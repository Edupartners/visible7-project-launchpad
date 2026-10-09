import { useEffect, useState } from "react";
import { loadAiUsage } from "@/lib/ai";
import { loadProjectKeys } from "@/lib/projectData";
import { BusinessCaseData, CostItem, groupOf } from "@/lib/businessCase";
import { buildType } from "@/lib/buildPlans";
import type { Fit } from "@/lib/marketingPlans";

/** Data z předchozích fází, která fáze 5 potřebuje: rozpočet, max. PNO, hodnocení kanálů AI, cesta zákazníka. */
export interface MarketingContext {
  loaded: boolean;
  monthlyBudget: number;
  maxPno: number | null;
  /** Hodnota jedné konverze (objednávka / poptávka přepočtená konverzí / prodej) */
  valuePerConversion: number;
  conversionLabel: string;
  fits: Record<string, Fit>;
  budgetNames: string[];
  firstStep: string | null;
  competitors: string[];
}

const EMPTY: MarketingContext = {
  loaded: false,
  monthlyBudget: 0,
  maxPno: null,
  valuePerConversion: 0,
  conversionLabel: "konverzí",
  fits: {},
  budgetNames: [],
  firstStep: null,
  competitors: [],
};

export function useMarketingContext(projectId: string | undefined, businessType: string | null | undefined) {
  const [ctx, setCtx] = useState<MarketingContext>(EMPTY);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    Promise.all([
      loadProjectKeys(projectId, ["business_case", "business_case_summary", "vision_project_data"]),
      loadAiUsage(projectId, "3n"),
      loadAiUsage(projectId, "3a"),
    ]).then(([raw, costs, autofill]) => {
      if (!active) return;
      const bc = raw.business_case as BusinessCaseData | undefined;
      const summary = raw.business_case_summary as
        { scenare?: { realisticky?: { max_pno_pct?: number | null } } } | undefined;
      const vision = (raw.vision_project_data ?? {}) as { lowCostName?: string; premiumName?: string };
      const costItems: CostItem[] = bc?.costs ?? [];
      const nameById = Object.fromEntries(costItems.map((c) => [c.id, c.name]));
      const hints = [
        ...(((autofill.latest.navrh as unknown as { items?: { id: string; fit?: Fit }[] }) ?? {}).items ?? []),
        ...(((costs.latest.navrh as unknown as { items?: { id: string; fit?: Fit }[] }) ?? {}).items ?? []),
      ];
      const fits: Record<string, Fit> = {};
      for (const h of hints) if (h.fit && nameById[h.id]) fits[nameById[h.id]] = h.fit;
      const marketing = costItems.filter((c) => c.kind === "marketing");
      const group = groupOf(businessType);
      const r = bc?.revenue;
      const value =
        group === "leads"
          ? ((r?.price ?? 0) * (r?.conversion ?? 0)) / 100
          : group === "marketplace"
            ? ((r?.price ?? 0) * (r?.commission ?? 0)) / 100
            : (r?.price ?? 0);
      setCtx({
        loaded: true,
        monthlyBudget: marketing.reduce((s, c) => s + (c.amount || 0), 0),
        maxPno: summary?.scenare?.realisticky?.max_pno_pct ?? null,
        valuePerConversion: value,
        conversionLabel: group === "leads" ? "poptávek" : group === "subscription" ? "nových zákazníků" : "objednávek",
        fits,
        budgetNames: marketing.map((c) => c.name),
        firstStep: buildType(businessType)?.funnel[0]?.label ?? null,
        competitors: [vision.lowCostName, vision.premiumName].filter((x): x is string => !!x?.trim()),
      });
    });
    return () => {
      active = false;
    };
  }, [projectId, businessType]);

  return ctx;
}
