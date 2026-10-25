import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown, Play } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { ADVISORS } from "@/lib/advisors";
import { track } from "@/lib/track";

export interface FeatureRow {
  eyebrow: string;
  title: string;
  text: ReactNode;
  image: string;
  alt: string;
  points?: string[];
}

export interface FeaturePageData {
  /** Krátký název funkce, slouží i pro měření. */
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: ReactNode;
  lead: string;
  cta: string;
  /** Řádek pod tlačítkem (cena, co je zdarma). */
  note: string;
  heroImage: string;
  heroAlt: string;
  /** Plovoucí karta s čísly v úvodu, nejvýš 2–3 řádky. */
  heroStats?: [string, string][];
  problemTitle: string;
  problems: { title: string; text: string }[];
  problemNote?: string;
  rowsTitle?: string;
  rows?: FeatureRow[];
  /** Vlastní blok místo řádků se snímky nebo za nimi (např. formulář čekací listiny). */
  extra?: ReactNode;
  /** Vlastní blok zařadit před řádky se snímky (hned za problém). */
  extraFirst?: boolean;
  /** Citace uprostřed stránky, jen skutečná. */
  quote?: { text: string; author: string; role: string };
  positioningTitle: string;
  positioningText: string;
  helpTitle: string;
  help: { title: string; text: string }[];
  finalTitle: string;
  faq: [string, string][];
}

const TRUST: [string, string][] = [
  ["Od roku 2011", "učíme podnikat (Edu Partners)"],
  ["1 000+ absolventů", "kurzů podnikání"],
  ["16+ poradců", "seniorních, z praxe"],
];

/**
 * Šablona podstránky jedné funkce (po vzoru produktových stránek LivePlanu):
 * úvod se snímkem, pruh důvěry, problém, střídavé řádky se snímky, pozicování, pomoc, výzva a časté otázky.
 */
