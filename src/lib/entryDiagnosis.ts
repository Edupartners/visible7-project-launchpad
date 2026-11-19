/**
 * Vstupní diagnostika: mapa toho, co člověk už umí a co se ke startu doučí.
 * Bez AI a bez odhadů tržeb: výsledek počítají pevná pravidla z odpovědí,
 * takže nemůže vzniknout nesmysl. Cílem je ukázat, že start zvládne.
 */
import { GATE_MAIN } from "@/lib/resume";

export const ENTRY_KEY = "entry_diagnosis";

/** Úroveň studia: jen to, co je potřeba ke startu, nebo celý kurz včetně témat do hloubky. */
export type EntryLevel = "start" | "full";
export type SkillLevel = "umim" | "trochu" | "ne";

export interface EntryAnswers {
  level: EntryLevel;
  /** Co by člověk rád dělal (id z WANTS) */
  want: string;
  /** Nepovinný vlastní nápad, pro člověka samotného */
  idea: string;
  skills: Record<string, SkillLevel>;
  /** Hodiny týdně (id z HOURS) */
  hours: string;
}

export interface EntryDiagnosis {
  answers: EntryAnswers;
  createdAt: string;
}

export const EMPTY_ENTRY: EntryAnswers = { level: "start", want: "", idea: "", skills: {}, hours: "" };

export const LEVELS: { id: EntryLevel; label: string; text: string }[] = [
  {
    id: "start",
    label: "Chci rozjet vlastní byznys",
    text: "Projdete základ, který ke startu opravdu potřebujete. Nic navíc.",
  },
  {
    id: "full",
    label: "Chci projít celý kurz a získat kvalifikaci",
    text: "Základ a k tomu témata do hloubky. Připraví vás na zkoušku profesní kvalifikace.",
  },
];

export const WANTS: { id: string; label: string; text: string; models: string[] }[] = [
  { id: "vyrobky", label: "Prodávat výrobky", text: "vlastní nebo nakoupené zboží", models: ["eshop", "web-eshop"] },
  {
    id: "sluzby",
    label: "Nabízet služby",
    text: "řemeslo, poradenství, péče, opravy…",
    models: ["konverzni-web", "web-prezentacni"],
  },
  { id: "vzdelavani", label: "Učit druhé", text: "online kurzy, lekce, konzultace", models: ["lms", "konverzni-web"] },
  { id: "obsah", label: "Psát nebo tvořit obsah", text: "blog, videa, doporučování produktů", models: ["blog"] },
  {
    id: "aplikace",
    label: "Vlastní aplikaci nebo platformu",
    text: "digitální produkt",
    models: ["vlastni-napad-app"],
  },
  { id: "nevim", label: "Ještě nevím", text: "pomůžeme vám vybrat", models: [] },
];

export const MODEL_NAMES: Record<string, string> = {
  eshop: "E-shop",
  "web-eshop": "Web + e-shop",
  "konverzni-web": "Konverzní web",
  "web-prezentacni": "Prezentační web",
  lms: "Online kurz",
  blog: "Blog",
  "vlastni-napad-app": "Vlastní aplikace",
};

export const HOURS = [
  { id: "do3", label: "do 3 hodin" },
  { id: "3-6", label: "3–6 hodin" },
  { id: "7-10", label: "7–10 hodin" },
  { id: "vic", label: "víc než 10 hodin" },
];

/** Co je potřeba umět ke spuštění. Každá oblast vede do konkrétní brány. */
export const SKILL_AREAS: { id: string; label: string; gate: number }[] = [
  { id: "zakaznik", label: "Popsat, pro koho to je a jaký problém mu řeším", gate: 1 },
  { id: "odliseni", label: "Říct, čím se liším od konkurence", gate: 1 },
  { id: "overeni", label: "Ověřit, že o to někdo stojí, dřív než utratím peníze", gate: 1 },
  { id: "plan", label: "Sepsat byznys na jednu stránku", gate: 2 },
  { id: "cisla", label: "Spočítat cenu, náklady a kdy to začne vydělávat", gate: 3 },
  { id: "urady", label: "Vybrat formu podnikání a vyřídit živnost a DPH", gate: 3 },
  { id: "web", label: "Postavit jednoduchý web nebo e-shop", gate: 4 },
  { id: "texty", label: "Napsat texty, které prodávají, a připravit produkty", gate: 4 },
  { id: "pravo", label: "Právní minimum webu: obchodní podmínky, GDPR, cookies", gate: 4 },
  { id: "reklama", label: "Získat první zákazníky přes sítě a reklamu", gate: 5 },
  { id: "mereni", label: "Změřit, kolik lidí přišlo a kolik nakoupilo", gate: 5 },
];

/** Témata, která ke startu nepotřebujete. Patří do celého kurzu. */
export const DEEP_TOPICS = [
  "cookies a měření do detailu",
  "SEO a PageRank",
  "LTV a CAC",
  "A/B testy",
  "remarketing",
  "affiliate",
];

export const GATE_LABEL: Record<number, string> = {
  1: "Brána 1: Vize",
  2: "Brána 2: Ideace",
  3: "Brána 3: Strategie a čísla",
  4: "Brána 4: Implementace",
  5: "Brána 5: Budování poptávky",
};

export const gateRoute = (gate: number) => GATE_MAIN[gate];

export function entryResult(a: EntryAnswers) {
  const can = SKILL_AREAS.filter((s) => a.skills[s.id] === "umim");
  const some = SKILL_AREAS.filter((s) => a.skills[s.id] === "trochu");
  const learn = SKILL_AREAS.filter((s) => (a.skills[s.id] ?? "ne") === "ne");
  const models = WANTS.find((w) => w.id === a.want)?.models ?? [];
  const slow = a.hours === "do3" && learn.length + some.length > 5;
  return { can, some, learn, models, slow, total: SKILL_AREAS.length };
}
