/**
 * Slovník podnikatele: hesla s krátkým vysvětlením a odkazy na lekce.
 * Lekce se k heslu hledají podle `match`: kousky názvu lekce (malými písmeny, bez diakritiky).
 * Nové video s takovým názvem se ke slovníku připojí samo.
 */

export type GlossaryCategory = "podnikani" | "web" | "texty" | "mereni" | "reklama" | "seo" | "ai" | "grafika" | "pravo";

export const GLOSSARY_CATEGORIES: Record<GlossaryCategory, string> = {
  podnikani: "Podnikání a strategie",
  web: "Web a e-shop",
  texty: "Texty a prodej",
  mereni: "Měření a data",
  reklama: "Reklama",
  seo: "SEO a viditelnost v AI",
  ai: "Umělá inteligence",
  grafika: "Grafika a grafy",
  pravo: "Právo a značka",
};

export interface GlossaryTerm {
  term: string;
  /** Další názvy a zkratky, pod kterými se heslo hledá. */
  aka?: string[];
  cat: GlossaryCategory;
  def: string;
  /** Kousky názvů lekcí (bez diakritiky, malými písmeny); musí začínat na začátku slova. */
  match: string[];
  /** Lekce, které výraz obsahují, ale k heslu nepatří. */
  not?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  // Podnikání a strategie
  {
    term: "Cílová skupina",
    aka: ["cílovka", "segment"],
    cat: "podnikani",
    def: "Lidé, kterým je nabídka určená a kteří ji s největší pravděpodobností koupí. Popisuje se demograficky (věk, bydliště, příjem) i podle potřeb, hodnot a nákupního chování.",
    match: ["cilova skupina", "cilovky", "kdo je na facebooku"],
  },
  {
    term: "Persona",
    cat: "podnikani",
    def: "Konkrétně popsaný typický zákazník se jménem, situací, přáními a obavami. Pomáhá psát texty a reklamy tak, jako byste mluvili s jedním člověkem.",
    match: ["persona"],
  },
  {
    term: "USP",
    aka: ["unique selling proposition", "konkurenční výhoda"],
    cat: "podnikani",
    def: "Jedinečný důvod, proč koupit právě u vás, a ne u konkurence. Musí být pro zákazníka důležitý a dát se jednou větou říct.",
    match: ["usp", "konkurencni vyhod"],
  },
  {
    term: "Marže",
    cat: "podnikani",
    def: "Rozdíl mezi prodejní cenou a náklady na prodané zboží nebo službu. Z marže se platí reklama, provoz i zisk, proto rozhoduje, kolik si můžete dovolit za zákazníka zaplatit.",
    match: ["marze"],
  },
  {
    term: "See–Think–Do–Care",
    aka: ["STDC", "nákupní cyklus"],
    cat: "podnikani",
    def: "Model nákupního cyklu od Googlu: See (ještě nehledá), Think (zvažuje), Do (chce koupit), Care (už je zákazník). Ke každé fázi patří jiný obsah a jiná reklama.",
    match: ["see-think", "see–think", "nakupniho cyklu"],
  },
  {
    term: "Marketplace",
    cat: "podnikani",
    def: "Online tržiště, kde prodává mnoho obchodníků pod jednou značkou (Allegro, Mall, Amazon). Rychlý přístup k zákazníkům za cenu provize a menší kontroly.",
    match: ["marketplace"],
  },
  {
    term: "KPI",
    aka: ["klíčový ukazatel výkonu"],
    cat: "podnikani",
    def: "Číslo, podle kterého poznáte, jestli se daří: třeba počet objednávek, tržby nebo cena za zákazníka. Má být málo a mají být měřitelné.",
    match: ["kpi"],
  },

