import { supabase } from "@/integrations/visible7/client";
import { LEGAL_VERSION } from "@/lib/legal";

export type ConsentKind = "podminky" | "zasady" | "klub" | "marketing";

export interface ConsentState {
  kind: ConsentKind;
  version: string;
  granted: boolean;
  created_at: string;
}

/** Platný stav souhlasů = nejnovější záznam každého druhu. */
export async function loadConsents(): Promise<Partial<Record<ConsentKind, ConsentState>>> {
  const { data } = await supabase
    .from("consents")
    .select("kind, version, granted, created_at")
    .order("created_at", { ascending: false });
  const out: Partial<Record<ConsentKind, ConsentState>> = {};
  for (const row of (data ?? []) as ConsentState[]) if (!out[row.kind]) out[row.kind] = row;
  return out;
}

export async function recordConsents(entries: Partial<Record<ConsentKind, boolean>>) {
  const rows = Object.entries(entries).map(([kind, granted]) => ({ kind, granted, version: LEGAL_VERSION }));
  if (rows.length === 0) return true;
  const { error } = await supabase.from("consents").insert(rows);
  return !error;
}

/** Podmínky a zásady jsou potvrzené v aktuální verzi. */
export const hasCurrentTerms = (c: Partial<Record<ConsentKind, ConsentState>>) =>
  !!c.podminky?.granted && c.podminky.version === LEGAL_VERSION && !!c.zasady?.granted && c.zasady.version === LEGAL_VERSION;
