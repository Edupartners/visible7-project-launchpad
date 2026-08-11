import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_subscription",
  title: "Get subscription status",
  description:
    "Read the signed-in user's VISIBLE7 subscription status, trial dates and access expiry.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, trial_started_at, trial_ends_at, access_until, promo_code_used, updated_at")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "No subscription record found." }] };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { subscription: data },
    };
  },
});