  // Web a e-shop
  {
    term: "Doména",
    cat: "web",
    def: "Adresa webu, například micek.academy. Registruje se na rok a dál a je potřeba ji včas prodlužovat, jinak o ni můžete přijít.",
    match: ["domen", "domeny"],
  },
  {
    term: "Registrátor domény",
    aka: ["CZ.NIC"],
    cat: "web",
    def: "Firma, přes kterou si doménu zaregistrujete a platíte. Správcem české koncovky .cz je sdružení CZ.NIC, registraci ale děláte přes registrátora (Wedos, Forpsi, Active24 a další).",
    match: ["registrace a prodlouzeni domeny", "nakup domeny"],
  },
  {
    term: "Subdoména",
    cat: "web",
    def: "Část pod hlavní doménou, například blog.mojefirma.cz. Pro hlavní web je lepší vlastní doména, subdoména se hodí pro doplňkové části.",
    match: ["subdomen"],
  },
  {
    term: "DNS",
    cat: "web",
    def: "Systém, který překládá doménu na adresu serveru. V nastavení DNS určujete, kde běží web a kam chodí e-maily.",
    match: ["dns"],
  },
  {
    term: "Webhosting",
    aka: ["hosting"],
    cat: "web",
    def: "Pronajaté místo na serveru, kde běží váš web, databáze a často i e-maily. Platí se měsíčně nebo ročně.",
    match: ["webhosting"],
  },
  {
    term: "SSL certifikát a HTTPS",
    aka: ["SSL", "HTTPS"],
    cat: "web",
    def: "Šifrované spojení mezi návštěvníkem a webem, poznáte ho podle https:// a zámku v prohlížeči. Bez něj prohlížeče web označí jako nezabezpečený.",
    match: ["ssl", "https"],
  },
  {
    term: "FTP",
    cat: "web",
    def: "Způsob, jak nahrávat a stahovat soubory webu na server. Používá se k tomu program (FTP klient), například FileZilla.",
    match: ["ftp"],
  },
  {
    term: "WordPress",
    aka: ["WP"],
    cat: "web",
    def: "Nejrozšířenější open source systém na tvorbu webů. Instaluje se na vlastní hosting a rozšiřuje šablonami a pluginy.",
    match: ["wordpress", "wp "],
  },
  {
    term: "Elementor",
    cat: "web",
    def: "Plugin do WordPressu pro skládání stránek myší bez programování. Verze PRO přidává šablony, formuláře a další prvky.",
    match: ["elementor"],
  },
  {
    term: "Šablona webu",
    aka: ["téma", "theme"],
    cat: "web",
    def: "Hotový vzhled webu nebo e-shopu, který upravíte barvami, logem a obsahem. Ve WordPressu se jí říká téma, v Shoptetu šablona.",
    match: ["sablon"],
    not: ["canva", "velikosti"],
  },
  {
    term: "Plugin",
    cat: "web",
    def: "Doplněk, který do WordPressu nebo e-shopu přidá funkci: formulář, SEO, platby, cookies lištu. Čím méně pluginů, tím rychlejší a bezpečnější web.",
    match: ["plugin"],
    not: ["bez pluginu"],
  },
  {
    term: "Localhost",
    cat: "web",
    def: "Web spuštěný jen na vašem počítači. Hodí se na zkoušení, než web přesunete (zmigrujete) na skutečný server.",
    match: ["localhost"],
  },
  {
    term: "HTML a CSS",
    aka: ["HTML", "CSS"],
    cat: "web",
    def: "HTML popisuje obsah a strukturu stránky (nadpisy, odstavce, obrázky), CSS její vzhled (barvy, písmo, rozložení). Dnes je za vás většinou napíše editor nebo AI.",
    match: ["html"],
  },
  {
    term: "Iframe",
    cat: "web",
    def: "Okno do cizí stránky vložené do vašeho webu. Typicky mapa nebo video z YouTube.",
    match: ["iframe"],
  },
  {
    term: "Nástroje pro vývojáře",
    aka: ["DevTools", "prozkoumat prvek"],
    cat: "web",
    def: "Panel v prohlížeči (pravé tlačítko › Prozkoumat), ve kterém vidíte kód a styly stránky. Pomůže najít, co upravit, nebo proč něco nefunguje.",
    match: ["nastroje pro vyvojare"],
  },
  {
    term: "Landing page",
    aka: ["vstupní stránka", "prodejní stránka"],
    cat: "web",
    def: "Stránka postavená na jeden cíl: aby návštěvník koupil, vyplnil formulář nebo si stáhl e-book. Většinou na ni vede reklama.",
    match: ["landing page", "prodejni strank", "zaujmi"],
  },
  {
    term: "Krabicové řešení",
    aka: ["SaaS e-shop", "open source"],
    cat: "web",
    def: "Hotová služba za měsíční poplatek (Shoptet, Shopify), kde se o server a aktualizace stará provozovatel. Opakem je open source (WordPress, WooCommerce), který si spravujete sami.",
    match: ["krabicove", "moznosti tvorby webu", "proc shoptet"],
  },
  {
    term: "Shoptet",
    cat: "web",
    def: "Nejrozšířenější česká platforma pro e-shopy za měsíční poplatek. Napojení na platby, dopravce, Heureku a účetnictví je hotové.",
    match: ["shoptet"],
  },
  {
    term: "WooCommerce",
    aka: ["Woo"],
    cat: "web",
    def: "Plugin, který z WordPressu udělá e-shop. Je zdarma, ale hosting, platby a doplňky si řešíte sami.",
    match: ["woocommerce", "woo "],
  },
  {
    term: "Platební brána",
    aka: ["Stripe", "platba kartou"],
    cat: "web",
    def: "Služba, která na webu přijme platbu kartou a peníze pošle na váš účet. Za každou platbu si bere malý poplatek.",
    match: ["stripe", "platby"],
  },
  {
    term: "Varianty produktu",
    cat: "web",
    def: "Různé verze jednoho produktu, třeba velikosti a barvy, každá s vlastním skladem a cenou.",
    match: ["varianty"],
    not: ["reklam"],
  },
  {
    term: "Cross-sell",
    aka: ["doprodej"],
    cat: "web",
    def: "Nabídka souvisejícího zboží k tomu, co zákazník kupuje (k foťáku paměťová karta). Zvyšuje hodnotu objednávky.",
    match: ["cross-sell"],
  },
  {
    term: "Cookies lišta",
    aka: ["cookie banner", "souhlas s cookies"],
    cat: "web",
    def: "Okno, ve kterém návštěvník souhlasí (nebo nesouhlasí) s ukládáním cookies pro měření a reklamu. Bez souhlasu nesmíte spouštět analytické a reklamní kódy.",
    match: ["cookies"],
  },
  {
    term: "Hero sekce",
    aka: ["hero", "hero slider"],
    cat: "web",
    def: "První velká část stránky, kterou návštěvník uvidí bez posouvání. Má hned říct, co nabízíte a proč právě vy.",
    match: ["hero"],
  },

