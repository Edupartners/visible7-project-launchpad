import { supabase } from "@/integrations/visible7/client";

/** Jedna položka ERRC matice s hodnotami pro hodnotovou křivku (0–100). */
export interface ErrcItem {
  id: string;
  text: string;
  lowCost: number;
  premium: number;
  mine: number;
}

export type ErrcQuadrant = "eliminate" | "reduce" | "raise" | "create";

export type ErrcMatrix = Record<ErrcQuadrant, ErrcItem[]>;

/** Základní údaje z fáze 1 (klíč `vision_project_data`). */
export interface VisionBasics {
  name: string;
  slogan: string;
  customer?: string;
  problem?: string;
  offering?: string;
  /** Konkrétní levná konkurence, se kterou se projekt srovnává. */
  lowCostName?: string;
  /** Konkrétní prémiová konkurence, se kterou se projekt srovnává. */
  premiumName?: string;
}

export const EMPTY_ERRC: ErrcMatrix = { eliminate: [], reduce: [], raise: [], create: [] };

export const VISION_KEYS = {
  basics: "vision_project_data",
  errc: "vision_errc_v2",
  usp: "vision_usp",
} as const;

/** Souhrn fáze 1 pro navazující fáze. */
export interface VisionSummary {
  basics: VisionBasics;
  errc: ErrcMatrix;
  usp: string;
}

/** Načte vybrané klíče z dat aktuálního projektu. */
export async function loadProjectKeys(projectId: string, keys: string[]): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from("project_data")
    .select("data_key, data_value")
    .eq("project_id", projectId)
    .in("data_key", keys);
  if (error || !data) return {};
  return Object.fromEntries((data as { data_key: string; data_value: unknown }[]).map((r) => [r.data_key, r.data_value]));
}

export async function loadVisionSummary(projectId: string): Promise<VisionSummary | null> {
  const raw = await loadProjectKeys(projectId, Object.values(VISION_KEYS));
  const basics = (raw[VISION_KEYS.basics] as VisionBasics | undefined) ?? null;
  const errc = (raw[VISION_KEYS.errc] as ErrcMatrix | undefined) ?? null;
  const usp = (raw[VISION_KEYS.usp] as string | undefined) ?? "";
  if (!basics && !errc && !usp) return null;
  return {
    basics: { name: "", slogan: "", ...(basics ?? {}) },
    errc: { ...EMPTY_ERRC, ...(errc ?? {}) },
    usp,
  };
}

/** Texty položek kvadrantu (bez prázdných). */
export const errcTexts = (errc: ErrcMatrix, q: ErrcQuadrant) =>
  (errc[q] ?? []).map((i) => i.text.trim()).filter(Boolean);
