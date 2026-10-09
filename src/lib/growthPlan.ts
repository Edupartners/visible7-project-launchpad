/**
 * Fáze 7 – Růst. Výpočty nad realistickým scénářem byznys case (12. měsíc):
 *  - páky růstu (cena / zákazníci / opakované nákupy),
 *  - past růstu: kolik volných peněz růst spolkne, než zákazníci zaplatí,
 *  - kdy najmout člověka (hodnota vlastní práce ÷ 4, náklad na zaměstnance, potřebné tržby navíc),
 *  - pravidlo 30 % času na růst a připravenost na růst.
 */
import type { BuildBlock } from "@/lib/buildPlans";
import { BusinessCaseData, groupOf, simulate } from "@/lib/businessCase";

/** Odvody zaměstnavatele 2026: sociální 24,8 % + zdravotní 9 %. */
export const EMPLOYER_LEVY = 0.338;
/** Průměrný počet pracovních hodin měsíčně (2 000 h ročně ÷ 12). */
export const HOURS_MONTH = 166.67;

export interface Base {
  revenue: number;
  grossProfit: number;
  marketing: number;
  fixed: number;
  profit: number;
  /** Hrubá marže v % */
  gm: number;
  price: number;
  volume: number;
  growthYear2: number;
}

export function baseFrom(businessType: string | null | undefined, bc: BusinessCaseData | null): Base | null {
  if (!bc?.revenue?.volume12) return null;
  const group = groupOf(businessType);
  const m12 = simulate(group, bc, 1)[12];
  const gm = group === "content" && !bc.revenue.grossMargin ? 100 : bc.revenue.grossMargin;
  return {
    revenue: m12.revenue,
    grossProfit: m12.grossProfit,
    marketing: m12.marketing,
    fixed: m12.fixed,
    profit: m12.profit,
    gm,
    price: bc.revenue.price || 0,
    volume: m12.volume,
    growthYear2: bc.revenue.growthYear2 || 0,
  };
}

/** Páky růstu: co udělá +10 % s měsíčním ziskem. */
export function levers(b: Base) {
  return [
    {
      id: "cena",
      title: "Zdražit o 10 %",
      gain: b.revenue * 0.1,
      text: "Každá koruna navíc jde rovnou do zisku – náklady na zboží i marketing zůstávají.",
    },
    {
      id: "vernost",
      title: "O 10 % víc opakovaných nákupů",
      gain: b.grossProfit * 0.1,
      text: "Stávající zákazníci nakupují znovu – bez dalších peněz za reklamu.",
    },
    {
      id: "zakaznici",
      title: "O 10 % víc nových zákazníků",
      gain: b.grossProfit * 0.1 - b.marketing * 0.1,
      text: "Noví zákazníci stojí reklamu. Zbude jen marže po zaplacení marketingu.",
    },
  ].sort((a, c) => c.gain - a.gain);
}

export interface CashTrapInput {
  growthPct: number;
  /** Za kolik dní se peníze vrátí (od nákupu zboží / zaplacení reklamy do platby od zákazníka) */
  cashDays: number;
  newFixed: number;
  reserve: number;
}

/** Past růstu: kolik peněz potřebujete předem a jak dlouho vydrží rezerva, když růst nepřijde podle plánu. */
export function cashTrap(b: Base, i: CashTrapInput) {
  const g = Math.max(0, i.growthPct) / 100;
  const extraRevenue = b.revenue * g;
  const extraCogs = extraRevenue * (1 - b.gm / 100);
  const extraMarketing = b.marketing * g;
  const workingCapital = (extraCogs + extraMarketing) * (Math.max(0, i.cashDays) / 30);
  const buffer = i.newFixed * 3;
  const needed = workingCapital + buffer;
  // Pomalejší růst: přijde jen 60 % plánu, nové fixní náklady běží celé.
  const slowMonthly = (b.grossProfit * g - extraMarketing) * 0.6 - i.newFixed;
  const fullMonthly = b.grossProfit * g - extraMarketing - i.newFixed;
  const monthsReserve = slowMonthly < 0 ? (i.reserve > 0 ? i.reserve / -slowMonthly : 0) : null;
  const verdict: "ok" | "pozor" | "past" =
    i.reserve >= needed && slowMonthly >= 0
      ? "ok"
      : i.reserve >= needed * 0.6 && slowMonthly > -i.newFixed * 0.5
        ? "pozor"
        : "past";
  return {
    extraRevenue,
    extraCogs,
    extraMarketing,
    workingCapital,
    buffer,
    needed,
    slowMonthly,
    fullMonthly,
    monthsReserve,
    verdict,
  };
}

export type HireType = "zamestnanec" | "freelancer" | "dpp";

export interface HireInput {
  type: HireType;
  /** Hrubá mzda (zaměstnanec) nebo hodinová sazba (freelancer, DPP) */
  amount: number;
  hours: number;
  ownProfit: number;
}

