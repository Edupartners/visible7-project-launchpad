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
  /** Volby ve dvojicích „co byste dělali raději“: index dvojice → vybraný talent */
  talent?: Record<number, TalentId>;
}

export interface EntryDiagnosis {
  answers: EntryAnswers;
  createdAt: string;
}

export const EMPTY_ENTRY: EntryAnswers = { level: "start", want: "", idea: "", skills: {}, hours: "", talent: {} };

export const LEVELS: { id: EntryLevel; label: string; text: string }[] = [
  {
    id: "start",
    label: "Rychlý start",
    text: "Projdete základ, který ke startu opravdu potřebujete. Nic navíc.",
  },
  {
    id: "full",
    label: "Kompletní studium e-commerce",
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

/* ---------- Talent: co vám jde samo ---------- */

export type TalentId = "tvurce" | "vypravec" | "obchodnik" | "analytik" | "organizator";

export interface Talent {
  id: TalentId;
  name: string;
  /** Jedna věta: v čem je síla */
  text: string;
  /** Co půjde samo, s bránou */
  easy: { label: string; gate: number; skill: string }[];
  /** Rada pro toho, komu tahle oblast nejde */
  help: string;
  models: string[];
}

export const TALENTS: Record<TalentId, Talent> = {
  tvurce: {
    id: "tvurce",
    name: "Tvůrce",
    text: "Baví vás vytvářet věci, které mají váš rukopis. Zákazníci kupují hlavně kvůli produktu, a ten je vaše silná stránka.",
    easy: [
      { label: "Čím se odlišíte od konkurence", gate: 1, skill: "odliseni" },
      { label: "Produkt, jeho vzhled a fotky", gate: 4, skill: "texty" },
    ],
    help: "Produkt nemusíte vymýšlet od nuly. Začněte tím, co už umíte, a vylepšujte podle zákazníků.",
    models: ["eshop", "lms"],
  },
  vypravec: {
    id: "vypravec",
    name: "Vypravěč",
    text: "Umíte zaujmout slovem, obrazem nebo videem. Dnes lidé kupují od těch, kterým rozumějí, a to je vaše výhoda.",
    easy: [
      { label: "Texty, které prodávají", gate: 4, skill: "texty" },
      { label: "Sociální sítě a obsah", gate: 5, skill: "reklama" },
    ],
    help: "Texty a příspěvky nemusí být dokonalé. Stačí krátce a vlastními slovy, k tomu máte v bráně 4 a 5 vzory.",
    models: ["blog", "lms", "konverzni-web"],
  },
  obchodnik: {
    id: "obchodnik",
    name: "Obchodník",
    text: "Nebojíte se lidí a umíte je přesvědčit. Prvních deset zákazníků se získává hlavně rozhovorem, a to vám jde.",
    easy: [
      { label: "Ověřit, že o to někdo stojí", gate: 1, skill: "overeni" },
      { label: "Získat první zákazníky", gate: 5, skill: "reklama" },
    ],
    help: "Prodávat nemusíte po telefonu. Zájem ověříte i jednoduchou stránkou a pár zprávami lidem, které znáte.",
    models: ["konverzni-web", "eshop"],
  },
  analytik: {
    id: "analytik",
    name: "Analytik",
    text: "Věříte číslům a rádi víte, proč něco funguje. Hlídáte peníze a nenecháte se unést, to je u startu k nezaplacení.",
    easy: [
      { label: "Cena, náklady a bod zvratu", gate: 3, skill: "cisla" },
      { label: "Měření a reklama podle čísel", gate: 5, skill: "mereni" },
    ],
    help: "Čísla za vás spočítá aplikace v bráně 3. Vy jen zadáte odhady a výsledek projdete s poradcem.",
    models: ["eshop", "web-eshop"],
  },
  organizator: {
    id: "organizator",
    name: "Organizátor",
    text: "Dotahujete věci do konce a máte v nich pořádek. Většina projektů nekončí na nápadu, ale na tom, že je nikdo nedotáhne. Vy ano.",
    easy: [
      { label: "Plán projektu na jednu stránku", gate: 2, skill: "plan" },
      { label: "Platby, doprava a provoz", gate: 4, skill: "web" },
    ],
    help: "Nemusíte mít plán na rok. Stačí vždy jeden další krok, aplikace vám ho ukáže na přehledu.",
    models: ["web-eshop", "konverzni-web"],
  },
};

/** 10 dvojic: každý talent proti každému. Pořadí stran se střídá. */
export const TALENT_PAIRS: [{ t: TalentId; text: string }, { t: TalentId; text: string }][] = [
  [
    { t: "tvurce", text: "Vyrobit nebo navrhnout něco vlastníma rukama" },
    { t: "vypravec", text: "Napsat o tom příběh nebo natočit video" },
  ],
  [
    { t: "obchodnik", text: "Zavolat neznámému člověku a domluvit obchod" },
    { t: "tvurce", text: "Ladit výrobek, dokud nebude přesně podle mě" },
  ],
  [
    { t: "tvurce", text: "Vymyslet, jak má věc vypadat" },
    { t: "analytik", text: "Spočítat, jestli se vyplatí" },
  ],
  [
    { t: "organizator", text: "Udělat pořádek v chaosu a nastavit systém" },
    { t: "tvurce", text: "Pustit se do něčeho úplně nového" },
  ],
  [
    { t: "vypravec", text: "Psát příspěvky na sociální sítě" },
    { t: "obchodnik", text: "Stát na veletrhu a mluvit s lidmi" },
  ],
  [
    { t: "analytik", text: "Hledat v tabulce, proč něco nefunguje" },
    { t: "vypravec", text: "Vysvětlit složitou věc jednoduše" },
  ],
  [
    { t: "vypravec", text: "Natočit krátké video na mobil" },
    { t: "organizator", text: "Naplánovat týden a odškrtat všechny úkoly" },
  ],
  [
    { t: "obchodnik", text: "Přesvědčit váhajícího zákazníka" },
    { t: "analytik", text: "Porovnat nabídky a najít tu nejvýhodnější" },
  ],
  [
    { t: "organizator", text: "Zařídit, aby objednávky odcházely včas" },
    { t: "obchodnik", text: "Vyjednat lepší cenu s dodavatelem" },
  ],
  [
    { t: "analytik", text: "Sledovat čísla a hledat, co zlepšit" },
    { t: "organizator", text: "Sepsat postup, aby to zvládl i někdo jiný" },
  ],
];

export function talentResult(choices: Record<number, TalentId> | undefined) {
  const score: Record<TalentId, number> = { tvurce: 0, vypravec: 0, obchodnik: 0, analytik: 0, organizator: 0 };
  const picked = Object.values(choices ?? {});
  if (picked.length < TALENT_PAIRS.length) return null;
  for (const t of picked) score[t] += 1;
  const order = (Object.keys(score) as TalentId[]).sort((x, y) => score[y] - score[x]);
  const top = TALENTS[order[0]];
  // Druhý talent jen když je opravdu blízko (stejně nebo o jeden bod méně).
  const second = score[order[1]] >= score[order[0]] - 1 ? TALENTS[order[1]] : null;
  const spread = score[order[0]] - score[order[order.length - 1]];
  // Vyrovnané volby: nikoho neškatulkujeme a neradíme, kde je slabý.
  const balanced = spread <= 1;
  const weakest = balanced ? null : TALENTS[order[order.length - 1]];
  return { top, second: balanced ? null : second, weakest, balanced, score };
}

export function entryResult(a: EntryAnswers) {
  const can = SKILL_AREAS.filter((s) => a.skills[s.id] === "umim");
  const some = SKILL_AREAS.filter((s) => a.skills[s.id] === "trochu");
  const learn = SKILL_AREAS.filter((s) => (a.skills[s.id] ?? "ne") === "ne");
  const talent = talentResult(a.talent);
  const wanted = WANTS.find((w) => w.id === a.want)?.models ?? [];
  // Kdo ještě neví, co dělat, dostane doporučení podle talentu.
  const models = wanted.length ? wanted : talent && !talent.balanced ? talent.top.models : [];
  const slow = a.hours === "do3" && learn.length + some.length > 5;
  // Oblasti, které člověku s jeho talentem půjdou rychle.
  const easySkills = new Set(
    talent && !talent.balanced ? [...talent.top.easy, ...(talent.second?.easy ?? [])].map((e) => e.skill) : [],
  );
  return { can, some, learn, models, talent, easySkills, slow, total: SKILL_AREAS.length };
}
