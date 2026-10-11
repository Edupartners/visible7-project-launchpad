import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/visible7/client";
import { useAuth } from "@/components/AuthGate";

/** Oznámení od správce (notifikační centrum). */
export type AnnouncementKind = "novinka" | "akce" | "info";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  kind: AnnouncementKind;
  link_url: string | null;
  link_label: string | null;
  highlight: boolean;
  active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

export const KIND_LABELS: Record<AnnouncementKind, string> = {
  novinka: "Novinka v aplikaci",
  akce: "Akce a setkání",
  info: "Informace",
};

// Typy tabulek nejsou ve vygenerovaných typech klienta – přístup přes volně typovaný klient.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const isLive = (a: Announcement, now = Date.now()) =>
  a.active && new Date(a.starts_at).getTime() <= now && (!a.ends_at || new Date(a.ends_at).getTime() > now);

interface ReadRow {
  announcement_id: string;
  dismissed: boolean;
}

/** Oznámení pro přihlášeného uživatele: seznam (bez skrytých), počet nepřečtených, přečíst a skrýt. */
export function useAnnouncements() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = useMemo(() => ["announcements", user?.id], [user?.id]);

  const { data } = useQuery({
    queryKey: key,
    enabled: !!user,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const [{ data: list }, { data: reads }] = await Promise.all([
        db.from("announcements").select("*").order("starts_at", { ascending: false }).limit(30),
        db.from("announcement_reads").select("announcement_id, dismissed").eq("user_id", user!.id),
      ]);
      return {
        list: ((list ?? []) as Announcement[]).filter((a) => isLive(a)),
        reads: (reads ?? []) as ReadRow[],
      };
    },
  });

  const readIds = useMemo(() => new Set((data?.reads ?? []).map((r) => r.announcement_id)), [data]);
  const dismissedIds = useMemo(
    () => new Set((data?.reads ?? []).filter((r) => r.dismissed).map((r) => r.announcement_id)),
    [data],
  );
  const items = useMemo(() => (data?.list ?? []).filter((a) => !dismissedIds.has(a.id)), [data, dismissedIds]);
  const unread = items.filter((a) => !readIds.has(a.id)).length;
  const highlighted = items.filter((a) => a.highlight);

  const markAllRead = useCallback(async () => {
    const fresh = items.filter((a) => !readIds.has(a.id));
    if (!user || !fresh.length) return;
    await db.from("announcement_reads").upsert(
      fresh.map((a) => ({ user_id: user.id, announcement_id: a.id })),
      { onConflict: "user_id,announcement_id", ignoreDuplicates: true },
    );
    qc.invalidateQueries({ queryKey: key });
  }, [items, readIds, user, qc, key]);

  const dismiss = useCallback(
    async (id: string) => {
      if (!user) return;
      qc.setQueryData(key, (old: typeof data) =>
        old
          ? {
              ...old,
              reads: [...old.reads.filter((r) => r.announcement_id !== id), { announcement_id: id, dismissed: true }],
            }
          : old,
      );
      await db
        .from("announcement_reads")
        .upsert({ user_id: user.id, announcement_id: id, dismissed: true }, { onConflict: "user_id,announcement_id" });
    },
    [user, qc, key],
  );

  return { items, unread, highlighted, isRead: (id: string) => readIds.has(id), markAllRead, dismiss };
}

/* ---------- Správa (jen správce; hlídá i databáze) ---------- */

export interface AdminAnnouncement extends Announcement {
  reads: number;
  live: boolean;
}

export async function loadAdminAnnouncements(): Promise<AdminAnnouncement[]> {
  const [{ data: list, error }, { data: reads }] = await Promise.all([
    db.from("announcements").select("*").order("created_at", { ascending: false }),
    db.from("announcement_reads").select("announcement_id"),
  ]);
  if (error) throw error;
  const counts = new Map<string, number>();
  for (const r of (reads ?? []) as { announcement_id: string }[])
    counts.set(r.announcement_id, (counts.get(r.announcement_id) ?? 0) + 1);
  return ((list ?? []) as Announcement[]).map((a) => ({ ...a, reads: counts.get(a.id) ?? 0, live: isLive(a) }));
}

export type AnnouncementInput = Pick<
  Announcement,
  "title" | "body" | "kind" | "link_url" | "link_label" | "highlight" | "starts_at" | "ends_at"
>;

export async function createAnnouncement(input: AnnouncementInput, userId: string) {
  const { error } = await db.from("announcements").insert({ ...input, created_by: userId });
  if (error) throw error;
}

export async function updateAnnouncement(id: string, patch: Partial<Announcement>) {
  const { error } = await db.from("announcements").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteAnnouncement(id: string) {
  const { error } = await db.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