  // Texty a prodej
  {
    term: "Copywriting",
    cat: "texty",
    def: "Psaní textů, které prodávají: na web, do reklam, e-mailů i na sítě. Píše se pro zákazníka a jeho potřeby, ne o firmě.",
    match: ["copywriting", "psani pro web"],
  },
  {
    term: "Benefit",
    aka: ["přínos"],
    cat: "texty",
    def: "Co zákazníkovi vlastnost produktu přinese. Vlastnost: baterie 5 000 mAh. Benefit: telefon vydrží celý den bez nabíječky.",
    match: ["benefit"],
  },
  {
    term: "Tone of voice",
    aka: ["tón komunikace"],
    cat: "texty",
    def: "Jak značka mluví: formálně, nebo kamarádsky, vážně, nebo s humorem. Má být stejný na webu, v reklamách i na sítích.",
    match: ["tone of voice", "ton komunikace", "ton videi"],
  },
  {
    term: "Výzva k akci",
    aka: ["CTA", "call to action"],
    cat: "texty",
    def: "Jasná instrukce, co má člověk udělat: Objednat, Rezervovat termín, Stáhnout zdarma. Na stránce i v reklamě by měla být vždy jedna hlavní.",
    match: ["vyzva k akci", "vyzvy k akci"],
  },
  {
    term: "AIDA",
    cat: "texty",
    def: "Model prodejního textu: Attention (pozornost), Interest (zájem), Desire (touha), Action (akce).",
    match: ["aida"],
  },
  {
    term: "PAS",
    cat: "texty",
    def: "Model textu: Problem (pojmenujte problém), Agitate (ukažte, co způsobuje), Solution (nabídněte řešení).",
    match: ["model pas"],
  },
  {
    term: "Hook",
    cat: "texty",
    def: "První věta nebo první vteřiny videa, které mají člověka zastavit při scrollování. Rozhodují, jestli se na zbytek vůbec podívá.",
    match: ["hook"],
  },
  {
    term: "Obrácená pyramida",
    cat: "texty",
    def: "Psaní od nejdůležitějšího k detailům. Lidé na webu nečtou, ale skenují, a podstatu musí pochopit z prvních řádků.",
    match: ["obracena pyramida", "skenuji"],
  },

