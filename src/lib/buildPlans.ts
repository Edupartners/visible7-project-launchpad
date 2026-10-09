/**
 * Fáze 4 – Tvorba. Plán tvorby se skládá z bloků; každý blok má instruktážní video (Vimeo),
 * několik kroků a případně náklady, které jde převzít do byznys case.
 * Bloky jsou sdílené mezi typy byznysu, takže jedno video slouží více typům.
 */

export interface BuildCost {
  name: string;
  /** Orientační částka v Kč; 0 = doplní uživatel */
  amount: number;
  kind: "jednorazove" | "mesicni";
}

export interface BuildBlock {
  id: string;
  title: string;
  /** Co bude po bloku hotové */
  goal: string;
  steps: string[];
  tip?: string;
  minutes: number;
  costs?: BuildCost[];
  /** Vimeo video k bloku – doplňte číslo videa (a hash u neveřejných) */
  vimeoId?: string;
  vimeoHash?: string;
  videoMinutes?: number;
}

export type Difficulty = "Nízká" | "Střední" | "Vyšší";

/** Fáze cesty zákazníka: odkud přijde → co na webu udělá → kde zaplatí nebo se ozve → co je potom. */
export type FunnelStage = "zdroj" | "web" | "konverze" | "potom";

export interface FunnelStep {
  label: string;
  hint: string;
  stage: FunnelStage;
}

const F = (stage: FunnelStage, label: string, hint: string): FunnelStep => ({ stage, label, hint });

export interface BuildType {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  duration: string;
  /** Na čem se staví */
  platform: string;
  /** Nejčastější volba – zvýrazní se v přehledu */
  popular?: boolean;
  blocks: string[];
  /** Cesta zákazníka (funnel) */
  funnel: FunnelStep[];
}

const B = (b: BuildBlock) => b;