export function hireCalc(b: Base | null, i: HireInput) {
  const cost = i.type === "zamestnanec" ? i.amount * (1 + EMPLOYER_LEVY) : Math.max(0, i.amount) * Math.max(0, i.hours);
  const ownHourly = i.ownProfit > 0 ? i.ownProfit / HOURS_MONTH : 0;
  const maxRate = ownHourly / 4;
  const rate = i.type === "zamestnanec" ? (i.amount * (1 + EMPLOYER_LEVY)) / HOURS_MONTH : i.amount;
  const extraRevenue = b && b.gm > 0 ? cost / (b.gm / 100) : null;
  const extraUnits = extraRevenue !== null && b && b.price > 0 ? extraRevenue / b.price : null;
  const plannedExtraUnits = b ? b.volume * (b.growthYear2 / 100) : null;
  const affordable = rate > 0 && maxRate >= rate;
  const coveredByPlan = extraUnits !== null && plannedExtraUnits !== null && plannedExtraUnits >= extraUnits;
  return { cost, ownHourly, maxRate, rate, extraRevenue, extraUnits, plannedExtraUnits, affordable, coveredByPlan };
}

export const GROWTH_BLOCKS: (BuildBlock & { optional?: boolean })[] = [
  {
    id: "automatizace",
    title: "Automatizace a AI dřív než člověk",
    goal: "Opakovanou práci dělá software, ne vy ani nový zaměstnanec.",
    steps: [
      "Týden si zapisujte, co děláte – a co se opakuje",
      "Fakturace, e-maily, objednávky: napojte automatizace mezi nástroji",
      "Odpovědi na časté dotazy a texty připravuje AI, vy je jen schvalujete",
      "Teprve co zbude, předáte člověku",
    ],
    tip: "Nejlevnější zaměstnanec je ten, kterého nemusíte najmout.",
    minutes: 120,
  },
  {
    id: "procesy",
    title: "Návody a procesy",
    goal: "Práci zvládne i někdo jiný než vy.",
    steps: [
      "Sepište 5 nejčastějších činností krok za krokem",
      "Nahrajte k nim krátké video obrazovky",
      "Určete, co musí zůstat na vás (rozhodování, klíčoví zákazníci)",
      "Návody uložte na jedno sdílené místo",
    ],
    minutes: 120,
  },
  {
    id: "spolupracovnik",
    title: "První spolupracovník",
    goal: "Pomůže vám člověk, aniž by zatížil fixní náklady.",
    steps: [
      "Začněte externistou nebo dohodou na konkrétní úkol",
      "Zadání s výsledkem a termínem, ne s počtem hodin",
      "Zkušební měsíc a jasné měřítko, co je hotovo",
      "Hlavní pracovní poměr až když práce trvale vydělá na mzdu i odvody",
    ],
    tip: "U dohod a externistů hlídejte limity a pravidla – ověřte je u účetní.",
    minutes: 60,
  },
  {
    id: "finance",
    title: "Měsíční finanční kontrola",
    goal: "Víte každý měsíc, kolik vyděláváte a kolik peněz máte k dispozici.",
    steps: [
      "Jednou měsíčně: tržby, hrubý zisk, náklady, zisk a stav účtu",
      "Rezerva aspoň na 3 měsíce fixních nákladů",
      "Pravidelně porovnávejte skutečnost s byznys casem",
      "Každý nový fixní náklad nejdřív projděte pastí růstu",
    ],
    minutes: 60,
  },
  {
    id: "novy-trh",
    title: "Nový produkt nebo trh",
    goal: "Rostete do šířky, až když základ běží sám.",
    steps: [
      "Nabídněte stávajícím zákazníkům další produkt",
      "Nový trh (např. Slovensko) testujte jako nový projekt – malým rozpočtem",
      "Každý nový směr projděte znovu bránami 1–3",
      "Co nevydělá do 3 měsíců, ukončete",
    ],
    minutes: 60,
    optional: true,
  },
];

export const REQUIRED_GROWTH = GROWTH_BLOCKS.filter((b) => !b.optional).map((b) => b.id);

export const LEAN_COSTS = [
  {
    id: "kancelar",
    label: "Kancelář nebo větší prostory",
    why: "Fixní náklad na roky. Dokud jde pracovat z domova nebo coworku, nepotřebujete ho.",
  },
  { id: "plny-uvazek", label: "Zaměstnanec na plný úvazek", why: "Nejdřív automatizace, externista nebo dohoda." },
  {
    id: "zasoby",
    label: "Velká zásoba zboží „pro jistotu“",
    why: "Peníze leží ve skladu. Objednávejte podle prodejů.",
  },
  { id: "auto", label: "Auto nebo vybavení na firmu", why: "Daňová úspora není důvod nakupovat." },
  { id: "nastroje", label: "Drahé nástroje a předplatné", why: "Platíte jen za to, co opravdu používáte každý týden." },
  { id: "rebranding", label: "Nový web nebo rebranding", why: "Zákazníci kupují řešení, ne nové logo." },
];

export interface GrowthState {
  stableMonths: number;
  growthHours: number;
  opsHours: number;
  growthPct: number;
  cashDays: number;
  newFixed: number;
  reserve: number;
  hireType: HireType;
  hireAmount: number;
  hireHours: number;
  ownProfit: number;
  avoided: string[];
  steps: string[];
  blocks: string[];
}

export const EMPTY_GROWTH: GrowthState = {
  stableMonths: 0,
  growthHours: 0,
  opsHours: 0,
  growthPct: 50,
  cashDays: 30,
  newFixed: 0,
  reserve: 0,
  hireType: "freelancer",
  hireAmount: 400,
  hireHours: 40,
  ownProfit: 0,
  avoided: [],
  steps: [],
  blocks: [],
};
