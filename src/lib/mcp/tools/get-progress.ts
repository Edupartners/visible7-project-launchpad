import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_progress",
  title: "Get saved progress",
  description:
    "Read the stored value of one VISIBLE7 progress entry (e.g. a phase's saved form data) for the signed-in user.",
  inputSchema: {
    data_key: z.string().trim().min(1).describe("Progress key, as returned by list_progress."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ data_key }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_progress")
      .select("data_key, data_value, updated_at")
      .eq("user_id", ctx.getUserId())
      .eq("data_key", data_key)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: `No progress saved for key "${data_key}".` }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { entry: data },
    };
  },
});