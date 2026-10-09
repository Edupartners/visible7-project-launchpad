/**
 * Fáze 5 – Marketing a testování.
 * Kanál = bloky s instruktážním videem (Vimeo) + test: útrata a výsledky → verdikt škálovat / ladit / vypnout
 * podle maximálního PNO z byznys case (fáze 3). Sdílené bloky (měření, testovací rozpočet) slouží všem kanálům.
 */
import type { BuildBlock } from "@/lib/buildPlans";

export type ChannelKind = "Placený" | "Neplacený";

export interface Channel {
  id: string;
  name: string;
  description: string;
  kind: ChannelKind;
  difficulty: "Nízká" | "Střední" | "Vyšší";
  setupTime: string;
  /** Orientační měsíční rozpočet na test (Kč); 0 = jen čas */
  testBudget: number;
  /** Typy byznysu, kde kanál obvykle funguje nejlépe */
  bestFor: string[];
  /** Jak se kanál jmenuje v nákladech byznys case (pro hodnocení AI z fáze 3) */
  costNames: string[];
  blocks: string[];
  /** Ostatní kanály – zobrazí se až pod hlavními */
  minor?: boolean;
}

const B = (b: BuildBlock) => b;

export const MKT_BLOCKS: Record<string, BuildBlock> = {
  mereni: B({
    id: "mereni",
    title: "Měření konverzí",
    goal: "Víte, kolik prodejů nebo poptávek přinesl každý kanál.",
    steps: [
      "Ověřte, že Google Analytics 4 měří objednávku nebo odeslaný formulář",
      "Vložte měřicí kód reklamního systému (pixel) – jen po souhlasu s cookies",
      "Odkazy v kampaních označte parametry UTM",
      "Udělejte zkušební nákup a zkontrolujte, že se konverze zapsala",
    ],
    tip: "Bez měření nejde poznat, který kanál vydělává. Tenhle blok nepřeskakujte.",
    minutes: 45,
  }),
  rozpocet: B({
    id: "rozpocet",
    title: "Testovací rozpočet",
    goal: "Víte, kolik a jak dlouho testujete a kdy test vyhodnotíte.",
    steps: [
      "Vezměte měsíční marketing z byznys case a rozdělte ho na 2–3 kanály",
      "Na každý kanál dejte rozpočet aspoň na 20–30 prokliků denně",
      "Test nechte běžet 14 dní bez zásahů",
      "Do kalendáře si dejte den vyhodnocení",
    ],
    tip: "Malý test nic nezkazí. Velká kampaň bez testu ano.",
    minutes: 20,
  }),
  texty: B({
    id: "texty",
    title: "Texty a obrázky reklam",
    goal: "Máte 2–3 varianty reklamy k porovnání.",
    steps: [
      "Nadpis: výsledek pro zákazníka, ne vlastnost produktu",
      "Použijte USP z fáze 1 a slova, kterými zákazník popisuje problém",
      "Připravte 2–3 varianty a nechte vyhrát tu, na kterou se kliká",
      "Reklama i stránka, kam vede, musí slibovat totéž",
    ],
    minutes: 60,
  }),
  meta_ucet: B({
    id: "meta_ucet",
    title: "Meta: účet a publikum",
    goal: "Máte firemní účet a víte, komu reklamu ukázat.",
    steps: [
      "Založte Meta Business portfolio a propojte Facebook a Instagram",
      "Ověřte doménu a nastavte pixel s událostí nákupu nebo poptávky",
      "Publikum: místo, věk a 2–3 zájmy vašeho zákazníka",
      "Připravte si i publikum návštěvníků webu pro opakované oslovení",
    ],
    minutes: 60,
  }),
  meta_kampan: B({
    id: "meta_kampan",
    title: "Meta: první kampaň",
    goal: "Běží kampaň na prodej nebo poptávky s malým rozpočtem.",
    steps: [
      "Cíl kampaně: prodej nebo potenciální zákazníci, ne dosah",
      "Denní rozpočet podle testovacího rozpočtu",
      "Nahrajte 2–3 varianty reklamy",
      "Po 3 dnech zkontrolujte, že se utrácí a měří",
    ],
    minutes: 60,
  }),
  google_klic: B({
    id: "google_klic",
    title: "Google Ads: klíčová slova",
    goal: "Víte, co zákazníci hledají a kolik stojí proklik.",
    steps: [
      "V plánovači klíčových slov najděte 10–20 frází s nákupním úmyslem",
      "Vyřaďte obecná slova a přidejte vylučující („zdarma“, „návod“, „práce“)",
      "Seskupte slova do 2–3 témat",
      "Odhadněte cenu za proklik a porovnejte s rozpočtem",
    ],
    minutes: 60,
  }),
  google_kampan: B({
    id: "google_kampan",
    title: "Google Ads: kampaň ve vyhledávání",
    goal: "Reklama se ukazuje lidem, kteří vás právě hledají.",
    steps: [
      "Založte kampaň ve vyhledávání s cílem konverze",
      "Ke každému tématu reklamu s klíčovým slovem v nadpisu",
      "Omezte místo a čas zobrazení podle zákazníka",
      "Napojte konverze z Google Analytics",
    ],
    minutes: 90,
  }),
  sklik_kampan: B({
    id: "sklik_kampan",
    title: "Sklik: kampaň na Seznamu",
    goal: "Oslovíte lidi, kteří hledají na Seznamu.",
    steps: [
      "Založte účet Sklik a vložte měřicí kód Seznamu",
      "Převezměte klíčová slova z Google Ads",
      "Kampaň ve vyhledávání s denním rozpočtem z testu",
      "Porovnávejte cenu za konverzi se Google Ads",
    ],
    tip: "Na Seznamu hledá hlavně starší a mimopražské publikum. U některých oborů je levnější než Google.",
    minutes: 60,
  }),
  chatgpt_kampan: B({
    id: "chatgpt_kampan",
    title: "ChatGPT Ads: první kampaň",
    goal: "Vaše nabídka se ukáže lidem, kteří se ptají ChatGPT.",
    steps: [
      "V Ads Manageru ověřte dostupnost pro Českou republiku",
      "Vložte měřicí kód OpenAI na web",
      "Popište nabídku tak, jak by ji zákazník popsal v otázce",
      "Začněte malým testovacím rozpočtem a porovnejte s Google Ads",
    ],
    minutes: 60,
  }),
  srovnavace_feed: B({
    id: "srovnavace_feed",
    title: "Srovnávače: napojení feedu",
    goal: "Produkty jsou na Heurece a Zboží.cz.",
    steps: [
      "V e-shopu vygenerujte XML feed produktů (Shoptet ho má hotový)",
      "Zaregistrujte obchod na Heureka.cz a Zboží.cz a vložte feed",
      "Zapněte sběr recenzí od zákazníků",
      "Zkontrolujte chyby ve feedu a opravte názvy produktů",
    ],
    minutes: 60,
  }),
  srovnavace_cena: B({
    id: "srovnavace_cena",
    title: "Srovnávače: placené zobrazení",
    goal: "Platíte jen za produkty, které se vyplácí.",
    steps: [
      "Zapněte cenu za proklik jen u nejprodávanějších produktů",
      "Nastavte strop ceny za proklik podle marže",
      "Po 14 dnech vypněte produkty bez prodeje",
      "Sledujte hodnocení obchodu – je důležitější než cena",
    ],
    minutes: 45,
  }),
  profil: B({
    id: "profil",
    title: "Firemní profil na Googlu",
    goal: "Ukážete se na mapách a v místním hledání.",
    steps: [
      "Založte a ověřte Firemní profil Google",
      "Vyplňte obor, oblast působnosti, otevírací dobu a fotky",
      "Požádejte 5 spokojených zákazníků o recenzi",
      "Jednou týdně přidejte příspěvek nebo fotku z práce",
    ],
    tip: "Pro služby v jednom městě často nejsilnější kanál – a zdarma.",
    minutes: 60,
  }),
  email_seznam: B({
    id: "email_seznam",
    title: "E-mail: sběr kontaktů",
    goal: "Každý týden přibývají kontakty se souhlasem.",
    steps: [
      "Formulář na webu s jasnou odměnou za e-mail",
      "Souhlas se zasíláním oddělený od objednávky",
      "Propojení s e-mailovým nástrojem",
      "Uvítací e-mail do 5 minut od přihlášení",
    ],
    minutes: 45,
  }),
  email_kampan: B({
    id: "email_kampan",
    title: "E-mail: automatizace a newsletter",
    goal: "E-maily prodávají i když spíte.",
    steps: [
      "Automatický e-mail po opuštění košíku nebo po stažení dárku",
      "Žádost o recenzi po doručení",
      "Pravidelný newsletter jednou za 2–4 týdny",
      "Sledujte otevření a prokliky, ne jen počet odeslaných",
    ],
    minutes: 90,
  }),
  seo_zaklad: B({
    id: "seo_zaklad",
    title: "SEO: základ",
    goal: "Google ví, o čem váš web je.",
    steps: [
      "Připojte web do Google Search Console",
      "Každá stránka má vlastní nadpis a popis s hlavním slovem",
      "Zrychlete web a zmenšete obrázky",
      "Odkažte na web z firemního profilu a sociálních sítí",
    ],
    minutes: 90,
  }),
  seo_obsah: B({
    id: "seo_obsah",
    title: "SEO: obsah",
    goal: "Články přivádějí lidi, kteří hledají řešení.",
    steps: [
      "Vypište 10 otázek, které zákazníci hledají",
      "Na každou odpovězte článkem lépe než konkurence",
      "Z článku vždy odkaz na produkt nebo poptávku",
      "Po 3 měsících zkontrolujte pozice a články doplňte",
    ],
    tip: "SEO je běh na dlouhou trať. Výsledky čekejte za 3–6 měsíců.",
    minutes: 240,
  }),
  linkedin: B({
    id: "linkedin",
    title: "LinkedIn: osobní profil a obsah",
    goal: "Firemní zákazníci vás znají jako odborníka.",
    steps: [
      "Profil: komu pomáháte a s čím, ne jen pozice",
      "Jednou týdně příspěvek z praxe – příběh, chyba, výsledek",
      "Každý den 5 smysluplných komentářů u lidí z cílové skupiny",
      "Oslovení zpráv jen po předchozí interakci",
    ],
    minutes: 60,
  }),
  influenceri: B({
    id: "influenceri",
    title: "Influenceři a spolupráce",
    goal: "Doporučí vás lidé, kterým vaši zákazníci věří.",
    steps: [
      "Najděte 10 menších tvůrců, které sleduje váš zákazník",
      "Nabídněte produkt nebo službu výměnou za upřímnou recenzi",
      "Každý dostane vlastní slevový kód – tak změříte prodeje",
      "Spolupráci musí tvůrce označit jako reklamu",
    ],
    minutes: 90,
  }),
  katalogy: B({
    id: "katalogy",
    title: "Marketplace a katalogy",
    goal: "Prodáváte i tam, kde už zákazníci nakupují.",
    steps: [
      "Vyberte jedno tržiště nebo katalog vhodný pro váš sortiment",
      "Napojte feed nebo nahrajte nejprodávanější produkty",
      "Spočítejte marži po provizi tržiště",
      "Po měsíci vyhodnoťte, jestli se vyplácí",
    ],
    minutes: 90,
  }),
  sms: B({
    id: "sms",
    title: "SMS zprávy",
    goal: "Krátké zprávy u objednávky a akcí.",
    steps: [
      "Zvolte SMS bránu s napojením na e-shop",
      "Automatická SMS při odeslání zásilky",
      "Akční SMS jen se souhlasem zákazníka",
      "Měřte prodeje z každé kampaně",
    ],
    minutes: 45,
  }),
  konkurence: B({
    id: "konkurence",
    title: "Benchmark konkurence",
    goal: "Víte, kde a čím konkurence inzeruje.",
    steps: [
      "V knihovně reklam Meta vyhledejte konkurenty z fáze 1",
      "Vyhledejte v Googlu a na Seznamu jejich hlavní služby a podívejte se na reklamy",
      "Zapište si, co slibují a za kolik",
      "Najděte, co nikdo nenabízí – to dejte do své reklamy",
    ],
    minutes: 45,
  }),
};

