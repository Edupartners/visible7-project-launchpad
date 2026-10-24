import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";

const IMG = "/funkce/";

/** Podstránka funkce: podnikatelský plán (brána 1 modrý oceán a brána 2 Lean Canvas). */
const BusinessPlanPage = () => {
  const d: FeaturePageData = {
    slug: "podnikatelsky-plan",
    metaTitle: "Podnikatelský plán a Lean Canvas s AI zdarma | VISIBLE7 MICEK",
    metaDescription:
      "Podnikatelský plán krok za krokem: strategie modrého oceánu, ERRC matice, hodnotová křivka, USP a Lean Canvas. AI navrhne obsah, vy ho upravíte. Brány 1 a 2 zdarma.",
    eyebrow: "Podnikatelský plán",
    title: (
      <>
        Najděte místo na trhu a{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          postavte byznys model
        </span>
        .
      </>
    ),
    lead: "Strategie modrého oceánu a Lean Canvas krok za krokem, na vašem vlastním nápadu. AI navrhne obsah z toho, co už víte, vy ho jen upravíte.",
    cta: "Začít plán zdarma",
    note: "Brány 1 a 2 jsou zdarma, bez platební karty. Pro registraci stačí e-mail.",
    heroImage: `${IMG}plan-krivka.webp`,
    heroAlt: "Hodnotová křivka: váš projekt proti levné a prémiové konkurenci",
    heroStats: [
      ["Lean Canvas", "8 z 8 polí"],
      ["Brány 1 a 2", "zdarma"],
    ],
    problemTitle: "Podnikatelský plán, který nikdo nečte, vám nepomůže.",
    problems: [
      {
        title: "Šablona na 30 stran",
        text: "Týdny psaní o trhu a konkurenci. Výsledek skončí v šuplíku a o nápadu nic neřekne.",
      },
      {
        title: "Plán od AI za minutu",
        text: "Vypadá profesionálně, ale je obecný. Nevychází z vašeho zákazníka ani z vaší konkurence.",
      },
      {
        title: "Plán v hlavě",
        text: "Všechno je jasné, dokud to nemusíte vysvětlit bance, partnerovi nebo prvnímu zákazníkovi.",
      },
    ],
    problemNote: "Ve VISIBLE7 je plán na jedné stránce a každé pole má smysl.",
    rowsTitle: "Od nápadu k byznys modelu ve dvou branách",
    rows: [
      {
        eyebrow: "Brána 1 · ERRC matice",
        title: "Srovnejte se s levnou a prémiovou konkurencí",
        text: "Podle strategie modrého oceánu (Kim a Mauborgne) určíte, co oproti konkurenci vynecháte, snížíte, zvýšíte a co vytvoříte nového. Každou položku ohodnotíte u sebe i u obou konkurentů.",
        image: `${IMG}plan-errc.webp`,
        alt: "ERRC matice: eliminovat, snížit, zvýšit a vytvořit, s hodnocením levné a prémiové konkurence",
        points: ["Návod přímo u matice, jak ji vyplnit", "Příklad z praxe ke každému kroku"],
      },
      {
        eyebrow: "Brána 1 · Hodnotová křivka",
        title: "Uvidíte, kde jste jiní než ostatní",
        text: "Křivka se kreslí sama z vaší matice. Modrý oceán je tam, kde vaše čára vede jinudy než obě konkurence. Z ní pak sestavíte svou USP, jednu větu, proč koupit právě u vás.",
        image: `${IMG}plan-krivka.webp`,
        alt: "Hodnotová křivka projektu proti levné a prémiové konkurenci",
      },
      {
        eyebrow: "Brána 2 · Typ byznysu",
        title: "E-shop, kurz, předplatné, nebo komunita?",
        text: "Vyberete jeden z 13 typů online byznysu. Podle něj vám aplikace v dalších branách připraví postup tvorby, výpočty i marketingové kanály.",
        image: `${IMG}plan-typ.webp`,
        alt: "Výběr typu online byznysu: e-shop, konverzní web, online kurz, členská sekce, marketplace a další",
      },
      {
        eyebrow: "Brána 2 · Lean Canvas",
        title: "Celý byznys na jedné stránce",
        text: "Osm polí Lean Canvasu (Ash Maurya): zákazník, problém, hodnota, řešení, alternativy, kanály, náklady a příjmy. AI pomocník je navrhne z brány 1, vy je upravíte. AI mentor pak řekne, co je silné a co chybí.",
        image: `${IMG}plan-canvas.webp`,
        alt: "Lean Canvas v aplikaci: segment zákazníků, problém, unikátní hodnota a řešení",
        points: ["Náhled celého canvasu na jedné stránce", "Náklady a příjmy převezme finanční plán v bráně 3"],
      },
    ],
    quote: {
      text: "Lidé k nám přicházejí s představou, že podnikání není pro ně. Odcházejí s tím, že vědí, jak začít, a zvládnou to sami.",
      author: "Michal Míček",
      role: "autor metodiky VISIBLE7 MICEK®",
    },
    positioningTitle: "Plán, který pokračuje",
    positioningText:
      "Brány 1 a 2 jsou základ, na kterém stojí všechno další: finanční plán, web, marketing i spuštění. Nic nevyplňujete dvakrát.",
    helpTitle: "Když si nevíte rady, nejste na to sami",
    help: [
      { title: "Video ke každému kroku", text: "Krátká videa k modrému oceánu i Lean Canvasu a příklady z praxe." },
      {
        title: "Seniorní poradce",
        text: "Modrý oceán nebo byznys model s vámi projde poradce z praxe na online konzultaci.",
      },
      { title: "Pracovní listy", text: "Lean Canvas a další listy zdarma ke stažení, když chcete pracovat na papíře." },
    ],
    finalTitle: "Začněte plánem na jedné stránce, ne na třiceti.",
    faq: [
      ["Je to opravdu zdarma?", "Ano. Brány 1 a 2 jsou zdarma, bez platební karty. Stačí registrace e-mailem."],
      [
        "Co je strategie modrého oceánu?",
        "Metoda W. Chan Kima a Renée Mauborgne. Místo boje s konkurencí cenou hledáte místo, kde dáte zákazníkovi víc hodnoty jinak než ostatní.",
      ],
      [
        "Co je Lean Canvas?",
        "Byznys model na jedné stránce podle Ashe Mauryi. Osm polí, která musíte znát, než do nápadu dáte peníze.",
      ],
      [
        "Musím mít hotový nápad?",
        "Ne. Brána 1 pomáhá nápad najít a zpřesnit. Pokud už máte výsledek testu nápadu, aplikace pole předvyplní.",
      ],
      [
        "Hodí se to pro banku nebo investora?",
        "Lean Canvas a USP jsou základ, na který se banka i investor ptají. Kompletní plán s čísly a pitchem na A4 vznikne v bráně 3.",
      ],
      [
        "Jak AI pracuje s mými daty?",
        "AI vidí jen to, co do projektu napíšete, a jen když ji sami zavoláte. Data jsou uložena v EU.",
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default BusinessPlanPage;