  // Měření a data
  {
    term: "Google Analytics 4",
    aka: ["GA4", "GA"],
    cat: "mereni",
    def: "Bezplatný nástroj Googlu na měření návštěvnosti: odkud lidé přišli, co na webu dělali a kolik z nich nakoupilo.",
    match: ["ga4"],
  },
  {
    term: "Google Tag Manager",
    aka: ["GTM", "Tag Manager"],
    cat: "mereni",
    def: "Nástroj, přes který vkládáte na web měřicí kódy (GA4, Meta Pixel, Sklik) bez zásahu do kódu webu. Hodí se, když měříte víc věcí najednou.",
    match: ["tag manager", "gtm"],
  },
  {
    term: "Konverze",
    aka: ["klíčová událost"],
    cat: "mereni",
    def: "Akce, kvůli které web máte: nákup, odeslaný formulář, rezervace. V GA4 se jí nově říká klíčová událost.",
    match: ["konverz"],
    not: ["konverzacne"],
  },
  {
    term: "Mikrokonverze",
    cat: "mereni",
    def: "Menší krok k hlavní konverzi: přidání do košíku, klik na telefon, přihlášení k newsletteru. Ukazuje zájem, i když člověk zatím nekoupil.",
    match: ["mikrokonverz"],
  },
  {
    term: "Konverzní poměr",
    aka: ["míra konverze", "conversion rate"],
    cat: "mereni",
    def: "Kolik procent návštěv skončí konverzí. Ze 100 návštěv 2 objednávky = konverzní poměr 2 %.",
    match: ["konverzni pomer"],
  },
  {
    term: "Událost",
    aka: ["event"],
    cat: "mereni",
    def: "Jakákoli měřená akce na webu: zobrazení stránky, klik, odeslání formuláře, nákup. Z událostí se skládají všechna data v GA4.",
    match: ["udalost"],
  },
  {
    term: "Relace",
    aka: ["návštěva", "session"],
    cat: "mereni",
    def: "Jedna návštěva webu jedním člověkem. Jeden uživatel může mít za měsíc mnoho relací.",
    match: ["relace"],
    not: ["tabulky"],
  },
  {
    term: "UTM parametry",
    aka: ["UTM"],
    cat: "mereni",
    def: "Značky na konci odkazu (utm_source, utm_medium, utm_campaign), podle kterých v GA4 poznáte, ze které kampaně nebo e-mailu návštěva přišla.",
    match: ["utm"],
  },
  {
    term: "Vstupní stránka",
    aka: ["landing page v GA4"],
    cat: "mereni",
    def: "Stránka, na kterou člověk na web přišel jako na první. Její výkon ukazuje, jestli splnila to, co slibovala reklama nebo výsledek ve vyhledávání.",
    match: ["vstupni strank"],
  },
  {
    term: "Nákupní trychtýř",
    aka: ["funnel"],
    cat: "mereni",
    def: "Cesta od návštěvy přes košík a pokladnu k nákupu. Ukazuje, v kterém kroku lidé nejčastěji odcházejí.",
    match: ["trychtyr", "funnel"],
  },
  {
    term: "Zdroj a médium",
    aka: ["akvizice", "kanál"],
    cat: "mereni",
    def: "Odkud návštěva přišla: zdroj je konkrétní web nebo služba (google, facebook), médium typ návštěvy (organic, cpc, email).",
    match: ["akvizice", "zdroj a medium"],
  },
  {
    term: "Looker Studio",
    cat: "mereni",
    def: "Bezplatný nástroj Googlu na přehledné reporty z GA4, Google Ads a tabulek. Report jednou nastavíte a čísla se doplňují sama.",
    match: ["looker"],
  },
  {
    term: "Děkovná stránka",
    aka: ["thank you page"],
    cat: "mereni",
    def: "Stránka, která se zobrazí po objednávce nebo odeslání formuláře. Je to nejjednodušší způsob, jak spolehlivě změřit konverzi.",
    match: ["dekovn"],
  },
  {
    term: "Atribuce",
    cat: "mereni",
    def: "Pravidlo, kterému kanálu se připíše zásluha za nákup, když člověk přišel víckrát z různých míst (reklama, e-mail, vyhledávání).",
    match: ["atribuc"],
  },
  {
    term: "Power BI",
    cat: "mereni",
    def: "Nástroj Microsoftu na propojení dat z více zdrojů (e-shop, reklama, účetnictví) do jednoho interaktivního přehledu.",
    match: ["power bi", "datoveho modelu"],
  },

