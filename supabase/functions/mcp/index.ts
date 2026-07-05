// Hand-owned (banner removed intentionally) — the Vite plugin will not regenerate this file.
// Reason: this project's Supabase Auth uses legacy HS256 JWT signing, so JWKS-based verification
// (mcp-js's built-in `auth.oauth.issuer`) always fails because the JWKS endpoint returns an empty
// key set. We drop the SDK auth layer and validate bearer tokens with `supabase.auth.getUser(token)`
// instead, which works regardless of signing algorithm.

import { defineMcp, defineTool } from "npm:@lovable.dev/mcp-js@0.20.0";
import { createSupabaseHandler } from "npm:@lovable.dev/mcp-js@0.20.0/stacks/supabase";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@^3.25.76";
import { AsyncLocalStorage } from "node:async_hooks";

// ---------------------------------------------------------------------------
// Per-request auth context (bearer token forwarded to tools without changing them)
// ---------------------------------------------------------------------------
type AuthCtx = { token: string; userId: string; email?: string };
const authStore = new AsyncLocalStorage<AuthCtx>();

// Wrap the SDK-provided ToolContext so tool handlers see the verified bearer
// even though we removed the SDK auth layer above.
function ctxProxy(original: any) {
  const ctx = authStore.getStore();
  return new Proxy(original, {
    get(target, prop) {
      if (prop === "isAuthenticated") return () => !!ctx;
      if (prop === "getToken") return () => ctx?.token;
      if (prop === "getUserId") return () => ctx?.userId;
      if (prop === "getUserEmail") return () => ctx?.email;
      const value = (target as any)[prop];
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

// ---------------------------------------------------------------------------
// Tool definitions (unchanged behavior — same names, schemas, and downstream calls
// as src/lib/mcp/tools/*.ts; only the ctx accessor is proxied)
// ---------------------------------------------------------------------------
const list_courses = defineTool({
  name: "list_courses",
  title: "List Canvas courses",
  description:
    "List the signed-in teacher's Canvas courses via the connected Canvas account. Requires the user to have connected Canvas in Allen.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_input, rawCtx) => {
    const ctx = ctxProxy(rawCtx);
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      return { content: [{ type: "text", text: "Missing SUPABASE_URL" }], isError: true };
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/get-canvas-courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ctx.getToken()}`,
      },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Canvas courses request failed (${res.status}): ${text}` }],
        isError: true,
      };
    }
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {}
    return {
      content: [
        { type: "text", text: typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2) },
      ],
      structuredContent: typeof parsed === "object" && parsed !== null ? parsed : { raw: text },
    };
  },
});

const list_assignments = defineTool({
  name: "list_assignments",
  title: "List assignments in a Canvas course",
  description:
    "List assignments for a specific Canvas course belonging to the signed-in teacher. Provide the numeric Canvas course id.",
  inputSchema: {
    courseId: z
      .union([z.string(), z.number()])
      .describe("The Canvas course id (as returned by list_courses)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ courseId }, rawCtx) => {
    const ctx = ctxProxy(rawCtx);
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      return { content: [{ type: "text", text: "Missing SUPABASE_URL" }], isError: true };
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/get-canvas-assignments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ctx.getToken()}`,
      },
      body: JSON.stringify({ courseId: String(courseId) }),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        content: [
          { type: "text", text: `Canvas assignments request failed (${res.status}): ${text}` },
        ],
        isError: true,
      };
    }
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {}
    return {
      content: [
        { type: "text", text: typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2) },
      ],
      structuredContent: typeof parsed === "object" && parsed !== null ? parsed : { raw: text },
    };
  },
});

const list_assignments_needing_grading = defineTool({
  name: "list_assignments_needing_grading",
  title: "List assignments needing grading",
  description:
    "List all assignments across the signed-in teacher's Canvas courses that currently have submissions needing grading.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_input, rawCtx) => {
    const ctx = ctxProxy(rawCtx);
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      return { content: [{ type: "text", text: "Missing SUPABASE_URL" }], isError: true };
    }
    const res = await fetch(`${supabaseUrl}/functions/v1/get-all-assignments-needing-grading`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ctx.getToken()}`,
      },
      body: JSON.stringify({}),
    });
    const text = await res.text();
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `Request failed (${res.status}): ${text}` }],
        isError: true,
      };
    }
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {}
    return {
      content: [
        { type: "text", text: typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2) },
      ],
      structuredContent: typeof parsed === "object" && parsed !== null ? parsed : { raw: text },
    };
  },
});

// ---------------------------------------------------------------------------
// MCP server — no SDK auth (we do our own with supabase.auth.getUser below)
// ---------------------------------------------------------------------------
const mcp = defineMcp({
  name: "allen-canvas-mcp",
  title: "Allen for Canvas",
  version: "0.1.0",
  instructions:
    "Tools for the Allen for Canvas grading assistant. Use `list_courses` to see the signed-in teacher's Canvas courses, `list_assignments` to browse assignments in one course, and `list_assignments_needing_grading` to find submissions that still need grading.",
  tools: [list_courses, list_assignments, list_assignments_needing_grading],
});

const innerHandler = createSupabaseHandler(mcp, { functionName: "mcp" });

// ---------------------------------------------------------------------------
// Custom auth wrapper: validate the bearer via supabase.auth.getUser(token)
// ---------------------------------------------------------------------------
const projectRef = "fnxbysvezshnikqboplh";
const AS_ISSUER = `https://${projectRef}.supabase.co/auth/v1`;
const PRM_SUFFIX = "/.well-known/oauth-protected-resource";
const MCP_RESOURCE_PATH = "/functions/v1/mcp";

function corsHeaders(extra: Record<string, string> = {}) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, mcp-protocol-version",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
    ...extra,
  };
}

function wwwAuthenticate(origin: string) {
  const prmUrl = `${origin}${MCP_RESOURCE_PATH}${PRM_SUFFIX}`;
  return `Bearer realm="mcp", resource_metadata="${prmUrl}"`;
}

function unauthorized(origin: string, description = "invalid_token") {
  return new Response(JSON.stringify({ error: "unauthorized", error_description: description }), {
    status: 401,
    headers: corsHeaders({
      "Content-Type": "application/json",
      "WWW-Authenticate": `${wwwAuthenticate(origin)}, error="invalid_token", error_description="${description}"`,
    }),
  });
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const origin = `${forwardedProto ?? url.protocol.replace(":", "")}://${forwardedHost}`;

  // Serve OAuth Protected Resource Metadata ourselves (SDK auth was removed).
  if (url.pathname.endsWith(PRM_SUFFIX)) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }
    return new Response(
      JSON.stringify({
        resource: `${origin}${MCP_RESOURCE_PATH}`,
        authorization_servers: [AS_ISSUER],
        bearer_methods_supported: ["header"],
        resource_name: "Allen for Canvas",
      }),
      {
        headers: corsHeaders({
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
        }),
      },
    );
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  // Validate bearer token via Supabase Auth (works with HS256 legacy signing).
  const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
  const token = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;

  if (!token) {
    return unauthorized(origin, "missing_bearer_token");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response(JSON.stringify({ error: "server_misconfigured" }), {
      status: 500,
      headers: corsHeaders({ "Content-Type": "application/json" }),
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return unauthorized(origin, error?.message ?? "invalid_token");
  }

  const authCtx: AuthCtx = {
    token,
    userId: data.user.id,
    email: data.user.email ?? undefined,
  };

  return authStore.run(authCtx, () => innerHandler(request));
});
