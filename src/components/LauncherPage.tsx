import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { ADVISORS, CONSULTATION } from "@/lib/advisors";
import { FREE_CONSULT_URL, kc, monthsLabel, perMonth, useFounderOffer, useShop } from "@/lib/shop";
import { SPECIALIST_TITLE } from "@/lib/certificates";
import { track } from "@/lib/track";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { SavingsCalculator } from "@/components/marketing/SavingsCalculator";
import {
  ArrowRight,
  Award,
  BarChart3,
  Calculator,
  Check,
  ChevronDown,
  Download,
  Layers,
  Lightbulb,
  PlayCircle,
  Rocket,
  Sparkles,
  Store,
  Target,
  TrendingUp,
  Wrench,
} from "lucide-react";

interface LauncherPageProps {
  onAccessGranted: () => void;
}

type Tag = "AI" | "Video" | "Výpočet";

const GATES: { name: string; icon: typeof Target; does: string; get: string; tags: Tag[]; sample: string }[] = [
  {
    name: "Vize",
    icon: Target,
    does: "Najdete místo mezi levnou a prémiovou konkurencí.",
    get: "Křivka hodnoty a USP",
    tags: ["Video"],
    sample: "USP: e-shop za víkend bez programátora",
  },
  {
    name: "Ideace",
    icon: Lightbulb,
    does: "Celý byznys na jedné stránce. AI navrhne texty a ohodnotí je.",
    get: "Lean Canvas a typ byznysu",
    tags: ["AI"],
    sample: "AI: typ byznysu – e-shop",
  },
  {
    name: "Strategie a čísla",
    icon: TrendingUp,
    does: "Příjmy, náklady a marketing na 24 měsíců. AI odhadne obvyklá čísla.",
    get: "Potřebný kapitál, bod zvratu, PNO",
    tags: ["AI", "Výpočet"],
    sample: "Bod zvratu: 6. měsíc",
  },
  {
    name: "Implementace",
    icon: Wrench,
    does: "Postup a nástroje pro váš typ byznysu: web, e-shop, kurz, předplatné…",
    get: "Plán tvorby krok za krokem",
    tags: ["Video"],
    sample: "Video: jak spustit e-shop",
  },
  {
    name: "Budování poptávky",
    icon: BarChart3,
    does: "Kanály seřazené podle toho, kde váš zákazník opravdu nakupuje.",
    get: "Ověřené kanály a rozpočet",
    tags: ["Video", "Výpočet"],
    sample: "Meta Ads: doporučeno",
  },
  {
    name: "Launch",
    icon: Rocket,
    does: "Spustíte hotový základ, ne dokonalý projekt, a měříte, co funguje.",
    get: "Spuštěný projekt a ukazatele",
    tags: ["Video"],
    sample: "První zákazník",
  },
  {
    name: "Expanze",
    icon: Layers,
    does: "Když projekt běží: automatizace, tým a další trhy.",
    get: "Plán růstu",
    tags: ["Výpočet"],
    sample: "Osvědčení VISIBLE7 Gold",
  },
];

const INSIDE = [
  { icon: PlayCircle, value: "100+", label: "videonávodů, kde je vidět každé kliknutí" },
  { icon: Sparkles, value: "7", label: "AI asistentů napojených na vaše čísla" },
  { icon: Calculator, value: "5", label: "kalkulaček: finanční plán, daně, PNO, cash-flow, nábor" },
  { icon: Layers, value: "13", label: "typů online byznysu s hotovým postupem" },
];

