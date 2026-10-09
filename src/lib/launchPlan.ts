/**
 * Fáze 6 – Launch: start mikrobyznysu v ČR (živnost, úřady, datová schránka, odvody, účetnictví),
 * jeden produkt na start a milníky MVP spočítané z byznys case.
 * Čísla jsou pro rok 2026 (zdroje: ČSSZ/zdravotní pojišťovny přes Průvodce podnikáním a BusinessInfo.cz).
 * Při změně zákonů aktualizujte LAUNCH_YEAR a částky.
 */
import type { BuildBlock } from "@/lib/buildPlans";
import { BusinessCaseData, computeMetrics, groupOf, simulate } from "@/lib/businessCase";
import { PAUSAL_2026 } from "@/components/TaxRegimeAdvice";

export const LAUNCH_YEAR = 2026;

export const ODVODY_2026 = {
  socialMain: 5720,
  socialStarting: 3575,
  healthMain: 3306,
  sideIncomeLimit: 117_521,
  vatLimit: 2_000_000,
  tradeFee: 1000,
};

const czk = (v: number) => `${v.toLocaleString("cs-CZ")} Kč`;
const B = (b: BuildBlock & { optional?: boolean }) => b;

export const LAUNCH_BLOCKS: (BuildBlock & { optional?: boolean })[] = [
  B({
    id: "forma",
    title: "Forma podnikání: živnost, nebo s.r.o.?",
    goal: "Víte, v jaké formě a jestli hlavní, nebo vedlejší činností začnete.",
    steps: [
      "Na start mikrobyznysu obvykle stačí živnost (OSVČ) – je levná a rychlá",
      "Rozhodněte: hlavní, nebo vedlejší činnost (vedle zaměstnání, studia, rodičovské)",
      "s.r.o. zvažte až při vyšším zisku, větším riziku nebo se společníkem",
      "Porovnejte paušální daň s běžným režimem – kalkulačka je ve fázi 3",
    ],
    tip: `Vedlejší činnost je nejbezpečnější start: zaměstnavatel za vás dál platí pojištění a sociální pojištění se do zisku ${czk(ODVODY_2026.sideIncomeLimit)} za rok ${LAUNCH_YEAR} neplatí.`,
    minutes: 30,
  }),
  B({
    id: "zivnost",
    title: "Živnostenský list",
    goal: "Máte oprávnění podnikat.",
    steps: [
      "Vyberte obory volné živnosti – pro online prodej a většinu služeb stačí",
      "Vyplňte Jednotný registrační formulář – online, na živnostenském úřadě nebo na Czech POINTu",
      `Zaplaťte správní poplatek ${czk(ODVODY_2026.tradeFee)} (na Czech POINTu navíc 50 Kč)`,
      "Úřad vás zapíše do 5 pracovních dnů – zkontrolujte výpis z živnostenského rejstříku",
    ],
    tip: "Některé činnosti potřebují řemeslnou nebo vázanou živnost s praxí či vzděláním. Ověřte si to předem.",
    minutes: 45,
    costs: [{ name: "Živnostenský list (správní poplatek)", amount: ODVODY_2026.tradeFee, kind: "jednorazove" }],
  }),
  B({
    id: "urady",
    title: "Finanční úřad, ČSSZ a zdravotní pojišťovna",
    goal: "Jste přihlášení všude, kde máte být.",
    steps: [
      "V Jednotném registračním formuláři zaškrtněte i přihlášku na ČSSZ a zdravotní pojišťovnu",
      "K dani z příjmů se registrujte do 15 dnů (jde to také přes formulář)",
      "Pokud jste se nepřihlásili přes formulář, oznamte zahájení ČSSZ a pojišťovně do 8 dnů",
      "Rozhodněte o paušální dani – jedna měsíční platba místo daně a obou pojištění",
    ],
    minutes: 30,
  }),
  B({
    id: "datovka",
    title: "Datová schránka",
    goal: "Komunikujete s úřady elektronicky a nic vám neuteče.",
    steps: [
      "Podnikající fyzické osobě se datová schránka zřizuje automaticky",
      "Přihlaste se přes Identitu občana (např. bankovní identitou) nebo údaji, které přijdou poštou",
      "Zapněte upozornění na nové zprávy e-mailem nebo v aplikaci",
      "Pozor: zpráva je doručená i nepřečtená po 10 dnech",
    ],
    tip: "Daňové přiznání a přehledy pro ČSSZ a pojišťovnu podáváte jako podnikatel elektronicky.",
    minutes: 20,
  }),
  B({
    id: "odvody",
    title: `Odvody v roce ${LAUNCH_YEAR}`,
    goal: "Víte, kolik budete měsíčně platit státu.",
    steps: [
      `Hlavní činnost: minimální záloha na sociální ${czk(ODVODY_2026.socialMain)} a zdravotní ${czk(ODVODY_2026.healthMain)} měsíčně`,
      `Začínající (start po 1. 1. 2024, 20 let jste nepodnikali): sociální od ${czk(ODVODY_2026.socialStarting)} první 3 roky`,
      `Vedlejší činnost: sociální až nad zisk ${czk(ODVODY_2026.sideIncomeLimit)} za rok, zdravotní z reálných příjmů`,
      `Paušální daň, 1. pásmo: ${czk(PAUSAL_2026.band1Monthly)} měsíčně – daň i obě pojištění v jedné platbě`,
    ],
    tip: "Zálohy si nastavte jako trvalý příkaz a mějte je v byznys case jako měsíční náklad.",
    minutes: 20,
    costs: [
      {
        name: "Zálohy na sociální a zdravotní pojištění",
        amount: ODVODY_2026.socialMain + ODVODY_2026.healthMain,
        kind: "mesicni",
      },
    ],
  }),
  B({
    id: "ucetnictvi",
    title: "Účetnictví a doklady",
    goal: "Máte pořádek v dokladech od prvního dne.",
    steps: [
      "Založte si samostatný podnikatelský účet",
      "Faktury vystavujte ve fakturačním programu – nic nepište ručně",
      "Jako OSVČ vedete daňovou evidenci, nebo uplatníte výdajový paušál či paušální daň",
      `Hlídejte obrat: nad ${czk(ODVODY_2026.vatLimit)} za 12 měsíců se stáváte plátcem DPH`,
    ],
    tip: "Účetnictví v kurzech Edu Partners učí Jana Pincová. Najdete ji mezi seniorními poradci.",
    minutes: 45,
    costs: [{ name: "Fakturační program nebo účetní (doplňte)", amount: 0, kind: "mesicni" }],
  }),
  B({
    id: "sro",
    title: "Kdy a jak založit s.r.o.",
    goal: "Víte, kdy se s.r.o. vyplatí – a že na start obvykle ne.",
    steps: [
      "Dává smysl hlavně při vyšším zisku, větším riziku nebo se společníkem",
      "Zakládá se notářským zápisem, základní kapitál může být od 1 Kč",
      "Zápis do obchodního rejstříku může udělat přímo notář",
      "Počítejte s podvojným účetnictvím, daní 21 % a srážkovou daní z vyplaceného zisku",
    ],
    tip: "Na start mikrobyznysu s.r.o. obvykle nedoporučujeme – je dražší na založení, účetnictví i provoz.",
    minutes: 20,
    optional: true,
  }),
  B({
    id: "spusteni",
    title: "Tichý start a první zákazník",
    goal: "Máte prvního platícího zákazníka a jeho zpětnou vazbu.",
    steps: [
      "Nabídněte produkt nejdřív známým a prvním 10 lidem z cílové skupiny",
      "Ke každému prodeji si vyžádejte zpětnou vazbu nebo recenzi",
      "Zapište si rizika: co když první měsíc nic neprodáte a jak dlouho to vydržíte",
      "Teprve pak pusťte otestovaný kanál z fáze 5 naplno",
    ],
    tip: "Hodnoťte rizika, nejen zisk. Start je úspěšný, když přežijete i horší scénář.",
    minutes: 60,
  }),
];

