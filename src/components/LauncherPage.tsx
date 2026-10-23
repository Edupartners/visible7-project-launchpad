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
  Check,
  Layers,
  Lightbulb,
  Play,
  Rocket,
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

const STEPS = [
  { title: "Test nápadu", meta: "10 minut · zdarma", text: "Uvidíte, kde je váš nápad silný a co ověřit jako první." },
  { title: "Brány 1–2", meta: "zdarma", text: "Ujasníte si, pro koho to je a jak bude byznys fungovat." },
  { title: "Celá cesta", meta: "PRICE", text: "Čísla, web, marketing a spuštění. S videi, AI a poradci." },
];

const FAIL_REASONS: [string, string][] = [
  [
    "Chybí technické dovednosti",
    "Videa krok za krokem, kde je vidět každé kliknutí. Většinu technické práce udělá AI.",
  ],
  [
    "Nevědí, jak nastavit marketing",
    "Kanály vybrané pro váš typ byznysu, testovací rozpočet a postup ke každému z nich.",
  ],
  [
    "Mají mylnou představu o velikosti podnikání",
    "Plán z vašich čísel: kolik opravdu potřebujete a kdy vás projekt uživí.",
  ],
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

const CERT_STEPS: [string, string][] = [
  ["Brány 1–5", "osvědčení za každou fázi"],
  ["Po bráně 5", SPECIALIST_TITLE],
  ["Brány 6–7", "VISIBLE7 Gold za spuštěný projekt"],
  ["Volitelně", "státní profesní kvalifikace"],
];

const FAQ = [
  [
    "Je test nápadu opravdu zdarma?",
    "Ano. Stačí registrace e-mailem, platební kartu nezadáváte. Zdarma jsou i brány 1 a 2.",
  ],
  [
    "Jak přesný je výsledek testu nápadu?",
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

/** Úvodní video s Michalem. Dokud není natočené, ukazujeme fotku a štítek „připravujeme“. */
const HERO_VIDEO_EMBED = "";

const HeroVideo = ({ photo }: { photo?: string }) => {
  const [playing, setPlaying] = useState(false);
  if (playing && HERO_VIDEO_EMBED)
    return (
      <div className="aspect-video w-full overflow-hidden rounded-3xl bg-black">
        <iframe
          src={`${HERO_VIDEO_EMBED}?autoplay=1`}
          title="Jak VISIBLE7 funguje"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-primary shadow-[0_40px_80px_-40px_hsl(216_62%_24%/0.6)] sm:aspect-[16/8]">
      {photo && (
        <img
          src={photo}
          alt="Michal Míček, autor metodiky VISIBLE7 MICEK®"
          className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 flex justify-center p-4 sm:p-7">
        <button
          type="button"
          disabled={!HERO_VIDEO_EMBED}
          onClick={() => {
            setPlaying(true);
            track("hero_video_play", {});
          }}
          className="flex min-h-11 items-center gap-3 rounded-full bg-[hsl(216_40%_13%/0.88)] py-2 pl-2 pr-5 text-left text-sm text-white backdrop-blur transition-colors hover:bg-[hsl(216_40%_13%)] disabled:cursor-default sm:text-base"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500">
            <Play className="h-4 w-4 fill-white text-white" aria-hidden="true" />
          </span>
          <span>
            <strong className="font-semibold">Michal ukazuje, jak VISIBLE7 funguje</strong>
            <span className="ml-2 text-white/70">{HERO_VIDEO_EMBED ? "~2 min" : "video připravujeme"}</span>
          </span>
        </button>
      </div>
    </div>
  );
};

const TRUST: [string, string][] = [
  ["Od roku 2011", "učíme podnikat (Edu Partners)"],
  ["1 000+ absolventů", "kurzů podnikání"],
  ["16+ poradců", "seniorních, z praxe"],
];

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
  const author = ADVISORS.find((a) => a.name.includes("Míček"));
  // Odkaz /#jak z jiné stránky: po načtení posunout na sekci.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 200);
    return () => clearTimeout(t);
  }, []);
  const photos = ADVISORS.filter((a) => a.photo).slice(0, 8);
  // Úvodní stránka má o kousek větší písmo než aplikace (18 px místo 17 px), vše v rem se zvětší úměrně.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.fontSize;
    html.style.fontSize = "112.5%";
    return () => {
      html.style.fontSize = prev;
    };
  }, []);

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
        {/* Hero: na střed, důvěra nahoře, pod ním velké video s Michalem */}
        <section className="bg-muted/50 px-4 pb-16 pt-10 sm:px-8 sm:pt-12 md:pb-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <ul className="flex flex-wrap justify-center gap-x-10 gap-y-3" aria-label="Proč nám věřit">
              {TRUST.map(([strong, rest]) => (
                <li key={strong} className="flex flex-col items-center leading-tight">
                  <span className="font-bold text-primary">{strong}</span>
                  <span className="text-sm text-muted-foreground">{rest}</span>
                </li>
              ))}
            </ul>
            <p className="mt-9 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-primary">
              <Award className="h-4 w-4 shrink-0 text-orange-600" aria-hidden="true" />
              Kompletní kurz online podnikání s AI
            </p>
            <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.035em] min-[400px]:text-[2.8rem] sm:text-7xl lg:text-[5rem]">
              Otestujte svůj podnikatelský nápad do&nbsp;10&nbsp;minut.
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground sm:text-[1.375rem]">
              100+ videonávodů krok za krokem. Naučíte se rozjet byznys kvalifikovaně, od nápadu až po první zákazníky.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Cta onClick={onAccessGranted}>Otestovat nápad zdarma</Cta>
              <a
                href="#video"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border-2 border-primary px-6 text-base font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Jak to funguje
                <Play className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Test nápadu a brány 1–2 ze 7 zdarma · pro registraci stačí e-mail
            </p>
          </div>
          <div id="video" className="mx-auto mt-14 max-w-6xl scroll-mt-24">
            <HeroVideo photo={author?.photo} />
          </div>
        </section>

        {/* Co vás čeká */}
        <section id="uvnitr" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 lg:px-12">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Co vás čeká</h2>
              <ol className="mt-6 grid gap-4 md:grid-cols-3">
                {STEPS.map((st, i) => (
                  <li key={st.title} className="flex gap-4 rounded-2xl bg-background p-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-bold">{st.title}</p>
                      <p className="text-sm font-semibold text-orange-700">
                        {st.meta === "PRICE" ? kc(shop.price) : st.meta}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{st.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
                Od tvůrců kurzů Edu Partners: přes 1 000 absolventů kurzů podnikání, vzděláváme od roku 2011, akreditace
                MŠMT a MPO. Metodika vyrostla z kurzů, ne od stolu.
              </p>
            </div>
          </div>
        </section>

        {/* Proč projekty krachují + slovo autora */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:py-24 lg:px-12">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-14">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Proč projekty krachují</h2>
              <p className="mt-3 text-lg text-muted-foreground">A jak tomu předejít.</p>
              <ul className="mt-8 space-y-5">
                {FAIL_REASONS.map(([why, fix]) => (
                  <li key={why} className="border-l-4 border-orange-400 pl-4">
                    <p className="font-bold">{why}</p>
                    <p className="mt-1 text-muted-foreground">{fix}</p>
                  </li>
                ))}
              </ul>
            </div>
            <figure className="self-start rounded-3xl bg-primary p-7 text-white sm:p-9">
              <blockquote className="text-lg leading-relaxed text-white/90">
                „Lidé k nám přicházejí s představou, že podnikání není pro ně. Odcházejí s tím, že vědí, jak začít, a
                zvládnou to sami. Většina kurzů má osnovu a všichni se jí musí podřídit. U nás je to naopak: cesta se
                ohne podle vás. A nejde o to mít peníze na velkou věc. Začněte s málem, škálujte až potom.“
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-4">
                {author?.photo && (
                  <img
                    src={author.photo}
                    alt=""
                    loading="lazy"
                    className="h-14 w-14 rounded-full bg-white/10 object-cover object-top"
                  />
                )}
                <span>
                  <span className="block font-bold">Michal Míček</span>
                  <span className="block text-sm text-white/70">autor metodiky VISIBLE7 MICEK®</span>
                </span>
              </figcaption>
            </figure>
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
                  16+ seniorních poradců z praxe, kteří vlastní byznys sami rozjeli: marketing, finance, právo, e-shopy
                  i AI. Konzultace {CONSULTATION.minutes} minut, orientačně {CONSULTATION.price.toLocaleString("cs-CZ")}{" "}
                  Kč.
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
                    Jdete krok za krokem. Výstup každé brány otevře tu další, takže nic důležitého nepřeskočíte.
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
              <ol className="relative mt-12 grid gap-y-3 lg:grid-cols-7 lg:gap-x-3">
                <span
                  className="absolute left-[1.375rem] top-6 bottom-6 w-0.5 bg-gradient-to-b from-[hsl(var(--gate-copper))] to-white/25 lg:left-[7%] lg:right-[7%] lg:top-[1.375rem] lg:bottom-auto lg:h-0.5 lg:w-auto lg:bg-gradient-to-r"
                  aria-hidden="true"
                />
                {GATES.map((g, i) => (
                  <li key={g.name} className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-0 lg:text-center">
                    <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--gate-copper))] text-lg font-extrabold shadow-[0_0_0_5px_hsl(var(--primary))]">
                      {i + 1}
                    </span>
                    <div className="lg:mt-4">
                      <h3 className="font-bold leading-tight lg:text-lg">
                        {g.name}
                        {i < 2 && <span className="ml-1.5 text-xs font-semibold text-emerald-300">zdarma</span>}
                      </h3>
                      <p className="mt-1 text-sm text-white/65">
                        <Check className="mr-1 inline h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                        {g.get}
                      </p>
                      <div className="mt-2 flex gap-1 lg:justify-center">
                        {g.tags.map((t) => (
                          <span
                            key={t}
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TAG_STYLE[t]}`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-8 grid gap-3 text-sm font-semibold lg:grid-cols-7 lg:gap-x-3">
                <p className="flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--gate-copper))] px-4 py-2 lg:col-span-5">
                  <Award className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Brány 1–5: certifikace {SPECIALIST_TITLE}
                </p>
                <p className="flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 ring-1 ring-white/25 lg:col-span-2">
                  <Award className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Brány 6–7: VISIBLE7 Gold
                </p>
              </div>
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
                Test nápadu a brány 1 a 2 vyzkoušíte zdarma, bez platební karty. Členství odemkne všech 7 bran a živé
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
                ["Test nápadu (10 minut) a brány 1–2", "0 Kč"],
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
                  <span className="block font-semibold">Úvodní konzultace s expertem, 20 minut</span>
                  <span className="block text-sm text-muted-foreground">
                    Online videohovor bez závazku: projdeme váš nápad a doporučíme, kterou cestou jít.{" "}
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