  // Reklama
  {
    term: "PPC",
    aka: ["pay per click", "placená reklama"],
    cat: "reklama",
    def: "Reklama, za kterou platíte až za proklik. Typicky Google Ads a Sklik ve vyhledávání.",
    match: ["ppc"],
  },
  {
    term: "Google Ads",
    cat: "reklama",
    def: "Reklamní systém Googlu: reklamy ve vyhledávání, nákupech, na YouTube a v obsahové síti.",
    match: ["google ads", "performance max", "merchant center"],
  },
  {
    term: "Sklik",
    cat: "reklama",
    def: "Reklamní systém Seznamu: reklamy ve vyhledávání na Seznamu, v obsahové síti a ve Zboží.cz.",
    match: ["sklik"],
  },
  {
    term: "Klíčové slovo",
    aka: ["keyword"],
    cat: "reklama",
    def: "Výraz, který lidé zadávají do vyhledávače. Podle klíčových slov se ukazují reklamy i výsledky SEO.",
    match: ["klicov"],
  },
  {
    term: "Long tail",
    aka: ["dlouhý chvost"],
    cat: "reklama",
    def: "Delší a konkrétnější dotazy (dámské trailové boty do bláta) s menší hledaností, ale vyšší ochotou nakoupit a nižší konkurencí.",
    match: ["long tail"],
  },
  {
    term: "CPC",
    aka: ["cena za proklik"],
    cat: "reklama",
    def: "Kolik v průměru zaplatíte za jeden proklik reklamy.",
    match: ["cpc"],
  },
  {
    term: "CTR",
    aka: ["míra prokliku"],
    cat: "reklama",
    def: "Kolik procent lidí, kteří reklamu viděli, na ni kliklo.",
    match: ["ctr"],
  },
  {
    term: "PNO",
    aka: ["podíl nákladů na obratu"],
    cat: "reklama",
    def: "Kolik procent z tržeb z reklamy padne na samotnou reklamu. Při PNO 20 % stojí reklama 20 Kč na každých 100 Kč obratu.",
    match: ["pno"],
  },
  {
    term: "Skóre kvality",
    aka: ["quality score"],
    cat: "reklama",
    def: "Hodnocení reklamy a cílové stránky v Google Ads. Čím vyšší, tím levnější proklik a lepší pozice.",
    match: ["skore kvality"],
  },
  {
    term: "Remarketing",
    aka: ["retargeting"],
    cat: "reklama",
    def: "Reklama pro lidi, kteří už u vás byli: navštívili web, dali zboží do košíku nebo sledují váš profil.",
    match: ["remarketing", "retargeting"],
  },
  {
    term: "Meta Business Suite",
    aka: ["Business Manager", "firemní portfolio"],
    cat: "reklama",
    def: "Správa firemní stránky na Facebooku, Instagramu, reklamních účtů a přístupů na jednom místě. Business Manager se nově jmenuje firemní portfolio.",
    match: ["business suite", "business manager", "firemni portfolio"],
  },
  {
    term: "Meta Pixel",
    aka: ["Facebook Pixel", "pixel"],
    cat: "reklama",
    def: "Kód od Mety na webu, který měří, co lidé z reklamy udělali, a sbírá publika pro remarketing.",
    match: ["pixel"],
    not: ["pixelech"],
  },
  {
    term: "Conversions API",
    aka: ["CAPI"],
    cat: "reklama",
    def: "Posílání konverzí do Mety přímo ze serveru, ne jen z prohlížeče. Měření je přesnější i tam, kde blokátory vypnou pixel.",
    match: ["conversions api"],
  },
  {
    term: "Vlastní a podobné publikum",
    aka: ["lookalike", "custom audience"],
    cat: "reklama",
    def: "Vlastní publikum jsou lidé, které už znáte (návštěvníci webu, zákazníci, fanoušci). Podobné publikum Meta dohledá mezi lidmi, kteří jim jsou nejpodobnější.",
    match: ["publika", "podobnych publik"],
  },
  {
    term: "Kreativa",
    cat: "reklama",
    def: "Vizuální část reklamy: obrázek, banner nebo video. Na sítích rozhoduje o úspěchu reklamy víc než cílení.",
    match: ["kreativ", "video vs. banner"],
  },
  {
    term: "Knihovna reklam",
    aka: ["Ad Library"],
    cat: "reklama",
    def: "Veřejný přehled všech reklam, které teď běží na Facebooku a Instagramu. Ideální na inspiraci a sledování konkurence.",
    match: ["knihovn"],
  },
  {
    term: "A/B test",
    cat: "reklama",
    def: "Porovnání dvou variant (reklamy, titulku, stránky), kdy každá dostane část lidí. Podle výsledků necháte tu lepší.",
    match: ["a/b test"],
  },
  {
    term: "Advantage+",
    cat: "reklama",
    def: "Automatické nastavení v reklamách Mety, kdy cílení, umístění nebo kreativy ladí umělá inteligence. Funguje nejlépe s dobrým měřením konverzí.",
    match: ["advantage"],
  },
  {
    term: "Affiliate marketing",
    aka: ["partnerský program", "provizní systém"],
    cat: "reklama",
    def: "Partneři (publisheři) doporučují vaše produkty a dostávají provizi z prodejů, které přivedou. Platíte jen za výsledek.",
    match: ["affiliate", "publisher", "provizn"],
  },
  {
    term: "XML feed",
    aka: ["produktový feed", "katalog produktů"],
    cat: "reklama",
    def: "Soubor se všemi produkty e-shopu (název, cena, obrázek, dostupnost), ze kterého čerpají srovnávače, Google Nákupy a dynamické reklamy.",
    match: ["xml feed", "katalog"],
    not: ["e-e-a-t"],
  },

