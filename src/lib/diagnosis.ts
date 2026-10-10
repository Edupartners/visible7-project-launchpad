/**
 * Fáze 0 – Rentgen nápadu.
 * Z odpovědí na 4 otázky AI navrhne typ byznysu, Lean Canvas a čísla byznys casu.
 * Mapu cesty A → B → C → D počítá aplikace sama ze stejného modelu jako fáze 3,
 * takže se s každou úpravou byznys casu zpřesňuje.
 */
import {
  BusinessCaseData,
  CostItem,
  CostKind,
  EMPTY_CASE,
  EMPTY_REVENUE,
  RevenueInputs,
  computeMetrics,
  groupOf,
  simulate,
} from "@/lib/businessCase";
import { supabase } from "@/integrations/visible7/client";
import type { VisionBasics } from "@/lib/projectData";

export const DIAGNOSIS_KEY = "diagnosis";

export type Goal = "privydelek" | "mzda" | "firma";

export interface DiagnosisAnswers {
  idea: string;
  customer: string;
  problem: string;
  hours: number;
  budget: number;
  /** Dnešní čistý měsíční příjem (nepovinné) */
  income: number | null;
  goal: Goal;
  skills: string[];
}

export const EMPTY_ANSWERS: DiagnosisAnswers = {
  idea: "",
  customer: "",
  problem: "",
  hours: 10,
  budget: 30_000,
  income: null,
  goal: "mzda",
  skills: [],
};

export const GOALS: { id: Goal; label: string; text: string }[] = [
  { id: "privydelek", label: "Přivýdělek", text: "Pár tisíc měsíčně navíc vedle práce" },
  { id: "mzda", label: "Nahradit mzdu", text: "Chci, aby mě projekt živil" },
  { id: "firma", label: "Velká firma", text: "Tým, růst, další trhy" },
];

export const SKILLS = [
  { id: "prodej", label: "Umím prodávat" },
  { id: "marketing", label: "Rozumím marketingu" },
  { id: "technika", label: "Zvládnu web a techniku" },
  { id: "obor", label: "Znám obor zevnitř" },
  { id: "finance", label: "Rozumím číslům" },
  { id: "zadna", label: "Nic z toho zatím" },
];

export const HOURS = [5, 10, 20, 40];
export const BUDGETS = [0, 10_000, 30_000, 100_000, 250_000];

export type Verdict = "zelena" | "oranzova" | "cervena";

export interface DiagnosisAi {
  projectName: string;
  slogan: string;
  verdict: { color: Verdict; headline: string; why: string };
  businessType: string;
  businessTypeReason: string;
  vision: Required<Omit<VisionBasics, "name" | "slogan">>;
  canvas: Record<string, string>;
  revenue: Partial<RevenueInputs>;
  costs: { name: string; kind: CostKind; amount: number }[];
  risks: { risk: string; test: string }[];
  strengths: string[];
}

export interface Diagnosis {
  answers: DiagnosisAnswers;
  ai: DiagnosisAi;
  createdAt: string;
  /** Které brány rentgen předvyplnil: vision, canvas, case */
  prefilled?: string[];
}

/** Měsíční zisk, který znamená bod C („živí mě to“). */
export const targetIncome = (a: Pick<DiagnosisAnswers, "goal" | "income">) => {
  const income = a.income && a.income > 0 ? a.income : 35_000;
  if (a.goal === "privydelek") return Math.min(10_000, income);
  if (a.goal === "firma") return Math.max(income, 35_000) * 2;
  return income;
};

/** Orientační měsíční náklad na prvního spolupracovníka (externista na část úvazku). */
export const FIRST_HIRE_COST = 25_000;

const MAP_HORIZON = 60;
const SCEN = { realisticky: 1, opatrny: 0.6 };

export interface MapPoint {
  id: "A" | "B" | "C" | "D";
  title: string;
  text: string;
  /** Měsíc v realistickém a opatrném scénáři; null = do 5 let nenastane */
  from: number | null;
  to: number | null;
}

const firstMonth = (rows: ReturnType<typeof simulate>, test: (r: (typeof rows)[number], cum: number) => boolean) => {
  let cum = 0;
  for (const r of rows.slice(1)) {
    cum += r.newCustomers;
    if (test(r, cum)) return r.month;
  }
  return null;
};

export function caseFromDiagnosis(ai: DiagnosisAi): BusinessCaseData {
  const costs: CostItem[] = ai.costs.map((c, i) => ({
    id: `rentgen-${i + 1}`,
    name: c.name,
    amount: Math.round(c.amount),
    kind: c.kind,
  }));
  return {
    ...EMPTY_CASE,
    revenue: { ...EMPTY_REVENUE, ...ai.revenue },
    costs,
    prefilled: true,
  };
}

