import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { kc, useShop } from "@/lib/shop";

const IMG = "/funkce/financni-plan-";

/** Podstránka funkce: finanční plán a bod zvratu (brána 3 Strategie a čísla). */
const FinancialPlanPage = () => {
  const shop = useShop();
  const price = kc(shop.price);

  const d: FeaturePageData = {
    slug: "financni-plan",
    metaTitle: "Finanční plán podnikání a bod zvratu s AI | VISIBLE7 MICEK",
    metaDescription:
      "Finanční plán na 24 měsíců bez Excelu. AI navrhne ceny, marže a náklady pro váš obor, aplikace spočítá potřebný kapitál, bod zvratu, návratnost a daně.",
    eyebrow: "Finanční plán a bod zvratu",
    title: (
      <>
        Spočítejte, kolik potřebujete a{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          kdy vás podnikání uživí
        </span>
        .
      </>
    ),
    lead: "Finanční plán na 24 měsíců hotový za odpoledne. AI navrhne ceny, marže a náklady obvyklé ve vašem oboru a vysvětlí proč. Vy je jen potvrdíte nebo přepíšete.",
    cta: "Začít plán zdarma",
    note: `Test nápadu a brány 1–2 zdarma. Finanční plán je brána 3, součást členství za ${price}.`,
    heroImage: `${IMG}graf.webp`,
    heroAlt: "Graf peněz v projektu: kolik kapitálu potřebujete a kdy se vám peníze vrátí",
    heroStats: [
      ["Bod zvratu", "8. měsíc"],
      ["Potřebný kapitál", "165 805 Kč"],
    ],
    problemTitle: "Finanční plán si dnes lidé dělají jedním ze tří způsobů. Ani jeden nefunguje.",
    problems: [
      {
        title: "Tabulka v Excelu",
        text: "Hodiny se vzorci a nikdo vám neřekne, jestli jsou vaše čísla realistická. Jedna chyba v buňce a celý plán lže.",
      },
      {
        title: "Zeptat se ChatGPT",
        text: "Odpoví rychle a sebejistě, ale čísla si dopočítá odhadem. Peníze měsíc po měsíci ani bod zvratu za vás nespočítá.",
      },
      {
        title: "Zaplatit poradce",
        text: "Tisíce korun za plán, který zastará při první změně ceny. A vy pořád nevíte, jak k číslům došel.",
      },
    ],
    problemNote: "Ve VISIBLE7 počítá aplikace, AI radí a vy rozhodujete.",
    rowsTitle: "Finanční plán, kterému můžete věřit. Bez Excelu a bez vzorců.",
    rows: [
      {
        eyebrow: "Příjmy s AI",
        title: "AI navrhne čísla. Vy rozhodnete.",
        text: "Zadáte cenu, počet objednávek a marži. AI ke každému poli doporučí hodnotu obvyklou ve vašem oboru a vysvětlí, odkud ji má. Doporučení převezmete jedním kliknutím, nebo ho přepíšete.",
        image: `${IMG}prijmy.webp`,
        alt: "Příjmy v aplikaci: průměrná objednávka, marže a opakované nákupy s doporučením AI",
        points: ["E-shop, předplatné, kurz, služby i tržiště", "U každého pole vysvětlivka, co do něj patří"],
      },
      {
        eyebrow: "Náklady",
        title: "Nezapomenete na nic, co stojí peníze",
        text: "Náklady jsou rozdělené na jednorázové před spuštěním, měsíční provoz a marketing. AI odhadne orientační částky pro začínající projekt v Česku a připomene položky, na které se nejčastěji zapomíná.",
        image: `${IMG}naklady.webp`,
        alt: "Náklady v aplikaci: jednorázové náklady před spuštěním a měsíční provoz",
        points: [
          "Pojištění OSVČ, účetní, platební brána i vaše vlastní odměna",
          "Položky převezme z vašeho Lean Canvasu",
        ],
      },
      {
        eyebrow: "Výsledek za 2 roky",
        title: "Kolik potřebujete a kdy se vám peníze vrátí",
        text: "Aplikace spočítá obrat, zisk před daní i po ní, potřebný kapitál, bod zvratu a návratnost. Graf ukáže, jak hluboko klesnou peníze v projektu, než se začnou vracet.",
        image: `${IMG}graf.webp`,
        alt: "Graf peněz v projektu s vyznačeným potřebným kapitálem",
        points: ["Daně podle formy: OSVČ, paušální daň nebo s.r.o.", "Stažení do Excelu"],
      },
      {
        eyebrow: "Scénáře",
        title: "Co když se bude prodávat hůř?",
        text: "Jedním kliknutím přepnete mezi opatrným, realistickým a optimistickým scénářem. Uvidíte vedle sebe zisk, potřebný kapitál a bod zvratu, a víte, jakou rezervu si nechat.",
        image: `${IMG}scenare.webp`,
        alt: "Srovnání opatrného, realistického a optimistického scénáře",
      },
      {
        eyebrow: "Marketing a zákazník",
        title: "Víte, kolik smíte dát do reklamy",
        text: "Z vaší marže spočítáme maximální podíl marketingu na obratu (PNO) a porovnáme hodnotu zákazníka s cenou za jeho získání. Na reklamu pak nedáte víc, než projekt unese.",
        image: `${IMG}pno.webp`,
        alt: "PNO a poměr hodnoty zákazníka k ceně za jeho získání",
      },
      {
        eyebrow: "AI mentor",
        title: "Druhý pohled na vaše čísla",
        text: "AI mentor projde všechny tři scénáře a řekne, kde je plán citlivý, co si ověřit a co udělat jako první. Čísla nevymýšlí, pracuje jen s tím, co aplikace spočítala.",
        image: `${IMG}ai-mentor.webp`,
        alt: "Komentář AI mentora: kde je plán citlivý, co si ověřit a co udělat teď",
      },
      {
        eyebrow: "Mapa cesty A → D",
        title: "Zjistěte, kdy můžete dát výpověď",
        text: "Z vašich čísel aplikace spočítá, kdy přijdou první zákazníci, kdy vás projekt uživí a kdy unese prvního spolupracovníka. S každou úpravou plánu se mapa zpřesní.",
        image: "/landing/ukazka-mapa-cesty.webp",
        alt: "Mapa cesty: dnes, první zákazníci, živí mě to, roste to beze mě",
      },
    ],
    quote: {
      text: "Nejde o to mít peníze na velkou věc. Začněte s málem, škálujte až potom.",
      author: "Michal Míček",
      role: "autor metodiky VISIBLE7 MICEK®",
    },
    positioningTitle: "Víc než kalkulačka",
    positioningText:
      "Finanční plán je brána 3 ze 7. Navazuje na váš nápad a byznys model a jeho čísla použijete dál: v marketingu, na webu projektu i v pitchi pro banku nebo investora.",
    helpTitle: "Když si nevíte rady, nejste na to sami",
    help: [
      { title: "Video ke každému kroku", text: "Krátká videa a vysvětlivka u každého pole. Víte, co vyplnit a proč." },
      {
        title: "Seniorní poradce",
        text: "Čísla s vámi projde poradce z praxe, třeba Jakub Rak, MBA, specialista na byznys case a finance.",
      },
      {
        title: "Živé semináře",
        text: "Každých 14 dní online s lektory Edu Partners. Na otázky k vašemu plánu je čas.",
      },
    ],
    finalTitle: "Vězte, kolik potřebujete, dřív než utratíte první korunu.",
    faq: [
      [
        "Potřebuji umět účetnictví nebo Excel?",
        "Ne. Vyplníte cenu, počet zákazníků a náklady, aplikace spočítá zbytek. U každého pole najdete vysvětlivku.",
      ],
      [
        "Odkud AI bere čísla?",
        "Navrhuje hodnoty obvyklé pro váš typ byznysu v Česku a u každé napíše, proč. Je to odhad, ne záruka. Vždy ho můžete přepsat podle vlastních zjištění.",
      ],
      [
        "Počítá plán s daněmi?",
        "Ano. Vyberete formu podnikání: OSVČ v klasickém režimu (daň 15 % ze zisku), OSVČ s paušální daní, nebo s.r.o. (daň 21 % ze zisku firmy). Aplikace vám i poradí, jestli se paušální daň vyplatí.",
      ],
      [
        "Co znamená bod zvratu, návratnost a potřebný kapitál?",
        "Bod zvratu je první měsíc v zisku. Návratnost je měsíc, kdy se vám vrátí všechny vložené peníze. Potřebný kapitál je nejhlubší propad peněz v projektu, tedy kolik musíte mít připraveno.",
      ],
      [
        "Pro jaký typ podnikání to funguje?",
        "Pro e-shop, předplatné a online kurzy, služby a zakázky, obsahové weby a affiliate i pro tržiště. Výpočet se přizpůsobí typu byznysu, který zvolíte v bráně 2.",
      ],
      ["Mohu plán stáhnout do Excelu?", "Ano, v členství si plán stáhnete do Excelu i s výpočty po měsících."],
      [
        "Hodí se plán pro banku nebo investora?",
        "Plán ukáže čísla, na která se banka ptá: potřebný kapitál, návratnost a cash flow. Po bráně 3 z něj připravíte i pitch na jednu stranu A4. Schválení úvěru ale zaručit nemůžeme.",
      ],
      [
        "Kolik to stojí?",
        `Test nápadu a brány 1 a 2 jsou zdarma, bez platební karty. Finanční plán je součástí členství za ${price}, platíte jednorázově, nic se samo neobnovuje.`,
      ],
    ],
  };

  return <FeaturePage d={d} />;
};

export default FinancialPlanPage;
