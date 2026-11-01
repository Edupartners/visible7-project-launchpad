import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Lock, PlayCircle } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/visible7/client";
import { FEATURED_COURSES, firstNames, hoursFloor10, useLessonStats, type FeaturedCourse } from "@/lib/courses";
import { track } from "@/lib/track";

interface CatalogLesson {
  block_key: string;
  title: string;
  position: number;
  minutes: number | null;
}

/** Pořadí řad: tak, jak je člověk potřebuje na cestě (brána 4 → 7, bonusy na konec). */
const ORDER = ["web", "shoptet", "copy", "ga4", "affiliate", "meta", "ppc", "seo", "znacka", "data", "ai_viditelnost", "grafika", "aiact"];

async function loadCatalog(): Promise<CatalogLesson[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("lesson_catalog");
  if (error || !Array.isArray(data)) return [];
  return data as CatalogLesson[];
}

const fmtLen = (min: number) =>
  min < 60 ? `${Math.max(1, Math.round(min))} min` : `${(Math.round((min / 60) * 10) / 10).toLocaleString("cs-CZ")} h`;

const lessonsWord = (n: number) => (n === 1 ? "lekce" : n >= 2 && n <= 4 ? "lekce" : "lekcí");

interface Row {
  course: FeaturedCourse;
  lessons: CatalogLesson[];
  minutes: number;
}