export const CHANNELS: Channel[] = [
  {
    id: "meta",
    name: "Meta Ads (Facebook a Instagram)",
    description: "Reklama tam, kde lidé tráví čas. Silná pro e-shopy, kurzy a sběr kontaktů.",
    kind: "Placený",
    difficulty: "Střední",
    setupTime: "2–3 dny",
    testBudget: 3000,
    bestFor: [
      "eshop",
      "dropshipping",
      "web-eshop",
      "lms",
      "members",
      "squeeze-page",
      "forum-komunita",
      "konverzni-web",
    ],
    costNames: ["meta", "facebook", "instagram"],
    blocks: ["mereni", "rozpocet", "meta_ucet", "texty", "meta_kampan"],
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Reklama lidem, kteří právě hledají, co nabízíte.",
    kind: "Placený",
    difficulty: "Vyšší",
    setupTime: "3–5 dnů",
    testBudget: 4000,
    bestFor: ["web-prezentacni", "konverzni-web", "eshop", "web-eshop", "lms", "dropshipping"],
    costNames: ["google ads"],
    blocks: ["mereni", "rozpocet", "google_klic", "texty", "google_kampan"],
  },
  {
    id: "sklik",
    name: "Sklik (Seznam)",
    description: "Vyhledávání na Seznamu. Často levnější proklik než Google.",
    kind: "Placený",
    difficulty: "Střední",
    setupTime: "1–2 dny",
    testBudget: 2000,
    bestFor: ["web-prezentacni", "konverzni-web", "eshop", "web-eshop", "dropshipping"],
    costNames: ["sklik", "seznam"],
    blocks: ["mereni", "rozpocet", "google_klic", "sklik_kampan"],
  },
  {
    id: "srovnavace",
    name: "Srovnávače zboží",
    description: "Heureka a Zboží.cz. Pro e-shopy první volba.",
    kind: "Placený",
    difficulty: "Nízká",
    setupTime: "1–2 dny",
    testBudget: 2000,
    bestFor: ["eshop", "dropshipping", "web-eshop"],
    costNames: ["srovnávač", "heureka", "zboží"],
    blocks: ["mereni", "srovnavace_feed", "srovnavace_cena"],
  },
  {
    id: "google-profil",
    name: "Firemní profil na Googlu",
    description: "Mapy a místní hledání. Pro služby zdarma a velmi účinné.",
    kind: "Neplacený",
    difficulty: "Nízká",
    setupTime: "1 den",
    testBudget: 0,
    bestFor: ["web-prezentacni", "konverzni-web"],
    costNames: ["firemní profil", "google business", "mapy"],
    blocks: ["mereni", "profil"],
  },
  {
    id: "email",
    name: "E-mail marketing",
    description: "Uvítací série, opuštěný košík a newsletter. Nejlevnější prodej.",
    kind: "Neplacený",
    difficulty: "Nízká",
    setupTime: "2–3 dny",
    testBudget: 0,
    bestFor: ["squeeze-page", "lms", "members", "eshop", "blog", "affiliate", "web-eshop"],
    costNames: ["e-mail", "email", "newsletter", "ecomail", "mailerlite"],
    blocks: ["mereni", "email_seznam", "email_kampan"],
  },
  {
    id: "chatgpt-ads",
    name: "ChatGPT Ads",
    description: "Reklama v odpovědích ChatGPT. Nový kanál, testujte opatrně.",
    kind: "Placený",
    difficulty: "Střední",
    setupTime: "1–2 dny",
    testBudget: 2000,
    bestFor: ["web-prezentacni", "eshop", "lms", "vlastni-napad-app"],
    costNames: ["chatgpt"],
    blocks: ["mereni", "rozpocet", "texty", "chatgpt_kampan"],
  },
  {
    id: "seo",
    name: "SEO a obsah",
    description: "Články a optimalizace pro Google. Pomalé, ale zadarmo a dlouhodobé.",
    kind: "Neplacený",
    difficulty: "Vyšší",
    setupTime: "3–6 měsíců",
    testBudget: 0,
    bestFor: ["blog", "affiliate", "web-prezentacni", "eshop", "lms"],
    costNames: ["seo", "obsah", "články"],
    blocks: ["mereni", "seo_zaklad", "seo_obsah"],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    description: "Pro firemní zákazníky a odborné služby.",
    kind: "Neplacený",
    difficulty: "Střední",
    setupTime: "průběžně",
    testBudget: 0,
    bestFor: ["konverzni-web", "web-prezentacni", "vlastni-napad-app"],
    costNames: ["linkedin"],
    blocks: ["mereni", "linkedin"],
  },
  {
    id: "influenceri",
    name: "Influenceři a PR",
    description: "Doporučení od lidí, kterým zákazníci věří.",
    kind: "Placený",
    difficulty: "Střední",
    setupTime: "1–2 týdny",
    testBudget: 3000,
    bestFor: ["eshop", "lms", "members", "forum-komunita"],
    costNames: ["influenc"],
    blocks: ["influenceri"],
    minor: true,
  },
  {
    id: "katalogy",
    name: "Marketplace a katalogy",
    description: "Prodej přes velká tržiště a módní či nábytkové katalogy.",
    kind: "Placený",
    difficulty: "Střední",
    setupTime: "3–5 dnů",
    testBudget: 2000,
    bestFor: ["eshop", "dropshipping"],
    costNames: ["marketplace", "katalog", "allegro", "glami", "favi"],
    blocks: ["mereni", "katalogy"],
    minor: true,
  },
  {
    id: "sms",
    name: "SMS",
    description: "Krátké zprávy k objednávkám a akcím.",
    kind: "Placený",
    difficulty: "Nízká",
    setupTime: "1 den",
    testBudget: 500,
    bestFor: [],
    costNames: ["sms"],
    blocks: ["sms"],
    minor: true,
  },
];