const SHOWCASE = [
  {
    eyebrow: "Byznys case s AI",
    title: "Finanční plán na 24 měsíců hotový za odpoledne",
    text: "AI navrhne ceny, marže a náklady obvyklé ve vašem oboru a vysvětlí proč. Vy jen potvrdíte nebo přepíšete. Spočítáme potřebný kapitál, bod zvratu i maximální cenu za zákazníka.",
    cta: "Vyzkoušet zdarma",
    image: "/landing/ukazka-byznys-case.webp",
    alt: "Byznys case: AI doporučuje marži a odchodovost s vysvětlením",
    width: 985,
    height: 310,
  },
  {
    eyebrow: "Marketing napojený na AI",
    title: "12 marketingových kanálů. AI vám řekne, kterými začít",
    text: "Meta, Google Ads, Sklik, srovnávače, e-mail, SEO, ChatGPT Ads a další. Aplikace je seřadí podle vašeho typu byznysu, zákazníka a rozpočtu. Ke každému kanálu máte postup krok za krokem, záznamy z přednášek, testovací rozpočet a maximální PNO z vašeho byznys casu, takže víte, kam dát peníze.",
    cta: "Najít moje kanály",
    image: "/landing/ukazka-marketing.webp",
    alt: "Doporučené marketingové kanály seřazené podle typu byznysu, hodnocení AI a rozpočtu",
    width: 1150,
    height: 389,
  },
  {
    eyebrow: "Mapa cesty A → D",
    title: "Zjistěte, kdy můžete dát výpověď",
    text: "Aplikace z vašich čísel spočítá, kdy přijdou první zákazníci, kdy vás projekt uživí a kdy unese prvního spolupracovníka. S každou úpravou plánu se mapa zpřesní.",
    cta: "Spočítat moji cestu",
    image: "/landing/ukazka-mapa-cesty.webp",
    alt: "Mapa cesty: dnes, první zákazníci, živí mě to, roste to beze mě",
    width: 1037,
    height: 430,
  },
];

const INSIDE_TAGS = [
  "Podnikatelský plán",
  "Business case v Excelu",
  "100+ videí",
  "AI asistent",
  "Web a e-shop",
  "Marketing a PPC",
  "Živnostenský úřad krok za krokem",
  "Daně a živnost v kostce",
  "Pracovní listy",
  "Poradci z praxe",
  "Živé semináře",
  "Osvědčení",
];

const CERT_STEPS: [string, string][] = [
  ["Brány 1–5", "osvědčení za každou fázi"],
  ["Po bráně 5", SPECIALIST_TITLE],
  ["Brány 6–7", "VISIBLE7 Gold za spuštěný projekt"],
  ["Volitelně", "státní profesní kvalifikace"],
];

const FAQ = [
  [
    "Je rentgen nápadu opravdu zdarma?",
    "Ano. Stačí registrace e-mailem, platební kartu nezadáváte. Zdarma jsou i brány 1 a 2.",
  ],
  [
    "Jak přesný je výsledek rentgenu?",
    "Je to první odhad z vašich odpovědí a obvyklých čísel v oboru, ne záruka. Ukáže, kde je nápad silný a co ověřit jako první. Se skutečnými čísly v bráně 3 se zpřesní.",
  ],
  [
    "Musím umět programovat nebo rozumět technice?",
    "Ne. Web nebo e-shop postavíte v hotovém nástroji, většinu technické práce udělá AI a na zbytek máte video, kde je vidět každé kliknutí.",
  ],
  [
    "Potřebuji na začátek hodně peněz?",
    "Ne. Začíná se tím, kolik si můžete dovolit ztratit. Aplikace spočítá, kolik opravdu potřebujete, a nejdřív ověříte zájem, teprve potom investujete.",
  ],
  [
    "Bojím se, že něco porušíme a přijde pokuta.",
    "Základní povinnosti (živnost, obchodní podmínky, GDPR) projdete krok za krokem a s poradcem, který se tomu věnuje každý den.",
  ],
  [
    "Prodávám službu, ne produkt. Hodí se to i pro mě?",
    "Ano. I službu jde zabalit do produktu s jasným rozsahem a cenou. Pak se dá propagovat a prodat. Funguje to i pro kamenné podniky, které chtějí přidat online prodej.",
  ],
  [
    "Co když ještě nemám nápad?",
    "Začněte bránou 1. Strategie modrého oceánu je přesně nástroj na to, jak najít místo, kde nebudete jen další z mnoha.",
  ],
  [
    "Jak pracuje AI s mými daty?",
    "AI vidí jen to, co do projektu napíšete, a jen když ji sami zavoláte. Data jsou uložena v EU.",
  ],
  [
    "Co jsou živé semináře?",
    "Každých 14 dní 90 minut online s lektory Edu Partners: AI, SEO, reklama, WordPress, affiliate a další. Výklad, práce na projektech účastníků a otázky. Jsou součástí členství, záznamy najdete v aplikaci.",
  ],
  ["Obnovuje se předplatné samo?", "Ne. Platíte jednorázově za zvolené období. Po jeho skončení vaše data zůstanou."],
  ["Mohu mít víc projektů?", "Ano. Každý projekt má vlastní cestu přes 7 bran."],
];

