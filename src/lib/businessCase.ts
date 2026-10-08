/**
 * Byznys case (fáze 3) – výpočetní model.
 *
 * Horizont 24 měsíců: měsíc 0 = jednorázová investice před spuštěním, měsíce 1–24 provoz.
 * Objem (objednávky, zákazníci, kontakty, návštěvy…) roste od spuštění k cíli ve 12. měsíci
 * a ve 2. roce dál o zadané procento. Scénáře násobí objem.
 * Hranice PNO se nepočítá z pevné tabulky, ale z marže projektu:
 *   max. PNO = hrubá marže − ostatní náklady v % obratu − cílový zisk.
 */

export type RevenueGroup = "commerce" | "subscription" | "leads" | "content" | "marketplace" | "generic";

export const GROUP_OF: Record<string, RevenueGroup> = {
  eshop: "commerce",
  "web-eshop": "commerce",
  dropshipping: "commerce",
  members: "subscription",
  lms: "subscription",
  "forum-komunita": "subscription",
  "web-prezentacni": "leads",
  "konverzni-web": "leads",
  "squeeze-page": "leads",
  blog: "content",
  affiliate: "content",
  marketplace: "marketplace",
  "vlastni-napad-app": "generic",
};

export const groupOf = (businessType: string | null | undefined): RevenueGroup =>
  (businessType && GROUP_OF[businessType]) || "generic";

export interface RevenueInputs {
  /** commerce: průměrná objednávka · subscription: měsíční cena · leads: hodnota zakázky · marketplace: průměrný prodej · generic: cena */
  price: number;
  /** Hrubá marže v % (po nákladech na zboží, dopravu, platební bránu…) */
  grossMargin: number;
  /** Objem za měsíc ve 12. měsíci po spuštění (objednávky / noví zákazníci / kontakty / návštěvy / prodeje) */
  volume12: number;
  /** commerce: podíl opakovaných nákupů v % */
  repeatRate: number;
  /** subscription: měsíční odchodovost v % */
  churn: number;
  /** leads: konverze kontaktu na zákazníka v % */
  conversion: number;
  /** content: výnos na 1 000 návštěv v Kč */
  rpm: number;
  /** marketplace: provize v % */
  commission: number;
  /** Růst objemu ve 2. roce v % */
  growthYear2: number;
}

export type CostKind = "jednorazove" | "mesicni" | "marketing";

export interface CostItem {
  id: string;
  name: string;
  amount: number;
  kind: CostKind;
}

export type ScenarioId = "opatrny" | "realisticky" | "optimisticky";

export const SCENARIOS: { id: ScenarioId; label: string; factor: number; hint: string }[] = [
  { id: "opatrny", label: "Opatrný", factor: 0.6, hint: "60 % plánovaného objemu" },
  { id: "realisticky", label: "Realistický", factor: 1, hint: "váš plán" },
  { id: "optimisticky", label: "Optimistický", factor: 1.4, hint: "140 % plánovaného objemu" },
];

export interface BusinessCaseData {
  revenue: RevenueInputs;
  costs: CostItem[];
  /** Cílový zisk v % obratu */
  targetProfit: number;
  /** Daň z příjmu v % ze zisku (OSVČ 15 %, s.r.o. 21 %); 0 = nepočítat */
  taxRate?: number;
  scenario: ScenarioId;
  /** Položky už byly jednou převzaty z Lean Canvasu */
  prefilled: boolean;
}

export const EMPTY_REVENUE: RevenueInputs = {
  price: 0,
  grossMargin: 0,
  volume12: 0,
  repeatRate: 0,
  churn: 5,
  conversion: 0,
  rpm: 0,
  commission: 0,
  growthYear2: 20,
};

export const EMPTY_CASE: BusinessCaseData = {
  revenue: EMPTY_REVENUE,
  costs: [],
  targetProfit: 10,
  scenario: "realisticky",
  prefilled: false,
};

export const HORIZON = 24;

/** Rozjezd: k cíli ve 12. měsíci pozvolna (mocnina 1,5), ve 2. roce lineárně o growthYear2. */
export const rampFactor = (month: number, growthYear2: number) => {
  if (month <= 0) return 0;
  if (month <= 12) return Math.pow(month / 12, 1.5);
  return 1 + (growthYear2 / 100) * ((month - 12) / 12);
};