export const channelById = (id: string | undefined) => CHANNELS.find((c) => c.id === id) ?? null;

export type Fit = "doporuceno" | "zvazit" | "nedoporuceno";

/** Skóre kanálu pro projekt: typ byznysu + hodnocení AI z fáze 3 + kanál už je v rozpočtu. */
export function rankChannels(
  businessType: string | null | undefined,
  fits: Record<string, Fit>,
  budgetNames: string[],
) {
  return CHANNELS.map((c) => {
    let score = c.minor ? -1 : 0;
    if (businessType && c.bestFor.includes(businessType)) score += 3;
    const fit = Object.entries(fits).find(([name]) => c.costNames.some((n) => name.toLowerCase().includes(n)))?.[1];
    if (fit === "doporuceno") score += 3;
    if (fit === "zvazit") score += 1;
    if (fit === "nedoporuceno") score -= 4;
    const inBudget = budgetNames.some((name) => c.costNames.some((n) => name.toLowerCase().includes(n)));
    if (inBudget) score += 2;
    return { channel: c, score, fit: fit ?? null, inBudget };
  }).sort((a, b) => b.score - a.score);
}

export interface ChannelTest {
  spend: number;
  clicks?: number;
  conversions: number;
  revenue?: number;
  date?: string;
}

export interface ChannelProgress {
  steps: string[];
  blocks: string[];
  test?: ChannelTest;
}

