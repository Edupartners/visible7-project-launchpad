import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Lock, PlayCircle } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { Footer } from "@/components/layout/Footer";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/visible7/client";
import { ADVISORS } from "@/lib/advisors";
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY,
  COURSE_ORDER,
  COURSE_PRICE,
  FEATURED_COURSES,
  firstNames,
  hoursFloor10,
  useLessonStats,
  type FeaturedCourse,
} from "@/lib/courses";
import { MEMBER_ITEMS, canBuy, kc, nbsp, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

interface CatalogLesson {
  block_key: string;
  title: string;
  position: number;
  minutes: number | null;
}

const CATEGORY = COURSE_CATEGORY;
const ORDER = COURSE_ORDER;
const CATEGORIES = COURSE_CATEGORIES;

async function loadCatalog(): Promise<CatalogLesson[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("lesson_catalog");
  if (error || !Array.isArray(data)) return [];
  return data as CatalogLesson[];
}

const fmtLen = (min: number) => {
  if (min < 60) return `${Math.max(1, Math.round(min))} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m ? `${h} h ${m} min` : `${h} h`;
};

const lessonsWord = (n: number) => (n === 1 ? "lekce" : n >= 2 && n <= 4 ? "lekce" : "lekcí");

/** Fotka lektora z přehledu poradců (podle příjmení prvního lektora). */
const lecturerPhoto = (lecturer: string) => {
  const first = lecturer.split(/,| a /)[0].trim();
  const last = first.split(" ").pop() ?? first;
  return ADVISORS.find((a) => a.photo && a.name.includes(last))?.photo ?? null;
};

interface Course {
  course: FeaturedCourse;
  lessons: CatalogLesson[];
  minutes: number;
}

/** Karta kurzu jako v katalogu e-learningu: obrázek, kategorie, název, lektor s fotkou, rozsah a osnova. */
function CatalogCard({ c, onOpen }: { c: Course; onOpen: () => void }) {
  const photo = lecturerPhoto(c.course.lecturer);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img
          src={c.course.cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-foreground">
          {CATEGORY[c.course.id]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold leading-snug">{c.course.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          {photo ? (
            <img src={photo} alt="" loading="lazy" className="h-7 w-7 rounded-full bg-muted object-cover object-top" />
          ) : null}
          <p className="text-sm text-muted-foreground">{firstNames(c.course.lecturer)}</p>
        </div>
        <p className="mt-auto pt-3 text-sm text-muted-foreground">
          {c.lessons.length} {lessonsWord(c.lessons.length)} · {fmtLen(c.minutes)}
        </p>
        <span className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border text-sm font-bold transition-colors group-hover:bg-muted">
          Zobrazit osnovu
        </span>
      </div>
    </button>
  );
}

/** Veřejný katalog e-learningu: kurzy v kartách, osnova v okně, vše v ceně ročního členství. */
export default function ELearningPage() {
  const navigate = useNavigate();
  const shop = useShop();
  const { hours } = useLessonStats();
  const { data: catalog = [], isLoading } = useQuery({
    queryKey: ["lesson_catalog"],
    queryFn: loadCatalog,
    staleTime: 60 * 60_000,
  });
  const [filter, setFilter] = useState("Vše");
  const [open, setOpen] = useState<Course | null>(null);

  useEffect(() => {
    document.title = "E-learning: kurzy od lektorů z praxe, vše v ceně členství | micek.academy";
    const meta = document.querySelector('meta[name="description"]');
    const prev = meta?.getAttribute("content") ?? null;
    meta?.setAttribute(
      "content",
      "Web na WordPressu, e-shop na Shoptetu, PPC, Facebook a Instagram, SEO, GA4, copywriting, affiliate, legislativa a data. Video kurzy od lektorů z praxe, všechny v ceně ročního členství.",
    );
    window.scrollTo(0, 0);
    return () => {
      if (meta && prev !== null) meta.setAttribute("content", prev);
    };
  }, []);

  const courses: Course[] = useMemo(() => {
    const byKey = new Map<string, CatalogLesson[]>();
    for (const l of catalog) byKey.set(l.block_key, [...(byKey.get(l.block_key) ?? []), l]);
    return ORDER.map((id) => FEATURED_COURSES.find((c) => c.id === id))
      .filter((c): c is FeaturedCourse => !!c)
      .map((course) => {
        const lessons = course.keys.flatMap((k) => [...(byKey.get(k) ?? [])].sort((a, b) => a.position - b.position));
        return { course, lessons, minutes: lessons.reduce((s, l) => s + (Number(l.minutes) || 0), 0) };
      })
      .filter((r) => r.lessons.length > 0);
  }, [catalog]);

  const shown = filter === "Vše" ? courses : courses.filter((c) => CATEGORY[c.course.id] === filter);
  const count = courses.length || FEATURED_COURSES.length;
  const price = kc(shop.price);

  const buy = (where: string) => {
    track("checkout_click", { source: `elearning:${where}`, price: shop.price });
    navigate(canBuy(shop) ? "/clenstvi" : "/cenik");
  };
  const start = (where: string) => {
    track("elearning_cta_click", { where });
    navigate("/home?novy");
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader onStart={() => start("header")} />
      <main>
        {/* Úvod s cenou */}
        <section className="border-b border-border bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:py-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-leaf-700">E-learning</p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                {count} kurzů od lektorů z praxe.
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Naučíte se postavit web nebo e-shop, spustit reklamu, měřit výsledky a ohlídat legislativu. Učí lidé,
                kteří se tím živí.
              </p>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Přes {hoursFloor10(hours)} hodin videí: e-learningové kurzy i záznamy přednášek rozdělené do kapitol,
                abyste našli přesně to, co potřebujete. Za dokončený kurz získáte osvědčení o absolvování.
              </p>
            </div>
            <div className="rounded-2xl bg-primary p-6 text-white">
              <p className="text-sm font-semibold text-white/70">Všechny kurzy v ceně členství</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight">{nbsp(price)}</p>
              <p className="text-sm text-white/70">na 12 měsíců, vč. DPH</p>
              <p className="mt-3 text-sm text-white/80">
                Samostatně stojí jeden kurz {nbsp(kc(COURSE_PRICE))}. Ke kurzům máte i aplikaci, semináře a osvědčení.
              </p>
              <button
                type="button"
                onClick={() => buy("hero")}
                className="v7-trap-btn v7-phi-sm mt-5 inline-flex h-12 w-full items-center justify-center gap-2 text-base font-bold text-signal-foreground"
              >
                Získat přístup <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => start("hero")}
                className="mt-3 w-full text-center text-sm font-semibold text-white/80 underline-offset-4 hover:underline"
              >
                Nejdřív vstupní diagnostika zdarma
              </button>
            </div>
          </div>
        </section>

        {/* Katalog */}
        <section id="kurzy" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10 sm:px-8">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kategorie kurzů">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  filter === cat ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? [0, 1, 2, 3, 4, 5].map((i) => (
                  <li key={i} aria-hidden="true" className="overflow-hidden rounded-2xl border border-border">
                    <div className="aspect-[16/9] animate-pulse bg-muted" />
                    <div className="space-y-2 p-4">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    </div>
                  </li>
                ))
              : shown.map((c) => (
                  <li key={c.course.id}>
                    <CatalogCard
                      c={c}
                      onOpen={() => {
                        track("elearning_syllabus", { course: c.course.id });
                        setOpen(c);
                      }}
                    />
                  </li>
                ))}
          </ul>
        </section>

        {/* Co je v ceně */}
        <section className="border-t border-border bg-muted/40">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Vše v ceně {nbsp(price)} na rok</h2>
              <p className="mt-2 text-muted-foreground">
                Přístup platí 12 měsíců od zaplacení. Ke kurzům dostanete i aplikaci a semináře.
              </p>
              <button
                type="button"
                onClick={() => buy("footer")}
                className="v7-trap-btn v7-phi-sm mt-6 inline-flex h-12 items-center justify-center gap-2 pl-7 pr-11 text-base font-bold text-signal-foreground"
              >
                Získat přístup <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="mt-3 text-sm">
                <Link to="/cenik" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Porovnat se studiem s lektory
                </Link>
              </p>
            </div>
            <ul className="space-y-2.5">
              {MEMBER_ITEMS.map((it) => (
                <li key={it} className="flex gap-2">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer variant="full" />

      {/* Osnova kurzu */}
      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0 sm:rounded-2xl">
          {open && (
            <div className="flex max-h-[90vh] flex-col">
              <div className="relative aspect-[16/6] shrink-0 overflow-hidden bg-muted">
                <img src={open.course.cover} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="shrink-0 px-5 pt-5 sm:px-6">
                <p className="text-sm font-semibold text-leaf-700">{CATEGORY[open.course.id]}</p>
                <DialogTitle className="mt-1 text-2xl font-extrabold tracking-tight">{open.course.title}</DialogTitle>
                <DialogDescription className="mt-1">
                  {firstNames(open.course.lecturer)} · {open.lessons.length} {lessonsWord(open.lessons.length)} ·{" "}
                  {fmtLen(open.minutes)}
                </DialogDescription>
              </div>
              <ol className="mt-4 min-h-0 flex-1 divide-y divide-border overflow-y-auto border-y border-border px-5 sm:px-6">
                {open.lessons.map((l, i) => (
                  <li key={`${l.block_key}-${l.position}-${i}`} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="w-6 shrink-0 text-right font-semibold text-muted-foreground">{i + 1}</span>
                    <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{l.title}</span>
                    <span className="shrink-0 text-muted-foreground">{l.minutes ? fmtLen(Number(l.minutes)) : ""}</span>
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Pro členy" />
                  </li>
                ))}
              </ol>
              <div className="flex shrink-0 flex-col gap-3 bg-muted/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm">
                  <span className="font-bold">V ceně členství {nbsp(price)} na rok</span>
                  <span className="block text-muted-foreground">spolu s dalšími {count - 1} kurzy</span>
                </p>
                <button
                  type="button"
                  onClick={() => buy(`osnova:${open.course.id}`)}
                  className="v7-trap-btn v7-phi-sm inline-flex h-11 shrink-0 items-center justify-center gap-2 pl-6 pr-10 text-sm font-bold text-signal-foreground"
                >
                  Získat přístup <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
