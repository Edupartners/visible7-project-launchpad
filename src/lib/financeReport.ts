/**
 * Finanční report podnikatele – UKÁZKOVÁ DATA.
 * Po napojení přes Sokordia Tech (PSD2) přijdou skutečné transakce už s kategorií;
 * report z nich spočítá souhrny, opakované platby, závislost na zákaznících a doporučení.
 */

export interface ReportCategory {
  key: string;
  label: string;
  amount: number;
  prev: number;
  avg3: number;
  top: { name: string; amount: number }[];
}

export interface Recurring {
  name: string;
  category: string;
  amount: number;
  since: string;
  /** změna ceny proti původní platbě v % (kladné = zdražení) */
  change?: number;
  note?: string;
}

export interface Insight {
  tone: "pozor" | "usetrit" | "dobre";
  title: string;
  text: string;
  /** odhad dopadu v Kč měsíčně, když je relevantní */
  impact?: number;
}

export interface FinanceReport {
  month: string;
  income: number;
  incomePrev: number;
  expense: number;
  expensePrev: number;
  categories: ReportCategory[];
  customers: { name: string; amount: number }[];
  recurring: Recurring[];
  insights: Insight[];
  uncategorized: number;
}

export const DEMO_REPORT: FinanceReport = {
  month: "září 2026",
  income: 186_400,
  incomePrev: 171_200,
  expense: 142_900,
  expensePrev: 121_300,
  uncategorized: 3,
  categories: [
    {
      key: "zbozi",
      label: "Zboží a materiál",
      amount: 58_200,
      prev: 54_900,
      avg3: 55_100,
      top: [
        { name: "Velkoobchod s materiálem", amount: 31_400 },
        { name: "Dodavatel obalů", amount: 14_800 },
        { name: "Ostatní (6 plateb)", amount: 12_000 },
      ],
    },
    {
      key: "marketing",
      label: "Marketing a reklama",
      amount: 27_600,
      prev: 16_900,
      avg3: 18_500,
      top: [
        { name: "Reklama na sociálních sítích", amount: 17_200 },
        { name: "Reklama ve vyhledávači", amount: 8_100 },
        { name: "Tisk letáků", amount: 2_300 },
      ],
    },
    {
      key: "provoz",
      label: "Provoz a nájem",
      amount: 22_000,
      prev: 22_000,
      avg3: 22_000,
      top: [
        { name: "Nájem dílny", amount: 15_000 },
        { name: "Energie", amount: 4_700 },
        { name: "Internet a telefon", amount: 2_300 },
      ],
    },
    {
      key: "nastroje",
      label: "Software a předplatné",
      amount: 6_980,
      prev: 6_480,
      avg3: 6_400,
      top: [
        { name: "Hosting e-shopu", amount: 1_890 },
        { name: "Grafický editor", amount: 1_490 },
        { name: "Účetní program", amount: 1_200 },
      ],
    },
    {
      key: "dane",
      label: "Daně a odvody",
      amount: 15_900,
      prev: 9_300,
      avg3: 11_400,
      top: [
        { name: "DPH za srpen", amount: 9_100 },
        { name: "Záloha na sociální pojištění", amount: 4_700 },
        { name: "Záloha na zdravotní pojištění", amount: 2_100 },
      ],
    },
    {
      key: "doprava",
      label: "Doprava a pohonné hmoty",
      amount: 7_400,
      prev: 6_900,
      avg3: 7_000,
      top: [
        { name: "Čerpací stanice (9 plateb)", amount: 5_200 },
        { name: "Přepravní služba", amount: 2_200 },
      ],
    },
    {
      key: "ostatni",
      label: "Ostatní",
      amount: 4_820,
      prev: 4_820,
      avg3: 5_100,
      top: [
        { name: "Bankovní poplatky", amount: 420 },
        { name: "Výběry hotovosti", amount: 4_000 },
        { name: "Nezařazené (3 platby)", amount: 400 },
      ],
    },
  ],
  customers: [
    { name: "Hlavní odběratel (velkoobchod)", amount: 76_400 },
    { name: "E-shop – platby kartou", amount: 58_900 },
    { name: "Firemní zakázky (4 klienti)", amount: 35_600 },
    { name: "Ostatní (11 plateb)", amount: 15_500 },
  ],
  recurring: [
    {
      name: "Hosting e-shopu",
      category: "Software",
      amount: 1_890,
      since: "2024",
      change: 18,
      note: "zdraženo od srpna",
    },
    { name: "Grafický editor", category: "Software", amount: 1_490, since: "2025" },
    { name: "Druhý grafický editor", category: "Software", amount: 990, since: "2025", note: "dělá totéž co první" },
    { name: "Účetní program", category: "Software", amount: 1_200, since: "2023" },
    {
      name: "Plánovač příspěvků",
      category: "Software",
      amount: 610,
      since: "2025",
      note: "poslední 3 měsíce bez přihlášení?",
    },
    { name: "Nájem dílny", category: "Provoz", amount: 15_000, since: "2023" },
    { name: "Internet a telefon", category: "Provoz", amount: 2_300, since: "2023" },
  ],
  insights: [
    {
      tone: "pozor",
      title: "Marketing je o 49 % nad průměrem",
      text: "Za září 27 600 Kč proti průměru 18 500 Kč. Tržby ale vzrostly jen o 9 %. Zkontrolujte, která reklama přinesla objednávky.",
    },
    {
      tone: "usetrit",
      title: "Dva grafické editory a jeden nevyužitý nástroj",
      text: "Platíte dva nástroje na stejnou práci a plánovač příspěvků, který možná nepoužíváte. Zrušením ušetříte zhruba 1 600 Kč měsíčně.",
      impact: 1_600,
    },
    {
      tone: "pozor",
      title: "41 % tržeb od jednoho odběratele",
      text: "Když hlavní odběratel přestane objednávat, přijdete o skoro polovinu příjmů. Zkuste do konce roku přidat 2–3 menší pravidelné zákazníky.",
    },
    {
      tone: "dobre",
      title: "Měsíc v zisku 43 500 Kč",
      text: "Marže 23 % je mírně nad plánem z byznys casu (20 %).",
    },
  ],
};