export type Verdict = "skalovat" | "ladit" | "vypnout" | "malo-dat";

export const VERDICT_COPY: Record<Verdict, { title: string; text: string; tone: string }> = {
  skalovat: {
    title: "Škálovat",
    text: "Kanál se vyplácí. Přidávejte rozpočet postupně, třeba o 20 % týdně, a hlídejte PNO.",
    tone: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  },
  ladit: {
    title: "Ladit",
    text: "Kousek nad hranicí. Zkuste lepší reklamu, užší publikum nebo jinou cílovou stránku a testujte znovu.",
    tone: "bg-amber-50 text-amber-900 ring-amber-200",
  },
  vypnout: {
    title: "Vypnout",
    text: "Kanál teď prodělává. Peníze přesuňte do kanálu, který funguje, nebo nejdřív změňte nabídku.",
    tone: "bg-red-50 text-red-900 ring-red-200",
  },
  "malo-dat": {
    title: "Málo dat",
    text: "Na rozhodnutí je potřeba aspoň pár konverzí. Nechte test běžet déle.",
    tone: "bg-muted text-foreground ring-border",
  },
};

/** Vyhodnocení testu: PNO proti maximu z byznys case (stejné pravidlo jako ve fázi 3). */
export function evaluateTest(t: ChannelTest, price: number, maxPno: number | null) {
  const revenue = t.revenue && t.revenue > 0 ? t.revenue : t.conversions * price;
  const cpa = t.conversions > 0 ? t.spend / t.conversions : null;
  const pno = revenue > 0 ? (t.spend / revenue) * 100 : null;
  const cpc = t.clicks && t.clicks > 0 ? t.spend / t.clicks : null;
  const conversionRate = t.clicks && t.clicks > 0 ? (t.conversions / t.clicks) * 100 : null;
  let verdict: Verdict = "malo-dat";
  if (t.spend === 0 && t.conversions > 0) verdict = "skalovat";
  else if (t.conversions >= 3 && pno !== null && maxPno !== null) {
    verdict = pno <= maxPno ? "skalovat" : pno <= maxPno + 5 ? "ladit" : "vypnout";
  } else if (t.conversions === 0 && t.spend >= price * 3 && price > 0) verdict = "vypnout";
  return { revenue, cpa, pno, cpc, conversionRate, verdict };
}
