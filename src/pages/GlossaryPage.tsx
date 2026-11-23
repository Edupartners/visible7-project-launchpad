import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Lock, PlayCircle, Search } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/visible7/client";
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  glossarySlug,
  termMatches,
  type GlossaryCategory,
  type GlossaryTerm,
} from "@/lib/glossary";
import { fold, lessonHref, routeOf } from "@/lib/lessonSearch";
import { track } from "@/lib/track";

interface GlossaryLesson {
  id: string;
  block_key: string;
  title: string;
  position: number;
  minutes: number | null;
}

async function loadLessons(): Promise<GlossaryLesson[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("glossary_lessons");
  if (error || !Array.isArray(data)) return [];
  return data as GlossaryLesson[];
}

const SHOWN = 4;
const ORDERED = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "cs"));
const letterOf = (t: GlossaryTerm) => {
  const c = t.term[0].toLocaleUpperCase("cs");
  return /[A-ZÁ-Ž]/.test(c) ? fold(c).toUpperCase() : "#";
};

interface LessonLink {
  id: string;
  title: string;
  href: string;
  place: string;
  minutes: number | null;
}

function TermCard({
  term,
  lessons,
  signedIn,
  onLocked,
}: {
  term: GlossaryTerm;
  lessons: LessonLink[];
  signedIn: boolean;
  onLocked: (where: string) => void;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? lessons : lessons.slice(0, SHOWN);
  return (
    <article id={glossarySlug(term.term)} className="scroll-mt-24 border-t border-border py-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-xl font-extrabold tracking-tight">{term.term}</h3>
        {term.aka && <span className="text-sm text-muted-foreground">též {term.aka.join(", ")}</span>}
      </div>
      <p className="mt-2 max-w-3xl leading-relaxed text-foreground/85">{term.def}</p>
      {lessons.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Lekce k heslu ({lessons.length})
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {shown.map((l) => {
              const inner = (
                <>
                  {signedIn ? (
                    <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  ) : (
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug group-hover:underline">{l.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {l.place}
                      {l.minutes ? ` · ${Math.max(1, Math.round(Number(l.minutes)))} min` : ""}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={l.id}>
                  {signedIn ? (
                    <Link
                      to={l.href}
                      onClick={() => track("glossary_lesson_click", { term: term.term })}
                      className="group flex gap-2 rounded-md p-2 text-sm hover:bg-muted"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onLocked(`heslo:${term.term}`)}
                      className="group flex w-full gap-2 rounded-md p-2 text-left text-sm hover:bg-muted"
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {lessons.length > SHOWN && (
            <button
              type="button"
              onClick={() => setAll((v) => !v)}
              className="mt-1 px-2 text-sm font-semibold text-primary hover:underline"
            >
              {all ? "Zobrazit méně" : `Další lekce (${lessons.length - SHOWN})`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

const GlossaryPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<GlossaryCategory | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  const { data: lessons = [] } = useQuery({
    queryKey: ["glossary-lessons"],
    queryFn: loadLessons,
    staleTime: 10 * 60_000,
  });

  /* Hesla → lekce */
  const byTerm = useMemo(() => {
    const map = new Map<string, LessonLink[]>();
    const sorted = [...lessons].sort((a, b) => a.block_key.localeCompare(b.block_key) || a.position - b.position);
    for (const t of GLOSSARY) {
      const seen = new Set<string>();
      const list: LessonLink[] = [];
      for (const l of sorted) {
        if (!termMatches(t, l.title) || seen.has(fold(l.title))) continue;
        const route = routeOf(l.block_key, null);
        if (!route) continue;
        seen.add(fold(l.title));
        list.push({
          id: l.id,
          title: l.title,
          place: route.place,
          minutes: l.minutes,
          href: lessonHref(route.path, l.block_key.split(":")[1], l.id),
        });
      }
      map.set(t.term, list);
    }
    return map;
  }, [lessons]);

  const visible = useMemo(() => {
    const f = fold(q.trim());
    return ORDERED.filter(
      (t) =>
        (!cat || t.cat === cat) &&
        (!f || fold(`${t.term} ${(t.aka ?? []).join(" ")}`).includes(f) || (f.length >= 4 && fold(t.def).includes(f))),
    );
  }, [q, cat]);

  const groups = useMemo(() => {
    const g = new Map<string, GlossaryTerm[]>();
    for (const t of visible) {
      const k = letterOf(t);
      g.set(k, [...(g.get(k) ?? []), t]);
    }
    return [...g.entries()];
  }, [visible]);

  const letters = useMemo(() => [...new Set(ORDERED.map(letterOf))], []);

  /* SEO: titulek, popisek a strukturovaná data pro vyhledávače a AI */
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Slovník podnikatele: pojmy z webu, marketingu a AI | VISIBLE7";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      `${GLOSSARY.length} pojmů z podnikání, webu, e-shopu, měření, reklamy, SEO a umělé inteligence vysvětlených česky a srozumitelně. Ke každému heslu videolekce od lektorů z praxe.`,
    );
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DefinedTermSet",
      name: "Slovník podnikatele VISIBLE7",
      url: "https://visible7.io/slovnik",
      inLanguage: "cs",
      hasDefinedTerm: GLOSSARY.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        ...(t.aka ? { alternateName: t.aka } : {}),
        description: t.def,
        url: `https://visible7.io/slovnik#${glossarySlug(t.term)}`,
      })),
    });
    document.head.appendChild(ld);
    track("glossary_view");
    return () => {
      document.title = prevTitle;
      if (meta && prev !== null) meta.setAttribute("content", prev);
      ld.remove();
    };
  }, []);

  /* Odkaz s kotvou (#heslo) dojede na heslo i po načtení stránky. */
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50);
  }, []);

  const start = (where: string) => {
    track("glossary_cta_click", { where });
    navigate("/home?novy");
  };

  const lessonTotal = useMemo(() => new Set([...byTerm.values()].flat().map((l) => l.id)).size, [byTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader onStart={() => start("header")} />
      <main>
        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 pb-10 pt-12 sm:px-8 lg:pt-16">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Slovník podnikatele</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">
              Pojmy z webu, marketingu a AI. Česky a k věci.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {GLOSSARY.length} hesel, která potkáte při rozjezdu podnikání: od domény a GA4 po PNO, E‑E‑A‑T a AI Act.
              Ke každému heslu najdete videolekce, kde se téma probírá do hloubky
              {lessonTotal > 0 ? ` (celkem ${lessonTotal.toLocaleString("cs-CZ")} lekcí)` : ""}.
            </p>
            <label className="relative mt-7 block max-w-xl">
              <span className="sr-only">Hledat pojem</span>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Hledat pojem, třeba PNO nebo doména"
                className="h-12 w-full rounded-md border border-input bg-background pl-12 pr-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Oblast">
              {[null, ...(Object.keys(GLOSSARY_CATEGORIES) as GlossaryCategory[])].map((c) => (
                <button
                  key={c ?? "vse"}
                  type="button"
                  aria-pressed={cat === c}
                  onClick={() => setCat(c)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    cat === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary"
                  }`}
                >
                  {c ? GLOSSARY_CATEGORIES[c] : "Vše"}
                </button>
              ))}
            </div>
          </div>
        </section>

        <nav aria-label="Abeceda" className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 py-2 sm:px-8">
            {letters.map((l) => {
              const on = groups.some(([k]) => k === l);
              return (
                <a
                  key={l}
                  href={on ? `#pismeno-${l}` : undefined}
                  aria-disabled={!on}
                  className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-sm font-bold ${
                    on ? "hover:bg-muted" : "pointer-events-none text-muted-foreground/40"
                  }`}
                >
                  {l}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-8">
          {groups.length === 0 && (
            <p className="py-16 text-center text-muted-foreground">
              Takový pojem ve slovníku zatím není. Zkuste jiné slovo nebo{" "}
              <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setQ("")}>
                zobrazte všechna hesla
              </button>
              .
            </p>
          )}
          {groups.map(([letter, terms]) => (
            <section
              key={letter}
              id={`pismeno-${letter}`}
              className="scroll-mt-16 pt-8"
              aria-label={`Písmeno ${letter}`}
            >
              <h2 className="text-3xl font-extrabold text-primary">{letter}</h2>
              {terms.map((t) => (
                <TermCard
                  key={t.term}
                  term={t}
                  lessons={byTerm.get(t.term) ?? []}
                  signedIn={signedIn}
                  onLocked={start}
                />
              ))}
            </section>
          ))}
        </div>

        {!signedIn && (
          <section className="border-t border-border bg-muted/40">
            <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-4 py-12 sm:px-8 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Pojem je jen začátek.</h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Lekce se zámkem si pustíte po registraci. Každá sedí ke kroku v aplikaci, takže to, co se naučíte,
                  hned uděláte na svém plánu, webu nebo kampani.
                </p>
              </div>
              <button
                type="button"
                onClick={() => start("footer")}
                className="v7-trap-btn v7-phi-lg inline-flex h-14 shrink-0 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
              >
                Diagnostika zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </main>
      <Footer variant="full" />
    </div>
  );
};

export default GlossaryPage;