/** Jedna řada „jako Netflix“: hlavička kurzu a lekce posuvné do strany. */
function CourseRow({ row, onPick }: { row: Row; onPick: (where: string) => void }) {
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  const { course: c, lessons } = row;
  return (
    <section aria-labelledby={`r-${c.id}`} className="group/row">
      <div className="mx-auto flex max-w-[90rem] items-end justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <div className="min-w-0">
          <h2 id={`r-${c.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {c.title.replace(/ /g, " ")}
            <span className="v7-para-sm bg-signal px-2.5 py-0.5 text-xs font-bold text-signal-foreground">{c.gate}</span>
          </h2>
          <p className="mt-1 text-sm text-white/60">
            {c.lecturer && <>{firstNames(c.lecturer)} · </>}
            {lessons.length} {lessonsWord(lessons.length)} · {fmtLen(row.minutes)}
          </p>
        </div>
        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-signal hover:text-signal"
            aria-label={`Posunout ${c.title} doleva`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-signal hover:text-signal"
            aria-label={`Posunout ${c.title} doprava`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      <ul
        ref={ref}
        className="mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] sm:scroll-px-8 sm:px-8 lg:scroll-px-[max(3rem,calc((100vw-90rem)/2+3rem))] lg:px-[max(3rem,calc((100vw-90rem)/2+3rem))] [&::-webkit-scrollbar]:hidden"
      >
        {lessons.map((l, i) => (
          <li key={`${l.block_key}-${l.position}-${i}`} className="w-[15.5rem] shrink-0 snap-start sm:w-[17rem]">
            <button
              type="button"
              onClick={() => onPick(c.id)}
              className="group relative block aspect-video w-full overflow-hidden rounded-lg bg-[hsl(158_40%_15%)] text-left ring-signal transition duration-300 hover:z-10 hover:scale-[1.04] hover:ring-2 focus:outline-none focus-visible:ring-2"
              aria-label={`${l.title} – lekce pro členy`}
            >
              <img src={c.cover} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-55 transition-opacity group-hover:opacity-40" />
              <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              <span className="absolute left-2.5 top-2 text-3xl font-black leading-none text-white/25">{i + 1}</span>
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                <Lock className="h-3 w-3" aria-hidden="true" /> {l.minutes ? fmtLen(Number(l.minutes)) : "video"}
              </span>
              <span className="absolute inset-x-0 bottom-0 p-3">
                <span className="line-clamp-3 text-sm font-bold leading-snug text-white">{l.title}</span>
              </span>
              <PlayCircle
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 text-signal opacity-0 transition-opacity group-hover:opacity-100"
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Veřejná stránka E-learning: všechny lekce v řadách podle kurzů, aby bylo vidět, kolik toho je. */
export default function ELearningPage() {
  const navigate = useNavigate();
  const { hours, lessons: lessonCount } = useLessonStats();
  const { data: catalog = [], isLoading } = useQuery({ queryKey: ["lesson_catalog"], queryFn: loadCatalog, staleTime: 60 * 60_000 });

  useEffect(() => {
    const title = "E-learning pro podnikatele: přes 50 hodin videí v krátkých lekcích | VISIBLE7 MICEK";
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Web a e-shop, Shoptet, GA4, reklama na Facebooku a Google, SEO, copywriting, legislativa a data. Stovky krátkých video lekcí od lektorů z praxe, seřazené podle toho, kdy je na cestě potřebujete.",
    );
    window.scrollTo(0, 0);
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, []);

  const rows: Row[] = useMemo(() => {
    const byKey = new Map<string, CatalogLesson[]>();
    for (const l of catalog) byKey.set(l.block_key, [...(byKey.get(l.block_key) ?? []), l]);
    return ORDER.map((id) => FEATURED_COURSES.find((c) => c.id === id))
      .filter((c): c is FeaturedCourse => !!c)
      .map((course) => {
        // Lekce v pořadí kurzu: karty tak, jak jdou v kurzu, uvnitř karty podle pozice.
        const lessons = course.keys.flatMap((k) => [...(byKey.get(k) ?? [])].sort((a, b) => a.position - b.position));
        return { course, lessons, minutes: lessons.reduce((s, l) => s + (Number(l.minutes) || 0), 0) };
      })
      .filter((r) => r.lessons.length > 0);
  }, [catalog]);

  const start = (where: string) => {
    track("elearning_cta_click", { where });
    navigate("/home?novy");
  };

  return (
    <div className="min-h-screen bg-[hsl(158_58%_7%)] text-white">
      <div className="bg-background text-foreground">
        <PublicHeader onStart={() => start("header")} />
      </div>
      <main>
        {/* Úvod */}
        <section className="relative overflow-hidden">
          <img src="/video-covers/kurz.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-r from-[hsl(158_58%_7%)] via-[hsl(158_58%_7%/0.85)] to-[hsl(158_58%_7%/0.3)]" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[hsl(158_58%_7%)] to-transparent" />
          <div className="relative mx-auto max-w-[90rem] px-4 pb-16 pt-14 sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-signal">E-learning VISIBLE7</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              Přes {hoursFloor10(hours)} hodin videí. {lessonCount.toLocaleString("cs-CZ")} krátkých lekcí.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              Web a e-shop, Shoptet, měření, reklama, SEO, texty, legislativa i data. Od lektorů z praxe, seřazené podle
              toho, kdy je na cestě k vlastnímu podnikání potřebujete. Každý měsíc přibývají další.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => start("hero")}
                className="v7-trap-btn inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-signal/40"
              >
                Začít zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <a
                href="#kurzy"
                className="inline-flex h-14 items-center justify-center gap-2 border-2 border-white/30 px-6 text-base font-semibold text-white transition-colors hover:border-signal hover:text-signal"
              >
                Prohlédnout lekce
              </a>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                [`${rows.length || FEATURED_COURSES.length}`, "kurzů"],
                [lessonCount.toLocaleString("cs-CZ"), "lekcí"],
                [`${hoursFloor10(hours)}+`, "hodin videí"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-3xl font-extrabold tracking-tight text-signal">
                    {v} <span className="text-base font-semibold text-white/70">{l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Řady kurzů */}
        <div id="kurzy" className="scroll-mt-20 space-y-10 pb-16 sm:space-y-12">
          {isLoading &&
            [0, 1, 2].map((i) => (
              <div key={i} className="mx-auto max-w-[90rem] px-4 sm:px-8 lg:px-12" aria-hidden="true">
                <div className="h-6 w-64 animate-pulse rounded bg-white/10" />
                <div className="mt-4 flex gap-3 overflow-hidden">
                  {[0, 1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="aspect-video w-[17rem] shrink-0 animate-pulse rounded-lg bg-white/10" />
                  ))}
                </div>
              </div>
            ))}
          {rows.map((r) => (
            <CourseRow key={r.course.id} row={r} onPick={(id) => start(`lekce:${id}`)} />
          ))}
        </div>

        {/* Výzva */}
        <section className="border-t border-white/10">
          <div className="mx-auto flex max-w-[90rem] flex-col items-start gap-6 px-4 py-14 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Videa nejsou samoúčelná.</h2>
              <p className="mt-2 max-w-2xl text-white/70">
                Každá lekce sedí ke kroku v aplikaci: pustíte si video a hned ho uděláte na svém plánu, webu nebo kampani.
                Lekce najdete i hledáním, třeba „jak nahodit GA4“.
              </p>
            </div>
            <button
              type="button"
              onClick={() => start("footer")}
              className="v7-trap-btn inline-flex h-14 shrink-0 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground"
            >
              Začít zdarma <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 pb-10 text-sm text-white/50 sm:px-8 lg:px-12">
            <Clock className="h-4 w-4" aria-hidden="true" /> Lekce se zámkem jsou pro členy. Délky se počítají z publikovaných videí.
          </p>
        </section>
      </main>
      <div className="bg-background text-foreground">
        <Footer variant="full" />
      </div>
    </div>
  );
}
