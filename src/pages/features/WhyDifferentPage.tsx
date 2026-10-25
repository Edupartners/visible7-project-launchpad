import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BarChart3,
  Bot,
  Check,
  Compass,
  GraduationCap,
  Megaphone,
  Minus,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { FeaturePage, type FeaturePageData } from "@/components/marketing/FeaturePage";
import { kc, useShop } from "@/lib/shop";
import { SPECIALIST_TITLE } from "@/lib/certificates";
import { NSK_QUALIFICATION } from "@/lib/qualification";

const IMG = "/funkce/";

interface Pillar {
  icon: LucideIcon;
  title: string;
  text: string;
  to: string;
}

/** Osm částí, které jinde skládáte z různých nástrojů a kurzů. */
const PILLARS: Pillar[] = [
  {
    icon: Compass,
    title: "Podnikatelský plán",
    text: "Modrý oceán, USP a Lean Canvas na vašem nápadu.",
    to: "/podnikatelsky-plan",
  },
  {
    icon: BarChart3,
    title: "Finanční plán",
    text: "Kapitál, bod zvratu, návratnost a daně bez Excelu.",
    to: "/financni-plan",
  },
  {
    icon: Bot,
    title: "AI asistence",
    text: "AI pomocník navrhne obsah, AI mentor zhodnotí výsledek.",
    to: "/test-napadu",
  },
  {
    icon: Wrench,
    title: "Tvorba projektu",
    text: "Web, e-shop, kurz nebo předplatné: 13 typů byznysu, postup s videi.",
    to: "/#jak",
  },
  {
    icon: Megaphone,
    title: "Marketingové kanály",
    text: "12 kanálů seřazených pro váš byznys, s testovacím rozpočtem.",
    to: "/marketingove-kanaly",
  },
  {
    icon: GraduationCap,
    title: "E-learning",
    text: "100+ videí, pracovní listy a živé semináře každých 14 dní.",
    to: "/pracovni-listy",
  },
  {
    icon: UserRound,
    title: "Poradci z praxe",
    text: "Finance, marketing, právo, e-shopy. Online konzultace k vašemu projektu.",
    to: "/poradci",
  },
  {
    icon: Award,
    title: "Osvědčení a kvalifikace",
    text: "Osvědčení za každou bránu, certifikace a volitelně státní zkouška.",
    to: "/certifikace",
  },
];

type Cell = "ano" | "ne" | "castecne";

/** Srovnání s obvyklými alternativami (kategorie, ne konkrétní firmy). */
const COMPARE: { row: string; cells: [Cell, Cell, Cell, Cell] }[] = [
  { row: "Plán postavený na vašem projektu", cells: ["castecne", "castecne", "ne", "ano"] },
  { row: "Spočítaná čísla: kapitál, bod zvratu, daně", cells: ["ne", "ne", "castecne", "ano"] },
  { row: "Postup tvorby webu nebo e-shopu", cells: ["castecne", "castecne", "ne", "ano"] },
  { row: "Marketing navázaný na rozpočet", cells: ["castecne", "ne", "ne", "ano"] },
  { row: "Živý poradce k vašemu projektu", cells: ["castecne", "ne", "ne", "ano"] },
  { row: "Osvědčení a cesta k profesní kvalifikaci", cells: ["castecne", "ne", "ne", "ano"] },
];
const COMPARE_COLS = ["Kurz podnikání", "Obecný AI chat", "Excel a šablony", "VISIBLE7"];

