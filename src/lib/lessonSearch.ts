/**
 * Hledání v lekcích: najde konkrétní kapitolu („jak nahodit GA4“) a pošle uživatele přímo na ni.
 * Hledá v názvu lekce, v názvu karty a přednášky a v klíčových slovech z titulků (public/lesson-index.json).
 * Všechno běží v prohlížeči nad videi, která už aplikace načítá.
 */
import { AREA_NAMES, ALL_BLOCKS, type BlockArea, type BlockVideoRow } from "@/lib/blockVideos";
import { BUILD_TYPES } from "@/lib/buildPlans";
import { CHANNELS } from "@/lib/marketingPlans";
import { lectureName } from "@/lib/videoCovers";

/** Malá písmena bez diakritiky. */
export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

const words = (s: string) => fold(s).match(/[a-z0-9]+/g) ?? [];

/** Slova, která nic nehledají („jak nahodit GA4“ → „ga4“). */
const STOP = new Set(
  "jak co kde kdy proc jaky jaka jake mam muzu lze se si to ten ta na do v ve z ze s k o a i u pro po pri by je jsou nahodit nahodim nastavit nastavim nastaveni udelat udelam zalozit zalozim zprovoznit pridat pridam funguje fungovat chci potrebuji potrebuju navod navody video videa lekce zacit spravne pres bez pomoci jako nebo kdyz".split(
    " ",
  ),
);

/** Zkratky a synonyma: hledaný výraz → další slova, která znamenají totéž. */
const SYNONYMS: Record<string, string[]> = {
  ga4: ["analytics", "ga"],
  ga: ["analytics", "ga4"],
  analytika: ["analytics"],
  gtm: ["tag", "manager"],
  tagmanager: ["tag", "manager"],
  manager: ["gtm"],
  lista: ["banner", "cookies"],
  newsletter: ["email", "emaily", "emailing"],
  email: ["emaily", "newsletter"],
  fb: ["facebook", "meta"],
  facebook: ["meta", "fb"],
  meta: ["facebook"],
  instagram: ["meta", "ig"],
  ig: ["instagram"],
  eshop: ["shoptet", "obchod"],
  "e-shop": ["shoptet"],
  obchod: ["eshop", "shoptet"],
  reklama: ["kampan", "ads", "reklamy"],
  reklamy: ["kampan", "ads"],
  kampan: ["reklama"],
  ppc: ["ads", "kampan"],
  web: ["stranka", "webu"],
  stranky: ["web"],
  seo: ["vyhledavani", "google"],
  ai: ["chatgpt", "umela"],
  chatgpt: ["ai", "gpt"],
  konverze: ["konverzi", "nakup"],
  mereni: ["analytics", "konverze"],
  cookies: ["cookie", "souhlas"],
  platby: ["platba", "platebni"],
  doprava: ["doruceni", "dopravy"],
  produkty: ["produkt", "zbozi"],
  kreativy: ["kreativa", "bannery", "video"],
  texty: ["text", "copywriting"],
  sklik: ["seznam"],
};

/** Kmen slova pro titulky (prvních 5 písmen, stejně jako při stavbě indexu). */
const stem = (w: string) => w.slice(0, 5);

export interface LessonHit {
  video: BlockVideoRow;
  /** Kam kliknutí vede (karta s otevřenou lekcí). */
  href: string;
  cardTitle: string;
  place: string;
  lecture: string | null;
  score: number;
}

/* ---------- Kam lekce patří ---------- */

const blockTitle = new Map(ALL_BLOCKS.map((b) => [b.key, b.title]));
const SHARED_MKT = new Set(["mereni", "rozpocet", "konkurence"]);

function routeOf(blockKey: string, businessType: string | null | undefined): { path: string; place: string } | null {
  const [area, id] = blockKey.split(":") as [BlockArea, string];
  if (!id) return null;
  if (area === "marketing") {
    if (SHARED_MKT.has(id)) return { path: "/benchmarking-phase", place: "Brána 5 · Budování poptávky" };
    const ch = CHANNELS.find((c) => c.blocks.includes(id));
    return ch ? { path: `/marketing-channel/${ch.id}`, place: `Brána 5 · ${ch.name}` } : null;
  }
  if (area === "tvorba") {
    const own = BUILD_TYPES.find((t) => t.id === businessType && t.blocks.includes(id));
    const t = own ?? BUILD_TYPES.find((x) => x.blocks.includes(id));
    return t ? { path: `/business-type/${t.id}`, place: `Brána 4 · ${t.name}` } : null;
  }
  if (area === "start") return { path: "/launch", place: "Brána 6 · Launch" };
  if (area === "rust") return { path: "/expansion", place: "Brána 7 · Expanze" };
  if (area === "bonus") return { path: "/bonusy", place: "Bonus" };
  return { path: "/home", place: AREA_NAMES[area] ?? "" };
}