export interface MonthRow {
  month: number;
  volume: number;
  newCustomers: number;
  revenue: number;
  grossProfit: number;
  fixed: number;
  marketing: number;
  oneOff: number;
  profit: number;
  cumulative: number;
}

const pct = (v: number) => (Number.isFinite(v) ? v : 0) / 100;

export function simulate(group: RevenueGroup, data: BusinessCaseData, factor = 1): MonthRow[] {
  const r = data.revenue;
  const oneOff = data.costs.filter((c) => c.kind === "jednorazove").reduce((s, c) => s + (c.amount || 0), 0);
  const fixed = data.costs.filter((c) => c.kind === "mesicni").reduce((s, c) => s + (c.amount || 0), 0);
  const marketing = data.costs.filter((c) => c.kind === "marketing").reduce((s, c) => s + (c.amount || 0), 0);
  const gm = group === "content" && !r.grossMargin ? 1 : pct(r.grossMargin);

  const rows: MonthRow[] = [
    { month: 0, volume: 0, newCustomers: 0, revenue: 0, grossProfit: 0, fixed: 0, marketing: 0, oneOff, profit: -oneOff, cumulative: -oneOff },
  ];
  let active = 0;
  let cumulative = -oneOff;
  for (let m = 1; m <= HORIZON; m++) {
    const volume = (r.volume12 || 0) * factor * rampFactor(m, r.growthYear2 || 0);
    let revenue = 0;
    let newCustomers = 0;
    switch (group) {
      case "commerce":
        revenue = volume * r.price;
        newCustomers = volume * (1 - Math.min(pct(r.repeatRate), 0.95));
        break;
      case "subscription":
        newCustomers = volume;
        active = active * (1 - Math.min(pct(r.churn), 1)) + volume;
        revenue = active * r.price;
        break;
      case "leads":
        newCustomers = volume * pct(r.conversion);
        revenue = newCustomers * r.price;
        break;
      case "content":
        revenue = (volume / 1000) * r.rpm;
        break;
      case "marketplace":
        revenue = volume * r.price * pct(r.commission);
        newCustomers = volume;
        break;
      default:
        newCustomers = volume;
        revenue = volume * r.price;
    }
    const grossProfit = revenue * gm;
    const profit = grossProfit - fixed - marketing;
    cumulative += profit;
    rows.push({ month: m, volume, newCustomers, revenue, grossProfit, fixed, marketing, oneOff: 0, profit, cumulative });
  }
  return rows;
}

export type Rating = "dobre" | "hranice" | "spatne" | "nelze";

export interface Metrics {
  revenueTotal: number;
  costsTotal: number;
  profitTotal: number;
  /** Daň z příjmu za 2 roky (počítaná zvlášť za každý rok ze zisku daného roku) */
  taxTotal: number;
  profitAfterTax: number;
  profitMargin: number | null;
  grossMargin: number;
  roi: number | null;
  requiredCapital: number;
  breakEvenMonth: number | null;
  paybackMonth: number | null;
  revenue12: number;
  profit12: number;
  pno12: number | null;
  maxPno: number | null;
  pnoRating: Rating;
  cac: number | null;
  ltv: number | null;
  ltvCac: number | null;
  ltvCacRating: Rating;
  extras: { label: string; value: string }[];
}

const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;
const pctFmt = (v: number) => `${(Math.round(v * 10) / 10).toLocaleString("cs-CZ")} %`;
const num = (v: number) => Math.round(v).toLocaleString("cs-CZ");

