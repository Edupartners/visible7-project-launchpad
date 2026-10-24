import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";

const IMG = "/funkce/";

/** Podstránka funkce: test (rentgen) nápadu zdarma. */
const IdeaTestPage = () => {
  const d: FeaturePageData = {
    slug: "test-napadu",
    metaTitle: "Test podnikatelského nápadu zdarma do 5 minut | VISIBLE7 MICEK",
    metaDescription:
      "Otestujte podnikatelský nápad zdarma. Za 5 minut uvidíte verdikt, typ byznysu, potřebný kapitál, bod zvratu, tři největší rizika a jak je ověřit do 14 dnů.",
    eyebrow: "Test nápadu zdarma",
    title: (
      <>
        Zjistěte, jestli váš nápad{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          stojí za to
        </span>
        .
      </>
    ),
    lead: "Čtyři krátké otázky a za 5 minut víte, jestli nápad dává smysl, kolik bude stát, kdy vás může uživit a co ověřit jako první. Dřív, než do něj dáte peníze.",
    cta: "Otestovat nápad zdarma",
    note: "Zdarma, bez platební karty. Pro registraci stačí e-mail.",
    heroImage: `${IMG}test-napadu-vysledek.webp`,
    heroAlt: "Výsledek testu nápadu: verdikt, typ byznysu, potřebný kapitál, bod zvratu a tržby",
    heroStats: [
      ["Verdikt", "Dává smysl"],
      ["Bod zvratu", "8. měsíc"],
    ],
    problemTitle: "Máte nápad. Jak poznáte, jestli za něco stojí?",
    problems: [
      {
        title: "Zeptat se známých",
        text: "Řeknou, že je to skvělé. Nechtějí vám kazit radost, a platit pak stejně nebudou.",
      },
      {
        title: "Zeptat se ChatGPT",
        text: "Odpoví povzbudivě a obecně. Neřekne, kolik peněz potřebujete ani kdy se vám vrátí.",
      },
      {
        title: "Prostě to zkusit",
        text: "Web, zboží, reklama. Že o to nikdo nestojí, zjistíte až po utracení úspor.",
      },
    ],
    problemNote: "Test nápadu vám řekne pravdu dřív, než utratíte první korunu.",
    rowsTitle: "Co se za 5 minut dozvíte",
    rows: [
      {
        eyebrow: "Verdikt a čísla",
        title: "Zelená, oranžová, nebo červená",
        text: "Dostanete jasný verdikt s vysvětlením: dává smysl začít, nejdřív ověřit, nebo v této podobě ne. K tomu typ byznysu, potřebný kapitál, bod zvratu a tržby, které potřebujete k cíli.",
        image: `${IMG}test-napadu-vysledek.webp`,
        alt: "Výsledek testu: zelený verdikt Dává smysl, typ byznysu e-shop, potřebný kapitál a bod zvratu",
        points: ["Podle hodin týdně a rozpočtu, který zadáte", "Žádné obecné rady, čísla pro váš nápad"],
      },
      {
        eyebrow: "Mapa cesty A → D",
        title: "Kdy přijdou první zákazníci a kdy vás to uživí",
        text: "Uvidíte cestu od dneška k prvním zákazníkům, k bodu, kdy vás projekt živí, a k bodu, kdy roste i bez vás. V realistickém i opatrném scénáři.",
        image: `${IMG}test-napadu-cesta.webp`,
        alt: "Mapa cesty z bodu A do bodu D: dnes, první zákazníci, živí mě to, roste to beze mě",
      },
      {
        eyebrow: "Rizika a první kroky",
        title: "Tři největší rizika a jak je ověřit do 14 dnů",
        text: "Ke každému riziku dostanete konkrétní test, který zvládnete do dvou týdnů a skoro bez peněz. A seznam toho, na čem můžete stavět.",
        image: `${IMG}test-napadu-rizika.webp`,
        alt: "Tři největší rizika nápadu s testem na 14 dní a silné stránky",
      },
    ],
    quote: {
      text: "Nejde o to mít peníze na velkou věc. Začněte s málem, škálujte až potom.",
      author: "Michal Míček",
      role: "autor metodiky VISIBLE7 MICEK®",
    },
    positioningTitle: "Test je jen začátek",
    positioningText:
      "Výsledek testu se rovnou propíše do bran 1 a 2, které jsou také zdarma. Nemusíte nic vyplňovat znovu, jen upřesníte, co AI navrhla.",
    helpTitle: "Co následuje po testu",
    help: [
      { title: "Brány 1–2 zdarma", text: "Najdete místo na trhu a sestavíte byznys model. S videi a AI pomocníkem." },
      {
        title: "Úvodní konzultace",
        text: "20 minut online s expertem zdarma. Projdeme výsledek a doporučíme další krok.",
      },
      { title: "Pracovní listy", text: "Karta projektu, Lean Canvas a další listy ke stažení a vytištění zdarma." },
    ],
    finalTitle: "Pět minut teď ušetří měsíce slepých pokusů.",
    faq: [
      [
        "Je test opravdu zdarma?",
        "Ano. Stačí registrace e-mailem, platební kartu nezadáváte. Zdarma jsou i brány 1 a 2.",
      ],
      [
        "Jak přesný je výsledek?",
        "Je to první odhad z vašich odpovědí a obvyklých čísel v oboru, ne záruka. Ukáže, kde je nápad silný a co ověřit jako první. Se skutečnými čísly v bráně 3 se zpřesní.",
      ],
      [
        "Na co se test ptá?",
        "Na nápad, pro koho je a co mu vyřeší, kolik hodin týdně a jaký rozpočet do něj dáte a co umíte. Když nevíte, kdo je zákazník, nechte pole prázdné a AI navrhne.",
      ],
      [
        "Co když už podnikám?",
        "Vyberte „Už podnikám“. Test se zeptá na váš obor a zákazníky a ukáže, kde vám online přinese nové zákazníky a peníze.",
      ],
      [
        "Co když ještě nemám nápad?",
        "Začněte bránou 1. Strategie modrého oceánu je nástroj na to, jak najít místo, kde nebudete jen další z mnoha.",
      ],
      [
        "Jak AI pracuje s mými daty?",
        "AI vidí jen to, co do projektu napíšete, a jen když ji sami zavoláte. Data jsou uložena v EU.",
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default IdeaTestPage;