export const REQUIRED_BLOCKS = LAUNCH_BLOCKS.filter((b) => !b.optional).map((b) => b.id);

export interface Milestone {
  id: string;
  title: string;
  detail: string;
  /** Měsíc od spuštění (0 = den spuštění), null = v plánu na 24 měsíců nenastane */
  month: number | null;
}

/** Milníky MVP z realistického scénáře byznys case. */
export function milestonesFrom(businessType: string | null | undefined, data: BusinessCaseData | null): Milestone[] {
  const base: Milestone[] = [
    { id: "start", title: "Spuštění", detail: "Web běží, jeden produkt je v prodeji.", month: 0 },
    { id: "prvni", title: "První platící zákazník", detail: "Cíl do 30 dnů od spuštění.", month: 1 },
  ];
  if (!data || !data.revenue?.volume12) return base;
  const group = groupOf(businessType);
  const rows = simulate(group, data, 1);
  const m = computeMetrics(group, data, rows);
  let cum = 0;
  const mvpRow = rows.slice(1).find((r) => {
    cum += group === "content" ? r.volume / 1000 : r.newCustomers;
    return cum >= 10;
  });
  return [
    ...base,
    {
      id: "mvp",
      title: "MVP ověřeno",
      detail:
        group === "content"
          ? "Prvních 10 000 návštěv – obsah lidé hledají."
          : "10 platících zákazníků – zájem je potvrzený.",
      month: mvpRow?.month ?? null,
    },
    {
      id: "zvrat",
      title: "Bod zvratu",
      detail: "Měsíční příjmy pokryjí měsíční náklady.",
      month: m.breakEvenMonth,
    },
    {
      id: "navratnost",
      title: "Návratnost investice",
      detail:
        m.requiredCapital > 0
          ? `Vrátí se ${Math.round(m.requiredCapital).toLocaleString("cs-CZ")} Kč, které jste do projektu vložili.`
          : "Projekt nepotřebuje vlastní kapitál navíc.",
      month: m.paybackMonth,
    },
    {
      id: "rok",
      title: "Rok od spuštění",
      detail: `Plán: tržby ${Math.round(m.revenue12).toLocaleString("cs-CZ")} Kč za 12. měsíc.`,
      month: 12,
    },
  ];
}

export const addMonths = (iso: string, months: number) => {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  return d;
};

export interface LaunchState {
  product: string;
  customer: string;
  channel: string;
  date: string;
  steps: string[];
  blocks: string[];
  /** Splněné milníky: id → datum splnění */
  reached: Record<string, string>;
}

export const EMPTY_LAUNCH: LaunchState = {
  product: "",
  customer: "",
  channel: "",
  date: "",
  steps: [],
  blocks: [],
  reached: {},
};
