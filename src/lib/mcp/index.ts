import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listProgressTool from "./tools/list-progress";
import getProgressTool from "./tools/get-progress";
import saveProgressTool from "./tools/save-progress";
import getSubscriptionTool from "./tools/get-subscription";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "visible7-new",
  title: "visible7-new",
  version: "0.1.0",
  instructions:
    "Tools for VISIBLE7 MICEK, a 7-step online business methodology app. Use `list_progress` and `get_progress` to read the signed-in user's saved phase data (vision, ideation, strategy, implementation, benchmarking, launch, expansion), `save_progress` to write a phase entry, and `get_subscription` to check their access level. All tools act as the authenticated user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listProgressTool, getProgressTool, saveProgressTool, getSubscriptionTool],
});