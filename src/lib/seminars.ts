/**
 * Živé semináře (webináře). Správce zakládá témata a termíny v administraci,
 * uživatel se registruje. Odkaz na připojení a záznam vrací jen funkce seminar_links
 * (člen vždy, u semináře zdarma registrovaný).
 */
import { supabase } from "@/integrations/visible7/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type SeminarAccess = "clenove" | "zdarma";

export interface Seminar {
  id: string;
  title: string;
  description: string;
  gate: number | null;
  starts_at: string | null;
  duration_min: number;
  place: string;
  access: SeminarAccess;
  published: boolean;
}

export interface AdminSeminar extends Seminar {
  join_url: string | null;
  recording_url: string | null;
  registrations: number;
}

export type SeminarInput = Omit<AdminSeminar, "id" | "registrations">;

const COLS = "id, title, description, gate, starts_at, duration_min, place, access, published";

/** Seminář probíhá nebo teprve bude (do konce + 30 min). */
export const isUpcoming = (s: Pick<Seminar, "starts_at" | "duration_min">, now = Date.now()) =>
  !s.starts_at || new Date(s.starts_at).getTime() + (s.duration_min + 30) * 60_000 > now;

export const isLiveNow = (s: Pick<Seminar, "starts_at" | "duration_min">, now = Date.now()) => {
  if (!s.starts_at) return false;
  const start = new Date(s.starts_at).getTime();
  return now >= start - 15 * 60_000 && now <= start + s.duration_min * 60_000;
};

export const formatWhen = (iso: string | null) => {
  if (!iso) return "Termín brzy vypíšeme";
  const d = new Date(iso);
  const date = d.toLocaleDateString("cs-CZ", { weekday: "long", day: "numeric", month: "long" });
  const time = d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} v ${time}`;
};

/** Nadcházející nejdřív (podle data, bez data na konci), pak proběhlé od nejnovějšího. */
export function sortSeminars<T extends Seminar>(list: T[]) {
  const time = (s: T) => (s.starts_at ? new Date(s.starts_at).getTime() : Number.MAX_SAFE_INTEGER);
  const up = list.filter((s) => isUpcoming(s)).sort((a, b) => time(a) - time(b));
  const past = list.filter((s) => !isUpcoming(s)).sort((a, b) => time(b) - time(a));
  return { up, past };
}

export async function loadSeminars(): Promise<Seminar[]> {
  const { data, error } = await db.from("seminars").select(COLS).eq("published", true);
  if (error) throw error;
  return (data ?? []) as Seminar[];
}

export async function loadMyRegistrations(userId: string): Promise<Set<string>> {
  const { data } = await db.from("seminar_registrations").select("seminar_id").eq("user_id", userId);
  return new Set(((data ?? []) as { seminar_id: string }[]).map((r) => r.seminar_id));
}

export async function register(seminarId: string, userId: string) {
  const { error } = await db.from("seminar_registrations").insert({ seminar_id: seminarId, user_id: userId });
  if (error && error.code !== "23505") throw error;
}

export async function unregister(seminarId: string, userId: string) {
  const { error } = await db.from("seminar_registrations").delete().eq("seminar_id", seminarId).eq("user_id", userId);
  if (error) throw error;
}

export async function seminarLinks(seminarId: string) {
  const { data } = await db.rpc("seminar_links", { p_id: seminarId });
  const row = (Array.isArray(data) ? data[0] : data) as {
    join_url: string | null;
    recording_url: string | null;
  } | null;
  return row ?? null;
}

// ---- Správa ----
export async function loadAdminSeminars(): Promise<AdminSeminar[]> {
  const { data, error } = await db.rpc("admin_seminars");
  if (error) throw error;
  return ((data ?? []) as AdminSeminar[]).map((s) => ({ ...s, registrations: Number(s.registrations) }));
}

export async function createSeminar(input: SeminarInput) {
  // Bez .select(): odkazy nejsou přímo čitelné, návratová řádka by selhala.
  const { error } = await db.from("seminars").insert(input);
  if (error) throw error;
}

export async function updateSeminar(id: string, patch: Partial<SeminarInput>) {
  const { error } = await db.from("seminars").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSeminar(id: string) {
  const { error } = await db.from("seminars").delete().eq("id", id);
  if (error) throw error;
}
