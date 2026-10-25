import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { kc, useShop } from "@/lib/shop";

const IMG = "/funkce/";

/** Podstránka pro cílovku: už podnikám offline a chci zákazníky z online. */
const ExistingBusinessPage = () => {
  const shop = useShop();
  const price = kc(shop.price);

  const d: FeaturePageData = {
    slug: "uz-podnikam",
    metaTitle: "Už podnikáte? Zjistěte, kde vám online přinese zákazníky | VISIBLE7 MICEK",
    metaDescription:
      "Rentgen podniku zdarma: za 5 minut uvidíte, co vás nejvíc brzdí, tři příležitosti, kde vám online vydělá, odhad tržeb a první krok na tento týden.",
    eyebrow: "Pro ty, kdo už podnikají",
    title: (
      <>
        Podnikáte offline? Zjistěte, kde vám{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          online přinese zákazníky
        </span>
        .
      </>
    ),
    lead: "Salon, řemeslo, obchod nebo služby. Rentgen podniku za 5 minut ukáže, co vás dnes nejvíc brzdí a tři příležitosti, kde vám online vydělá. S odhadem tržeb a prvním krokem na tento týden.",
    cta: "Udělat rentgen podniku zdarma",
    note: "Zdarma, bez platební karty. V testu zvolte „Už podnikám“.",
    heroImage: `${IMG}uz-podnikam-rentgen.webp`,
    heroAlt: "Rentgen podniku: co vás nejvíc brzdí a tři příležitosti, kde vám online vydělá",
    heroStats: [
      ["Příležitosti", "3"],
      ["Rentgen", "do 5 minut"],
    ],
    problemTitle: "Podnikáte roky a online pořád odkládáte. Proč?",
    problems: [
      {
        title: "Není na to čas",
        text: "Provoz zabere celý den. Na web, reklamu a sociální sítě zbývají jen večery, a to jen někdy.",
      },
      {
        title: "Nevíte, co se vyplatí",
        text: "E-shop, Instagram, reklama na Googlu? Každý radí něco jiného a nikdo neřekne, kolik to přinese.",
      },
      {
        title: "Špatná zkušenost",
        text: "Web od známého nebo agentura, která utratila rozpočet. Výsledek nikdo neměřil.",
      },
    ],
    problemNote: "Rentgen podniku začne od toho, co už máte: zákazníky, obor a zkušenosti.",
    rowsTitle: "Online jako další zdroj zákazníků, ne jako další starost",
    rows: [
      {
        eyebrow: "Rentgen podniku · zdarma",
        title: "Co vás dnes nejvíc brzdí",
        text: "Odpovíte na pár otázek o oboru, zákaznících a čase. Rentgen pojmenuje hlavní úzké místo vašeho podnikání, tedy to, co vám dnes bere nejvíc peněz nebo zákazníků.",
        image: `${IMG}uz-podnikam-rentgen.webp`,
        alt: "Rentgen podniku: název podniku a hlavní úzké místo",
      },
      {
        eyebrow: "3 příležitosti",
        title: "Kde vám online vydělá a kolik",
        text: "Tři konkrétní příležitosti pro váš podnik s odhadem tržeb navíc za měsíc, výpočtem a náročností. Ke každé první krok, který zvládnete tento týden.",
        image: `${IMG}uz-podnikam-prilezitosti.webp`,
        alt: "Tři příležitosti s odhadem měsíčních tržeb, náročností a prvním krokem",
        points: ["Odhad z vašich odpovědí a čísel v oboru, ne záruka", "Splněné kroky si odškrtáte"],
      },
      {
        eyebrow: "Marketingové kanály",
        title: "Firemní profil na Googlu, reklama, e-mail",
        text: "Pro místní podnikání aplikace doporučí kanály, které přivedou zákazníky z okolí. Ke každému postup krok za krokem a testovací rozpočet, aby se reklama vyplatila.",
        image: `${IMG}kanaly-doporucene.webp`,
        alt: "Doporučené marketingové kanály s testovacím rozpočtem a dobou nastavení",
      },
      {
        eyebrow: "Finanční plán",
        title: "Spočítejte, jestli se nový kanál vyplatí",
        text: "Než dáte peníze do e-shopu nebo reklamy, spočítáte si tržby, náklady, bod zvratu a maximální podíl marketingu na obratu. Rozhodujete podle čísel, ne podle pocitu.",
        image: `${IMG}financni-plan-scenare.webp`,
        alt: "Srovnání opatrného, realistického a optimistického scénáře",
      },
    ],
    positioningTitle: "Stavíte na tom, co už máte",
    positioningText:
      "Výsledek rentgenu se propíše do bran 1 až 3 jako návrh. Projdete stejnou cestou jako nový projekt, jen začínáte se zákazníky, oborem a zkušenostmi.",
    helpTitle: "Pomoc od lidí, kteří podnikají",
    help: [
      {
        title: "Úvodní konzultace zdarma",
        text: "20 minut online s expertem. Projdeme výsledek rentgenu a doporučíme, čím začít.",
      },
      {
        title: "Poradci na konkrétní kanál",
        text: "Specialisté na Google, Facebook, e-shopy nebo e-mail z Edu Partners, na online konzultaci.",
      },
      {
        title: "Napojení banky",
        text: "Připravujeme napojení účtu přes PSD2, aby plán vycházel z vašich skutečných čísel.",
      },
    ],
    finalTitle: "Pět minut a víte, kde vám online přinese první zákazníky.",
    faq: [
      [
        "Pro jaké podnikání je rentgen vhodný?",
        "Pro služby, řemesla, obchody, gastro i výrobu. Pro každého, kdo už má zákazníky a chce jich víc přes internet.",
      ],
      [
        "Musím mít web nebo e-shop?",
        "Ne. Rentgen ukáže, jestli ho vůbec potřebujete. Často je prvním krokem firemní profil na Googlu nebo online rezervace.",
      ],
      [
        "Jak přesný je odhad tržeb?",
        "Je to první odhad z vašich odpovědí a obvyklých čísel v oboru, ne záruka. Ve finančním plánu v bráně 3 ho spočítáte přesně.",
      ],
      [
        "Kolik času mi to zabere?",
        "Rentgen do 5 minut. První kroky jsou vybrané tak, aby se daly zvládnout během jednoho týdne vedle provozu.",
      ],
      [
        "Kolik to stojí?",
        `Rentgen podniku a brány 1 a 2 jsou zdarma, bez platební karty. Celá cesta je součástí členství za ${price}, platíte jednorázově, nic se samo neobnovuje.`,
      ],
      [
        "Jak AI pracuje s mými daty?",
        "AI se spustí jen na vaše kliknutí a dostane jen údaje z projektu, bez jména a e-mailu. Neučí se na nich. Databáze je v EU, AI text zpracuje v USA se standardními smluvními doložkami. Podrobně na stránce Váš nápad a data.",
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default ExistingBusinessPage;