export const FeaturePage = ({ d }: { d: FeaturePageData }) => {
  const navigate = useNavigate();
  const start = () => {
    track("feature_cta_click", { page: d.slug });
    navigate("/home?novy");
  };
  const author = ADVISORS.find((a) => a.name.includes("Míček"));

  useEffect(() => {
    document.title = d.metaTitle;
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute("content", d.metaDescription);
    window.scrollTo(0, 0);
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, [d]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={start} />
      <main>
        {/* Úvod: vlevo text, vpravo zelený panel se snímkem aplikace, kartou s čísly a fotkou (jako LivePlan) */}
        <section className="relative overflow-hidden bg-background">
          <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[44%] bg-leaf-500 lg:block" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.12em] text-leaf-700">{d.eyebrow}</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl lg:text-[3.25rem]">
                {d.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{d.lead}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-leaf-500 px-7 text-base font-semibold text-white transition-colors hover:bg-leaf-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
                >
                  {d.cta} <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <a
                  href="#ukazka"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-leaf-500 px-6 text-base font-semibold text-leaf-700 transition-colors hover:bg-leaf-50"
                >
                  Jak to funguje <Play className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{d.note}</p>
            </div>
            <div className="rounded-3xl bg-leaf-500 px-5 py-10 sm:px-10 lg:rounded-none lg:bg-transparent lg:p-0">
              <div className="relative mx-auto max-w-[520px] pb-16 pt-10 lg:ml-auto lg:mr-0">
                <img
                  src={d.heroImage}
                  alt={d.heroAlt}
                  className="w-[92%] rounded-2xl bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.45)]"
                />
                {d.heroStats && (
                  <div className="absolute right-0 top-0 rounded-2xl bg-white px-5 py-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]">
                    {d.heroStats.map(([label, value]) => (
                      <p key={label} className="leading-tight [&+p]:mt-3">
                        <span className="block text-xs font-semibold text-muted-foreground">{label}</span>
                        <span className="text-xl font-extrabold tracking-tight text-foreground">{value}</span>
                      </p>
                    ))}
                  </div>
                )}
                {author?.photo && (
                  <img
                    src={author.photo}
                    alt="Michal Míček, autor metodiky VISIBLE7 MICEK®"
                    className="absolute bottom-0 right-2 h-28 w-28 rounded-2xl object-cover object-top shadow-[0_20px_40px_-15px_rgba(0,0,0,0.45)] ring-4 ring-white sm:h-32 sm:w-32"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pruh důvěry */}
        <section aria-label="Proč nám věřit" className="bg-primary text-white">
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-14 gap-y-4 px-4 py-6 sm:px-8 lg:px-12">
            {TRUST.map(([strong, rest]) => (
              <li key={strong} className="flex flex-col items-center leading-tight sm:items-start">
                <span className="font-bold">{strong}</span>
                <span className="text-sm text-white/70">{rest}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Problém */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:py-24 lg:px-12">
          <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            {d.problemTitle}
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {d.problems.map((p) => (
              <li key={p.title} className="rounded-2xl border border-border bg-card p-6">
                <p className="text-lg font-bold">{p.title}</p>
                <p className="mt-2 text-muted-foreground">{p.text}</p>
              </li>
            ))}
          </ul>
          {d.problemNote && <p className="mt-8 text-center text-lg font-semibold text-leaf-700">{d.problemNote}</p>}
        </section>

        {d.extra && d.extraFirst && <div className="scroll-mt-20">{d.extra}</div>}

        {/* Řádky se snímky */}
        {d.rows && d.rows.length > 0 && (
          <section id="ukazka" className="scroll-mt-20 bg-muted/40 py-16 md:py-24">
            <h2 className="mx-auto max-w-3xl px-4 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
              {d.rowsTitle}
            </h2>
            <div className="mx-auto mt-14 max-w-6xl space-y-20 px-4 sm:px-8 md:space-y-28 lg:px-12">
              {d.rows.map((r, i) => (
                <div key={r.title} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <div className={i % 2 ? "lg:order-2" : ""}>
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-leaf-700">{r.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">{r.title}</h3>
                    <div className="mt-4 text-lg leading-relaxed text-muted-foreground">{r.text}</div>
                    {r.points && (
                      <ul className="mt-5 space-y-2">
                        {r.points.map((p) => (
                          <li key={p} className="flex gap-2.5">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <figure className={i % 2 ? "lg:order-1" : ""}>
                    <img
                      src={r.image}
                      alt={r.alt}
                      loading="lazy"
                      className="w-full rounded-2xl bg-card shadow-[0_30px_60px_-35px_hsl(160_61%_15%/0.5)]"
                    />
                  </figure>
                </div>
              ))}
            </div>
          </section>
        )}

        {d.extra && !d.extraFirst && (
          <div id={d.rows?.length ? undefined : "ukazka"} className="scroll-mt-20">
            {d.extra}
          </div>
        )}

        {/* Citace */}
        {d.quote && (
          <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-8 md:py-20">
            <figure>
              <blockquote className="text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                „{d.quote.text}“
              </blockquote>
              <figcaption className="mt-6 flex items-center justify-center gap-3 text-muted-foreground">
                {author?.photo && d.quote.author.includes("Míček") && (
                  <img src={author.photo} alt="" className="h-12 w-12 rounded-full object-cover object-top" />
                )}
                <span>
                  <strong className="text-foreground">{d.quote.author}</strong> · {d.quote.role}
                </span>
              </figcaption>
            </figure>
          </section>
        )}

        {/* Pozicování */}
        <section className="px-3 py-2 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1280px] rounded-[2rem] bg-primary px-4 py-16 text-center text-white sm:px-8 md:py-20">
            <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl">
              {d.positioningTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/75">{d.positioningText}</p>
            <a
              href="/#jak"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-semibold hover:bg-white/10"
            >
              Celá cesta přes 7 bran <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* Pomoc */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 md:py-24 lg:px-12">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{d.helpTitle}</h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-3">
            {d.help.map((h) => (
              <li key={h.title} className="rounded-2xl bg-muted/60 p-6 text-center">
                <p className="text-lg font-bold">{h.title}</p>
                <p className="mt-2 text-muted-foreground">{h.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Výzva */}
        <section className="mx-auto max-w-4xl px-4 pb-16 text-center sm:px-8 md:pb-24">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{d.finalTitle}</h2>
          <button
            type="button"
            onClick={start}
            className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-leaf-500 px-7 text-base font-semibold text-white transition-colors hover:bg-leaf-600"
          >
            {d.cta} <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="mt-4 text-sm text-muted-foreground">{d.note}</p>
        </section>

        {/* Časté otázky */}
        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-8 md:pb-28">
          <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Časté otázky</h2>
          <div className="mt-10 space-y-3">
            {d.faq.map(([q, a]) => (
              <details key={q} className="group rounded-2xl border border-border bg-card px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-3 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer variant="full" />
    </div>
  );
};
