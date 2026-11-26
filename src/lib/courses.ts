/**
 * Vybrané kurzy na úvodní stránce. Délky se počítají z publikovaných videí (block_videos):
 * u kapitol z dlouhé přednášky end_sec − start_sec, jinak minutes. Funkce course_hours
 * (migrace 20261030120000_course_hours.sql) vrací jen součty, ne odkazy na videa.
 * Dokud funkce v databázi není, ukazujeme hodnoty změřené 30. 10. 2026.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/visible7/client";
import type { BlockVideoRow } from "@/lib/blockVideos";

/** Za kolik se kurz prodává samostatně (LearnWorlds), vč. DPH. */
export const COURSE_PRICE = 3780;

export interface FeaturedCourse {
  id: string;
  title: string;
  gate: string;
  lecturer: string;
  cover: string;
  keys: string[];
}

export const FEATURED_COURSES: FeaturedCourse[] = [
  {
    id: "web",
    title: "Tvorba webu na WordPressu s AI",
    gate: "Brána 4",
    lecturer: "Michal Míček",
    cover: "/video-covers/web.webp",
    keys: [
      "tvorba:domena",
      "tvorba:hosting",
      "tvorba:vzhled",
      "tvorba:woo",
      "tvorba:clanky",
      "tvorba:poptavka",
      "tvorba:pravni",
      "tvorba:kurz",
    ],
  },
  {
    id: "shoptet",
    title: "E-shop na Shoptetu krok za krokem",
    gate: "Brána 4",
    lecturer: "Lukáš",
    cover: "/video-covers/eshop.webp",
    keys: ["tvorba:shoptet", "tvorba:produkty", "tvorba:platby"],
  },
  {
    id: "copy",
    title: "Copywriting: texty, které prodávají",
    gate: "Brány 4–5",
    lecturer: "Andrea Votrubová",
    cover: "/video-covers/copywriting.webp",
    keys: ["tvorba:texty", "tvorba:prodejni", "marketing:texty"],
  },
  {
    id: "affiliate",
    title: "Affiliate: partnerské programy",
    gate: "Brány 4–5",
    lecturer: "Patrik Zapletal",
    cover: "/video-covers/affiliate.webp",
    keys: ["tvorba:affiliate", "marketing:affiliate_program"],
  },
  {
    id: "ppc",
    title: "PPC: výkonnostní reklama v Google Ads a Skliku",
    gate: "Brána 5",
    lecturer: "Veronika Miklová",
    cover: "/video-covers/ppc.webp",
    keys: ["marketing:google_klic", "marketing:google_kampan", "marketing:sklik_kampan"],
  },
  {
    id: "meta",
    title: "Facebook a Instagram reklama",
    gate: "Brána 5",
    lecturer: "Renata Dimitrov, Martina a Štěpán",
    cover: "/video-covers/facebook.webp",
    keys: ["marketing:meta_strategie", "marketing:meta_ucet", "marketing:meta_kreativy", "marketing:meta_kampan"],
  },
  {
    id: "seo",
    title: "SEO: základ a obsah",
    gate: "Brána 5",
    lecturer: "Michal Míček",
    cover: "/video-covers/seo.webp",
    keys: ["marketing:seo_zaklad", "marketing:seo_obsah"],
  },
  {
    id: "znacka",
    title: "Ochranná známka a legislativa",
    gate: "Brána 6",
    lecturer: "Michaela Stančová",
    cover: "/video-covers/znacka.webp",
    keys: ["start:znacka"],
  },
  {
    id: "data",
    title: "Data a Power BI",
    gate: "Brána 7",
    lecturer: "Honza Novák",
    cover: "/video-covers/data.webp",
    keys: ["rust:data"],
  },
  {
    id: "ga4",
    title: "Google Analytics 4 a Tag Manager",
    gate: "Brány 4–5",
    lecturer: "Patrik Zapletal",
    cover: "/video-covers/data.webp",
    keys: ["tvorba:mereni", "marketing:mereni"],
  },
  {
    id: "ai_viditelnost",
    title: "Buď vidět pro lidi i AI",
    gate: "Bonus",
    lecturer: "Michal Míček",
    cover: "/video-covers/seo.webp",
    keys: ["bonus:ai_viditelnost"],
  },
  {
    id: "grafika",
    title: "Grafika ve Photopea",
    gate: "Bonus",
    lecturer: "Hana Antonová",
    cover: "/video-covers/grafika.webp",
    keys: ["bonus:grafika"],
  },
  {
    id: "aiact",
    title: "AI Act v praxi (s\u00a0osvědčením)",
    gate: "Bonus",
    lecturer: "Michal Míček",
    cover: "/video-covers/ai.webp",
    keys: ["bonus:ai_act"],
  },
];

