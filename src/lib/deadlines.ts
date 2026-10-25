import { supabase } from "@/integrations/visible7/client";

/** Forma podnikání určuje, které termíny se uživatele týkají. */
export type BusinessForm = "nezacal" | "osvc_bezny" | "osvc_pausal" | "sro";

export const FORM_OPTIONS: { id: BusinessForm; label: string; hint: string }[] = [
  { id: "nezacal", label: "Zatím nepodnikám", hint: "Termíny vám zatím posílat nebudeme." },
  { id: "osvc_bezny", label: "OSVČ (běžný režim)", hint: "Zálohy na pojištění, daňové přiznání, přehledy." },
  { id: "osvc_pausal", label: "OSVČ s paušální daní", hint: "Měsíční paušální záloha a oznámení o vstupu." },
  { id: "sro", label: "Společnost s.r.o.", hint: "Daňové přiznání firmy." },
];

export interface BusinessProfile {
  form: BusinessForm;
  dph: boolean;
  deadline_reminders: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  detail: string;
  due_date: string;
  audience: string[];
  url: string | null;
  source_url: string | null;
  verified: boolean;
}

export const DEFAULT_PROFILE: BusinessProfile = { form: "nezacal", dph: false, deadline_reminders: true };

/** Štítky profilu pro porovnání s `deadlines.audience`. */
export const profileTags = (p: BusinessProfile) => (p.form === "nezacal" ? [] : [p.form, ...(p.dph ? ["dph"] : [])]);

export async function loadProfile(): Promise<BusinessProfile | null> {
  const { data } = await supabase.from("business_profile").select("form, dph, deadline_reminders").maybeSingle();
  return (data as BusinessProfile | null) ?? null;
}

export async function saveProfile(p: BusinessProfile) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { error } = await supabase
    .from("business_profile")
    .upsert({ user_id: u.user.id, ...p, updated_at: new Date().toISOString() });
  return !error;
}

/** Termíny od dneška na `days` dní dopředu. Bez filtru na ověření (to řeší jen e-maily). */
export async function loadDeadlines(days = 120): Promise<Deadline[]> {
  const today = new Date();
  const to = new Date(today.getTime() + days * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const { data } = await supabase
    .from("deadlines")
    .select("id, title, detail, due_date, audience, url, source_url, verified")
    .gte("due_date", iso(today))
    .lte("due_date", iso(to))
    .order("due_date");
  return (data as Deadline[] | null) ?? [];
}

export async function loadDone(): Promise<Set<string>> {
  const { data } = await supabase.from("deadline_done").select("deadline_id");
  return new Set((data ?? []).map((r: { deadline_id: string }) => r.deadline_id));
}

export async function setDone(id: string, done: boolean) {
  if (done) return !(await supabase.from("deadline_done").insert({ deadline_id: id })).error;
  return !(await supabase.from("deadline_done").delete().eq("deadline_id", id)).error;
}

/** Datum česky: 20. 11. 2026, a kolik dní zbývá. */
export const czDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d}. ${m}. ${y}`;
};
export const daysLeft = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const due = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((due - today) / 86400000);
};

/* Správa termínů v administraci */
export async function adminLoadDeadlines(): Promise<Deadline[]> {
  const { data } = await supabase
    .from("deadlines")
    .select("id, title, detail, due_date, audience, url, source_url, verified")
    .gte("due_date", new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10))
    .order("due_date");
  return (data as Deadline[] | null) ?? [];
}

export async function adminSaveDeadline(d: Partial<Deadline> & { id?: string }) {
  const { id, ...rest } = d;
  const q = id ? supabase.from("deadlines").update(rest).eq("id", id) : supabase.from("deadlines").insert(rest);
  const { error } = await q;
  return error?.message ?? null;
}

export async function adminDeleteDeadline(id: string) {
  const { error } = await supabase.from("deadlines").delete().eq("id", id);
  return error?.message ?? null;
}
