import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { COURSE_PRICE, FEATURED_COURSES, durationLabel, firstNames, hoursFloor10, useCourseHours, useLessonStats } from "@/lib/courses";
import { kc, useShop } from "@/lib/shop";

type Course = (typeof FEATURED_COURSES)[number];
type Duration = Parameters<typeof durationLabel>[0];

/** Dvě řady jako na Netflixu: co postavíte a jak přivedete zákazníky. Kurz, který není v žádné řadě, spadne do první. */
const MARKETING_IDS = ["meta", "ppc", "seo", "copy", "ga4", "ai_viditelnost"];
const ROWS: { title: string; courses: Course[] }[] = [
  {
    title: "Postavte svůj projekt",
    courses: FEATURED_COURSES.filter((c) => !MARKETING_IDS.includes(c.id)),
  },
  {
    title: "Přiveďte zákazníky",
    courses: MARKETING_IDS.map((id) => FEATURED_COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c),
  },
];

const CourseCard = ({ c, hours }: { c: Course; hours: Duration }) => (
  <li className="flex w-[15.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border bg-card sm:w-[17rem]">
    <div className="relative aspect-[16/10] bg-muted">
      <img src={c.cover} alt="" loading="lazy" draggable={false} className="h-full w-full object-cover" />
      <span className="v7-para-sm absolute left-3 top-3 bg-signal px-2.5 py-0.5 text-xs font-bold text-signal-foreground">
        {c.gate}
      </span>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <h3 className="font-bold leading-snug">{c.title}</h3>
      {c.lecturer && <p className="mt-1 text-sm text-muted-foreground">{firstNames(c.lecturer)}</p>}
      <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {durationLabel(hours)}
      </p>
      <p className="mt-auto pt-3 text-sm">
        <span className="text-muted-foreground">
          samostatně <s>{kc(COURSE_PRICE)}</s>
        </span>
        <span className="block font-bold text-primary">V ceně členství</span>
      </p>
    </div>
  </li>
);

/** Vodorovná řada: posun šipkami, kolečkem/touchpadem, prstem nebo klávesnicí (řada je zaměřitelná). */
const CourseRow = ({ title, courses, hoursOf }: { title: string; courses: Course[]; hoursOf: (c: Course) => Duration }) => {
  const ref = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });
  const update = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const move = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  const arrow =
    "absolute top-[42%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-primary shadow-lg transition-opacity hover:bg-background md:flex";
  return (
    <div className="mt-10">
      <h3 className="text-xl font-extrabold tracking-tight">
        {title} <span className="ml-1 text-base font-semibold text-muted-foreground">{courses.length} {courses.length === 1 ? "kurz" : courses.length < 5 ? "kurzy" : "kurzů"}</span>
      </h3>
      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label={`Posunout řadu ${title} doleva`}
          className={`${arrow} -left-5 ${edge.start ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <ul
          ref={ref}
          onScroll={update}
          tabIndex={0}
          aria-label={title}
          className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:-mx-12 lg:scroll-px-12 lg:px-12 [&::-webkit-scrollbar]:hidden"
        >
          {courses.map((c) => (
            <CourseCard key={c.id} c={c} hours={hoursOf(c)} />
          ))}
        </ul>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label={`Posunout řadu ${title} doprava`}
          className={`${arrow} -right-5 ${edge.end ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

/** Vybrané kurzy: skutečná videa v aplikaci, seřazená podle brány, kde je člověk potřebuje. */
export const FeaturedCourses = () => {
  const shop = useShop();
  const { course } = useCourseHours();
  const { hours, lessons } = useLessonStats();
  return (
    <section id="kurzy" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-8 md:py-24 lg:px-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-leaf-700">Vybrané kurzy</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Kompletní kurz. Přes {hoursFloor10(hours)} hodin videí v {lessons.toLocaleString("cs-CZ")} krátkých lekcích od lektorů z praxe.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Samostatně se tyto kurzy prodávají za {kc(COURSE_PRICE)} za kus. V členství máte všechny za {kc(shop.price)},
          seřazené podle toho, kdy je na cestě potřebujete. Každý měsíc přibývají další.
        </p>
      </div>
      {ROWS.map((r) => (
        <CourseRow key={r.title} title={r.title} courses={r.courses} hoursOf={course} />
      ))}
      <Link
        to="/e-learning"
        className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 font-semibold text-primary hover:bg-primary hover:text-white"
      >
        Zobrazit všechny kurzy <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
};