export const lessonHref = (path: string, blockId: string, videoId: string) =>
  `${path}?blok=${encodeURIComponent(blockId)}&lekce=${encodeURIComponent(videoId)}`;

/* ---------- Index ---------- */

interface Doc {
  hit: Omit<LessonHit, "score">;
  title: string[];
  meta: string[];
  transcript: Set<string>;
}

export type TranscriptIndex = Record<string, string>;

let transcriptPromise: Promise<TranscriptIndex> | null = null;
/** Klíčová slova z titulků se načtou až při prvním otevření hledání. */
export const loadTranscripts = () =>
  (transcriptPromise ??= fetch("/lesson-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<TranscriptIndex>) : {}))
    .catch(() => ({})));

export function buildDocs(
  videos: BlockVideoRow[],
  transcripts: TranscriptIndex | null,
  businessType: string | null | undefined,
): Doc[] {
  const seen = new Set<string>();
  const docs: Doc[] = [];
  for (const v of [...videos].sort((a, b) => a.block_key.localeCompare(b.block_key) || a.position - b.position)) {
    const dupe = `${v.vimeo_id}:${v.start_sec ?? ""}:${v.end_sec ?? ""}:${fold(v.title)}`;
    if (seen.has(dupe)) continue;
    const route = routeOf(v.block_key, businessType);
    if (!route) continue;
    seen.add(dupe);
    const blockId = v.block_key.split(":")[1];
    const cardTitle = blockTitle.get(v.block_key) ?? "";
    const lecture = lectureName(v.vimeo_id);
    const t = transcripts?.[`${v.vimeo_id}:${v.start_sec ?? 0}`];
    docs.push({
      hit: { video: v, href: lessonHref(route.path, blockId, v.id), cardTitle, place: route.place, lecture },
      title: words(v.title),
      meta: words(`${cardTitle} ${route.place} ${lecture ?? ""}`),
      transcript: new Set(t ? t.split(" ") : []),
    });
  }
  return docs;
}

/** Hledaný výraz → skupiny slov; každá skupina = jedno slovo dotazu i se synonymy. */
function queryGroups(q: string): string[][] {
  const raw = fold(q).replace(/e-shop/g, "eshop");
  return (raw.match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length >= 2 && !STOP.has(w))
    .map((w) => [w, ...(SYNONYMS[w] ?? [])]);
}

const prefixHit = (list: string[], term: string) =>
  list.some((w) => w === term || (term.length >= 3 && w.startsWith(term)) || (w.length >= 4 && term.startsWith(w)));

function scoreGroup(d: Doc, group: string[]): number {
  let best = 0;
  group.forEach((term, i) => {
    const weight = i === 0 ? 1 : 0.7; // synonymum váží o něco méně
    let s = 0;
    if (prefixHit(d.title, term)) s = 10;
    else if (prefixHit(d.meta, term)) s = 5;
    else if (term.length >= 4 && d.transcript.has(stem(term))) s = 2;
    best = Math.max(best, s * weight);
  });
  return best;
}

/** „nahodit“, „nastavit“…: člověk chce zprovoznit, takže dostanou přednost lekce z implementace (brána 4). */
const SETUP = /\b(nahod|nastav|zaloz|vloz|instal|zprovozn|propoj|implement)/;

export function searchLessons(docs: Doc[], q: string, limit = 30): LessonHit[] {
  const groups = queryGroups(q);
  if (groups.length === 0) return [];
  const setup = SETUP.test(fold(q));
  return docs
    .map((d) => {
      const parts = groups.map((g) => scoreGroup(d, g));
      const matched = parts.filter((p) => p > 0).length;
      const boost = setup && d.hit.video.block_key.startsWith("tvorba:") ? 3 : 0;
      // Každé slovo dotazu, které v lekci chybí, ji posune níž.
      const score = parts.reduce((a, b) => a + b, 0) + boost - 5 * (groups.length - matched);
      return { d, score, matched };
    })
    .filter((s) => s.matched > 0 && s.score > 0)
    .sort((a, b) => b.score - a.score || a.d.hit.video.position - b.d.hit.video.position)
    // Slabé shody jen z titulků schovat, když jsou k dispozici lekce, které téma mají přímo v názvu.
    .filter((s, _i, all) => s.score >= all[0].score * 0.35)
    .slice(0, limit)
    .map(({ d, score }) => ({ ...d.hit, score }));
}
