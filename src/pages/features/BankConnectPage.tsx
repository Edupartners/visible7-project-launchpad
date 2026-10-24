import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { BankWaitlist } from "@/components/marketing/BankWaitlist";

/** Podstránka funkce: napojení bankovního účtu (PSD2), zatím čekací listina. */
const BankConnectPage = () => {
  const d: FeaturePageData = {
    slug: "napojeni-banky",
    metaTitle: "Napojení bankovního účtu a predikce cash flow (PSD2) | VISIBLE7 MICEK",
    metaDescription:
      "Připravujeme bezpečné napojení bankovního účtu přes PSD2. Plán a predikce cash flow pak vyjdou z vašich skutečných pohybů, ne z průměrů. Zapište se na čekací listinu.",
    eyebrow: "Napojení banky · připravujeme",
    title: (
      <>
        Plán postavený na{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          vašich skutečných číslech
        </span>
        .
      </>
    ),
    lead: "Když už podnikáte, nemusíte čísla odhadovat. Připravujeme bezpečné napojení bankovního účtu, aby VISIBLE7 spočítal predikci podle toho, jak vaše firma opravdu funguje.",
    cta: "Začít plán zdarma",
    note: "Napojení banky připravujeme. Finanční plán z vlastních čísel můžete udělat už teď.",
    heroImage: "/funkce/financni-plan-graf.webp",
    heroAlt: "Graf peněz v projektu, který po napojení banky vyjde ze skutečných pohybů",
    heroStats: [
      ["Napojení přes", "PSD2"],
      ["Partner", "Goodveri"],
    ],
    problemTitle: "Plán z odhadů platí jen do prvního výpisu z účtu.",
    problems: [
      {
        title: "Průměry z oboru",
        text: "Dobré na start. Jakmile podnikáte, vaše čísla se od průměru liší a plán přestane sedět.",
      },
      {
        title: "Ruční přepisování",
        text: "Každý měsíc stahovat výpisy a přepisovat je do tabulky. Po třetím měsíci to každý vzdá.",
      },
      {
        title: "Účetní jednou za rok",
        text: "Přiznání ukáže, jak jste dopadli. Na rozhodnutí během roku je ale pozdě.",
      },
    ],
    extra: <BankWaitlist />,
    positioningTitle: "Bezpečně, přes licencovanou infrastrukturu",
    positioningText:
      "Napojení poběží přes evropské pravidlo PSD2 a technologického partnera Goodveri. VISIBLE7 bude vidět jen pohyby na účtu, které ke svému plánu povolíte, a hýbat s penězi nebude moct.",
    helpTitle: "Co můžete udělat už teď",
    help: [
      {
        title: "Finanční plán",
        text: "Spočítejte kapitál, bod zvratu a návratnost z vlastních čísel. Bez banky, hned.",
      },
      { title: "Seniorní poradce", text: "Projde s vámi skutečná čísla firmy a řekne, kde plán upravit." },
      {
        title: "Čekací listina",
        text: "Zapište se a ozveme se, jakmile napojení spustíme. Nic dalšího vám posílat nebudeme.",
      },
    ],
    finalTitle: "Začněte plánem z vlastních čísel. Banku napojíte, až to spustíme.",
    faq: [
      [
        "Kdy napojení spustíte?",
        "Termín zatím neznáme. Zapište se na čekací listinu a dáme vám vědět jedním e-mailem, jakmile napojení spustíme.",
      ],
      [
        "Co je PSD2?",
        "Evropská směrnice o platebních službách. Umožňuje vám bezpečně sdílet údaje z účtu s aplikací, kterou si sami vyberete, přes licencovaného poskytovatele.",
      ],
      [
        "Uvidí VISIBLE7 moje peníze nebo s nimi může hýbat?",
        "Ne. Napojení bude sloužit jen ke čtení pohybů, které povolíte. Platby z účtu přes něj provádět nepůjde.",
      ],
      [
        "Kdo je Goodveri?",
        "Technologický partner pro open banking. Pro banky, pojišťovny a poskytovatele úvěrů zajišťuje digitální onboarding klientů a analýzu bankovních dat.",
      ],
      [
        "Musím na napojení čekat?",
        "Ne. Finanční plán z vlastních čísel uděláte už teď v bráně 3. Po napojení se jen zpřesní.",
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default BankConnectPage;