  // SEO a viditelnost v AI
  {
    term: "SEO",
    aka: ["optimalizace pro vyhledávače"],
    cat: "seo",
    def: "Úpravy webu a obsahu, aby se zobrazoval vysoko v neplacených výsledcích vyhledávání.",
    match: ["seo"],
  },
  {
    term: "E-E-A-T",
    cat: "seo",
    def: "Zkušenost, odbornost, autorita a důvěryhodnost. Podle těchto znaků Google i AI posuzují, jestli obsahu věřit.",
    match: ["e-e-a-t"],
  },
  {
    term: "Indexace",
    cat: "seo",
    def: "Zařazení stránky do databáze vyhledávače. Co není zaindexované, ve výsledcích vyhledávání neuvidíte.",
    match: ["indexac", "noindex"],
  },
  {
    term: "Sitemap a robots.txt",
    aka: ["sitemap", "robots.txt", "llms.txt"],
    cat: "seo",
    def: "Soubory pro roboty vyhledávačů a AI: sitemap vyjmenuje stránky webu, robots.txt říká, kam roboti smějí, llms.txt shrnuje web pro jazykové modely.",
    match: ["sitemap", "robot"],
  },
  {
    term: "Kanonická URL",
    aka: ["canonical"],
    cat: "seo",
    def: "Označení hlavní verze stránky, když stejný obsah běží na víc adresách. Zabrání tomu, aby si stránky konkurovaly.",
    match: ["kanonick"],
  },
  {
    term: "Kanibalizace klíčových slov",
    cat: "seo",
    def: "Víc vašich stránek cílí na stejné klíčové slovo a ve vyhledávání si navzájem berou pozice.",
    match: ["kanibaliz"],
  },
  {
    term: "Meta titulek a popisek",
    aka: ["title", "meta description"],
    cat: "seo",
    def: "Nadpis a krátký text, které se o stránce ukážou ve výsledcích vyhledávání. Rozhodují, jestli na vás lidé kliknou.",
    match: ["titulek", "meta titulek"],
  },
  {
    term: "Alt text",
    aka: ["alternativní text"],
    cat: "seo",
    def: "Popis obrázku v kódu stránky. Čte ho vyhledávač i čtečka pro nevidomé.",
    match: ["alt text"],
  },
  {
    term: "Google Search Console",
    cat: "seo",
    def: "Bezplatný nástroj Googlu, který ukazuje, na jaké dotazy se web zobrazuje, kolik má prokliků a jaké má technické chyby.",
    match: ["search console"],
  },
  {
    term: "Status kódy",
    aka: ["404", "301"],
    cat: "seo",
    def: "Číselné odpovědi serveru: 200 stránka je v pořádku, 301 trvalé přesměrování, 404 stránka neexistuje, 500 chyba serveru.",
    match: ["status kod"],
  },
  {
    term: "Schema.org",
    aka: ["strukturovaná data"],
    cat: "seo",
    def: "Značky v kódu stránky, které strojům řeknou, co obsah znamená: firma, produkt, cena, recenze, otázka a odpověď. Pomáhají ve vyhledávání i v odpovědích AI.",
    match: ["schema.org"],
  },
  {
    term: "GEO",
    aka: ["AI viditelnost", "optimalizace pro AI"],
    cat: "seo",
    def: "Úpravy webu a digitální stopy, aby vás zmiňovaly odpovědi ChatGPT, Gemini nebo Perplexity, ne jen klasický Google.",
    match: ["v ai", "pro ai", "ai cte", "ai pozna"],
  },

