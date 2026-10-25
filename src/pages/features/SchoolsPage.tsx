import { Check, Mail, Phone } from "lucide-react";
import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { SPECIALIST_TITLE } from "@/lib/certificates";
import { NSK_QUALIFICATION } from "@/lib/qualification";
import { OPERATOR } from "@/lib/legal";
import { track } from "@/lib/track";

const IMG = "/funkce/";

const inquiry = (pkg: string) =>
  `mailto:${OPERATOR.email}?subject=${encodeURIComponent(`Licence VISIBLE7 pro školu: ${pkg}`)}&body=${encodeURIComponent(
    "Dobrý den,\n\nmáme zájem o licenci VISIBLE7 pro naši školu.\n\nŠkola:\nPočet žáků:\nKontaktní osoba a telefon:\n\nDěkuji.",
  )}`;

const PACKAGES = [
  {
    name: "Třída",
    price: "14 900 Kč",
    unit: "za školní rok, do 30 žáků",
    items: [
      "Celá aplikace: 7 bran, videa, AI pomocník",
      "Pracovní listy pro výuku",
      "Osvědčení žákům za každou bránu",
      "Účet pro učitele zdarma",
    ],
  },
  {
    name: "Škola",
    price: "39 000 Kč",
    unit: "za školní rok, do 100 žáků",
    featured: true,
    items: [
      "Vše z balíčku Třída",
      "Kódy pro více tříd a učitelů",
      "90 minut online zaškolení učitelů",
      "Přehled, kam se třídy dostaly, na vyžádání",
    ],
  },
  {
    name: "Na míru",
    price: "Dohodou",
    unit: "nad 100 žáků nebo víc škol",
    items: ["Licence pro celou školu nebo zřizovatele", "Školení učitelů přímo u vás", "Termíny podle školního roku"],
  },
];

const EXTRAS: [string, string][] = [
  ["Jednodenní školení učitelů", "2 890 Kč za učitele"],
  [`Příprava a zkouška profesní kvalifikace ${NSK_QUALIFICATION.code}`, "8 000 Kč za žáka"],
  ["Konzultace se seniorním poradcem", "podle ceníku poradců"],
];

