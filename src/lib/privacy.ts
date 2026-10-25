import { supabase } from "@/integrations/visible7/client";

/** Odpověď funkce `privacy`; chybu převedeme na srozumitelnou větu. */
async function callPrivacy(body: Record<string, unknown>): Promise<string | null> {
  const { data, error } = await supabase.functions.invoke("privacy", { body });
  if (!error && data?.ok) return null;
  try {
    const ctx = (error as { context?: Response } | null)?.context;
    const j = ctx ? await ctx.json() : data;
    if (j?.error) return String(j.error);
  } catch {
    /* bez těla */
  }
  return "Smazání se nepodařilo. Zkuste to prosím znovu, nebo nám napište.";
}

/** Smaže obsah projektu (fáze, výstupy AI, web projektu). Vrací chybovou hlášku, nebo null. */
export const purgeProject = (projectId: string) => callPrivacy({ action: "purge_project", projectId });

/** Smaže celý účet se všemi projekty. `confirm` musí být „SMAZAT“. */
export const deleteAccount = (confirm: string) => callPrivacy({ action: "delete_account", confirm });