/** Minuty a počet videí bez délky podle karty – stav 30. 10. 2026. */
type Totals = Record<string, { minutes: number; missing: number }>;
const SNAPSHOT: Totals = {
  "bonus:ai_act": { minutes: 25, missing: 0 },
  "bonus:grafika": { minutes: 576, missing: 0 },
  "marketing:affiliate_program": { minutes: 145, missing: 0 },
  "marketing:google_kampan": { minutes: 190, missing: 0 },
  "marketing:google_klic": { minutes: 55, missing: 0 },
  "marketing:meta_kampan": { minutes: 119, missing: 0 },
  "marketing:meta_ucet": { minutes: 105, missing: 0 },
  "marketing:seo_obsah": { minutes: 28, missing: 1 },
  "marketing:mereni": { minutes: 147, missing: 0 },
  "tvorba:mereni": { minutes: 60, missing: 0 },
  "marketing:seo_zaklad": { minutes: 84, missing: 6 },
  "marketing:sklik_kampan": { minutes: 34, missing: 0 },
  "marketing:texty": { minutes: 59, missing: 0 },
  "rust:data": { minutes: 232, missing: 0 },
  "start:znacka": { minutes: 208, missing: 0 },
  "tvorba:affiliate": { minutes: 77, missing: 0 },
  "tvorba:clanky": { minutes: 22, missing: 0 },
  "tvorba:domena": { minutes: 56, missing: 0 },
  "tvorba:hosting": { minutes: 70, missing: 0 },
  "tvorba:kurz": { minutes: 19, missing: 0 },
  "tvorba:poptavka": { minutes: 36, missing: 0 },
  "tvorba:pravni": { minutes: 12, missing: 0 },
  "tvorba:prodejni": { minutes: 90, missing: 0 },
  "tvorba:texty": { minutes: 101, missing: 0 },
  "tvorba:vzhled": { minutes: 98, missing: 0 },
  "tvorba:woo": { minutes: 72, missing: 0 },
};

async function loadTotals(): Promise<Totals> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("course_hours");
  if (error || !Array.isArray(data) || data.length === 0) return SNAPSHOT;
  const out: Totals = {};
  for (const r of data as { block_key: string; minutes: number; missing: number }[])
    out[r.block_key] = { minutes: Number(r.minutes) || 0, missing: Number(r.missing) || 0 };
  return out;
}

export function useCourseHours() {
  const totals = useQuery({ queryKey: ["course_hours"], queryFn: loadTotals, staleTime: 60 * 60_000 }).data ?? SNAPSHOT;
  const course = (c: FeaturedCourse) =>
    c.keys.reduce(
      (s, k) => ({ minutes: s.minutes + (totals[k]?.minutes ?? 0), missing: s.missing + (totals[k]?.missing ?? 0) }),
      { minutes: 0, missing: 0 },
    );
  const allMinutes = Object.values(totals).reduce((s, t) => s + t.minutes, 0);
  return { course, totalHours: Math.floor(allMinutes / 60) };
}

/** Lekce a hodiny bez zdvojení (kapitola ve dvou kartách se počítá jednou). Funkce lesson_stats, stav 18. 11. 2026 jako záloha. */
const LESSONS_SNAPSHOT = { lessons: 455, minutes: 3290 };

async function loadLessons() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("lesson_stats");
  const r = Array.isArray(data) ? data[0] : null;
  if (error || !r) return LESSONS_SNAPSHOT;
  return {
    lessons: Number(r.lessons) || LESSONS_SNAPSHOT.lessons,
    minutes: Number(r.minutes) || LESSONS_SNAPSHOT.minutes,
  };
}

export function useLessonStats() {
  const s =
    useQuery({ queryKey: ["lesson_stats"], queryFn: loadLessons, staleTime: 60 * 60_000 }).data ?? LESSONS_SNAPSHOT;
  return { lessons: s.lessons, hours: Math.floor(s.minutes / 60) };
}