export function computeMetrics(group: RevenueGroup, data: BusinessCaseData, rows: MonthRow[]): Metrics {
  const r = data.revenue;
  const ops = rows.slice(1);
  const revenueTotal = ops.reduce((s, x) => s + x.revenue, 0);
  const cogs = ops.reduce((s, x) => s + (x.revenue - x.grossProfit), 0);
  const fixedTotal = ops.reduce((s, x) => s + x.fixed, 0);
  const marketingTotal = ops.reduce((s, x) => s + x.marketing, 0);
  const costsTotal = rows[0].oneOff + cogs + fixedTotal + marketingTotal;
  const profitTotal = revenueTotal - costsTotal;
  // Daň z příjmu: zvlášť za 1. rok (investice + měsíce 1–12) a 2. rok (měsíce 13–24), jen z kladného zisku.
  const rate = Math.min(Math.max(data.taxRate ?? 0, 0), 100) / 100;
  const year1 = rows.filter((x) => x.month <= 12).reduce((s, x) => s + x.profit, 0);
  const year2 = rows.filter((x) => x.month > 12).reduce((s, x) => s + x.profit, 0);
  const taxTotal = (Math.max(0, year1) + Math.max(0, year2)) * rate;
  const minCum = Math.min(0, ...rows.map((x) => x.cumulative));
  const requiredCapital = -minCum;
  const breakEven = ops.find((x) => x.revenue > 0 && x.profit >= 0);
  let paybackMonth: number | null = null;
  if (requiredCapital > 0) {
    const lowIdx = rows.findIndex((x) => x.cumulative === minCum);
    const back = rows.slice(lowIdx).find((x) => x.cumulative >= 0 && x.month > 0);
    paybackMonth = back ? back.month : null;
  } else if (revenueTotal > 0) {
    paybackMonth = 0;
  }

  const m12 = rows[12];
  const gm = group === "content" && !r.grossMargin ? 100 : r.grossMargin;
  const pno12 = m12.revenue > 0 ? (m12.marketing / m12.revenue) * 100 : null;
  const maxPno = m12.revenue > 0 ? gm - (m12.fixed / m12.revenue) * 100 - data.targetProfit : null;
  let pnoRating: Rating = "nelze";
  if (pno12 !== null && maxPno !== null) {
    pnoRating = pno12 <= maxPno ? "dobre" : pno12 <= maxPno + 5 ? "hranice" : "spatne";
  }

  const cac = m12.newCustomers > 0 && m12.marketing > 0 ? m12.marketing / m12.newCustomers : null;
  let ltv: number | null = null;
  const extras: { label: string; value: string }[] = [];
  switch (group) {
    case "commerce": {
      const marginPerOrder = r.price * (gm / 100);
      const ordersPerCustomer = 1 / (1 - Math.min(r.repeatRate / 100, 0.95));
      ltv = marginPerOrder * ordersPerCustomer;
      extras.push(
        { label: "Průměrná objednávka", value: czk(r.price) },
        { label: "Marže na objednávku", value: czk(marginPerOrder) },
        { label: "Objednávek na zákazníka", value: (Math.round(ordersPerCustomer * 10) / 10).toLocaleString("cs-CZ") },
        { label: "Opakované nákupy", value: pctFmt(r.repeatRate) },
      );
      break;
    }
    case "subscription": {
      ltv = r.churn > 0 ? (r.price * (gm / 100)) / (r.churn / 100) : null;
      const active12 = r.price > 0 ? m12.revenue / r.price : 0;
      extras.push(
        { label: "Měsíční opakovaný příjem (12. měsíc)", value: czk(m12.revenue) },
        { label: "Aktivních zákazníků (12. měsíc)", value: num(active12) },
        { label: "Odchodovost", value: `${pctFmt(r.churn)} měsíčně` },
        { label: "Průměrná doba předplatného", value: r.churn > 0 ? `${Math.round(100 / r.churn)} měsíců` : "—" },
      );
      break;
    }
    case "leads": {
      ltv = r.price * (gm / 100);
      const cpl = m12.volume > 0 && m12.marketing > 0 ? m12.marketing / m12.volume : null;
      extras.push(
        { label: "Cena za kontakt", value: cpl !== null ? czk(cpl) : "—" },
        { label: "Konverze kontaktu na zákazníka", value: pctFmt(r.conversion) },
        { label: "Hodnota zakázky", value: czk(r.price) },
        { label: "Zakázek za měsíc (12. měsíc)", value: (Math.round(m12.newCustomers * 10) / 10).toLocaleString("cs-CZ") },
      );
      break;
    }
    case "content":
      extras.push(
        { label: "Návštěvnost (12. měsíc)", value: `${num(m12.volume)} měsíčně` },
        { label: "Výnos na 1 000 návštěv", value: czk(r.rpm) },
        { label: "Příjem (12. měsíc)", value: czk(m12.revenue) },
      );
      break;
    case "marketplace":
      extras.push(
        { label: "Zprostředkované prodeje (12. měsíc)", value: czk(m12.volume * r.price) },
        { label: "Provize", value: pctFmt(r.commission) },
        { label: "Příjem z provizí (12. měsíc)", value: czk(m12.revenue) },
      );
      break;
    default:
      ltv = r.price * (gm / 100);
      extras.push({ label: "Cena", value: czk(r.price) });
  }
  if (!ltv) ltv = null;
  const ltvCac = ltv !== null && cac ? ltv / cac : null;
  const ltvCacRating: Rating = ltvCac === null ? "nelze" : ltvCac >= 3 ? "dobre" : ltvCac >= 1 ? "hranice" : "spatne";

  return {
    revenueTotal,
    costsTotal,
    profitTotal,
    taxTotal,
    profitAfterTax: profitTotal - taxTotal,
    profitMargin: revenueTotal > 0 ? (profitTotal / revenueTotal) * 100 : null,
    grossMargin: gm,
    roi: requiredCapital > 0 ? (profitTotal / requiredCapital) * 100 : null,
    requiredCapital,
    breakEvenMonth: breakEven ? breakEven.month : null,
    paybackMonth,
    revenue12: m12.revenue,
    profit12: m12.profit,
    pno12,
    maxPno,
    pnoRating,
    cac,
    ltv,
    ltvCac,
    ltvCacRating,
    extras,
  };
}

