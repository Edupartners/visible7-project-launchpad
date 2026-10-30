/**
 * Vybrané kurzy na úvodní stránce. Délky se počítají z publikovaných videí (block_videos):
 * u kapitol z dlouhé přednášky end_sec − start_sec, jinak minutes. Funkce course_hours
 * (migrace 20261030120000_course_hours.sql) vrací jen součty, ne odkazy na videa.
 * Dokud funkce v databázi není, ukazujeme hodnoty změřené 30. 10. 2026.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/visible7/client";

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
    title: "Web a e-shop na WordPressu",
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
    title: "Google Ads a Sklik",
    gate: "Brána 5",
    lecturer: "",
    cover: "/video-covers/ppc.webp",
    keys: ["marketing:google_klic", "marketing:google_kampan", "marketing:sklik_kampan"],
  },
  {
    id: "meta",
    title: "Facebook a Instagram reklama",
    gate: "Brána 5",
    lecturer: "Renata Dimitrov",
    cover: "/video-covers/facebook.webp",
    keys: ["marketing:meta_ucet", "marketing:meta_kampan"],
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
    id: "grafika",
    title: "Grafika zdarma ve Photopea",
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

/** „6,4 h“, „25 min“; když některá videa nemají délku, přidá „+“. */
export const durationLabel = ({ minutes, missing }: { minutes: number; missing: number }) => {
  const base =
    minutes < 60 ? `${Math.round(minutes)} min` : `${(Math.round((minutes / 60) * 10) / 10).toLocaleString("cs-CZ")} h`;
  return missing > 0 ? `${base}+` : base;
};

/** Celkové hodiny zaokrouhlené dolů na desítky pro nadpis („přes 40 hodin“). */
export const hoursFloor10 = (h: number) => Math.max(10, Math.floor(h / 10) * 10);