const Mark = ({ v, strong }: { v: Cell; strong?: boolean }) =>
  v === "ano" ? (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
        strong ? "bg-leaf-500 text-white" : "bg-leaf-100 text-leaf-700"
      }`}
    >
      <Check className="h-4 w-4" strokeWidth={3} aria-label="ano" />
    </span>
  ) : v === "castecne" ? (
    <span className="text-xs font-semibold text-muted-foreground">částečně</span>
  ) : (
    <Minus className="mx-auto h-4 w-4 text-muted-foreground/60" aria-label="ne" />
  );

const OneplaceBlock = () => (
  <>
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Osm věcí, které jinde skládáte dohromady
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Ve VISIBLE7 jsou propojené kolem jednoho projektu, vašeho. Co vyplníte v jedné části, použije další.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition-colors hover:border-leaf-500"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
                <p.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{p.title}</h3>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-leaf-600">
                Více <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          Jak to obvykle vypadá jinde
        </h2>
        <div className="mt-10 overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 font-semibold text-muted-foreground" scope="col">
                  <span className="sr-only">Co potřebujete</span>
                </th>
                {COMPARE_COLS.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`p-4 text-center font-bold ${i === 3 ? "bg-leaf-50 text-leaf-700" : ""}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.row} className="border-b border-border last:border-0">
                  <th scope="row" className="p-4 font-medium">
                    {r.row}
                  </th>
                  {r.cells.map((v, i) => (
                    <td key={i} className={`p-4 text-center ${i === 3 ? "bg-leaf-50" : ""}`}>
                      <Mark v={v} strong={i === 3} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Srovnání s obvyklými typy řešení, ne s konkrétními firmami.
        </p>
      </div>
    </section>
  </>
);

/** Podstránka „Čím jsme jiní“: vše pro samostatného podnikatele na jednom místě. */
const WhyDifferentPage = () => {
  const shop = useShop();
  const price = kc(shop.price);

  const d: FeaturePageData = {
    slug: "cim-jsme-jini",
    metaTitle: "Čím je VISIBLE7 jiný: plán, AI, e-learning a poradci na jednom místě | VISIBLE7 MICEK",
    metaDescription:
      "Podnikatelský a finanční plán, AI asistence, postup tvorby webu a e-shopu, marketingové kanály, e-learning, poradci, osvědčení a cesta k profesní kvalifikaci. Vše v jedné aplikaci.",
    eyebrow: "Čím jsme jiní",
    title: (
      <>
        Všechno pro váš byznys{" "}
        <span className="text-leaf-500 underline decoration-leaf-200 decoration-[0.12em] underline-offset-[0.14em]">
          na jednom místě
        </span>
        .
      </>
    ),
    lead: "Plán, čísla, AI asistence, tvorba webu nebo e-shopu, marketing, e-learning, poradci i osvědčení. Ne deset nástrojů a tři kurzy, ale jedna aplikace, která vás provede od nápadu po spuštěný projekt.",
    cta: "Začít zdarma",
    note: "Test nápadu a brány 1–2 zdarma, bez platební karty. Pro registraci stačí e-mail.",
    heroImage: `${IMG}jini-implementace.webp`,
    heroAlt: "Plán tvorby e-shopu v aplikaci: doména, založení e-shopu, produkty, platby, právní minimum",
    heroStats: [
      ["Na jednom místě", "8 částí"],
      ["Cesta", "7 bran"],
    ],
    problemTitle: "Kdo začíná podnikat, skládá si pomoc z kousků.",
    problems: [
      {
        title: "Kurz bez vašeho projektu",
        text: "Hodiny teorie a příklady z cizích firem. Na vlastní plán, čísla a web už vám nezbude čas.",
      },
      {
        title: "Deset nástrojů",
        text: "Šablona plánu, Excel, AI chat, návody na reklamu. Nic na sebe nenavazuje a všechno přepisujete znovu.",
      },
      {
        title: "Nikdo, kdo se podívá",
        text: "Když se zaseknete, není koho se zeptat. Projekt stojí a odkládá se.",
      },
    ],
    problemNote: "VISIBLE7 spojuje plán, tvorbu, marketing, vzdělávání a podporu do jedné cesty.",
    extra: <OneplaceBlock />,
    extraFirst: true,
    rowsTitle: "Jak to do sebe zapadá",
    rows: [
      {
        eyebrow: "Plán a čísla",
        title: "Nejdřív plán, který dává smysl",
        text: "Test nápadu, modrý oceán a Lean Canvas, pak finanční plán na 24 měsíců. AI navrhne obsah a čísla obvyklá ve vašem oboru, aplikace spočítá kapitál, bod zvratu a daně.",
        image: `${IMG}financni-plan-graf.webp`,
        alt: "Graf peněz v projektu s vyznačeným potřebným kapitálem a bodem zvratu",
      },
      {
        eyebrow: "Tvorba projektu",
        title: "Web, e-shop nebo kurz krok za krokem",
        text: "Podle typu byznysu dostanete plán tvorby: 13 typů online byznysu, 28 bloků s instruktážním videem a 112 konkrétních kroků. Náklady se rovnou propíšou do finančního plánu.",
        image: `${IMG}jini-implementace.webp`,
        alt: "Plán tvorby e-shopu: platforma, náročnost, bloky a kroky, čas a náklady na start",
        points: ["Doména, platby, doprava i právní minimum", "Vidíte každé kliknutí ve videu"],
      },
      {
        eyebrow: "Web projektu",
        title: "Ověřte zájem dřív, než postavíte všechno",
        text: "Z toho, co máte v branách 1 až 3, složíte jednoduchou stránku. Přivedete na ni lidi ze své cílovky a vidíte návštěvy i zápisy zájemců.",
        image: `${IMG}jini-web-projektu.webp`,
        alt: "Web projektu: upravte texty, zveřejněte a sledujte zájemce",
      },
      {
        eyebrow: "Marketing",
        title: "Kanály a rozpočet podle vašich čísel",
        text: "Aplikace doporučí kanály pro váš typ byznysu a hlídá, abyste na reklamu nedali víc, než projekt unese. Po testu rozhodnete podle výsledků.",
        image: `${IMG}kanaly-doporucene.webp`,
        alt: "Doporučené marketingové kanály s testovacím rozpočtem",
      },
      {
        eyebrow: "Osvědčení a kvalifikace",
        title: "To, co uděláte, máte černé na bílém",
        text: `Za každou bránu osvědčení, po bráně 5 certifikace ${SPECIALIST_TITLE}. Kdo chce víc, může složit zkoušku státem uznané profesní kvalifikace ${NSK_QUALIFICATION.name} (${NSK_QUALIFICATION.code}).`,
        image: `${IMG}jini-certifikace.webp`,
        alt: "Cesta k certifikaci: osvědčení za fáze, certifikace, VISIBLE7 Gold a státní profesní kvalifikace",
        points: ["Zkoušku pořádá Edu Partners jako autorizovaná osoba", "Kvalifikace je volitelná"],
      },
    ],
    quote: {
      text: "Lidé k nám přicházejí s představou, že podnikání není pro ně. Odcházejí s tím, že vědí, jak začít, a zvládnou to sami.",
      author: "Michal Míček",
      role: "autor metodiky VISIBLE7 MICEK®",
    },
    positioningTitle: "Za aplikací je metodika a lidé",
    positioningText:
      "VISIBLE7 stojí na metodice VISIBLE7 MICEK® a na zkušenostech Edu Partners, kde učíme podnikat od roku 2011. AI vám šetří čas, rozhodujete ale vy, a když je potřeba, i s poradcem z praxe.",
    helpTitle: "A když si nevíte rady",
    help: [
      {
        title: "Úvodní konzultace zdarma",
        text: "20 minut online s expertem. Projdeme váš projekt a doporučíme první krok.",
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
    finalTitle: "Jedna aplikace místo deseti. Začněte zdarma.",
    faq: [
      [
        "Pro koho je VISIBLE7?",
        "Pro samostatné podnikatele: kdo teprve začíná, i kdo už podniká offline a chce zákazníky z online.",
      ],
      [
        "Je to kurz, nebo aplikace?",
        "Obojí. Vzdělávání je přímo u práce na vašem projektu: video, krok, a hned ho uděláte na svém plánu, webu nebo marketingu.",
      ],
      [
        "Postaví mi aplikace web nebo e-shop?",
        "Web projektu pro test zájmu složíte přímo v aplikaci. Vlastní web nebo e-shop postavíte sami na doporučené platformě, podle postupu s videi krok za krokem.",
      ],
      [
        "Co je profesní kvalifikace?",
        `Státem uznaná kvalifikace ${NSK_QUALIFICATION.name} (${NSK_QUALIFICATION.code}) podle Národní soustavy kvalifikací. Zkouška je volitelná a skládá se u autorizované osoby.`,
      ],
      [
        "Kolik to stojí?",
        `Test nápadu a brány 1 a 2 jsou zdarma, bez platební karty. Celá cesta je součástí členství za ${price}, platíte jednorázově, nic se samo neobnovuje.`,
      ],
      [
        "Jak AI pracuje s mými daty?",
        "AI vidí jen to, co do projektu napíšete, a jen když ji sami zavoláte. Data jsou uložena v EU.",
      ],
    ],
  };
  return <FeaturePage d={d} />;
};

export default WhyDifferentPage;