/** Co se u daného typu zadává jako objem a cena. */
export const GROUP_COPY: Record<
  RevenueGroup,
  { title: string; price: string; volume: string; volumeHint: string; priceHint: string; marginHint: string }
> = {
  commerce: {
    title: "E-shop",
    price: "Průměrná objednávka (Kč)",
    priceHint: "např. 900",
    volume: "Objednávek za měsíc ve 12. měsíci",
    volumeHint: "např. 150",
    marginHint: "Co vám zbude z objednávky po zaplacení zboží, dopravy a platební brány. U e-shopů obvykle 20–40 %.",
  },
  subscription: {
    title: "Předplatné a kurzy",
    price: "Cena za měsíc (Kč)",
    priceHint: "např. 490",
    volume: "Nových zákazníků za měsíc ve 12. měsíci",
    volumeHint: "např. 30",
    marginHint: "U digitálního obsahu bývá 80–95 % (odečtěte platební bránu a platformu).",
  },
  leads: {
    title: "Web pro získávání zakázek",
    price: "Průměrná hodnota zakázky (Kč)",
    priceHint: "např. 15 000",
    volume: "Kontaktů (poptávek) za měsíc ve 12. měsíci",
    volumeHint: "např. 40",
    marginHint: "Kolik ze zakázky zbude po přímých nákladech na její splnění.",
  },
  content: {
    title: "Obsahový web",
    price: "",
    priceHint: "",
    volume: "Návštěv za měsíc ve 12. měsíci",
    volumeHint: "např. 20 000",
    marginHint: "U reklamy a provizí bývá 100 %.",
  },
  marketplace: {
    title: "Marketplace",
    price: "Průměrná hodnota prodeje (Kč)",
    priceHint: "např. 1 500",
    volume: "Prodejů za měsíc ve 12. měsíci",
    volumeHint: "např. 400",
    marginHint: "Kolik z provize zbude po platební bráně a podpoře. Obvykle 80–95 %.",
  },
  generic: {
    title: "Vlastní model",
    price: "Cena pro zákazníka (Kč)",
    priceHint: "např. 1 000",
    volume: "Prodejů za měsíc ve 12. měsíci",
    volumeHint: "např. 40",
    marginHint: "Kolik z ceny zbude po přímých nákladech.",
  },
};

// ---- Převzetí položek z Lean Canvasu --------------------------------------

const ONE_OFF = /(tvorb|vývoj|vyvoj|založ|zaloz|logo|design|grafik|nastaven|natáčen|natacen|vytvoř|vytvor|registrac|vybaven|počáteční|pocatecni)/i;
const MARKETING = /(reklam|marketing|ppc|ads\b|kampa|influenc|propagac|sponzor)/i;

export const splitItems = (text: string | undefined | null) =>
  (text ?? "")
    // Víceřádkový výčet dělíme po řádcích, jednu větu po čárkách (mimo závorky).
    .split((text ?? "").includes("\n") ? /\n|•/ : /;|,(?![^(]*\))|•/)
    .map((s) => s.replace(/^[\s\-–*\d.)]+/, "").replace(/\.$/, "").trim())
    .filter((s) => s.length > 1)
    .map((s) => (s.length > 70 ? `${s.slice(0, 67)}…` : s))
    .slice(0, 12);

