import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import { ADVISORS, CONSULTATION } from "@/lib/advisors";
import { PLANS } from "@/lib/pricing";
import { REFERENCES } from "@/lib/references";
import { NSK_QUALIFICATION } from "@/lib/qualification";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  FileSpreadsheet,
  FileText,
  Layers,
  Lightbulb,
  Linkedin,
  Minus,
  PlayCircle,
  Rocket,
  Sparkles,
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
    name: "Modrý oceán",
    icon: Target,
    does: "Najdete místo mezi levnou a prémiovou konkurencí.",
    get: "Křivka hodnoty a USP",
    tags: ["Video"],
    sample: "USP: e-shop za víkend bez programátora",
  },
  {
    name: "Lean Canvas",
    icon: Lightbulb,
    does: "Celý byznys na jedné stránce. AI navrhne texty a ohodnotí je.",
    get: "Lean Canvas a typ byznysu",
    tags: ["AI"],
    sample: "AI: doporučený typ – online kurz",
  },
  {
    name: "Byznys case",
    icon: TrendingUp,
    does: "Příjmy, náklady a marketing na 24 měsíců. AI odhadne obvyklá čísla.",
    get: "Potřebný kapitál, bod zvratu, PNO",
    tags: ["AI", "Výpočet"],
    sample: "Bod zvratu: 6. měsíc",
  },
  {
    name: "Tvorba",
    icon: Wrench,
    does: "Postup a nástroje pro váš typ byznysu: web, e-shop, kurz, předplatné…",
    get: "Plán tvorby krok za krokem",
    tags: ["Video"],
    sample: "Video: jak spustit e-shop",
  },
  {
    name: "Marketing a testování",
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
    name: "Růst",
    icon: Layers,
    does: "Když projekt běží: automatizace, tým a další trhy.",
    get: "Plán růstu",
    tags: ["Výpočet"],
    sample: "Osvědčení VISIBLE7 Gold",
  },
];

const MYTHS = [
  [
    "Potřebuji na začátek hodně peněz.",
    "Začíná se tím, kolik si můžete dovolit ztratit. Aplikace spočítá, kolik opravdu potřebujete.",
  ],
  ["Nerozumím technice.", "Většinu technické práce dnes udělá AI. Na zbytek máte video, kde je vidět každé kliknutí."],
  ["Musí to být dokonalé, než začnu.", "Spouští se hotový základ. Dokonalost přijde s prvními zákazníky."],
  [
    "Bojím se, že něco porušíme a přijde pokuta.",
    "Základní povinnosti projdete s poradcem, který se tomu věnuje každý den.",
  ],
  ["Postavím to rovnou ve velkém.", "Nejdřív ověříte, že o produkt je zájem. Teprve potom investujete."],
  [
    "Prodávám službu, ne produkt.",
    "I službu jde zabalit do produktu s jasným rozsahem a cenou. Pak se dá propagovat a prodat.",
  ],
];

/** 1 = ano, 0.5 = částečně, 0 = ne */
const COMPARE: { row: string; values: [number, number, number, number] }[] = [
  { row: "Postup krok za krokem od nápadu po spuštění", values: [1, 1, 0, 0.5] },
  { row: "AI napojená na metodiku a čísla vašeho projektu", values: [1, 0, 0.5, 0] },
  { row: "Video ukáže, kam přesně kliknout", values: [1, 1, 0, 0] },
  { row: "Finanční plán na 24 měsíců z vašich čísel", values: [1, 0, 0.5, 1] },
  { row: "Živý poradce, když se zaseknete", values: [1, 0, 0, 1] },
  { row: "Pitch na A4 pro investora nebo banku", values: [1, 0, 0.5, 1] },
  { row: "Osvědčení za každý splněný krok", values: [1, 1, 0, 0] },
  { row: "Cesta ke státem uznané profesní kvalifikaci", values: [1, 0.5, 0, 0] },
];