/** Lektoři jen křestními jmény: „Patrik Zapletal“ → „Patrik“, „Renata Dimitrov, Martina a Štěpán“ → „Renata, Martina a Štěpán“. */
export const firstNames = (lecturer: string) =>
  lecturer
    .split(/(,\s*|\s+a\s+)/)
    .map((part) => (/^(,\s*|\s+a\s+)$/.test(part) ? part : part.trim().split(/\s+/)[0]))
    .join("");

/** „6,4 h“, „25 min“; když některá videa nemají délku, přidá „+“. */
export const durationLabel = ({ minutes, missing }: { minutes: number; missing: number }) => {
  const base =
    minutes < 60 ? `${Math.round(minutes)} min` : `${(Math.round((minutes / 60) * 10) / 10).toLocaleString("cs-CZ")} h`;
  return missing > 0 ? `${base}+` : base;
};

/** Celkové hodiny zaokrouhlené dolů na desítky pro nadpis („přes 40 hodin“). */
export const hoursFloor10 = (h: number) => Math.max(10, Math.floor(h / 10) * 10);

/* ---------- Kurzy v bráně 5 (katalog jako v LMS) ---------- */

/** Kurzy marketingu v bráně 5, v pořadí, jak je ukazujeme. */
export const MARKETING_COURSE_IDS = ["ppc", "meta", "ga4", "seo", "copy", "affiliate"];

/** Ke kterým kanálům kurz patří (doporučení podle projektu). GA4 doporučujeme všem. */
export const COURSE_CHANNELS: Record<string, string[]> = {
  ppc: ["google-ads", "sklik"],
  meta: ["meta"],
  seo: ["seo"],
  affiliate: ["affiliate"],
  copy: [],
  ga4: [],
};
export const ALWAYS_RECOMMENDED = ["ga4"];

/** Kanály, které mají vlastní kurz – v seznamu kanálů se už neukazují zvlášť. */
export const CHANNELS_WITH_COURSE = Object.values(COURSE_CHANNELS).flat();

export const courseById = (id: string) => FEATURED_COURSES.find((c) => c.id === id) ?? null;

/** Číslo brány kurzu (první číslo ze štítku „Brány 4–5“), bonus = null. */
export const courseGate = (c: FeaturedCourse) => {
  const m = c.gate.match(/\d/);
  return m ? Number(m[0]) : null;
};