/** Mapa cesty z byznys casu: B = 10 zákazníků, C = zisk na cílový příjem, D = zisk unese i spolupracovníka. */
export function journeyMap(businessType: string | null | undefined, bc: BusinessCaseData, target: number) {
  const group = groupOf(businessType);
  const real = simulate(group, bc, SCEN.realisticky, MAP_HORIZON);
  const slow = simulate(group, bc, SCEN.opatrny, MAP_HORIZON);
  const metrics = computeMetrics(group, bc, simulate(group, bc, 1));
  const firstCustomers = (rows: typeof real) =>
    group === "content" ? firstMonth(rows, (r) => r.volume >= 1000) : firstMonth(rows, (_r, cum) => cum >= 10);
  const profitAt = (rows: typeof real, amount: number) => firstMonth(rows, (r) => r.profit >= amount);
  const m12 = real[12];
  // Tržby za měsíc, při kterých zbude cílový zisk po zaplacení zboží, provozu a marketingu.
  const gm = metrics.grossMargin / 100;
  const revenueForTarget = gm > 0 ? Math.ceil((target + m12.fixed + m12.marketing) / gm / 1000) * 1000 : null;

  const points: MapPoint[] = [
    { id: "A", title: "Dnes", text: "Nápad, čas a rozpočet. Začínáte branou 1.", from: 0, to: 0 },
    {
      id: "B",
      title: "První zákazníci",
      text: group === "content" ? "Prvních 1 000 návštěv měsíčně." : "10 platících zákazníků. Zájem je ověřený.",
      from: firstCustomers(real),
      to: firstCustomers(slow),
    },
    {
      id: "C",
      title: "Živí mě to",
      text: `Zisk ${target.toLocaleString("cs-CZ")} Kč měsíčně. Můžete zvážit výpověď.`,
      from: profitAt(real, target),
      to: profitAt(slow, target),
    },
    {
      id: "D",
      title: "Roste to beze mě",
      text: "Zisk unese i prvního spolupracovníka.",
      from: profitAt(real, target + FIRST_HIRE_COST),
      to: profitAt(slow, target + FIRST_HIRE_COST),
    },
  ];
  return { points, metrics, revenueForTarget };
}

export const rangeLabel = (p: MapPoint) => {
  if (p.id === "A") return "výchozí bod";
  if (p.from === null) return "do 5 let podle plánu nenastane";
  const y = (m: number) => (m > 24 ? " (orientačně)" : "");
  if (p.to === null) return `od ${p.from}. měsíce, v opatrném scénáři déle než 5 let`;
  if (p.to === p.from) return `${p.from}. měsíc${y(p.from)}`;
  return `${p.from}.–${p.to}. měsíc${y(p.to)}`;
};

/** Zavolá AI a vrátí návrh. Projekt musí existovat (AI ověřuje vlastníka). */
export async function runDiagnosis(projectId: string, answers: DiagnosisAnswers) {
  const { data, error } = await supabase.functions.invoke("ai-assist", {
    body: { projectId, action: "diagnose", answers },
  });
  if (error) {
    let message = "AI teď neodpovídá. Zkuste to prosím za chvíli.";
    try {
      const ctx = (error as { context?: Response }).context;
      const body = ctx ? await ctx.json() : null;
      if (body?.error) message = body.error;
    } catch {
      /* necháme obecnou zprávu */
    }
    throw new Error(message);
  }
  return (data as { output: DiagnosisAi }).output;
}

const isBlank = (v: unknown) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && !v.trim()) ||
  (typeof v === "object" && Object.values(v as object).every((x) => typeof x !== "string" || !x.trim()));

/**
 * Uloží rentgen a předvyplní brány 1–3 – jen tam, kde uživatel zatím nic nemá.
 * Vrací seznam předvyplněných částí.
 */
export async function applyDiagnosis(projectId: string, d: Diagnosis) {
  const { data } = await supabase
    .from("project_data")
    .select("data_key, data_value")
    .eq("project_id", projectId)
    .in("data_key", ["vision_project_data", "ideation_lean_canvas", "business_case"]);
  const existing = Object.fromEntries(
    ((data ?? []) as { data_key: string; data_value: unknown }[]).map((r) => [r.data_key, r.data_value]),
  );
  const rows: { project_id: string; data_key: string; data_value: unknown }[] = [
    { project_id: projectId, data_key: DIAGNOSIS_KEY, data_value: d },
  ];
  const prefilled: string[] = [];
  if (isBlank(existing.vision_project_data)) {
    rows.push({
      project_id: projectId,
      data_key: "vision_project_data",
      data_value: { name: d.ai.projectName, slogan: d.ai.slogan, ...d.ai.vision },
    });
    prefilled.push("vision");
  }
  if (isBlank(existing.ideation_lean_canvas)) {
    rows.push({ project_id: projectId, data_key: "ideation_lean_canvas", data_value: d.ai.canvas });
    prefilled.push("canvas");
  }
  const bc = existing.business_case as BusinessCaseData | undefined;
  if (!bc?.revenue?.volume12 && !(bc?.costs ?? []).some((c) => c.amount > 0)) {
    rows.push({ project_id: projectId, data_key: "business_case", data_value: caseFromDiagnosis(d.ai) });
    prefilled.push("case");
  }
  rows[0].data_value = { ...d, prefilled };
  const { error } = await supabase.from("project_data").upsert(rows, { onConflict: "project_id,data_key" });
  if (error) throw error;
  return prefilled;
}
