import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import {
  FEATURED_COURSES,
  durationLabel,
  firstNames,
  hoursFloor10,
  useCourseHours,
  useLessonStats,
} from "@/lib/courses";

type Course = (typeof FEATURED_COURSES)[number];

/** Hlavní kurzy v pořadí, jak je Michal ukazuje; ostatní jako odkazy pod nimi. */
const MAIN_IDS = ["seo", "ppc", "web", "meta", "ga4", "affiliate"];
const MAIN = MAIN_IDS.map((id) => FEATURED_COURSES.find((c) => c.id === id)).filter((c): c is Course => !!c);
const OTHER = FEATURED_COURSES.filter((c) => !MAIN_IDS.includes(c.id));

/** Kurzy jako v katalogu e-learningu: karta s obrázkem, lektorem a délkou. */
export const FeaturedCourses = () => {
  const { course } = useCourseHours();
  const { hours, lessons } = useLessonStats();
  return (
    <section id="kurzy" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-8 md:py-24 lg:px-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-leaf-700">Kurzy</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Kurzy od lektorů, kteří se tím živí.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Přes {hoursFloor10(hours)} hodin videí v {lessons.toLocaleString("cs-CZ")} krátkých lekcích. Všechny jsou v
          ceně a v aplikaci vám ukážeme, které se hodí k vašemu projektu.
        </p>
      </div>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MAIN.map((c) => (
          <li key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-[16/9] bg-muted">
              <img src={c.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-bold leading-snug">{c.title}</h3>
              {c.lecturer && <p className="mt-1 text-sm text-muted-foreground">{firstNames(c.lecturer)}</p>}
              <p className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-leaf-700">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {durationLabel(course(c))}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-muted-foreground">
        <span className="font-semibold text-foreground">A další: </span>
        {OTHER.map((c) => c.title).join(" · ")}
      </p>
      <Link
        to="/e-learning"
        className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 font-semibold text-primary hover:bg-primary hover:text-white"
      >
        Zobrazit všechny kurzy <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
};
