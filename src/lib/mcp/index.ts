import { defineMcp } from "@lovable.dev/mcp-js";
import { createClient } from "@supabase/supabase-js";
import { AsyncLocalStorage } from "node:async_hooks";
import listCoursesTool from "./tools/list-courses";
import listAssignmentsTool from "./tools/list-assignments";
import listAssignmentsNeedingGradingTool from "./tools/list-assignments-needing-grading";

// ---------------------------------------------------------------------------
// Why this file looks the way it does
// ---------------------------------------------------------------------------
// This project's Supabase Auth uses legacy HS256 JWT signing, so the JWKS
// endpoint at /auth/v1/.well-known/jwks.json returns an empty key set. The
// mcp-js SDK's built-in `auth.oauth.issuer` verifier is JWKS-only, so every
// request would 401. mcp-js does not expose a `verifyToken` hook, so we
// validate the bearer token ourselves with `supabase.auth.getUser(token)`
// (HS256-compatible) and forward the verified token to tools via
// AsyncLocalStorage — keeping tool source files unchanged.
//
// The mcp-js Vite plugin owns supabase/functions/mcp/index.ts and generates a
// wrapper of the form:
//     import mcp from "<this file>";
//     import { createSupabaseHandler } from "@lovable.dev/mcp-js/stacks/supabase";
//     Deno.serve(createSupabaseHandler(mcp, { functionName: "mcp" }));
//
// ES module imports execute this file first, so our Deno.serve monkey-patch
// installs before the SDK calls Deno.serve at the wrapper's top level.
// ---------------------------------------------------------------------------

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => unknown;
  env: { get(name: string): string | undefined };
} | undefined;

type AuthCtx = { token: string; userId: string; email?: string };
const authStore = new AsyncLocalStorage<AuthCtx>();

// Wrap tool handlers so ctx.getToken()/isAuthenticated()/getUserId() read from
// our ALS-populated context instead of the SDK auth context (which we disabled).
function wrap<T extends { handler: (input: any, ctx: any) => any }>(tool: T): T {
  const original = tool.handler;
  return {
    ...tool,
    handler: (input: any, rawCtx: any) => {
      const store = authStore.getStore();
      const proxy = new Proxy(rawCtx ?? {}, {
        get(target, prop) {
          if (prop === "isAuthenticated") return () => !!store;
          if (prop === "getToken") return () => store?.token;
          if (prop === "getUserId") return () => store?.userId;
          if (prop === "getUserEmail") return () => store?.email;
          const v = (target as any)[prop];
          return typeof v === "function" ? v.bind(target) : v;
        },
      });
      return original(input, proxy);
    },
  } as T;
}

// ---------------------------------------------------------------------------
// Deno.serve monkey-patch: intercept every request, validate the bearer via
// supabase.auth.getUser, serve OAuth Protected Resource Metadata ourselves,
// and populate the ALS before delegating to the SDK handler.
// ---------------------------------------------------------------------------
const projectRef = "fnxbysvezshnikqboplh";
const AS_ISSUER = `https://${projectRef}.supabase.co/auth/v1`;
const PRM_SUFFIX = "/.well-known/oauth-protected-resource";
const MCP_RESOURCE_PATH = "/functions/v1/mcp";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, mcp-protocol-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
};

const g = globalThis as unknown as { __mcpServePatched?: boolean };
if (typeof Deno !== "undefined" && Deno?.serve && !g.__mcpServePatched) {
  g.__mcpServePatched = true;
  const denoRef = Deno;
  const originalServe = denoRef.serve.bind(denoRef);
  denoRef.serve = ((innerHandler: (req: Request) => Response | Promise<Response>) => {
    return originalServe(async (request: Request) => {
      const url = new URL(request.url);
      // Always derive the public origin from SUPABASE_URL — inside Supabase's
      // edge runtime the request Host is `edge-runtime.supabase.com`, which
      // would break OAuth resource-URL matching for MCP clients.
      const publicSupabaseUrl = denoRef.env.get("SUPABASE_URL") ?? `https://${projectRef}.supabase.co`;
      const origin = publicSupabaseUrl.replace(/\/+$/, "");
      const prmUrl = `${origin}${MCP_RESOURCE_PATH}${PRM_SUFFIX}`;

      if (url.pathname.endsWith(PRM_SUFFIX)) {
        if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
        return new Response(
          JSON.stringify({
            resource: `${origin}${MCP_RESOURCE_PATH}`,
            authorization_servers: [AS_ISSUER],
            bearer_methods_supported: ["header"],
            resource_name: "Allen for Canvas",
          }),
          {
            headers: {
              ...CORS,
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=300",
            },
          },
        );
      }

      if (request.method === "OPTIONS") {
        return new Response(null, { headers: CORS });
      }

      const authHeader =
        request.headers.get("authorization") ?? request.headers.get("Authorization");
      const token = authHeader?.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : undefined;

      const unauthorized = (desc: string) =>
        new Response(
          JSON.stringify({ error: "unauthorized", error_description: desc }),
          {
            status: 401,
            headers: {
              ...CORS,
              "Content-Type": "application/json",
              "WWW-Authenticate": `Bearer realm="mcp", resource_metadata="${prmUrl}", error="invalid_token", error_description="${desc}"`,
            },
          },
        );

      if (!token) return unauthorized("missing_bearer_token");

      const supabaseUrl = denoRef.env.get("SUPABASE_URL");
      const supabaseAnonKey = denoRef.env.get("SUPABASE_ANON_KEY");
      if (!supabaseUrl || !supabaseAnonKey) {
        return new Response(JSON.stringify({ error: "server_misconfigured" }), {
          status: 500,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return unauthorized(error?.message ?? "invalid_token");
      }

      return authStore.run(
        { token, userId: data.user.id, email: data.user.email ?? undefined },
        () => Promise.resolve(innerHandler(request)),
      );
    });
  }) as typeof denoRef.serve;
}

export default defineMcp({
  name: "allen-canvas-mcp",
  title: "Allen for Canvas",
  version: "0.1.0",
  instructions:
    "Tools for the Allen for Canvas grading assistant. Use `list_courses` to see the signed-in teacher's Canvas courses, `list_assignments` to browse assignments in one course, and `list_assignments_needing_grading` to find submissions that still need grading.",
  // No SDK `auth` here — the monkey-patched Deno.serve above enforces auth via
  // supabase.auth.getUser(token), which works with legacy HS256 signing.
  tools: [
    wrap(listCoursesTool),
    wrap(listAssignmentsTool),
    wrap(listAssignmentsNeedingGradingTool),
  ],
});
