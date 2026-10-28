/**
 * Videa ke kartám (blokům). Správce v administraci vloží odkaz z Vimea, videa seřadí,
 * uživatel je na kartě vidí jako seznam a odškrtává zhlédnutá.
 * Klíč karty: "<oblast>:<id bloku>" – stejné id bloku se v různých fázích liší obsahem.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/visible7/client";
import { BLOCKS } from "@/lib/buildPlans";
import { MKT_BLOCKS } from "@/lib/marketingPlans";
import { LAUNCH_BLOCKS } from "@/lib/launchPlan";
import { GROWTH_BLOCKS } from "@/lib/growthPlan";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type BlockArea = "tvorba" | "marketing" | "start" | "rust";

export const AREA_NAMES: Record<BlockArea, string> = {
  tvorba: "Fáze 4 – Implementace",
  marketing: "Fáze 5 – Budování poptávky",
  start: "Fáze 6 – Launch",
  rust: "Fáze 7 – Expanze",
};

/** 1 video, 2–4 videa, 5+ videí */
export const videosLabel = (n: number) => `${n} ${n === 1 ? "video" : n >= 2 && n <= 4 ? "videa" : "videí"}`;

export const blockKey = (area: BlockArea, blockId: string) => `${area}:${blockId}`;

/** Všechny karty, ke kterým jde přidat video (pro výběr v administraci). */
export const ALL_BLOCKS: { key: string; area: BlockArea; title: string }[] = [
  ...Object.values(BLOCKS).map((b) => ({ key: blockKey("tvorba", b.id), area: "tvorba" as const, title: b.title })),
  ...Object.values(MKT_BLOCKS).map((b) => ({
    key: blockKey("marketing", b.id),
    area: "marketing" as const,
    title: b.title,
  })),
  ...LAUNCH_BLOCKS.map((b) => ({ key: blockKey("start", b.id), area: "start" as const, title: b.title })),
  ...GROWTH_BLOCKS.map((b) => ({ key: blockKey("rust", b.id), area: "rust" as const, title: b.title })),
];

export interface BlockVideoRow {
  id: string;
  block_key: string;
  title: string;
  vimeo_id: string;
  vimeo_hash: string | null;
  minutes: number | null;
  position: number;
  published: boolean;
  /** Úsek dlouhé přednášky (kapitola bez střihu), v sekundách. Prázdné = celé video. */
  start_sec: number | null;
  end_sec: number | null;
}

type NewVideo = {
  title: string;
  vimeo_id: string;
  vimeo_hash: string | null;
  minutes: number | null;
  start_sec?: number | null;
  end_sec?: number | null;
};

/**
 * Z odkazu Vimea vytáhne číslo videa a případný klíč neveřejného videa.
 * Zvládne vimeo.com/123, vimeo.com/123/abc, player.vimeo.com/video/123?h=abc,
 * vimeo.com/manage/videos/123/abc i samotné číslo.
 */