let seq = 0;
export const newId = () => `c${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Nákladové položky a marketingové kanály z canvasu jako řádky kalkulace (bez částek). */
export function costsFromCanvas(canvas: { costStructure?: string; channels?: string } | null): CostItem[] {
  if (!canvas) return [];
  const costs: CostItem[] = splitItems(canvas.costStructure).map((name) => ({
    id: newId(),
    name,
    amount: 0,
    kind: MARKETING.test(name) ? "marketing" : ONE_OFF.test(name) ? "jednorazove" : "mesicni",
  }));
  const channels: CostItem[] = splitItems(canvas.channels).map((name) => ({
    id: newId(),
    name,
    amount: 0,
    kind: "marketing",
  }));
  // Obecnou „reklamu“ z nákladů vynecháme, pokud máme konkrétní kanály.
  const filtered = channels.length ? costs.filter((c) => c.kind !== "marketing") : costs;
  return [...filtered, ...channels];
}

/** Základní sada nákladů online projektu, když canvas nic neobsahuje. */
export const BASE_COSTS = (): CostItem[] => [
  { id: newId(), name: "Tvorba webu", amount: 0, kind: "jednorazove" },
  { id: newId(), name: "Doména a hosting", amount: 0, kind: "mesicni" },
  { id: newId(), name: "Software a nástroje", amount: 0, kind: "mesicni" },
  { id: newId(), name: "Vlastní čas nebo externí pomoc", amount: 0, kind: "mesicni" },
  { id: newId(), name: "Reklama", amount: 0, kind: "marketing" },
];

export const ratingLabel: Record<Rating, string> = {
  dobre: "v pořádku",
  hranice: "na hraně",
  spatne: "rizikové",
  nelze: "zatím nelze spočítat",
};

// ---- Pole příjmů a vysvětlivky -------------------------------------------

export interface RevenueFieldDef {
  key: keyof RevenueInputs;
  label: string;
  suffix: string;
  placeholder: string;
  help: string;
  max?: number;
}

const VOLUME_NOUN: Record<RevenueGroup, string> = {
  commerce: "objednávek",
  subscription: "nových zákazníků",
  leads: "kontaktů",
  content: "návštěv",
  marketplace: "prodejů",
  generic: "prodejů",
};

const PRICE_HELP: Record<RevenueGroup, string> = {
  commerce: "Průměrná částka jedné objednávky. Pokud jste plátce DPH, zadejte ji bez DPH.",
  subscription:
    "Kolik zákazník platí za měsíc přístupu. Prodáváte-li kurz jednorázově, zadejte jeho cenu a odchodovost 100 %.",
  leads: "Průměrná částka, kterou vám zákazník zaplatí za jednu zakázku.",
  content: "",
  marketplace: "Průměrná hodnota jednoho prodeje mezi prodávajícím a kupujícím. Vy si z ní berete provizi.",
  generic: "Kolik zákazník zaplatí za jeden nákup nebo za měsíc služby.",
};

/** Pole příjmů pro daný typ byznysu, v pořadí zobrazení. */
export function revenueFieldsFor(group: RevenueGroup): RevenueFieldDef[] {
  const copy = GROUP_COPY[group];
  const noun = VOLUME_NOUN[group];
  const fields: RevenueFieldDef[] = [];
  if (group === "content") {
    fields.push({
      key: "rpm",
      label: "Výnos na 1 000 návštěv (Kč)",
      suffix: "Kč",
      placeholder: "např. 150",
      help: "Kolik vyděláte z reklam a provizí na každých 1\u00a0000 návštěv webu. U českých webů obvykle 50–300 Kč.",
    });
  } else {
    fields.push({ key: "price", label: copy.price, suffix: "Kč", placeholder: copy.priceHint, help: PRICE_HELP[group] });
  }
  fields.push({
    key: "volume12",
    label: copy.volume,
    suffix: "",
    placeholder: copy.volumeHint,
    help: `Kolik ${noun} chcete mít za měsíc rok po spuštění. První měsíce budou slabší, rozjezd aplikace dopočítá sama.`,
  });
  if (group !== "content") {
    fields.push({
      key: "grossMargin",
      label: "Hrubá marže (% z ceny)",
      suffix: "%",
      placeholder: "např. 35",
      max: 100,
      help:
        "Kolik procent z ceny vám zůstane po zaplacení přímých nákladů na prodej: zboží, doprava, balné, platební brána. Příklad: prodáte za 1\u00a0000 Kč, zboží a doprava stojí 650 Kč, hrubá marže je 35 %. Reklamu a provoz sem nepočítejte, ty patří do nákladů.",
    });
  }
  if (group === "commerce")
    fields.push({
      key: "repeatRate",
      label: "Opakované nákupy (% objednávek)",
      suffix: "%",
      placeholder: "např. 20",
      max: 90,
      help: "Kolik procent objednávek udělají zákazníci, kteří už u vás nakoupili. Čím víc, tím levněji roste obrat.",
    });
  if (group === "subscription")
    fields.push({
      key: "churn",
      label: "Odchodovost (% zákazníků měsíčně)",
      suffix: "%",
      placeholder: "např. 5",
      max: 100,
      help:
        "Kolik procent předplatitelů každý měsíc předplatné zruší. 5 % znamená, že průměrný zákazník zůstane asi 20 měsíců. U jednorázově placeného kurzu zadejte 100 %.",
    });
  if (group === "leads")
    fields.push({
      key: "conversion",
      label: "Konverze kontaktu na zákazníka (%)",
      suffix: "%",
      placeholder: "např. 10",
      max: 100,
      help: "Kolik procent lidí, kteří vás kontaktují, se stane platícím zákazníkem.",
    });
  if (group === "marketplace")
    fields.push({
      key: "commission",
      label: "Provize z prodeje (%)",
      suffix: "%",
      placeholder: "např. 10",
      max: 100,
      help: "Kolik procent z každého zprostředkovaného prodeje si necháte vy.",
    });
  fields.push({
    key: "growthYear2",
    label: "Růst ve 2. roce (%)",
    suffix: "%",
    placeholder: "např. 20",
    help: `O kolik procent vzroste počet ${noun} mezi 12. a 24. měsícem. Záleží na oboru a na tom, kolik budete dávat do marketingu. Doporučení podle oboru vám navrhne AI.`,
  });
  return fields;
}

/** Pole, ke kterým AI doporučuje obvyklé hodnoty podle oboru. */
export const AI_ASSUMPTION_FIELDS: Record<RevenueGroup, (keyof RevenueInputs)[]> = {
  commerce: ["grossMargin", "repeatRate", "growthYear2"],
  subscription: ["grossMargin", "churn", "growthYear2"],
  leads: ["grossMargin", "conversion", "growthYear2"],
  content: ["rpm", "growthYear2"],
  marketplace: ["grossMargin", "commission", "growthYear2"],
  generic: ["grossMargin", "growthYear2"],
};

export const HELP = {
  obrat: "Všechny příjmy od zákazníků za první 2 roky po spuštění.",
  zisk: "Obrat minus všechny náklady za 2 roky včetně jednorázové investice. Před daní z příjmu.",
  kapital:
    "Kolik peněz musíte mít k dispozici, než se projekt začne financovat sám. V grafu je to nejnižší bod křivky.",
  roi: "Návratnost investice: zisk za 2 roky vydělený potřebným kapitálem. 100 % znamená, že zisk se rovná penězům, které jste museli vložit.",
  bodZvratu: "První měsíc, kdy příjmy pokryjí všechny měsíční náklady a projekt je v zisku.",
  navratnost: "Měsíc, kdy se vám vrátí všechny vložené peníze včetně ztrát z rozjezdu.",
  obrat12: "Měsíční příjmy rok po spuštění – ukazuje, kam se projekt dostane.",
  zisk12: "Měsíční zisk rok po spuštění, po odečtení zboží, provozu i marketingu.",
  pno: "Podíl nákladů na obratu: kolik procent z tržeb utratíte za marketing. Když je vyšší než maximum pro váš projekt, marketing vám sní zisk.",
  ltv: "Kolik na jednom zákazníkovi vyděláte (po odečtení přímých nákladů) za celou dobu, co u vás nakupuje.",
  cac: "Kolik vás stojí marketing na získání jednoho nového zákazníka. Měl by být alespoň třikrát nižší než LTV.",
  dan:
    "Daň z příjmu se platí ze zisku. Fyzická osoba (OSVČ) obvykle 15 %, s.r.o. 21 %. Počítáme ji zvlášť za každý rok a jen ze zisku. Paušální daň, pojištění a DPH tu nejsou – pojištění OSVČ přidejte do měsíčních nákladů, ceny zadávejte bez DPH.",
  ziskPoZdaneni: "Zisk za 2 roky po odečtení daně z příjmu. Kolik vám z projektu opravdu zůstane.",
  cilovyZisk:
    "Kolik procent z obratu chcete mít jako zisk. Čím vyšší cíl, tím méně peněz zbývá na marketing a tím nižší je maximální PNO.",
};