/** Lekce kurzu: videa ze všech jeho karet, bez zdvojení (stejná kapitola ve dvou kartách jednou). */
export function courseVideos(c: FeaturedCourse, all: BlockVideoRow[]) {
  const seen = new Set<string>();
  const out: BlockVideoRow[] = [];
  for (const key of c.keys) {
    const rows = all.filter((v) => v.block_key === key).sort((a, b) => a.position - b.position);
    for (const v of rows) {
      const sig = `${v.vimeo_id}:${v.start_sec ?? ""}:${v.end_sec ?? ""}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      out.push(v);
    }
  }
  return out;
}

export const videoMinutes = (v: BlockVideoRow) =>
  v.start_sec != null && v.end_sec != null ? Math.max(1, Math.round((v.end_sec - v.start_sec) / 60)) : (v.minutes ?? 0);

export const hoursLabel = (min: number) =>
  min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}` : `${min} min`;

export const lessonsLabel = (n: number) => `${n} ${n === 1 ? "lekce" : n >= 2 && n <= 4 ? "lekce" : "lekcí"}`;

/** Obsah osvědčení o absolvování kurzu (podle skutečných lekcí). Bonusové kurzy mají obsah v bonuses.ts. */
export interface CourseCertContent {
  certificateFor: string;
  skills: string[];
  topics: string[];
}

export const COURSE_CERT: Record<string, CourseCertContent> = {
  web: {
    certificateFor: "za absolvování kurzu tvorby webu a e-shopu na WordPressu s pomocí AI",
    skills: ["tvorba webu na WordPressu", "nastavení e-shopu ve WooCommerce"],
    topics: [
      "Zaregistruje doménu, zřídí webhosting a nainstaluje WordPress s SSL certifikátem",
      "Postaví web v Elementoru: úvodní stránku, menu, sekce a návrh s pomocí AI",
      "Spustí e-shop ve WooCommerce včetně produktů, dopravy a platby kartou",
      "Nastaví poptávkový formulář, blog a základní SEO",
      "Doplní cookies lištu a přenese web z počítače na server",
    ],
  },
  shoptet: {
    certificateFor: "za absolvování kurzu založení a nastavení e-shopu na platformě Shoptet",
    skills: ["založení e-shopu na Shoptetu", "správa produktů a kategorií"],
    topics: [
      "Založí e-shop na Shoptetu a nastaví šablonu, logo a bannery",
      "Navrhne kategorie podle hledanosti a napíše meta titulky a popisky s AI",
      "Založí produkty s popisem, cenou, skladem, variantami a parametry",
      "Nastaví dopravu, příznaky a interní prolinkování a otestuje objednávku",
    ],
  },
  copy: {
    certificateFor: "za absolvování kurzu copywritingu a psaní prodejních textů",
    skills: ["psaní prodejních textů", "tvorba persony a tone of voice"],
    topics: [
      "Popíše nabídku přes benefity pro zákazníka, ne přes funkce",
      "Vytvoří personu a určí tone of voice značky",
      "Napíše text pro web, který se dá rychle přečíst a vede k akci",
      "Sestaví prodejní stránku podle modelů AIDA a PAS",
      "Napíše titulky a texty reklam, které zaujmou",
    ],
  },
  affiliate: {
    certificateFor: "za absolvování kurzu affiliate marketingu pro inzerenty i publishery",
    skills: ["spuštění affiliate programu", "tvorba affiliate webu"],
    topics: [
      "Vysvětlí, jak funguje affiliate: inzerent, publisher, provize a sledování",
      "Vybere vlastní platformu nebo affiliate síť a nastaví provizní model",
      "Připraví pravidla a propagační materiály pro partnery a umí s nimi pracovat",
      "Založí affiliate web se správně vybraným tématem a obsahem",
    ],
  },
  ppc: {
    certificateFor: "za absolvování kurzu výkonnostní reklamy v Google Ads a Skliku",
    skills: ["správa kampaní v Google Ads", "správa kampaní ve Skliku"],
    topics: [
      "Rozumí metrikám PPC: CPC, CTR, konverze, PNO a skóre kvality",
      "Vybere klíčová slova v plánovači a zvolí typy shody",
      "Založí a nastaví vyhledávací kampaň v Google Ads včetně reklam a rozšíření",
      "Nastaví měření konverzí, Merchant Center a kampaň Performance Max",
      "Spustí kampaně ve Skliku a pravidelně kampaně optimalizuje",
    ],
  },
  meta: {
    certificateFor: "za absolvování kurzu reklamy na Facebooku a Instagramu",
    skills: ["správa reklam na Facebooku a Instagramu", "tvorba reklamních kreativ"],
    topics: [
      "Naplánuje reklamní strategii podle nákupního cyklu a rozpočtu",
      "Založí firemní portfolio, reklamní účet, Meta Pixel a Conversions API",
      "Připraví reklamní kreativy: bannery v Canvě a videa z telefonu",
      "Nastaví kampaň: účel, cílení, umístění a A/B test",
      "Vyhodnotí výsledky podle tržeb, ne podle kliknutí",
    ],
  },
  seo: {
    certificateFor: "za absolvování kurzu optimalizace webu pro vyhledávače (SEO)",
    skills: ["technické SEO", "obsahová strategie a klíčová slova"],
    topics: [
      "Vysvětlí, jak vyhledávače hodnotí stránky, a vyhne se zakázaným technikám",
      "Zkontroluje indexaci v Search Console a nastaví robots, sitemap a kanonické URL",
      "Upraví strukturu stránky, titulky a alt texty a provede audit v Lighthouse",
      "Vybere klíčová slova a long tail a předejde kanibalizaci",
      "Naplánuje obsah podle fází nákupu a pracuje se Screaming Frog a Ahrefs",
    ],
  },
  znacka: {
    certificateFor: "za absolvování kurzu ochranných známek a duševního vlastnictví",
    skills: ["orientace v ochraně značky", "příprava přihlášky ochranné známky"],
    topics: [
      "Rozliší značku a ochrannou známku a zvolí ochranu v Česku, EU nebo ve světě",
      "Ověří název v databázi ÚPV a vybere třídy výrobků a služeb",
      "Připraví přihlášku ochranné známky a rozumí průběhu řízení",
      "Posoudí riziko zaměnitelnosti a zná možnosti dotace na známku",
    ],
  },
  data: {
    certificateFor: "za absolvování kurzu práce s daty a reportingu v Power BI",
    skills: ["vizualizace dat", "datové modelování v Power BI"],
    topics: [
      "Zvolí správný typ grafu a pozná zavádějící vizualizaci",
      "Navrhne datový model s vazbami mezi tabulkami",
      "Naimportuje a vyčistí data v Power BI",
      "Sestaví a publikuje report tržeb a marketingových kanálů",
    ],
  },
  ga4: {
    certificateFor: "za absolvování kurzu měření webu v Google Analytics 4 a Google Tag Manageru",
    skills: ["nastavení měření v GA4 a Tag Manageru", "vyhodnocování dat z webu"],
    topics: [
      "Určí konverze a mikrokonverze a nasadí měření GA4 na web",
      "Nastaví Google Tag Manager, souhlas s cookies a ověří měření",
      "Používá UTM parametry a vyhodnotí akvizici a zapojení návštěvníků",
      "Vyhodnotí nákupní trychtýř a vstupní stránky",
      "Sestaví report v Looker Studiu a vyhne se chybám při čtení dat",
    ],
  },
};

/** Bonusový kurz (klíč "bonus:<id>") má osvědčení za bonus, ostatní osvědčení za kurz. */
export const courseBonusId = (c: FeaturedCourse) =>
  c.keys.length === 1 && c.keys[0].startsWith("bonus:") ? c.keys[0].slice(6) : null;

/** Kategorie kurzů v katalogu e-learningu (pořadí klíčů = pořadí v katalogu). */
export const COURSE_CATEGORY: Record<string, string> = {
  web: "Web a e-shop",
  shoptet: "Web a e-shop",
  copy: "Marketing",
  ppc: "Marketing",
  meta: "Marketing",
  seo: "Marketing",
  ga4: "Marketing",
  affiliate: "Marketing",
  ai_viditelnost: "AI",
  aiact: "AI",
  znacka: "Právo a data",
  data: "Právo a data",
  grafika: "Bonusy",
};
export const COURSE_ORDER = Object.keys(COURSE_CATEGORY);
export const COURSE_CATEGORIES = ["Vše", "Web a e-shop", "Marketing", "AI", "Právo a data", "Bonusy"];

const sigOf = (v: BlockVideoRow) => `${v.vimeo_id}:${v.start_sec ?? ""}:${v.end_sec ?? ""}`;

/** Postup ve všech kurzech: kapitola se počítá jako zhlédnutá, když ji člověk viděl v kterékoli kartě. */
export function coursesProgress(all: BlockVideoRow[], watched: Set<string>) {
  const seen = new Set(all.filter((v) => watched.has(v.id)).map(sigOf));
  return COURSE_ORDER.map((id) => courseById(id))
    .filter((c): c is FeaturedCourse => !!c)
    .map((course) => {
      const videos = courseVideos(course, all);
      const done = videos.filter((v) => seen.has(sigOf(v))).length;
      const next = videos.find((v) => !seen.has(sigOf(v))) ?? null;
      return {
        course,
        videos,
        done,
        total: videos.length,
        pct: videos.length ? Math.round((done / videos.length) * 100) : 0,
        next,
      };
    })
    .filter((r) => r.total > 0);
}

/** Kurzy převedené z původní platformy, které (zatím) nejsou v katalogu. Jen kvůli převedeným osvědčením. */
export const LEGACY_COURSE_TITLES: Record<string, string> = {
  ai_manazeri: "Master kurz: AI pro manažery",
  grafika_adobe: "Kompletní kurz grafiky Adobe",
};

/** Název kurzu pro osvědčení: z katalogu, jinak z převedených kurzů. */
export const courseTitleFor = (id: string) => courseById(id)?.title ?? LEGACY_COURSE_TITLES[id] ?? "";

Object.assign(COURSE_CERT, {
  ai_manazeri: {
    certificateFor: "za absolvování kurzu Master kurz: AI pro manažery",
    skills: ["využití AI v manažerské práci"],
    topics: ["Využívá nástroje umělé inteligence v řízení a v každodenní práci manažera"],
  },
  grafika_adobe: {
    certificateFor: "za absolvování kompletního kurzu grafiky v programech Adobe",
    skills: ["grafika v Adobe Photoshop", "sazba v Adobe InDesign"],
    topics: [
      "Upravuje fotografie v Adobe Photoshop",
      "Kreslí vektorovou grafiku v Adobe Illustrator",
      "Připraví tiskovou sazbu v Adobe InDesign",
    ],
  },
} satisfies Record<string, CourseCertContent>);
