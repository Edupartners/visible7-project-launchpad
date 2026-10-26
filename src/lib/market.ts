import { supabase } from "@/integrations/visible7/client";

/** Velikost trhu (TAM / SAM / SOM) z funkce market-size, uložená v project_data pod klíčem `market_size`. */
export interface MarketLevel {
  value_czk: number;
  formula: string;
}

export interface MarketSize {
  category: string;
  tam: MarketLevel;
  sam: MarketLevel;
  som: MarketLevel;
  assumptions: string[];
  confidence: "nizka" | "stredni" | "vysoka";
  confidence_why: string;
  sources: { url: string; title: string; used_for: string }[];
  region: "cz" | "cz_sk";
  created_at: string;
}

export const MARKET_KEY = "market_size";
export const MARKET_LIMIT = 2;

export const REGION_LABEL: Record<MarketSize["region"], string> = {
  cz: "Česko",
  cz_sk: "Česko a Slovensko",
};

export const CONFIDENCE_LABEL: Record<MarketSize["confidence"], string> = {
  nizka: "Nízká jistota",
  stredni: "Střední jistota",
  vysoka: "Vysoká jistota",
};

/** Částka zkráceně: { num: "4,2", unit: "mld. Kč" }. */
export const shortCzk = (v?: number | null) => {
  if (v === undefined || v === null || !Number.isFinite(v)) return { num: "—", unit: "" };
  const a = Math.abs(v);
  const one = (x: number) => (Math.round(x * 10) / 10).toLocaleString("cs-CZ");
  if (a >= 1e9) return { num: one(v / 1e9), unit: "mld. Kč" };
  if (a >= 1e6) return { num: one(v / 1e6), unit: "mil. Kč" };
  if (a >= 1e4) return { num: Math.round(v / 1000).toLocaleString("cs-CZ"), unit: "tis. Kč" };
  return { num: Math.round(v).toLocaleString("cs-CZ"), unit: "Kč" };
};
export const shortCzkText = (v?: number | null) => {
  const s = shortCzk(v);
  return `${s.num} ${s.unit}`.trim();
};

/** Podíl a z b v procentech, zaokrouhlený čitelně (0,4 % / 9 %). */
export const sharePct = (a: number, b: number) => {
  if (!b || !Number.isFinite(a / b)) return null;
  const p = (a / b) * 100;
  return `${(p < 1 ? Math.round(p * 10) / 10 : Math.round(p)).toLocaleString("cs-CZ")} %`;
};

export async function runMarketSize(
  projectId: string,
  region: MarketSize["region"],
): Promise<{ output?: MarketSize; error?: string; code?: string }> {
  const { data, error } = await supabase.functions.invoke("market-size", { body: { projectId, region } });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        return { error: body?.error ?? "Výpočet se nepodařil.", code: body?.code };
      } catch {
        /* ignore */
      }
    }
    return { error: "Výpočet se nepodařil. Zkuste to prosím za chvíli." };
  }
  return { output: (data as { output: MarketSize }).output };
}

/** Kolik výpočtů trhu už projekt spotřeboval. */
export async function marketRunsUsed(projectId: string) {
  const { count } = await supabase
    .from("ai_outputs")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("phase", "m");
  return count ?? 0;
}