export const BLOCKS: Record<string, BuildBlock> = {
  domena: B({
    id: "domena",
    title: "Doména",
    goal: "Máte vlastní adresu webu.",
    steps: [
      "Vyberte krátký název bez diakritiky, ideálně .cz",
      "Ověřte, že název není obsazený a nekoliduje s cizí ochrannou známkou",
      "Kupte doménu u registrátora na 1 rok",
      "Zapněte automatické prodloužení, ať o doménu nepřijdete",
    ],
    tip: "Název má jít nadiktovat do telefonu. Pokud ho musíte hláskovat, hledejte dál.",
    minutes: 20,
    costs: [{ name: "Doména .cz (1 rok)", amount: 250, kind: "jednorazove" }],
  }),
  hosting: B({
    id: "hosting",
    title: "Hosting a WordPress",
    goal: "Web běží na vaší doméně se zabezpečením https.",
    steps: [
      "Objednejte webhosting s instalací WordPressu na jedno kliknutí",
      "Nainstalujte WordPress a nastavte češtinu",
      "Zapněte certifikát SSL (https)",
      "Zkontrolujte, že hosting dělá automatické zálohy",
    ],
    minutes: 45,
    costs: [{ name: "Webhosting", amount: 100, kind: "mesicni" }],
  }),
  vzhled: B({
    id: "vzhled",
    title: "Šablona a vzhled",
    goal: "Web vypadá jako vaše značka.",
    steps: [
      "Vyberte jednoduchou šablonu s blokovým editorem",
      "Nastavte barvy a písmo",
      "Nahrajte logo – na začátek stačí textové",
      "Sestavte menu: Úvod, Nabídka, O nás, Kontakt",
    ],
    tip: "Méně je více. Jedna barva, jedno písmo a dost bílého místa.",
    minutes: 60,
  }),
  texty: B({
    id: "texty",
    title: "Texty stránek",
    goal: "Návštěvník do 5 vteřin pozná, komu pomáháte a co má udělat.",
    steps: [
      "Úvodní stránka: problém zákazníka a vaše řešení (vezměte z Lean Canvasu)",
      "Nabídka: co přesně dostane, za kolik a do kdy",
      "O nás: proč vám věřit – zkušenost, reference, fotka",
      "Kontakt a jedna jasná výzva k akci na každé stránce",
    ],
    tip: "Pište jazykem zákazníka. Slova, kterými popisuje problém, použijte v nadpisech.",
    minutes: 90,
  }),
  prodejni: B({
    id: "prodejni",
    title: "Prodejní stránka",
    goal: "Jedna stránka, která vede k poptávce nebo nákupu.",
    steps: [
      "Nadpis se slibem výsledku pro konkrétního zákazníka",
      "Problém → řešení → důkaz (reference, čísla, ukázky)",
      "Nabídka s cenou a odpovědi na nejčastější námitky",
      "Formulář nebo tlačítko, opakované na konci stránky",
    ],
    minutes: 90,
  }),
  poptavka: B({
    id: "poptavka",
    title: "Formulář a zpracování poptávek",
    goal: "Žádná poptávka se neztratí.",
    steps: [
      "Krátký formulář: jméno, e-mail, telefon, co potřebuje",
      "Upozornění na nové poptávky do e-mailu nebo telefonu",
      "Automatická odpověď s tím, co bude dál a kdy se ozvete",
      "Jednoduchá tabulka poptávek a jejich stavu",
    ],
    minutes: 45,
  }),
  shoptet: B({
    id: "shoptet",
    title: "Shoptet: založení e-shopu",
    goal: "E-shop běží na vaší doméně s vaším vzhledem.",
    steps: [
      "Založte e-shop na Shoptetu – začněte zkušební verzí",
      "Vyberte šablonu, nastavte barvy a nahrajte logo",
      "Vyplňte údaje o firmě a kontakty",
      "Napojte vlastní doménu",
    ],
    tip: "Do 10 produktů je Shoptet zdarma – na ověření zájmu ideální. Vyšší tarif řešte, až budete prodávat.",
    minutes: 60,
    costs: [{ name: "Shoptet (zdarma do 10 produktů)", amount: 0, kind: "mesicni" }],
  }),
  woo: B({
    id: "woo",
    title: "E-shop ve WordPressu",
    goal: "Na webu jde objednat a zaplatit.",
    steps: [
      "Nainstalujte WooCommerce a projděte průvodce nastavením",
      "Přidejte první produkty s cenou a fotkami",
      "Zapněte platbu kartou a převodem",
      "Napojte dopravu (Zásilkovna, Balíkovna)",
    ],
    minutes: 120,
  }),
  produkty: B({
    id: "produkty",
    title: "Produkty",
    goal: "Prvních 5–10 produktů je online a připravených k prodeji.",
    steps: [
      "Začněte s 5–10 produkty, ne s celým katalogem",
      "Fotky z mobilu u okna na bílém pozadí na začátek stačí",
      "Popis: pro koho produkt je, co řeší a parametry",
      "Kategorie a ceny (u plátce DPH včetně DPH)",
    ],
    tip: "Nejprodávanější produkt dejte na úvodní stránku.",
    minutes: 120,
  }),
  platby: B({
    id: "platby",
    title: "Platby a doprava",
    goal: "Zákazník zaplatí a zboží mu dorazí.",
    steps: [
      "Zapněte platební bránu pro platbu kartou a převod",
      "Napojte výdejní místa (Zásilkovna, Balíkovna) a kurýra",
      "Nastavte ceny dopravy a hranici dopravy zdarma",
      "Udělejte zkušební objednávku a opravdu ji zaplaťte",
    ],
    minutes: 60,
    costs: [{ name: "Platební brána (poplatek z plateb – doplňte)", amount: 0, kind: "mesicni" }],
  }),
  dodavatel: B({
    id: "dodavatel",
    title: "Dodavatel",
    goal: "Víte, kdo zboží odešle, za kolik a jak rychle.",
    steps: [
      "Vyberte 1–2 dodavatele s doručením v ČR do pár dnů",
      "Objednejte si vzorek a ověřte kvalitu i balení",
      "Domluvte reklamace a vratky – kdo je řeší a jak",
      "Propojte sklad dodavatele s e-shopem (feed nebo ručně)",
    ],
    minutes: 90,
  }),
  predplatne: B({
    id: "predplatne",
    title: "Opakované platby",
    goal: "Zákazníci platí pravidelně a automaticky.",
    steps: [
      "Vyberte platební bránu s opakovanými platbami",
      "Nastavte tarify (měsíc, rok) a zkušební období",
      "Automatický e-mail před platbou a po neúspěšné platbě",
      "Jednoduché zrušení předplatného pro zákazníka",
    ],
    minutes: 60,
  }),
  clenove: B({
    id: "clenove",
    title: "Členská sekce",
    goal: "Placený obsah vidí jen platící členové.",
    steps: [
      "Vyberte nástroj pro členskou sekci (plugin nebo hotovou službu)",
      "Nastavte úrovně přístupu",
      "Připravte první obsah pro členy",
      "Vyzkoušejte registraci, platbu a přihlášení jako nový člen",
    ],
    minutes: 90,
  }),
  kurz: B({
    id: "kurz",
    title: "Platforma pro kurz",
    goal: "Kurz má místo, kde ho studenti procházejí.",
    steps: [
      "Rozhodněte: hotová služba pro kurzy, nebo WordPress s pluginem",
      "Založte kurz a lekce podle osnovy",
      "Videa nahrajte na Vimeo se zákazem stahování",
      "Nastavte přístup po zaplacení",
    ],
    minutes: 90,
  }),
  obsahkurzu: B({
    id: "obsahkurzu",
    title: "První modul kurzu",
    goal: "Máte hotový první modul a víte, jak natočit další.",
    steps: [
      "Osnova: 5–7 modulů, každý s jedním výsledkem",
      "Natočte první modul telefonem nebo nahrávkou obrazovky",
      "Ke každé lekci krátký pracovní list nebo úkol",
      "Pusťte modul 3 lidem z cílové skupiny a upravte podle nich",
    ],
    tip: "Spusťte kurz s prvním modulem a další dotáčejte. Prodejte ho dřív, než je celý.",
    minutes: 240,
  }),
  landing: B({
    id: "landing",
    title: "Stránka pro sběr kontaktů",
    goal: "Jedna stránka, která sbírá e-maily.",
    steps: [
      "Nadpis se slibem: co člověk získá za svůj e-mail",
      "3 odrážky s přínosem a fotka nebo ukázka dárku",
      "Formulář jen na e-mail (a případně jméno)",
      "Děkovací stránka s dalším krokem",
    ],
    minutes: 60,
  }),
  darek: B({
    id: "darek",
    title: "Dárek za e-mail",
    goal: "Máte lákadlo, za které lidé rádi dají e-mail.",
    steps: [
      "Vyberte formát: checklist, krátké video, šablona nebo mini kurz",
      "Řešte jeden konkrétní problém – rychle a do hloubky",
      "Připravte ho v Canvě nebo jako PDF",
      "Ověřte zájem u 5 lidí z cílové skupiny",
    ],
    minutes: 120,
  }),
  emaily: B({
    id: "emaily",
    title: "E-mailový nástroj a uvítací série",
    goal: "Každý nový kontakt dostane automaticky 3 e-maily.",
    steps: [
      "Založte účet v e-mailovém nástroji (např. Ecomail, MailerLite)",
      "Napojte formulář z webu",
      "Napište uvítací sérii: dárek → příběh → nabídka",
      "Pošlete si test a zkontrolujte, že nekončí ve spamu",
    ],
    minutes: 90,
    costs: [{ name: "E-mailový nástroj", amount: 0, kind: "mesicni" }],
  }),
  clanky: B({
    id: "clanky",
    title: "Plán a první články",
    goal: "Máte plán 10 témat a 3 vydané články.",
    steps: [
      "Vypište otázky, které zákazníci hledají na Googlu",
      "Vyberte 10 témat a seřaďte je podle přínosu",
      "Napište první 3 články – s AI jako pomocníkem, ne autorem",
      "Na konci článku vždy jeden další krok (odběr, produkt)",
    ],
    minutes: 240,
  }),
  affiliate: B({
    id: "affiliate",
    title: "Partnerské programy",
    goal: "Máte schválené programy a funkční odkazy.",
    steps: [
      "Najděte 3–5 partnerských programů k vašemu tématu",
      "Přihlaste se a nechte web schválit",
      "Vložte odkazy do článků a srovnání",
      "Spolupráci viditelně označte – je to povinnost",
    ],
    minutes: 60,
  }),
  trziste: B({
    id: "trziste",
    title: "Tržiště nanečisto",
    goal: "Propojíte první prodejce a kupující bez vývoje.",
    steps: [
      "Začněte ručně: formulář pro prodejce a stránka s nabídkou",
      "Získejte prvních 10 prodejců osobně",
      "Zprostředkujte první obchody a vyberte provizi",
      "Teprve když to funguje, řešte platformu",
    ],
    tip: "Tržiště má problém slepice a vejce. Začněte stranou, kterou získáte snáz.",
    minutes: 180,
  }),
  pravidla: B({
    id: "pravidla",
    title: "Pravidla pro prodejce a členy",
    goal: "Každý ví, co smí, kolik platí a co se stane při sporu.",
    steps: [
      "Podmínky pro prodejce: provize, výplaty, zakázané zboží",
      "Pravidla komunity a moderování",
      "Postup při reklamaci a sporu",
      "Souhlas s pravidly při registraci",
    ],
    minutes: 90,
  }),
  komunita: B({
    id: "komunita",
    title: "Komunitní platforma",
    goal: "Komunita má místo, kde se potkává.",
    steps: [
      "Začněte na hotové platformě (skupina, Discord, komunitní služba)",
      "Nastavte kanály nebo témata – na začátek nejvýš 5",
      "Připravte uvítací příspěvek a pravidla",
      "Pozvěte prvních 20 lidí osobně",
    ],
    minutes: 60,
  }),
  prototyp: B({
    id: "prototyp",
    title: "Zadání a prototyp",
    goal: "Máte klikací prototyp hlavní funkce.",
    steps: [
      "Sepište zadání: problém, uživatel, jedna hlavní funkce",
      "Nechte AI zadání rozpracovat a najít mezery",
      "Vytvořte prototyp v nástroji pro vývoj s AI",
      "Ukažte ho 5 lidem a sledujte, kde se zaseknou",
    ],
    minutes: 240,
  }),
  aplikace: B({
    id: "aplikace",
    title: "První verze aplikace",
    goal: "Aplikace běží online a lidé se do ní můžou přihlásit.",
    steps: [
      "Napojte databázi a přihlášení",
      "Kód ukládejte do repozitáře (GitHub)",
      "Nasaďte aplikaci a napojte doménu",
      "Pokud se platí, napojte platby",
    ],
    minutes: 480,
  }),
  pravni: B({
    id: "pravni",
    title: "Právní minimum",
    goal: "Web splňuje základní povinnosti a nehrozí zbytečná pokuta.",
    steps: [
      "Identifikace podnikatele na webu: jméno, IČO, sídlo",
      "Zásady zpracování osobních údajů",
      "Cookie lišta: měření a reklama až po souhlasu",
      "Při prodeji: obchodní podmínky, reklamační řád, poučení o odstoupení do 14 dnů",
    ],
    tip: "Nejste si jistí? V aplikaci je seniorní poradkyně pro právo online podnikání.",
    minutes: 60,
  }),
  mereni: B({
    id: "mereni",
    title: "Měření návštěvnosti",
    goal: "Víte, kolik lidí přišlo, odkud a kolik jich nakoupilo.",
    steps: [
      "Založte účet Google Analytics 4",
      "Vložte měřicí kód (plugin nebo nastavení platformy)",
      "Nastavte konverzi: odeslaný formulář nebo objednávka",
      "Ověřte, že měření běží až po souhlasu s cookies",
    ],
    minutes: 45,
  }),
  kontrola: B({
    id: "kontrola",
    title: "Kontrola před spuštěním",
    goal: "Web je připravený na první zákazníky.",
    steps: [
      "Projděte celý web na mobilu",
      "Odešlete zkušební formulář nebo objednávku",
      "Změřte rychlost (PageSpeed Insights) a zmenšete velké obrázky",
      "Pošlete web 3 známým a zeptejte se, co jim není jasné",
    ],
    minutes: 45,
  }),
};