const SchoolOffer = () => (
  <section className="bg-muted/40 py-16 md:py-24">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
        Roční licence pro školu
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
        Žáci se připojí kódem třídy a mají plný přístup po celý školní rok. Ceny jsou bez DPH.
      </p>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {PACKAGES.map((p) => (
          <div
            key={p.name}
            className={`flex flex-col rounded-3xl border p-7 ${
              p.featured
                ? "border-leaf-500 bg-card shadow-[0_30px_60px_-35px_hsl(160_61%_15%/0.5)]"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold">{p.name}</h3>
              {p.featured && (
                <span className="rounded-full bg-leaf-100 px-3 py-1 text-xs font-semibold text-leaf-700">
                  Nejčastější
                </span>
              )}
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight">{p.price}</p>
            <p className="text-sm text-muted-foreground">{p.unit}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">
              {p.items.map((i) => (
                <li key={i} className="flex gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <a
              href={inquiry(p.name)}
              onClick={() => track("school_inquiry_click", { pkg: p.name })}
              className={`mt-7 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold transition-colors ${
                p.featured
                  ? "bg-leaf-500 text-white hover:bg-leaf-600"
                  : "border-2 border-leaf-500 text-leaf-700 hover:bg-leaf-50"
              }`}
            >
              Poptat licenci
            </a>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 rounded-3xl border border-border bg-card p-7 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div>
          <h3 className="text-lg font-bold">Doplňkové služby</h3>
          <dl className="mt-4 divide-y divide-border text-sm">
            {EXTRAS.map(([k, v]) => (
              <div key={k} className="flex flex-wrap justify-between gap-2 py-2.5">
                <dt>{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="space-y-3 text-sm md:border-l md:border-border md:pl-6">
          <p className="font-semibold">Chcete se nejdřív domluvit?</p>
          <a href={inquiry("dotaz")} className="flex items-center gap-2 text-primary hover:underline">
            <Mail className="h-4 w-4" aria-hidden="true" /> {OPERATOR.email}
          </a>
          <a
            href={`tel:${OPERATOR.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Phone className="h-4 w-4" aria-hidden="true" /> {OPERATOR.phone}
          </a>
          <p className="text-muted-foreground">Fakturuje {OPERATOR.name}, cena se navyšuje o 21 % DPH.</p>
        </div>
      </div>
    </div>
  </section>
);

/** Podstránka pro školy: roční licence pro žáky a školení učitelů. */
const SchoolsPage = () => {
  const d: FeaturePageData = {
    slug: "pro-skoly",
    metaTitle: "VISIBLE7 pro školy: podnikání v praxi s roční licencí pro žáky | VISIBLE7 MICEK",
    metaDescription:
      "Roční licence VISIBLE7 pro střední a vyšší odborné školy. Žáci si projdou vlastní podnikatelský projekt v sedmi branách, s videi, AI pomocníkem a osvědčením. Školení učitelů.",
    eyebrow: "Pro školy a učitele",
    title: (
      <>
        Podnikání, které si žáci{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          vyzkoušejí na vlastním projektu
        </span>
        .
      </>
    ),
    lead: "Místo teorie z učebnice si každý žák projde vlastní nápad: od testu nápadu přes byznys model a finanční plán až po web a marketing. Vy dostanete hotovou osnovu, videa a pracovní listy do výuky.",
    cta: "Vyzkoušet zdarma",
    note: "Test nápadu a brány 1–2 si můžete vyzkoušet zdarma. Licenci pro třídu poptáte níže.",
    heroImage: `${IMG}test-napadu-vysledek.webp`,
    heroAlt: "Výsledek testu nápadu: verdikt, typ byznysu, potřebný kapitál a bod zvratu",
    heroStats: [
      ["Licence", "školní rok"],
      ["Třída", "od 14 900 Kč"],
    ],
    problemTitle: "Podnikání se ve škole učí hlavně z teorie. Proč to nestačí?",
    problems: [
      {
        title: "Podnikatelský plán na papíře",
        text: "Žáci vyplní šablonu, učitel ji opraví a tím to končí. Že by nápad mohli opravdu rozjet, nezjistí.",
      },
      {
        title: "Čísla bez souvislostí",
        text: "Bod zvratu a cash flow znají ze vzorců, ale nespočítali je na ničem, co by je zajímalo.",
      },
      {
        title: "Online jen okrajově",
        text: "Web, e-shop a reklama jsou dnes základ podnikání. Ve výuce na ně zbývá málo času a materiálů.",
      },
    ],
    problemNote: "S VISIBLE7 pracuje každý žák na svém projektu a vy máte hotovou osnovu.",
    extra: <SchoolOffer />,
    rowsTitle: "Co žáci ve VISIBLE7 udělají",
    rows: [
      {
        eyebrow: "Test nápadu a byznys model",
        title: "Od nápadu k Lean Canvasu",
        text: "Žák otestuje nápad, strategií modrého oceánu najde, čím bude jiný než konkurence, a sestaví Lean Canvas. AI navrhne obsah, žák ho musí obhájit a upravit.",
        image: `${IMG}plan-canvas.webp`,
        alt: "Lean Canvas v aplikaci: segment zákazníků, problém, unikátní hodnota a řešení",
      },
      {
        eyebrow: "Finanční plán",
        title: "Čísla, která si spočítá sám",
        text: "Příjmy, náklady, daně, potřebný kapitál a bod zvratu na 24 měsíců. Bez Excelu, ale s vysvětlením každého pole, takže žák ví, odkud čísla jsou.",
        image: `${IMG}financni-plan-graf.webp`,
        alt: "Graf peněz v projektu s vyznačeným potřebným kapitálem a bodem zvratu",
      },
      {
        eyebrow: "Tvorba a marketing",
        title: "Web, e-shop a první kampaň",
        text: "Podle typu byznysu dostane plán tvorby s videi krok za krokem a doporučené marketingové kanály s testovacím rozpočtem.",
        image: `${IMG}jini-implementace.webp`,
        alt: "Plán tvorby e-shopu v aplikaci s bloky a kroky",
      },
      {
        eyebrow: "Osvědčení",
        title: "Výsledek, který si žák dá do životopisu",
        text: `Za každou bránu osvědčení s popisem obsahu, po bráně 5 certifikace ${SPECIALIST_TITLE}. Kdo chce víc, může složit zkoušku státem uznané profesní kvalifikace ${NSK_QUALIFICATION.name}.`,
        image: `${IMG}jini-certifikace.webp`,
        alt: "Cesta k certifikaci: osvědčení za fáze, certifikace, VISIBLE7 Gold a státní profesní kvalifikace",
      },
    ],
    positioningTitle: "Za aplikací je 15 let výuky podnikání",
    positioningText:
      "VISIBLE7 vychází z kurzů Edu Partners, kde učíme podnikat od roku 2011, a z metodiky VISIBLE7 MICEK®. Ve škole ji používáte jako hotovou osnovu na pololetí nebo celý rok.",
    helpTitle: "Pro učitele",
    help: [
      {
        title: "Zaškolení a osnova",
        text: "Online zaškolení k aplikaci a pracovní listy, které vytisknete a použijete v hodině.",
      },
      {
        title: "Jednodenní školení",
        text: "Podnikání a e-commerce od nápadu po projekt, pro učitele ekonomických předmětů. 2 890 Kč za učitele.",
      },
      {
        title: "Ochrana dat žáků",
        text: "Učitel vidí, jak daleko žák je, ne obsah jeho projektu. Žákům neposíláme obchodní nabídky. Zpracovatelská smlouva je součástí licence.",
      },
    ],
    finalTitle: "Ať si žáci podnikání vyzkoušejí dřív, než do něj půjdou naostro.",
    faq: [
      [
        "Pro jaké školy je VISIBLE7?",
        "Pro obchodní akademie, střední a vyšší odborné školy a všechny, kdo učí ekonomiku, podnikání nebo marketing. Hodí se i pro projektové dny a odborné praxe.",
      ],
      [
        "Jak se žáci připojí?",
        "Každá třída dostane kód. Žák se zaregistruje e-mailem, zadá kód a má plný přístup po celý školní rok.",
      ],
      [
        "Kolik hodin výuky to zabere?",
        "Orientačně: brány 1 až 3 (nápad, byznys model a finanční plán) se dají projít za pololetí při dvou hodinách týdně, celá cesta za školní rok. Tempo si určujete sami.",
      ],
      [
        "Vidí učitel projekty žáků?",
        "Učitel vidí, kam se žák dostal. Obsah projektu žák ukazuje sám, například při prezentaci ve třídě.",
      ],
      [
        "Jak je to s AI a nezletilými žáky?",
        "AI se spouští jen na kliknutí žáka a dostane jen údaje z projektu, bez jména a e-mailu. Se školou uzavíráme zpracovatelskou smlouvu. Podrobnosti najdete na stránce Váš nápad a data.",
      ],
      ["Jak se platí?", `Fakturou. Licenci fakturuje ${OPERATOR.name}, ceny jsou uvedené bez DPH.`],
    ],
  };
  return <FeaturePage d={d} />;
};

export default SchoolsPage;
