import { supabase } from "@/integrations/visible7/client";

/** Limity musí odpovídat edge funkci `ai-assist`. */
export const AI_LIMITS = { navrh: 3, vyhodnoceni: 3, daily: 20 } as const;

export type AiKind = "navrh" | "vyhodnoceni";

export interface CanvasSuggestion {
  businessType: string;
  businessTypeReason: string;
  fields: Record<string, string>;
}

export interface CanvasEvaluation {
  summary: string;
  criteria: { name: string; rating: "silné" | "v pořádku" | "doplnit"; comment: string }[];
  contradictions: string[];
  nextSteps: string[];
}

export interface AiUsage {
  used: Record<AiKind, number>;
  usedDaily: number;
  latest: { navrh: CanvasSuggestion | null; vyhodnoceni: CanvasEvaluation | null };
}

/** Kolik AI volání už projekt/uživatel spotřeboval a poslední výstupy. */
export async function loadAiUsage(projectId: string, phase: string): Promise<AiUsage> {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [rows, daily] = await Promise.all([
    supabase
      .from("ai_outputs")
      .select("kind, output, created_at")
      .eq("project_id", projectId)
      .eq("phase", phase)
      .order("created_at", { ascending: false }),
    supabase.from("ai_outputs").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
  ]);
  const list = (rows.data ?? []) as { kind: AiKind; output: unknown }[];
  const first = (k: AiKind) => list.find((r) => r.kind === k)?.output ?? null;
  return {
    used: {
      navrh: list.filter((r) => r.kind === "navrh").length,
      vyhodnoceni: list.filter((r) => r.kind === "vyhodnoceni").length,
    },
    usedDaily: daily.count ?? 0,
    latest: {
      navrh: first("navrh") as CanvasSuggestion | null,
      vyhodnoceni: first("vyhodnoceni") as CanvasEvaluation | null,
    },
  };
}

export async function callAi<T>(
  projectId: string,
  action:
    | "canvas_suggest"
    | "canvas_evaluate"
    | "case_comment"
    | "case_assumptions"
    | "case_costs"
    | "case_autofill"
    | "pitch",
  extra: Record<string, string> = {},
): Promise<{ output?: T; error?: string; code?: string }> {
  const { data, error } = await supabase.functions.invoke("ai-assist", { body: { ...extra, projectId, action } });
  if (error) {
    // Chybová odpověď funkce nese českou hlášku v těle.
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        return { error: body?.error ?? "AI teď neodpovídá.", code: body?.code };
      } catch {
        /* ignore */
      }
    }
    return { error: "AI teď neodpovídá. Zkuste to prosím za chvíli." };
  }
  return { output: (data as { output: T }).output };
}