export const BUILD_TYPES: BuildType[] = [
  {
    id: "web-prezentacni",
    name: "Web (prezentační)",
    description: "Představí vás a vaše služby. Ideální start pro služby a řemesla.",
    difficulty: "Nízká",
    duration: "7 dní",
    platform: "WordPress",
    popular: true,
    blocks: ["domena", "hosting", "vzhled", "texty", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Google a doporučení", "Hledá službu ve svém okolí"),
      F("web", "Úvodní stránka", "Do 5 vteřin pozná, že jste pro něj"),
      F("web", "Služby a reference", "Přesvědčí ho ukázky a recenze"),
      F("konverze", "Poptávka", "Zavolá nebo vyplní formulář"),
      F("potom", "Schůzka a zakázka", "Domluvíte se osobně"),
    ],
  },
  {
    id: "eshop",
    name: "E-shop",
    description: "Prodej zboží online. Na Shoptetu bez programování.",
    difficulty: "Střední",
    duration: "14 dní",
    platform: "Shoptet",
    popular: true,
    blocks: ["domena", "shoptet", "produkty", "platby", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Reklama a vyhledávání", "Google, Meta, srovnávače"),
      F("web", "Produkt", "Fotky, popis, cena a doprava"),
      F("konverze", "Košík a platba", "Kartou nebo převodem"),
      F("potom", "Doručení", "Zásilkovna nebo kurýr"),
      F("potom", "Recenze a další nákup", "E-mail po doručení"),
    ],
  },
  {
    id: "squeeze-page",
    name: "Squeeze page",
    description: "Jedna stránka, která sbírá kontakty výměnou za dárek.",
    difficulty: "Nízká",
    duration: "5 dní",
    platform: "Stránka + e-mailový nástroj",
    popular: true,
    blocks: ["domena", "landing", "darek", "emaily", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Reklama a sociální sítě", "Nabídka dárku zdarma"),
      F("web", "Stránka s dárkem", "Jedna stránka, jeden cíl"),
      F("konverze", "E-mail za dárek", "Kontakt máte ve své databázi"),
      F("potom", "Uvítací e-maily", "Dárek, příběh, důvěra"),
      F("konverze", "Nabídka", "Prodej produktu nebo služby"),
    ],
  },
  {
    id: "web-eshop",
    name: "Web + E-shop",
    description: "Prezentace i prodej na jednom webu.",
    difficulty: "Střední",
    duration: "14 dní",
    platform: "WordPress + WooCommerce",
    blocks: ["domena", "hosting", "vzhled", "texty", "woo", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Google a reklama", "Hledá řešení nebo produkt"),
      F("web", "Obsah a prezentace", "Pozná vás a začne vám věřit"),
      F("web", "Produkt", "Vybere si z nabídky"),
      F("konverze", "Košík a platba", "Nákup přímo na webu"),
      F("potom", "Další nákup", "Novinky e-mailem"),
    ],
  },
  {
    id: "konverzni-web",
    name: "Konverzní web",
    description: "Jedna silná prodejní stránka, která přivádí poptávky.",
    difficulty: "Nízká",
    duration: "7 dní",
    platform: "WordPress",
    blocks: ["domena", "hosting", "vzhled", "prodejni", "poptavka", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Reklama", "Míří přímo na jednu nabídku"),
      F("web", "Prodejní stránka", "Problém, řešení, důkaz, cena"),
      F("konverze", "Nákup nebo poptávka", "Jedno tlačítko, žádné odbočky"),
      F("potom", "Hotovo", "Děkovací stránka a další krok"),
    ],
  },
  {
    id: "lms",
    name: "Online kurz (LMS)",
    description: "Prodej znalostí formou videokurzu.",
    difficulty: "Střední",
    duration: "21 dní",
    platform: "Platforma pro kurzy + Vimeo",
    blocks: ["domena", "kurz", "obsahkurzu", "predplatne", "emaily", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Obsah zdarma a reklama", "Video, článek nebo podcast"),
      F("web", "Ukázková lekce", "Ochutnávka výměnou za e-mail"),
      F("potom", "E-maily", "Výsledky studentů, odpovědi na námitky"),
      F("web", "Prodejní stránka kurzu", "Osnova, reference, cena"),
      F("konverze", "Platba", "Jednorázově nebo ve splátkách"),
      F("potom", "Studium a certifikát", "Hotový student = nejlepší reference"),
    ],
  },
  {
    id: "members",
    name: "Members (placený obsah)",
    description: "Uzavřená sekce s obsahem pro platící členy.",
    difficulty: "Střední",
    duration: "14 dní",
    platform: "WordPress + členský plugin",
    blocks: ["domena", "hosting", "vzhled", "clenove", "predplatne", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Obsah zdarma", "Ukázka toho, co je uvnitř"),
      F("web", "Registrace", "Zkušební období nebo ukázka"),
      F("konverze", "Předplatné", "Automatická platba měsíčně nebo ročně"),
      F("potom", "Nový obsah pro členy", "Důvod zůstat"),
      F("potom", "Prodloužení", "Člen zůstává další měsíc"),
    ],
  },
  {
    id: "blog",
    name: "Blog",
    description: "Články, které přivádějí lidi z Googlu.",
    difficulty: "Nízká",
    duration: "10 dní",
    platform: "WordPress",
    blocks: ["domena", "hosting", "vzhled", "clanky", "pravni", "mereni"],
    funnel: [
      F("zdroj", "Google", "Hledá odpověď na otázku"),
      F("web", "Článek", "Najde odpověď u vás"),
      F("konverze", "Odběr novinek", "Nechá vám e-mail"),
      F("potom", "Doporučený produkt", "Váš nebo partnerský"),
    ],
  },
  {
    id: "affiliate",
    name: "Affiliate web",
    description: "Výdělek z provizí za doporučené produkty.",
    difficulty: "Střední",
    duration: "14 dní",
    platform: "WordPress",
    blocks: ["domena", "hosting", "vzhled", "clanky", "affiliate", "pravni", "mereni"],
    funnel: [
      F("zdroj", "Google", "Hledá „nejlepší…“ nebo recenzi"),
      F("web", "Srovnání a recenze", "Pomůžete mu vybrat"),
      F("konverze", "Partnerský odkaz", "Klikne k prodejci"),
      F("potom", "Nákup u partnera", "Vy dostanete provizi"),
    ],
  },
  {
    id: "dropshipping",
    name: "Dropshipping",
    description: "E-shop bez vlastního skladu – zboží posílá dodavatel.",
    difficulty: "Střední",
    duration: "14 dní",
    platform: "Shoptet",
    blocks: ["domena", "dodavatel", "shoptet", "produkty", "platby", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Reklama", "Meta, Google, srovnávače"),
      F("web", "Produkt", "Fotky a popis od dodavatele, vylepšené"),
      F("konverze", "Košík a platba", "Platí vám"),
      F("potom", "Objednávka u dodavatele", "Dodavatel zboží odešle"),
      F("potom", "Doručení", "Zákazník dostane balík"),
    ],
  },
  {
    id: "forum-komunita",
    name: "Komunita",
    description: "Placená nebo otevřená komunita kolem tématu.",
    difficulty: "Střední",
    duration: "10 dní",
    platform: "Hotová komunitní platforma",
    blocks: ["domena", "komunita", "pravidla", "predplatne", "pravni", "mereni"],
    funnel: [
      F("zdroj", "Obsah a doporučení", "Pozvánka od člena nebo z obsahu"),
      F("web", "Vstup do komunity", "Uvítání a pravidla"),
      F("potom", "Aktivita", "Otázky, odpovědi, akce"),
      F("konverze", "Placené členství", "Prémiový obsah a setkání"),
    ],
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Tržiště, které propojuje prodejce a kupující.",
    difficulty: "Vyšší",
    duration: "30 dní",
    platform: "Nejdřív ručně, pak platforma",
    blocks: ["domena", "trziste", "pravidla", "platby", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Prodejci", "Nabídnou zboží nebo služby"),
      F("zdroj", "Kupující", "Hledají nabídku"),
      F("web", "Nabídka na tržišti", "Najdou se"),
      F("konverze", "Obchod", "Platba přes tržiště"),
      F("potom", "Provize", "Váš podíl z každého obchodu"),
    ],
  },
  {
    id: "vlastni-napad-app",
    name: "Vlastní aplikace",
    description: "Aplikace na míru postavená s pomocí AI, bez programování.",
    difficulty: "Vyšší",
    duration: "14–30 dní",
    platform: "Vývoj s AI",
    blocks: ["prototyp", "aplikace", "domena", "pravni", "mereni", "kontrola"],
    funnel: [
      F("zdroj", "Web aplikace", "Ukáže, co aplikace vyřeší"),
      F("web", "Registrace", "Zdarma, bez karty"),
      F("potom", "První úspěch", "Uživatel vyřeší svůj problém"),
      F("konverze", "Placený tarif", "Když chce víc"),
    ],
  },
];

