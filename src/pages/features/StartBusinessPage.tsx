import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { kc, useShop } from "@/lib/shop";

const IMG = "/funkce/";

/** Podstránka pro cílovku: začínám podnikat (od nápadu po prvního zákazníka). */
const StartBusinessPage = () => {
  const shop = useShop();
  const price = kc(shop.price);

  const d: FeaturePageData = {
    slug: "zacit-podnikat",
    metaTitle: "Jak začít podnikat krok za krokem, s AI a poradci | VISIBLE7 MICEK",
    metaDescription:
      "Od nápadu po prvního zákazníka v sedmi branách. Test nápadu zdarma, podnikatelský a finanční plán, živnost, web a marketing. S videi, AI pomocníkem a poradci z praxe.",
    eyebrow: "Pro začínající podnikatele",
    title: (
      <>
        Začněte podnikat{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          s plánem, ne naslepo
        </span>
        .
      </>
    ),
    lead: "Od nápadu po prvního platícího zákazníka v sedmi branách. Víte, co udělat dnes, kolik to bude stát a kdy vás podnikání může uživit. S videi, AI pomocníkem a poradci z praxe.",
    cta: "Otestovat nápad zdarma",
    note: "Test nápadu a brány 1–2 zdarma, bez platební karty. Pro registraci stačí e-mail.",
    heroImage: `${IMG}test-napadu-cesta.webp`,
    heroAlt: "Mapa cesty od dneška přes první zákazníky k bodu, kdy vás projekt uživí",
    heroStats: [
      ["Cesta", "7 bran"],
      ["Start", "zdarma"],
    ],
    problemTitle: "Proč většina lidí s podnikáním nikdy nezačne?",
    problems: [
      {
        title: "Nevědí, kde začít",
        text: "Živnost, web, reklama, daně. Všechno najednou působí jako hora, tak se nezačne vůbec.",
      },
      {
        title: "Bojí se o úspory",
        text: "Nevědí, kolik budou potřebovat a jestli se jim peníze vrátí. Tak raději čekají.",
      },
      {
        title: "Jsou na to sami",
        text: "Rady z internetu si odporují a známí podnikatelé nemají čas. Chybí někdo, kdo se podívá na jejich projekt.",
      },
    ],
    problemNote: "VISIBLE7 rozdělí cestu na malé kroky a ke každému dá návod a podporu.",
    rowsTitle: "Od nápadu k prvnímu zákazníkovi, krok za krokem",
    rows: [
      {
        eyebrow: "Do 5 minut · zdarma",
        title: "Nejdřív zjistěte, jestli nápad dává smysl",
        text: "Čtyři krátké otázky a máte verdikt, typ byznysu, potřebný kapitál, bod zvratu a tři největší rizika s testem na 14 dní. Dřív, než utratíte první korunu.",
        image: `${IMG}test-napadu-vysledek.webp`,
        alt: "Výsledek testu nápadu: verdikt, typ byznysu, potřebný kapitál a bod zvratu",
      },
      {
        eyebrow: "Brány 1 a 2 · zdarma",
        title: "Najděte místo na trhu a sestavte byznys model",
        text: "Strategií modrého oceánu najdete, čím budete jiní než konkurence. Lean Canvas pak shrne celý byznys na jednu stránku. AI navrhne obsah, vy ho upravíte.",
        image: `${IMG}plan-canvas.webp`,
        alt: "Lean Canvas v aplikaci: segment zákazníků, problém, unikátní hodnota a řešení",
      },
      {
        eyebrow: "Brána 3 · Strategie a čísla",
        title: "Spočítejte, kolik potřebujete a kdy vás to uživí",
        text: "Finanční plán na 24 měsíců bez Excelu: potřebný kapitál, bod zvratu, návratnost a daně podle formy podnikání. Víte, kolik si nechat v rezervě a kdy můžete dát výpověď.",
        image: `${IMG}financni-plan-graf.webp`,
        alt: "Graf peněz v projektu s vyznačeným potřebným kapitálem a bodem zvratu",
      },
      {
        eyebrow: "Brány 4 až 6",
        title: "Živnost, web, marketing a spuštění",
        text: "Plán tvorby podle typu byznysu, tahák k ohlášení živnosti, web projektu a marketingové kanály s testovacím rozpočtem. Pak spuštění a sledování prvních čísel.",
        image: `${IMG}kanaly-doporucene.webp`,
        alt: "Doporučené marketingové kanály s testovacím rozpočtem a dobou nastavení",
        points: [
          "Tahák k ohlášení živnosti a ověření IČO",
          "Obchodní podmínky a GDPR s poradcem",
          "Osvědčení za každou dokončenou bránu",
        ],
      },
    ],
    quote: {
      text: "Lidé k nám přicházejí s představou, že podnikání není pro ně. Odcházejí s tím, že vědí, jak začít, a zvládnou to sami.",
      author: "Michal Míček",
      role: "autor metodiky VISIBLE7 MICEK®",
    },
    positioningTitle: "Jedna cesta místo deseti nástrojů",
    positioningText:
      "Každá brána navazuje na předchozí. Co vyplníte v testu nápadu, převezme byznys model, z něj finanční plán a z něj marketing. Nic nevyplňujete dvakrát.",
    helpTitle: "Na začátku nejste sami",
    help: [
      {
        title: "Úvodní konzultace zdarma",
        text: "20 minut online s expertem. Projdeme váš nápad a doporučíme první krok.",
      },
      {
        title: "Poradci z praxe",
        text: "Na finance, marketing, právo i e-shopy. Online konzultace přímo k vašemu projektu.",
      },
      {
        title: "Živé semináře",
        text: "Každých 14 dní online s lektory Edu Partners, s prostorem na vaše otázky.",
      },
    ],
    finalTitle: "Začněte malým krokem. Prvních pět minut je zdarma.",
    faq: [
      [
        "Potřebuji mít hotový nápad?",
        "Ne. Když nápad ještě nemáte, začněte bránou 1. Strategie modrého oceánu pomáhá najít místo, kde nebudete jen další z mnoha.",
      ],
      [
        "Kolik času tomu musím dát?",
        "Záleží na vás. Test nápadu trvá do 5 minut, jedna brána obvykle několik večerů. Můžete začít při zaměstnání.",
      ],
      [
        "Musím hned založit živnost?",
        "Ne. Živnost řešíte až ve chvíli, kdy víte, že nápad dává smysl a čísla vycházejí. V aplikaci k tomu máte tahák k formuláři.",
      ],
      [
        "Kolik peněz potřebuji na začátek?",
        "To spočítá právě test nápadu a finanční plán. Metodika vede k tomu začít s málem a škálovat až potom.",
      ],
      [
        "Kolik to stojí?",
        `Test nápadu a brány 1 a 2 jsou zdarma, bez platební karty. Celá cesta je součástí členství za ${price}, platíte jednorázově, nic se samo neobnovuje.`,
      ],
      [
        "Jak AI pracuje s mými daty?",
        "AI se spustí jen na vaše kliknutí a dostane jen údaje z projektu, bez jména a e-mailu. Neučí se na nich. Databáze je v EU, AI text zpracuje v USA se standardními smluvními doložkami. Podrobně na stránce Váš nápad a data.",
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default StartBusinessPage;
