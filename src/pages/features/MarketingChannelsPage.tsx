import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { kc, useShop } from "@/lib/shop";

const IMG = "/funkce/";

/** Podstránka funkce: marketingové kanály (brána 5 Budování poptávky). */
const MarketingChannelsPage = () => {
  const shop = useShop();
  const price = kc(shop.price);

  const d: FeaturePageData = {
    slug: "marketingove-kanaly",
    metaTitle: "Marketingové kanály pro začínající podnikání s AI | VISIBLE7 MICEK",
    metaDescription:
      "12 marketingových kanálů od Meta Ads a Google Ads po SEO a e-mail. AI je seřadí podle vašeho typu byznysu a rozpočtu, ke každému máte postup a testovací rozpočet.",
    eyebrow: "Marketingové kanály",
    title: (
      <>
        Víte, kde začít s marketingem a{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          kolik do něj dát
        </span>
        .
      </>
    ),
    lead: "12 kanálů od Meta Ads a Google Ads po SEO a e-mail. AI je seřadí podle vašeho typu byznysu, zákazníka a rozpočtu. Ke každému máte postup krok za krokem a testovací rozpočet.",
    cta: "Začít zdarma",
    note: `Test nápadu a brány 1–2 zdarma. Marketingové kanály jsou brána 5, součást členství za ${price}.`,
    heroImage: `${IMG}kanaly-doporucene.webp`,
    heroAlt: "Doporučené kanály seřazené podle typu byznysu: Meta Ads, Google Ads a Sklik s testovacím rozpočtem",
    heroStats: [
      ["Začněte tady", "Meta Ads"],
      ["Test", "3 000 Kč / měs."],
    ],
    problemTitle: "Na marketing se nejčastěji vyhazují peníze. Proč?",
    problems: [
      {
        title: "Všechno najednou",
        text: "Facebook, Instagram, Google, TikTok. Rozpočet se rozpustí a nevíte, co z toho fungovalo.",
      },
      {
        title: "Agentura bez čísel",
        text: "Měsíční paušál a reporty plné kliknutí. Kolik vás stál jeden zákazník, se nedozvíte.",
      },
      {
        title: "Návody z internetu",
        text: "Obecné tipy pro velké firmy. Nevychází z vašeho oboru, marže ani rozpočtu.",
      },
    ],
    problemNote: "Ve VISIBLE7 začnete dvěma až třemi kanály a rozhodnete podle čísel.",
    rowsTitle: "Marketing, který vychází z vašeho byznysu",
    rows: [
      {
        eyebrow: "Doporučené kanály",
        title: "Tři kanály, kterými začít",
        text: "Aplikace zná váš typ byznysu z brány 2 a rozpočet z finančního plánu. Podle nich seřadí kanály a ukáže tři, kterými začít, s testovacím rozpočtem a dobou nastavení.",
        image: `${IMG}kanaly-doporucene.webp`,
        alt: "Doporučené kanály: Meta Ads, Google Ads a Sklik s testovacím rozpočtem a dobou nastavení",
      },
      {
        eyebrow: "12 kanálů",
        title: "Od reklamy po SEO a e-mail",
        text: "Meta Ads, Google Ads, Sklik, srovnávače zboží, e-mail marketing, ChatGPT Ads, SEO a obsah, influenceři a PR, marketplace, firemní profil na Googlu, LinkedIn a SMS. U každého vidíte, jestli se hodí pro váš typ byznysu.",
        image: `${IMG}kanaly-dalsi.webp`,
        alt: "Přehled dalších marketingových kanálů s testovacím rozpočtem a dobou nastavení",
      },
      {
        eyebrow: "Postup krok za krokem",
        title: "Nastavíte kanál sami, podle videí",
        text: "Každý kanál je rozdělený do bloků: měření konverzí, testovací rozpočet, účet a publikum, texty reklam a první kampaň. Ke každému bloku video a kontrolní seznam.",
        image: `${IMG}kanaly-postup.webp`,
        alt: "Postup pro Meta Ads: měření konverzí, testovací rozpočet, účet a publikum, texty a první kampaň",
        points: ["Měření konverzí jako první krok", "Poradci pro konkrétní kanál na konzultaci"],
      },
      {
        eyebrow: "Test kanálu",
        title: "Vyplatí se, nebo ne? Rozhodnou čísla.",
        text: "Po 14 dnech zapíšete, kolik jste utratili a co to přineslo. Aplikace výsledek porovná s maximálním podílem marketingu na obratu (PNO) z vašeho finančního plánu a ukáže, jestli se kanál vyplatí.",
        image: `${IMG}kanaly-test.webp`,
        alt: "Test kanálu: útrata, prodejky, počet objednávek a tržby, vyhodnocení podle PNO",
      },
    ],
    positioningTitle: "Marketing navázaný na čísla",
    positioningText:
      "Maximální PNO a cenu za získání zákazníka znáte z finančního plánu v bráně 3. Marketing v bráně 5 je na ně napojený, takže na reklamu nedáte víc, než projekt unese.",
    helpTitle: "Když si nevíte rady, nejste na to sami",
    help: [
      {
        title: "Videa a záznamy přednášek",
        text: "Ke každému kanálu postup krok za krokem a záznamy z přednášek lektorů.",
      },
      {
        title: "Poradci na konkrétní kanál",
        text: "Specialisté na Facebook, PPC, SEO nebo e-mail z Edu Partners, na online konzultaci.",
      },
      { title: "Živé semináře", text: "Jednou měsíčně online: reklama, SEO, AI a další, s prostorem na vaše otázky." },
    ],
    finalTitle: "Utraťte za marketing jen tolik, kolik se vrátí.",
    faq: [
      [
        "Kolik musím dát do reklamy?",
        "Na začátek stačí testovací rozpočet u každého kanálu, obvykle 2 000–4 000 Kč měsíčně. Kolik můžete dát dlouhodobě, spočítá aplikace z vaší marže jako maximální PNO.",
      ],
      [
        "Jak AI vybírá kanály?",
        "Podle vašeho typu byznysu, zákazníka a rozpočtu. Doporučení je výchozí bod, rozhodují výsledky vašeho testu.",
      ],
      [
        "Musím umět nastavit reklamu?",
        "Ne. Ke každému kanálu máte postup v blocích s videem, kde je vidět každé kliknutí, a kontrolní seznam.",
      ],
      [
        "Co je PNO?",
        "Podíl nákladů na obratu: kolik procent z tržeb dáte do marketingu. Maximum počítáme z vaší marže, ostatních nákladů a cílového zisku.",
      ],
      [
        "Hodí se to i pro služby a místní podnikání?",
        "Ano. Pro služby a místní firmy aplikace doporučí například firemní profil na Googlu, reklamu ve vyhledávání nebo e-mail.",
      ],
      [
        "Kolik to stojí?",
        `Test nápadu a brány 1 a 2 jsou zdarma. Marketingové kanály jsou součástí členství za ${price}, platíte jednorázově, nic se samo neobnovuje.`,
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default MarketingChannelsPage;
