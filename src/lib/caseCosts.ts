import { supabase } from "@/integrations/visible7/client";
import { CostItem, newId } from "@/lib/businessCase";
import type { BuildCost } from "@/lib/buildPlans";

/** Přidá náklady do byznys case projektu (položky se stejným názvem přeskočí). */
export async function addCostsToCase(projectId: string, costs: BuildCost[]) {
  const { data } = await supabase
    .from("project_data")
    .select("data_value")
    .eq("project_id", projectId)
    .eq("data_key", "business_case")
    .maybeSingle();
  const bc = (data?.data_value as { costs?: CostItem[] } | null) ?? {};
  const existing = bc.costs ?? [];
  const names = new Set(existing.map((c) => c.name.toLowerCase()));
  const fresh = costs
    .filter((c) => !names.has(c.name.toLowerCase()))
    .map((c) => ({ id: newId(), name: c.name, amount: c.amount, kind: c.kind }) as CostItem);
  if (fresh.length) {
    const { error } = await supabase
      .from("project_data")
      .upsert(
        { project_id: projectId, data_key: "business_case", data_value: { ...bc, costs: [...existing, ...fresh] } },
        { onConflict: "project_id,data_key" },
      );
    if (error) return { ok: false, added: 0, needsAmount: false };
  }
  return { ok: true, added: fresh.length, needsAmount: fresh.some((c) => !c.amount) };
}