  // Umělá inteligence
  {
    term: "Prompt",
    aka: ["zadání pro AI"],
    cat: "ai",
    def: "Zadání, které napíšete umělé inteligenci. Čím víc kontextu, cíle a příkladů, tím lepší výsledek.",
    match: ["prompt"],
  },
  {
    term: "Halucinace AI",
    aka: ["limity AI"],
    cat: "ai",
    def: "Když AI s jistotou tvrdí něco, co není pravda. Proto se výstupy AI vždy kontrolují.",
    match: ["limity ai", "limity umele"],
  },
  {
    term: "Human in the loop",
    aka: ["lidský dohled"],
    cat: "ai",
    def: "Zásada, že výsledek AI kontroluje a schvaluje člověk, než se použije. Vyžaduje ji i AI Act.",
    match: ["human in the loop", "lidsky dohled"],
  },
  {
    term: "AI Act",
    cat: "ai",
    def: "Nařízení Evropské unie o umělé inteligenci. Dělí AI systémy podle rizika a firmám ukládá povinnosti, mimo jiné naučit lidi s AI zacházet.",
    match: ["ai act"],
  },
  {
    term: "Skill",
    aka: ["dovednost AI"],
    cat: "ai",
    def: "Uložený postup a styl, který AI asistent (například Claude) použije pokaždé, když řešíte stejný typ úkolu.",
    match: ["skill"],
  },
  {
    term: "NotebookLM",
    cat: "ai",
    def: "Nástroj Googlu, který z vašich dokumentů vytvoří shrnutí, otázky nebo audio podcast a odpovídá jen z nich.",
    match: ["notebooklm"],
  },
  {
    term: "Vibe coding",
    aka: ["Lovable", "AI Studio"],
    cat: "ai",
    def: "Tvorba webu nebo aplikace zadáním v běžné řeči, kód napíše AI. Typické nástroje jsou Lovable a Google AI Studio.",
    match: ["lovable", "ai studio"],
  },

