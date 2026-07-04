import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_courses",
  title: "List Canvas courses",
  description:
    "List the signed-in teacher's Canvas courses via the connected Canvas account. Requires the user to have connected Canvas in Allen.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async (_input, ctx: ToolContext) => {
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
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      /* keep raw */
    }
    return {
      content: [{ type: "text", text: typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2) }],
      structuredContent: typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : { raw: text },
    };
  },
});