export function parseVimeo(input: string): { id: string; hash: string | null } | null {
  const raw = input.trim();
  if (/^\d{3,15}$/.test(raw)) return { id: raw, hash: null };
  let url: URL;
  try {
    url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (!/(^|\.)vimeo\.com$/.test(url.hostname)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const idx = parts.findIndex((p) => /^\d{3,15}$/.test(p));
  if (idx < 0) return null;
  const qh = url.searchParams.get("h");
  const next = parts[idx + 1];
  const hash = qh || (next && /^[a-f0-9]{6,40}$/i.test(next) ? next : null);
  return { id: parts[idx], hash: hash && /^[a-zA-Z0-9]{4,40}$/.test(hash) ? hash : null };
}

export const vimeoSrc = (
  v: Pick<BlockVideoRow, "vimeo_id" | "vimeo_hash"> & { start_sec?: number | null },
  autoplay = false,
) =>
  `https://player.vimeo.com/video/${v.vimeo_id}?dnt=1${v.vimeo_hash ? `&h=${v.vimeo_hash}` : ""}${autoplay ? "&autoplay=1" : ""}${
    v.start_sec ? `#t=${v.start_sec}s` : ""
  }`;

/** „1:02:30“ → 3750, „12:30“ → 750, „90“ → 90 s */
export function toSeconds(s: string | undefined | null): number | null {
  if (!s) return null;
  const t = s.trim();
  if (!/^\d{1,5}(:\d{1,2}){0,2}$/.test(t)) return null;
  const p = t.split(":").map(Number);
  if (p.length > 1 && p.slice(1).some((n) => n > 59)) return null;
  return p.reduce((acc, n) => acc * 60 + n, 0);
}

/** 750 → „12:30“, 3750 → „1:02:30“ */
export function fmtTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Úsek „12:30–25:10“ (pomlčka, spojovník nebo „-“). Konec je nepovinný: „12:30–“. */
export function parseRange(s: string | undefined | null): { start: number; end: number | null } | null {
  if (!s) return null;
  const m = s.trim().match(/^(\d{1,5}(?::\d{1,2}){0,2})\s*[–—-]\s*(\d{1,5}(?::\d{1,2}){0,2})?$/);
  if (!m) return null;
  const start = toSeconds(m[1]);
  const end = m[2] ? toSeconds(m[2]) : null;
  if (start === null || (m[2] && end === null) || (end !== null && end <= start)) return null;
  return { start, end };
}

export const rangeLabel = (v: Pick<BlockVideoRow, "start_sec" | "end_sec">) =>
  v.start_sec == null && v.end_sec == null ? "" : `${fmtTime(v.start_sec ?? 0)}–${v.end_sec ? fmtTime(v.end_sec) : "konec"}`;

const minutesOf = (start: number, end: number | null) => (end ? Math.max(1, Math.round((end - start) / 60)) : null);

const sortVideos = (list: BlockVideoRow[]) => [...list].sort((a, b) => a.position - b.position);

/* ---------- Sdílená paměť pro uživatelský pohled (jedno načtení na stránku) ---------- */

interface Store {
  videos: BlockVideoRow[];
  watched: Set<string>;
  ready: boolean;
}
let store: Store = { videos: [], watched: new Set(), ready: false };
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

async function loadStore() {
  const [v, w] = await Promise.all([
    db.from("block_videos").select("*").eq("published", true),
    db.from("block_video_views").select("video_id"),
  ]);
  store = {
    videos: (v.data as BlockVideoRow[] | null) ?? [],
    watched: new Set(((w.data as { video_id: string }[] | null) ?? []).map((r) => r.video_id)),
    ready: true,
  };
  emit();
}

/** Po změně v administraci načíst znovu. */
export function refreshBlockVideos() {
  loading = loadStore().catch(() => undefined);
  return loading;
}

export function useBlockVideos(key: string) {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    if (!loading) loading = loadStore().catch(() => undefined);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const videos = sortVideos(store.videos.filter((v) => v.block_key === key));
  return { videos, watched: store.watched, ready: store.ready };
}

export async function setWatched(videoId: string, value: boolean) {
  const next = new Set(store.watched);
  if (value) next.add(videoId);
  else next.delete(videoId);
  store = { ...store, watched: next };
  emit();
  const { error } = value
    ? await db
        .from("block_video_views")
        .upsert({ video_id: videoId }, { onConflict: "user_id,video_id", ignoreDuplicates: true })
    : await db.from("block_video_views").delete().eq("video_id", videoId);
  if (error) {
    // vrátit zpět
    const back = new Set(store.watched);
    if (value) back.delete(videoId);
    else back.add(videoId);
    store = { ...store, watched: back };
    emit();
  }
}

/* ---------- Administrace ---------- */

export async function loadAdminVideos(): Promise<BlockVideoRow[]> {
  const { data, error } = await db.from("block_videos").select("*").order("position");
  if (error) throw error;
  return (data as BlockVideoRow[]) ?? [];
}

export async function addVideos(
  key: string,
  items: NewVideo[],
  startPosition: number,
) {
  const rows = items.map((it, i) => ({ ...it, block_key: key, position: startPosition + i + 1 }));
  const { error } = await db.from("block_videos").insert(rows);
  if (error) throw error;
}

export async function updateVideo(id: string, patch: Partial<Omit<BlockVideoRow, "id" | "block_key">>) {
  const { error } = await db.from("block_videos").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteVideo(id: string) {
  const { error } = await db.from("block_videos").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderVideos(key: string, ids: string[]) {
  const { error } = await db.rpc("block_videos_reorder", { p_block_key: key, p_ids: ids });
  if (error) throw error;
}

/**
 * Hromadné vložení: jeden řádek = jedno video, „Název | odkaz | minuty“ (minuty nepovinné),
 * nebo jen odkaz. Oddělovač | nebo tabulátor (vložení z Excelu).
 * Kapitola z dlouhé přednášky: místo minut úsek „Název | odkaz | 12:30–25:10“.
 */
export function parseBulk(text: string) {
  const ok: NewVideo[] = [];
  const bad: string[] = [];
  for (const line of text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)) {
    const cells = line
      .split(/\t|\s\|\s|\|/)
      .map((c) => c.trim())
      .filter(Boolean);
    const linkIdx = cells.findIndex((c) => parseVimeo(c));
    if (linkIdx < 0) {
      bad.push(line);
      continue;
    }
    const v = parseVimeo(cells[linkIdx])!;
    // Z Excelu může přijít „https://vimeo.com/“ a číslo v samostatných buňkách – odkazy do názvu nepatří.
    const rest = cells.filter((c, i) => i !== linkIdx && !/^https?:\/\//i.test(c) && !/^\d{6,15}$/.test(c));
    const rangeCell = rest.find((c) => parseRange(c));
    const minCell = rest.find((c) => c !== rangeCell && /^\d{1,3}(:\d{2}){0,2}$/.test(c));
    const title = rest.find((c) => c !== minCell && c !== rangeCell) ?? `Video ${v.id}`;
    const range = parseRange(rangeCell);
    ok.push({
      title: title.slice(0, 160),
      vimeo_id: v.id,
      vimeo_hash: v.hash,
      minutes: range ? minutesOf(range.start, range.end) ?? toMinutes(minCell) : toMinutes(minCell),
      start_sec: range?.start ?? null,
      end_sec: range?.end ?? null,
    });
  }
  return { ok, bad };
}

/** „6:38“ → 7, „1:02:00“ → 62, „12“ → 12 */
export function toMinutes(s: string | undefined | null): number | null {
  if (!s) return null;
  const p = s.split(":").map(Number);
  if (p.some((n) => Number.isNaN(n))) return null;
  // Excel ukládá „6:38“ (min:s) často jako čas 6:38:00 – nulové sekundy bereme jako min:s.
  const excelTime = p.length === 3 && p[2] === 0 && p[0] < 60;
  const sec = excelTime
    ? p[0] * 60 + p[1]
    : p.length === 3
      ? p[0] * 3600 + p[1] * 60 + p[2]
      : p.length === 2
        ? p[0] * 60 + p[1]
        : p[0] * 60;
  const m = Math.max(1, Math.round(sec / 60));
  return m > 600 ? null : m;
}