export const buildType = (id: string | null | undefined) => BUILD_TYPES.find((t) => t.id === id) ?? null;

export const blocksOf = (t: BuildType) => t.blocks.map((id) => BLOCKS[id]);

export const stepId = (blockId: string, i: number) => `${blockId}:${i}`;

export const typeStats = (t: BuildType) => {
  const blocks = blocksOf(t);
  const minutes = blocks.reduce((s, b) => s + b.minutes, 0);
  const oneOff = blocks.flatMap((b) => b.costs ?? []).filter((c) => c.kind === "jednorazove");
  const monthly = blocks.flatMap((b) => b.costs ?? []).filter((c) => c.kind === "mesicni");
  return {
    blocks: blocks.length,
    steps: blocks.reduce((s, b) => s + b.steps.length, 0),
    hours: Math.round(minutes / 60),
    videos: blocks.filter((b) => b.vimeoId).length,
    oneOff: oneOff.reduce((s, c) => s + c.amount, 0),
    monthly: monthly.reduce((s, c) => s + c.amount, 0),
  };
};

/** Uložený postup tvorby (project_data „build_progress“). */
export interface BuildProgress {
  steps: string[];
  blocks: string[];
  url?: string;
}

export const EMPTY_PROGRESS: BuildProgress = { steps: [], blocks: [] };
