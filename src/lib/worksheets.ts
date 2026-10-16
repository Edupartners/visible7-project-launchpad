/**
 * Pracovní listy VISIBLE7 ke stažení (stránka /pracovni-listy).
 * PDF zdarma leží v public/listy, náhledy v public/listy/nahled. Listy pro členy tu mají jen náhled.
 * Zdroj listů: Documents › 02 PROJEKTY › VISIBLE7 › Pracovní listy › Nová sada 2026 (generátor v _zdroj).
 */
export type WorksheetPhase = "V" | "I" | "S" | "IM" | "B" | "L" | "E";

export interface Worksheet {
  slug: string;
  code: string;
  title: string;
  phase: WorksheetPhase;
  desc: string;
  free: boolean;
}

export const PHASE_LABELS: Record<WorksheetPhase, { letter: string; name: string }> = {
  V: { letter: "V", name: "Vize" },
  I: { letter: "I", name: "Ideace" },
  S: { letter: "S", name: "Strategie a čísla" },
  IM: { letter: "I", name: "Implementace" },
  B: { letter: "B", name: "Budování poptávky" },
  L: { letter: "L", name: "Launch" },
  E: { letter: "E", name: "Expanze" },
};

export const BUNDLE = {
  slug: "startovni-balicek",
  file: "/listy/visible7-pracovni-listy-startovni-balicek.pdf",
  title: "Startovní balíček: Vize a Ideace",
  desc: "Úvod do metodiky a 11 listů pro první dvě fáze v jednom PDF.",
};

export const WORKSHEETS: Worksheet[] = [
  {
    slug: "v0-karta-projektu",
    code: "V0",
    title: "Karta projektu",
    phase: "V",
    desc: "Vize na začátku a na konci. Rozdíl ukáže, jak jste se posunuli.",
    free: true,
  },
  {
    slug: "v1-vyber-napadu",
    code: "V1",
    title: "Výběr nápadu",
    phase: "V",
    desc: "10 kritérií s vahami: který nápad rozjet jako první.",
    free: true,
  },
  {
    slug: "v2-six-paths",
    code: "V2",
    title: "Six Paths",
    phase: "V",
    desc: "Šest cest k modrému oceánu. Kde hledat nový trh.",
    free: true,
  },
  {
    slug: "v3-errc",
    code: "V3",
    title: "ERRC",
    phase: "V",
    desc: "Co eliminovat, snížit, zvýšit a vytvořit.",
    free: true,
  },
  {
    slug: "v4-mapa-modreho-oceanu",
    code: "V4",
    title: "Mapa modrého oceánu",
    phase: "V",
    desc: "Strategická křivka vás a konkurence.",
    free: true,
  },
  {
    slug: "v5-mapa-uzitku",
    code: "V5",
    title: "Mapa užitku",
    phase: "V",
    desc: "Kde zákazníkovi přinesete hodnotu, kterou nikdo nedává.",
    free: true,
  },
  {
    slug: "v6-hooked-model",
    code: "V6",
    title: "Hooked model",
    phase: "V",
    desc: "Proč se k vám lidé budou vracet bez reklamy.",
    free: true,
  },
  {
    slug: "v7-swot",
    code: "V7",
    title: "SWOT",
    phase: "V",
    desc: "Silné a slabé stránky, příležitosti a hrozby.",
    free: true,
  },
  {
    slug: "i1-lean-canvas",
    code: "I1",
    title: "Lean Canvas",
    phase: "I",
    desc: "Byznys model na jedné stránce.",
    free: true,
  },
  {
    slug: "i2-projektovy-plan",
    code: "I2",
    title: "Projektový plán",
    phase: "I",
    desc: "Úkoly, termíny a odpovědnosti na 3 měsíce.",
    free: true,
  },
  {
    slug: "i3-pre-mortem",
    code: "I3",
    title: "Pre-mortem",
    phase: "I",
    desc: "Proč by projekt mohl selhat, a co s tím udělat dnes.",
    free: true,
  },
  {
    slug: "s1-bod-zvratu",
    code: "S1",
    title: "Bod zvratu",
    phase: "S",
    desc: "Kolik musíte prodat, aby se zaplatily náklady.",
    free: false,
  },
  {
    slug: "im1-checklist-webu",
    code: "I·1",
    title: "Checklist webu",
    phase: "IM",
    desc: "Co projít, než web spustíte.",
    free: false,
  },
  {
    slug: "im2-prodejni-trychtyr",
    code: "I·2",
    title: "Prodejní trychtýř",
    phase: "IM",
    desc: "Od reklamy po děkovací stránku.",
    free: false,
  },
  {
    slug: "im3-checklist-ai-first-web",
    code: "I·3",
    title: "Checklist AI-first web",
    phase: "IM",
    desc: "Aby vašemu webu rozuměl Google i AI asistenti.",
    free: true,
  },
  {
    slug: "im4-spusteni-dopravy",
    code: "I·4",
    title: "Spuštění dopravy v e-shopu",
    phase: "IM",
    desc: "Dopravci, ceny, vratky a testovací zásilka.",
    free: false,
  },
  {
    slug: "b1-merici-plan",
    code: "B1",
    title: "Měřicí plán",
    phase: "B",
    desc: "Cíle, události v GA4 a čísla, která sledovat.",
    free: false,
  },
  {
    slug: "b2-a-b-test",
    code: "B2",
    title: "A/B test",
    phase: "B",
    desc: "Hypotéza, varianty, měření a rozhodnutí.",
    free: false,
  },
  {
    slug: "b3-errc-pro-seo-a-ai",
    code: "B3",
    title: "ERRC pro SEO a AI",
    phase: "B",
    desc: "Aby vás doporučovala AI. S testem na skutečných dotazech.",
    free: true,
  },
  {
    slug: "b4-vykonnostni-reklama",
    code: "B4",
    title: "Výkonnostní reklama",
    phase: "B",
    desc: "Google Ads, Sklik, Meta a remarketing s rozpočtem a PNO.",
    free: false,
  },
  {
    slug: "b5-affiliate",
    code: "B5",
    title: "Affiliate",
    phase: "B",
    desc: "Vydělávejte na doporučení, nebo nechte doporučovat jiné.",
    free: false,
  },
  {
    slug: "l1-od-napadu-k-mvp",
    code: "L1",
    title: "Od nápadu k MVP",
    phase: "L",
    desc: "Idea, Proof of Concept, MVP a stabilita.",
    free: false,
  },
  {
    slug: "e1-vernostni-program",
    code: "E1",
    title: "Věrnostní program",
    phase: "E",
    desc: "Za co dávat body a kolik vás to bude stát.",
    free: false,
  },
  {
    slug: "e2-caesaruv-kvadrant",
    code: "E2",
    title: "Caesarův kvadrant",
    phase: "E",
    desc: "Kam dáváte energii: růst, stabilita, marketing, vztahy.",
    free: false,
  },
];

export const worksheetFile = (w: Pick<Worksheet, "slug">) => `/listy/${w.slug}.pdf`;
export const worksheetPreview = (w: Pick<Worksheet, "slug">) => `/listy/nahled/${w.slug}.webp`;
