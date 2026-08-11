import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "save_progress",
  title: "Save progress",
  description:
    "Create or overwrite one VISIBLE7 progress entry for the signed-in user. The value must be JSON matching what the app stores under that key.",
  inputSchema: {
    data_key: z.string().trim().min(1).describe("Progress key to write."),
    data_value: z
      .string()
      .min(1)
      .describe("JSON-encoded value to store for this key."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ data_key, data_value }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(data_value);
    } catch {
      return { content: [{ type: "text", text: "data_value must be valid JSON." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_progress")
      .upsert(
        { user_id: ctx.getUserId(), data_key, data_value: parsed as never },
        { onConflict: "user_id,data_key" },
      )
      .select("data_key, updated_at");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? { data_key }) }],
      structuredContent: { entry: data?.[0] ?? null },
    };
  },
});