  // Grafika a data
  {
    term: "Photopea",
    cat: "grafika",
    def: "Bezplatný grafický editor v prohlížeči, který se ovládá skoro stejně jako Photoshop.",
    match: ["photopea"],
  },
  {
    term: "Vrstva",
    cat: "grafika",
    def: "Samostatná část obrázku (fotka, text, tvar), kterou upravujete, aniž byste zničili zbytek.",
    match: ["vrstv"],
    not: ["datova vrstva"],
  },
  {
    term: "Maska",
    cat: "grafika",
    def: "Způsob, jak část vrstvy skrýt bez mazání: černá skrývá, bílá ukazuje. Úpravu jde kdykoli vrátit.",
    match: ["mask"],
  },
  {
    term: "Fotobanka",
    cat: "grafika",
    def: "Web s fotkami a grafikou k použití, zdarma (Pexels, Unsplash) nebo za poplatek. Vždy si ověřte licenci.",
    match: ["fotobank"],
  },
  {
    term: "Datová velikost obrázku",
    aka: ["komprese", "rozlišení"],
    cat: "grafika",
    def: "Kolik obrázek váží v kB. Pro web se drží co nejníž (obvykle do 150 kB), jinak se stránka načítá pomalu.",
    match: ["datova velikost", "rozliseni", "export do jpg"],
  },
  {
    term: "Heatmapa",
    cat: "grafika",
    def: "Barevná mapa, která ukazuje, kde je čeho nejvíc: v datech hodnot, na webu kliknutí a pohybu myši.",
    match: ["heatmap"],
  },

  // Právo a značka
  {
    term: "Ochranná známka",
    aka: ["®", "registrovaná známka"],
    cat: "pravo",
    def: "Zapsané označení (název, logo, i zvuk), které chrání vaši značku pro vybrané výrobky a služby. V Česku se zapisuje u Úřadu průmyslového vlastnictví.",
    match: ["ochranna znamk", "ochrannou znamk", "znamk"],
  },
  {
    term: "Niceské třídy",
    aka: ["třídy výrobků a služeb"],
    cat: "pravo",
    def: "Mezinárodní třídění výrobků a služeb, podle kterého určujete, pro co má ochranná známka platit. Každá třída navíc se platí.",
    match: ["tridy"],
  },
  {
    term: "Duševní vlastnictví",
    cat: "pravo",
    def: "Práva k výsledkům tvůrčí práce: autorská práva, ochranné známky, patenty a průmyslové vzory.",
    match: ["dusevni vlastnictvi", "autorska prava"],
  },
  {
    term: "GDPR",
    cat: "pravo",
    def: "Evropské nařízení o ochraně osobních údajů. Určuje, co smíte o zákaznících sbírat, jak dlouho a s jakým souhlasem.",
    match: ["gdpr", "co do ai nikdy nevkladat"],
  },
];

/** Adresa hesla na stránce (kotva). */
export const glossarySlug = (term: string) =>
  term
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const foldText = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

/** Patří lekce s tímto názvem k heslu? */
export function termMatches(t: GlossaryTerm, title: string): boolean {
  const f = foldText(title);
  if (t.not?.some((n) => f.includes(n))) return false;
  return t.match.some((m) => {
    let i = f.indexOf(m);
    while (i !== -1) {
      if (i === 0 || !/[a-z0-9]/.test(f[i - 1])) return true;
      i = f.indexOf(m, i + 1);
    }
    return false;
  });
}
