import { supabase } from "@/integrations/visible7/client";

// Tabulky nejsou ve vygenerovaných typech klienta. Přístup hlídá databáze (jen správce).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

/* ---------- Promo kódy ---------- */

export interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  extends_access_days: number;
  max_uses: number | null;
  times_used: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  redeemed_by: string[];
}

export async function loadPromoCodes(): Promise<PromoCode[]> {
  const [{ data, error }, { data: red }] = await Promise.all([
    db.from("promo_codes").select("*").order("created_at", { ascending: false }),
    db.from("promo_redemptions").select("code_id, user_id"),
  ]);
  if (error) throw error;
  const by = new Map<string, string[]>();
  for (const r of (red ?? []) as { code_id: string; user_id: string }[])
    by.set(r.code_id, [...(by.get(r.code_id) ?? []), r.user_id]);
  return ((data ?? []) as Omit<PromoCode, "redeemed_by">[]).map((p) => ({ ...p, redeemed_by: by.get(p.id) ?? [] }));
}

export async function createPromoCode(input: {
  code: string;
  description: string | null;
  extends_access_days: number;
  max_uses: number | null;
  expires_at: string | null;
  created_by: string;
}) {
  const { error } = await db.from("promo_codes").insert({ ...input, code: input.code.trim().toUpperCase() });
  if (error) throw new Error(error.code === "23505" ? "Takový kód už existuje." : error.message);
}

export async function setPromoActive(id: string, is_active: boolean) {
  const { error } = await db.from("promo_codes").update({ is_active }).eq("id", id);
  if (error) throw error;
}

export async function deletePromoCode(id: string) {
  const { error } = await db.from("promo_codes").delete().eq("id", id);
  if (error) throw error;
}

export const promoLink = (code: string) => `${window.location.origin}/home?novy&kod=${encodeURIComponent(code)}`;

/* ---------- Štítky uživatelů ---------- */

export type TagColor = "slate" | "blue" | "green" | "orange" | "red" | "purple";

export interface UserTag {
  id: string;
  name: string;
  color: TagColor;
}

export const TAG_COLORS: Record<TagColor, string> = {
  slate: "bg-slate-100 text-slate-800 border-slate-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
  purple: "bg-purple-100 text-purple-800 border-purple-200",
};
export const TAG_DOT: Record<TagColor, string> = {
  slate: "bg-slate-500",
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

export async function loadTags(): Promise<{ tags: UserTag[]; links: Record<string, string[]> }> {
  const [{ data: tags, error }, { data: links }] = await Promise.all([
    db.from("user_tags").select("id, name, color").order("name"),
    db.from("user_tag_links").select("user_id, tag_id"),
  ]);
  if (error) throw error;
  const map: Record<string, string[]> = {};
  for (const l of (links ?? []) as { user_id: string; tag_id: string }[]) (map[l.user_id] ??= []).push(l.tag_id);
  return { tags: (tags ?? []) as UserTag[], links: map };
}

export async function createTag(name: string, color: TagColor): Promise<UserTag> {
  const { data, error } = await db
    .from("user_tags")
    .insert({ name: name.trim(), color })
    .select("id, name, color")
    .single();
  if (error) throw new Error(error.code === "23505" ? "Štítek s tímto názvem už existuje." : error.message);
  return data as UserTag;
}

export async function deleteTag(id: string) {
  const { error } = await db.from("user_tags").delete().eq("id", id);
  if (error) throw error;
}

export async function setUserTag(userId: string, tagId: string, on: boolean) {
  const q = on
    ? db.from("user_tag_links").upsert({ user_id: userId, tag_id: tagId }, { ignoreDuplicates: true })
    : db.from("user_tag_links").delete().eq("user_id", userId).eq("tag_id", tagId);
  const { error } = await q;
  if (error) throw error;
}
