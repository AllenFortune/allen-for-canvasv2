import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
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
  handler: async ({ courseId }, ctx: ToolContext) => {
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
        content: [{ type: "text", text: `Canvas assignments request failed (${res.status}): ${text}` }],
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
      structuredContent:
        typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : { raw: text },
    };
  },
});