const OUTPUTS = [
  { icon: Lightbulb, title: "Lean Canvas", text: "Celý byznys na jedné stránce, zkontrolovaný AI." },
  { icon: FileSpreadsheet, title: "Byznys case v Excelu", text: "Živé vzorce: změníte cenu a přepočítá se celý plán." },
  { icon: FileText, title: "Pitch na jednu A4", text: "Pro investora, banku nebo partnera. Stáhnete jako PDF." },
  { icon: Linkedin, title: "Osvědčení za každou bránu", text: "S ověřovacím kódem, rovnou na LinkedIn." },
];

const FAQ = [
  [
    "Musím umět programovat?",
    "Ne. Aplikace počítá s tím, že web nebo e-shop postavíte v hotovém nástroji. Videa ukazují každé kliknutí.",
  ],
  [
    "Co když ještě nemám nápad?",
    "Začněte bránou 1. Modrý oceán je přesně nástroj na to, jak najít místo, kde nebudete jen další z mnoha.",
  ],
  [
    "Jak pracuje AI s mými daty?",
    "AI vidí jen to, co do projektu napíšete, a jen když ji sami zavoláte. Data jsou uložena v EU.",
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
    <div className="rounded-[28px] bg-primary p-5 text-white shadow-[0_30px_60px_-30px_hsl(216_62%_24%/0.6)] sm:p-7">
      <div className="flex items-center justify-between">
        <p className="font-semibold">Startér e-shopu</p>
        <p className="text-sm text-white/60">Otevřeno {open} ze 7 bran</p>
      </div>
      <ol className="mt-5 space-y-1.5" aria-label="Ukázka cesty přes 7 bran">
        {GATES.map((g, i) => {
          const done = i < open;
          const current = i === open;
          const Icon = g.icon;
          return (
            <li
              key={g.name}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-500 ${
                current ? "bg-white text-foreground" : done ? "bg-white/[0.07]" : ""
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-orange-500 text-white ring-4 ring-orange-200"
                      : "border border-white/30 text-white/60"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
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
                <span className="shrink-0 rounded-full bg-orange-500 px-2.5 py-1 text-xs font-semibold text-white">
                  Pokračovat
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
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

export const LauncherPage = ({ onAccessGranted }: LauncherPageProps) => {
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
      <PublicHeader onStart={onAccessGranted} />

      <main id="top">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h1 className="text-[2.6rem] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
              Postavte online byznys podle plánu, ne&nbsp;podle pocitu.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Aplikace vás provede sedmi branami od nápadu po první zákazníky. AI navrhne texty a čísla, videa ukážou,
              kam kliknout, a finanční plán spočítá, kolik potřebujete a kdy začnete vydělávat.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Cta onClick={onAccessGranted}>Začít zdarma</Cta>
              <a href="#jak" className="px-2 font-semibold text-primary underline-offset-4 hover:underline">
                Jak to funguje
              </a>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Brána 1 a 2 zdarma, bez platební karty.</p>
          </div>
          <HeroJourney />
        </section>

        {/* Důvěra */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50">
            <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-6 px-4 py-8 sm:px-6 md:grid-cols-4">
              {[
                ["1 000+", "absolventů kurzů podnikání"],
                ["14 let", "praxe v e-commerce a vzdělávání"],
                ["15", "seniorních poradců z praxe"],
                ["MŠMT a MPO", "akreditace Edu Partners"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-2xl font-extrabold tracking-tight text-primary">{v}</dd>
                  <dd className="text-sm text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Mýty */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Většinu nápadů nezabije trh, ale strach
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Za deset let kurzů jsme slyšeli pořád stejné důvody, proč lidé nezačnou. Žádný z nich neobstojí.
            </p>
          </div>
          <dl className="mt-12 divide-y divide-border border-y border-border">
            {MYTHS.map(([myth, truth]) => (
              <div key={myth} className="grid gap-2 py-6 md:grid-cols-[1fr_1.3fr] md:gap-10">
                <dt className="text-lg font-semibold text-muted-foreground line-through decoration-orange-400/70 decoration-2">
                  {myth}
                </dt>
                <dd className="text-lg leading-relaxed">{truth}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Čím je jiná */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50 py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Metodika, AI, videa a finanční plán v jedné aplikaci
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Kurz vám dá teorii, ChatGPT odpovědi bez souvislostí a konzultant drahé hodiny. VISIBLE7 spojuje
                  všechno do jedné cesty, která si pamatuje váš projekt.
                </p>
              </div>
              <div className="mt-12 overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-border text-sm">
                      <th className="w-[40%] p-4 font-semibold text-muted-foreground sm:p-5" scope="col">
                        <span className="sr-only">Co dostanete</span>
                      </th>
                      <th className="bg-primary p-4 text-center font-bold text-white sm:p-5" scope="col">
                        VISIBLE7
                      </th>
                      {["Online kurz", "ChatGPT", "Konzultant"].map((h) => (
                        <th key={h} className="p-4 text-center font-semibold text-muted-foreground sm:p-5" scope="col">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map(({ row, values }) => (
                      <tr key={row} className="border-b border-border last:border-0">
                        <th scope="row" className="p-4 font-medium sm:p-5">
                          {row}
                        </th>
                        {values.map((v, i) => (
                          <td key={i} className={`p-4 text-center sm:p-5 ${i === 0 ? "bg-primary/[0.04]" : ""}`}>
                            {v === 1 ? (
                              <Check
                                className={`mx-auto h-5 w-5 ${i === 0 ? "text-emerald-600" : "text-muted-foreground"}`}
                                strokeWidth={3}
                                aria-label="ano"
                              />
                            ) : v > 0 ? (
                              <span className="text-xs font-semibold text-muted-foreground">částečně</span>
                            ) : (
                              <Minus className="mx-auto h-5 w-5 text-border" aria-label="ne" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Proces: 7 bran */}
        <section id="jak" className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-primary py-20 text-white md:py-28">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
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

        {/* Výstupy */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Na konci máte v ruce věci, které můžete ukázat
          </h2>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {OUTPUTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--gate-copper)/0.12)] text-[hsl(var(--gate-copper))]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className="mt-1 text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-border p-6">
            <Sparkles className="h-6 w-6 text-violet-600" aria-hidden="true" />
            <p className="flex-1 text-muted-foreground">
              <span className="font-semibold text-foreground">AI pracuje s vaším projektem, ne s obecnými radami.</span>{" "}
              Návrhy z Lean Canvasu použije pro čísla v byznys casu a z obojího napíše pitch.
            </p>
            <Calculator className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            <PlayCircle className="h-6 w-6 text-sky-600" aria-hidden="true" />
          </div>
        </section>

        {/* Reference */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-start">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Metodiku učíme deset let</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                VISIBLE7 je základem kurzu Specialista internetového obchodu v Edu Partners a firemních školení.
                Aplikace z ní dělá postup, kterým projdete sami a svým tempem.
              </p>
            </div>
            {REFERENCES.length > 0 ? (
              <ul className="grid gap-6">
                {REFERENCES.slice(0, 3).map((r) => (
                  <li key={r.name} className="border-l-4 border-[hsl(var(--gate-copper))] pl-5">
                    <blockquote className="text-lg leading-relaxed">„{r.quote}“</blockquote>
                    <p className="mt-3 flex items-center gap-3 text-sm">
                      {r.photo && <img src={r.photo} alt="" className="h-9 w-9 rounded-full object-cover" />}
                      <span>
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-muted-foreground">, {r.role}</span>
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
                {[
                  [
                    "Specialista internetového obchodu",
                    "Rekvalifikační kurz Edu Partners postavený na metodice VISIBLE7",
                  ],
                  ["Firemní školení", "E-commerce, digitální marketing a AI pro týmy firem"],
                  ["1 000+ absolventů", "Lidé, kteří prošli kurzy podnikání a e-commerce"],
                  ["Od roku 2011", "Edu Partners s akreditací MŠMT a MPO"],
                ].map(([t, d]) => (
                  <div key={t} className="bg-card p-6">
                    <dt className="font-bold">{t}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{d}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {/* Poradci */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50 py-20 md:py-24">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr]">
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

        {/* Profesní kvalifikace NSK */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-[hsl(var(--gate-copper))] text-white">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr] md:py-20">
              <div>
                <p className="font-semibold text-white/80">Navíc po bráně 4</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Z aplikace ke státem uznané kvalifikaci
                </h2>
                <p className="mt-4 text-lg text-white/85">
                  Kdo projde branou 4, může se přihlásit ke zkoušce profesní kvalifikace{" "}
                  <strong>{NSK_QUALIFICATION.name}</strong>. Zkoušku pořádá Edu Partners jako autorizovaná osoba.
                  Osvědčení o profesní kvalifikaci je státem uznané.
                </p>
                <a
                  href={NSK_QUALIFICATION.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-block font-semibold underline underline-offset-4 hover:no-underline"
                >
                  Kvalifikace v Národní soustavě kvalifikací
                </a>
              </div>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/20">
                {[
                  ["Kód kvalifikace", NSK_QUALIFICATION.code],
                  ["Úroveň", `EQF ${NSK_QUALIFICATION.eqf}`],
                  ["Uznává", "Národní soustava kvalifikací"],
                  ["Přihlášení", `po bráně ${NSK_QUALIFICATION.unlockGate}`],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[hsl(28_58%_34%)] p-5">
                    <dt className="text-sm text-white/70">{l}</dt>
                    <dd className="mt-1 text-xl font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Ceník – krátce, celý ceník je na /cenik */}
        <section id="cenik" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6 md:py-28">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Začněte zdarma. Celá cesta od 350 Kč.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Brána 1 a 2 jsou zdarma napořád. Za další brány platíte jednorázově za zvolené období, nic se samo
                neobnovuje.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Cta onClick={onAccessGranted}>Začít zdarma</Cta>
                <Link to="/cenik" className="px-2 font-semibold text-primary underline-offset-4 hover:underline">
                  Zobrazit celý ceník
                </Link>
              </div>
            </div>
            <dl className="divide-y divide-border rounded-2xl border border-border">
              {PLANS.map((p) => (
                <div key={p.name} className="flex items-baseline justify-between gap-4 px-5 py-4">
                  <dt className="font-semibold">{p.name}</dt>
                  <dd className="text-xl font-extrabold tracking-tight">{p.price}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Autor */}
        <section className="border-t border-border">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[0.8fr_1.2fr] md:py-24">
            <img
              src="https://www.edu-partners.cz/wp-content/uploads/2026/05/michal_micek_edu-scaled-1-1024x766.jpeg"
              alt="Michal Míček"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-3xl bg-muted object-cover"
            />
            <div>
              <blockquote className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                „Podnikat se dá s málem. Nejdřív se dívejte, kolik můžete ztratit, ne kolik vyděláte.“
              </blockquote>
              <p className="mt-6 font-semibold">Mgr. Michal Míček, LL.M.</p>
              <p className="text-muted-foreground">
                Autor metodiky VISIBLE7 MICEK™, zakladatel Edu Partners. Přes 14 let v e-commerce, fintechu a
                vzdělávání.
              </p>
              <a
                href="https://visible7.cz"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block font-semibold text-primary underline-offset-4 hover:underline"
              >
                Více o metodice na visible7.cz
              </a>
            </div>
          </div>
        </section>

        {/* Otázky */}
        <section className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50 py-20 md:py-24">
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
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
        <section className="scroll-mt-20 px-3 py-2 sm:px-5">
          <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-primary text-white">
            <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-28">
              <p className="text-lg text-white/60">Fortuna audaces iuvat</p>
              <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
                Štěstí přeje odvážným. A připraveným.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
                Projděte první dvě brány zdarma a uvidíte, jestli má váš nápad místo na trhu.
              </p>
              <div className="mt-10">
                <Cta onClick={onAccessGranted} light>
                  Začít zdarma
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

      <Footer />
    </div>
  );
};
