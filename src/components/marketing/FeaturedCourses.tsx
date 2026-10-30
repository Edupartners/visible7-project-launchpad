import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { COURSE_PRICE, FEATURED_COURSES, durationLabel, hoursFloor10, useCourseHours } from "@/lib/courses";
import { kc, useShop } from "@/lib/shop";

/** Vybrané kurzy: skutečná videa v aplikaci, seřazená podle brány, kde je člověk potřebuje. */
export const FeaturedCourses = () => {
  const shop = useShop();
  const { course, totalHours } = useCourseHours();
  return (
    <section id="kurzy" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-8 md:py-24 lg:px-12">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.08em] text-leaf-700">Vybrané kurzy</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Kompletní kurz. Přes {hoursFloor10(totalHours)} hodin videí od lektorů z praxe.
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Samostatně se tyto kurzy prodávají za {kc(COURSE_PRICE)} za kus. V členství máte všechny za {kc(shop.price)},
          seřazené podle toho, kdy je na cestě potřebujete. Každý měsíc přibývají další.
        </p>
      </div>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {FEATURED_COURSES.map((c) => (
          <li key={c.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-[16/10] bg-muted">
              <img src={c.cover} alt="" loading="lazy" className="h-full w-full object-cover" />
              <span className="v7-para-sm absolute left-3 top-3 bg-signal px-2.5 py-0.5 text-xs font-bold text-signal-foreground">
                {c.gate}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="font-bold leading-snug">{c.title}</h3>
              {c.lecturer && <p className="mt-1 text-sm text-muted-foreground">{c.lecturer}</p>}
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-leaf-700">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {durationLabel(course(c))}
              </p>
              <p className="mt-auto pt-3 text-sm">
                <span className="text-muted-foreground">
                  samostatně <s>{kc(COURSE_PRICE)}</s>
                </span>
                <span className="block font-bold text-primary">V ceně členství</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link
        to="/certifikace"
        className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-primary px-5 py-2 font-semibold text-primary hover:bg-primary hover:text-white"
      >
        Zobrazit všechny kurzy <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
};