const TAG_STYLE: Record<Tag, string> = {
  AI: "bg-violet-100 text-violet-800",
  Video: "bg-sky-100 text-sky-800",
  Výpočet: "bg-emerald-100 text-emerald-800",
};

/** Živá ukázka cesty: brány se po načtení postupně otevírají. */
const HeroJourney = () => {
  const [open, setOpen] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setOpen(3);
      return;
    }
    const timers = [1, 2, 3].map((n) => setTimeout(() => setOpen(n), 500 + n * 750));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto w-full max-w-[340px] rounded-3xl bg-primary p-4 text-white shadow-[0_30px_60px_-30px_hsl(216_62%_24%/0.6)] sm:p-5 xl:mr-0">
      <div className="flex items-baseline justify-between gap-3 px-1">
        <p className="whitespace-nowrap text-sm font-semibold">Startér e-shopu</p>
        <p className="whitespace-nowrap text-xs text-white/60">{open} ze 7 bran</p>
      </div>
      <ol className="mt-3 space-y-1" aria-label="Ukázka cesty přes 7 bran">
        {GATES.map((g, i) => {
          const done = i < open;
          const current = i === open;
          const Icon = g.icon;
          return (
            <li
              key={g.name}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors duration-500 ${
                current ? "bg-white text-foreground" : done ? "bg-white/[0.07]" : ""
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-500 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-orange-500 text-white ring-[3px] ring-orange-200"
                      : "border border-white/30 text-white/60"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-semibold ${!done && !current ? "text-white/60" : ""}`}>
                  {g.name}
                </span>
                {(done || current) && (
                  <span className={`block truncate text-xs ${current ? "text-muted-foreground" : "text-white/60"}`}>
                    {current ? "Na řadě" : g.sample}
                  </span>
                )}
              </span>
              {done ? (
                <Icon className="h-4 w-4 shrink-0 text-white/50" />
              ) : current ? (
                <span className="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  Pokračovat
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      <div
        className={`mt-3 flex items-center gap-2.5 rounded-xl border border-amber-300/40 xl:[@media(max-height:760px)]:hidden bg-amber-400/10 px-2.5 py-2 transition-all duration-700 ${
          open >= 3 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        aria-hidden={open < 3}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-primary">
          <Award className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block whitespace-nowrap text-sm font-semibold">Osvědčení za 3 brány</span>
          <span className="block truncate text-xs text-white/60">Do CV i na LinkedIn</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">
          <Download className="h-3.5 w-3.5" />
          PDF
        </span>
      </div>
    </div>
  );
};

const Cta = ({
  onClick,
  children,
  light = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  light?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex h-14 items-center justify-center gap-2 rounded-xl px-7 text-base font-semibold transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 ${
      light ? "bg-white text-primary hover:bg-white/90" : "bg-orange-500 text-white hover:bg-orange-600"
    }`}
  >
    {children}
    <ArrowRight className="h-5 w-5" aria-hidden="true" />
  </button>
);

const VERBS = ["Vymyslete.", "Naučte se.", "Zkonzultujte.", "Vydělávejte."];

export const LauncherPage = ({ onAccessGranted }: LauncherPageProps) => {
  const shop = useShop();
  const offer = useFounderOffer();
  // Odkaz /#jak z jiné stránky: po načtení posunout na sekci.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 200);
    return () => clearTimeout(t);
  }, []);
  const photos = ADVISORS.filter((a) => a.photo).slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#poradci"
        className="flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary/90"
      >
        <Store className="hidden h-4 w-4 shrink-0 text-orange-300 sm:block" aria-hidden="true" />
        <span className="sm:hidden">Už podnikáte? Získejte zákazníky i online</span>
        <span className="hidden sm:inline">
          Už podnikáte offline? Poradci vám ukážou, kde vám online přinese nové zákazníky
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </a>
      <PublicHeader onStart={onAccessGranted} />

      <main id="top">
        {/* Hero */}
        {/* Lišta + menu + hero = jedna obrazovka (od md, kde je horní lišta na jeden řádek: 43 + 65 px). */}
        <section className="relative flex flex-col md:min-h-[calc(100svh-108px)]">
          <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-10 px-4 pb-6 pt-12 sm:px-8 md:pt-14 lg:px-12 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:gap-14 xl:py-6">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-orange-200 sm:rounded-full bg-orange-50 px-3.5 py-1.5 text-sm font-semibold text-orange-800">
                <Award className="h-4 w-4 shrink-0" aria-hidden="true" />
                Kompletní kurz online podnikání s AI
              </p>
              <h1 className="text-[2.1rem] font-extrabold leading-[1.05] tracking-[-0.035em] min-[400px]:text-[2.6rem] sm:text-6xl xl:text-[clamp(2.75rem,6.6vh,3.75rem)]">
                Otestujte svůj podnikatelský nápad do&nbsp;10&nbsp;minut.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Výuková videa krok za krokem, AI, která zná váš projekt, a poradci z praxe. Na konci nemáte jen
                certifikát, ale rozjetý projekt.
              </p>
              <div className="mt-8">
                <Cta onClick={onAccessGranted}>Otestovat nápad zdarma</Cta>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Stačí e-mail, bez platební karty. Výsledek do 10 minut.
              </p>
            </div>
            <div className="w-full">
              <HeroJourney />
            </div>
          </div>
          <div className="flex justify-center pb-5">
            <a
              href="#uvnitr"
              aria-label="Pokračovat dolů"
              className="scroll-cue flex h-12 w-12 items-center justify-center rounded-full border border-orange-300 bg-white text-orange-600 shadow-sm transition-colors hover:bg-orange-50"
            >
              <ChevronDown className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Co je uvnitř */}
        <section id="uvnitr" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-12">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
                {INSIDE.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-start gap-3">
                    <Icon className="mt-1 h-6 w-6 shrink-0 text-orange-600" aria-hidden="true" />
                    <div>
                      <dt className="sr-only">{label}</dt>
                      <dd className="text-2xl font-extrabold tracking-tight text-primary">{value}</dd>
                      <dd className="text-sm leading-snug text-muted-foreground">{label}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <ul className="mt-6 flex flex-wrap gap-2" aria-label="Co v aplikaci najdete">
                {INSIDE_TAGS.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground/80"
                  >
                    {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                Od tvůrců kurzů Edu Partners: přes 1 000 absolventů kurzů podnikání, vzděláváme od roku 2011, akreditace
                MŠMT a MPO. Metodika vyrostla z kurzů, ne od stolu.
              </p>
            </div>
          </div>
        </section>

        {/* Poradci */}
        <section id="poradci" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50 py-20 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-8 lg:px-12 md:grid-cols-[1fr_1.1fr]">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Když se zaseknete, zavoláte člověku
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  15 seniorních poradců z Edu Partners, kteří vlastní byznys sami rozjeli: marketing, finance, právo,
                  e-shopy i AI. Konzultace {CONSULTATION.minutes} minut, orientačně{" "}
                  {CONSULTATION.price.toLocaleString("cs-CZ")} Kč.
                </p>
              </div>
              <ul className="flex flex-wrap gap-3" aria-label="Seniorní poradci">
                {photos.map((a) => (
                  <li key={a.id} className="w-[calc(25%-0.6rem)] min-w-[4.5rem]">
                    <img
                      src={a.photo}
                      alt=""
                      loading="lazy"
                      className="aspect-square w-full rounded-2xl bg-muted object-cover object-top"
                    />
                    <p className="mt-1.5 truncate text-xs font-semibold">
                      {a.name.replace(/^(Mgr\.|Ing\.|Bc\.)( et Mgr\.)?\s/, "")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{a.focus}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Ukázky z aplikace */}
        <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-8 md:pt-28 lg:px-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Podnikatelský plán, kterému můžete věřit. Bez Excelu a bez teorie.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Každý krok je hotový výstup, ne lekce.</p>
          </div>
          {SHOWCASE.map((b, i) => (
            <div
              key={b.title}
              className="mt-16 grid grid-cols-1 items-center gap-10 md:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16"
            >
              <div className={i % 2 ? "lg:order-2" : ""}>
                <p className="text-sm font-bold uppercase tracking-[0.08em] text-orange-700">{b.eyebrow}</p>
                <h3 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.1rem]">
                  {b.title}
                </h3>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{b.text}</p>
                <button
                  type="button"
                  onClick={onAccessGranted}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  {b.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <figure className={i % 2 ? "lg:order-1" : ""}>
                <img
                  src={b.image}
                  alt={b.alt}
                  width={b.width}
                  height={b.height}
                  loading="lazy"
                  className="h-auto w-full rounded-2xl border border-border bg-card shadow-[0_24px_50px_-30px_hsl(216_62%_24%/0.5)]"
                />
                <figcaption className="mt-2 text-center text-xs text-muted-foreground">Ukázka z aplikace</figcaption>
              </figure>
            </div>
          ))}
        </section>

        <SavingsCalculator onStart={onAccessGranted} />

        {/* Proces: 7 bran */}
        <section id="jak" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-primary py-20 text-white md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-12">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div className="max-w-2xl">
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Sedm bran od nápadu po růst</h2>
                  <p className="mt-4 text-lg text-white/70">
                    Každá brána má jasný výstup. Další otevřete, až je ta předchozí hotová, takže nic důležitého
                    nepřeskočíte.
                  </p>
                </div>
                <ul className="flex gap-2 text-sm" aria-label="Legenda">
                  {(Object.keys(TAG_STYLE) as Tag[]).map((t) => (
                    <li key={t} className={`rounded-full px-3 py-1 font-semibold ${TAG_STYLE[t]}`}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <ol className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
                {GATES.map((g, i) => {
                  const Icon = g.icon;
                  return (
                    <li key={g.name} className={`flex flex-col bg-primary p-6 ${i === 6 ? "lg:col-span-2" : ""}`}>
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[hsl(var(--gate-copper))] text-lg font-bold">
                          {i + 1}
                        </span>
                        <Icon className="h-5 w-5 text-white/50" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 text-xl font-bold">{g.name}</h3>
                      <p className="mt-2 flex-1 text-white/70">{g.does}</p>
                      <p className="mt-5 text-sm text-white/50">Výstup</p>
                      <p className="font-semibold">{g.get}</p>
                      <div className="mt-4 flex gap-1.5">
                        {g.tags.map((t) => (
                          <span key={t} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TAG_STYLE[t]}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* Certifikace – krátce, celý program je na /certifikace */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[hsl(var(--gate-copper))] text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 lg:px-12 md:grid-cols-[1.2fr_1fr] md:py-20">
              <div>
                <p className="font-semibold text-white/80">Certifikace</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{SPECIALIST_TITLE}</h2>
                <p className="mt-4 text-lg text-white/85">
                  Za každou bránu osvědčení, po bráně 5 certifikace s přílohou obsahu programu. A kdo chce víc, může
                  složit zkoušku státem uznané profesní kvalifikace.
                </p>
                <Link
                  to="/certifikace"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[hsl(var(--gate-copper))] hover:bg-white/90"
                >
                  Celý program a osvědčení <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ol className="space-y-px overflow-hidden rounded-2xl bg-white/20">
                {CERT_STEPS.map(([when, what]) => (
                  <li key={when} className="flex gap-4 bg-[hsl(28_58%_34%)] p-4">
                    <span className="w-24 shrink-0 text-sm text-white/70">{when}</span>
                    <span className="font-semibold">{what}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Ceník – krátce, celý ceník je na /cenik */}
        <section id="cenik" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-8 lg:px-12 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Začněte zdarma. Celá cesta za {kc(shop.price)}.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Rentgen nápadu a brány 1 a 2 vyzkoušíte zdarma, bez platební karty. Členství odemkne všech 7 bran a živé
                semináře každých 14 dní. Platíte jednou na {monthsLabel(shop.months)}, nic se samo neobnovuje.{" "}
                {shop.anchor}
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Cta onClick={onAccessGranted}>Začít zdarma</Cta>
                <Link to="/cenik" className="px-2 font-semibold text-primary underline-offset-4 hover:underline">
                  Zobrazit celý ceník
                </Link>
              </div>
            </div>
            <dl className="divide-y divide-border rounded-2xl border border-border">
              {[
                ["Rentgen nápadu a brány 1–2", "0 Kč"],
                ["Zjistěte, jaký jste typ podnikatele, a získejte 3 dny zdarma", "0 Kč"],
                [`Členství na ${monthsLabel(shop.months)}: 7 bran a živé semináře`, `${kc(shop.price)}`],
              ].map(([name, price]) => (
                <div key={name} className="flex items-baseline justify-between gap-4 px-5 py-4">
                  <dt className="font-semibold">{name}</dt>
                  <dd className="whitespace-nowrap text-xl font-extrabold tracking-tight">{price}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 bg-orange-50 px-5 py-4">
                <dt className="min-w-0">
                  <span className="block font-semibold">Konzultace vašeho projektu, 20 minut</span>
                  <span className="block text-sm text-muted-foreground">
                    Probereme váš nápad a které řešení zvolit.{" "}
                    <a
                      href={FREE_CONSULT_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("free_consult_click", { from: "landing_cenik" })}
                      className="font-semibold text-orange-700 underline-offset-4 hover:underline"
                    >
                      Vybrat termín
                    </a>
                  </span>
                </dt>
                <dd className="whitespace-nowrap text-xl font-extrabold tracking-tight text-orange-700">Zdarma</dd>
              </div>
              <div className="space-y-1 px-5 py-3 text-sm text-muted-foreground">
                {offer && offer.left > 0 && (
                  <p className="font-semibold text-orange-800">
                    Startovací cena pro prvních {offer.seats} lidí a k ní 20 minut konzultace zdarma. Pak{" "}
                    {kc(offer.next_price)}.
                  </p>
                )}
                <p>vychází na {perMonth(shop)} měsíčně, včetně DPH</p>
                <p>Další konzultace se seniorními poradci nejsou součástí členství, platí se zvlášť.</p>
              </div>
            </dl>
          </div>
        </section>

        {/* Otázky */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50 py-20 md:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-8 lg:px-12">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Časté otázky</h2>
              <div className="mt-10 divide-y divide-border border-y border-border">
                {FAQ.map(([q, a]) => (
                  <details key={q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                      {q}
                      <span className="text-2xl font-normal text-muted-foreground transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-muted-foreground">{a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Závěr */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-primary text-white">
            <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-8 lg:px-12 md:py-28">
              <p className="text-lg text-white/60">Fortuna audaces iuvat</p>
              <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                Štěstí přeje odvážným. A připraveným.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
                Za 10 minut zjistíte, jestli má váš nápad místo na trhu. Zdarma.
              </p>
              <div className="mt-10">
                <Cta onClick={onAccessGranted} light>
                  Otestovat nápad zdarma
                </Cta>
              </div>
              <p className="mt-6 text-sm text-white/50">
                Už máte účet?{" "}
                <Link to="/home" className="font-semibold text-white underline-offset-4 hover:underline">
                  Přihlaste se
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer variant="full" />
    </div>
  );
};
