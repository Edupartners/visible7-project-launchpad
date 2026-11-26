import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { CourseCard } from "@/components/courses/CourseCard";
import { ContinueCourse } from "@/components/courses/ContinueCourse";
import { useAccess } from "@/lib/access";
import { useCourseAccess } from "@/lib/courseAccess";
import { courseCheckoutUrl, coursePrice, kc, nbsp, useShop } from "@/lib/shop";
import { useAllBlockVideos } from "@/lib/blockVideos";
import { COURSE_CATEGORIES, COURSE_CATEGORY, coursesProgress, hoursLabel, videoMinutes } from "@/lib/courses";

/** E-learning v aplikaci: všechny kurzy s postupem, rozkoukaný kurz nahoře. Kurzy nejsou vázané na brány. */
export default function ELearningAppPage() {
  const { videos: all, watched, ready } = useAllBlockVideos();
  const [filter, setFilter] = useState("Vše");
  const access = useAccess();
  const own = useCourseAccess();
  const shop = useShop();
  useEffect(() => {
    document.title = "E-learning | micek.academy";
  }, []);

  const rows = ready ? coursesProgress(all, watched) : [];
  const shown = filter === "Vše" ? rows : rows.filter((r) => COURSE_CATEGORY[r.course.id] === filter);
  const minutes = rows.reduce((s, r) => s + r.videos.reduce((m, v) => m + videoMinutes(v), 0), 0);
  const finished = rows.filter((r) => r.done === r.total).length;

  return (
    <SidebarLayout>
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-8">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">E-learning</h1>
          <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
            {rows.length || 13} kurzů od lektorů z praxe{minutes ? `, ${hoursLabel(minutes)} videí` : ""}. Za každý
            dokončený kurz si vystavíte osvědčení o absolvování.
          </p>
          {finished > 0 && (
            <p className="mt-1 text-sm font-semibold text-leaf-700">
              Dokončeno {finished} z {rows.length} kurzů
            </p>
          )}
        </header>

        <ContinueCourse showAllLink={false} />

        <section aria-labelledby="vsechny-kurzy">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="vsechny-kurzy" className="text-xl font-bold">
              Všechny kurzy
            </h2>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Kategorie kurzů">
              {COURSE_CATEGORIES.map((cat) => (
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
          </div>
          {!ready ? (
            <Loader2 className="mt-6 h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((r) => (
                <li key={r.course.id}>
                  <CourseCard
                    course={r.course}
                    videos={r.videos}
                    watched={watched}
                    price={
                      !access.loading &&
                      !access.full &&
                      !own.courses[r.course.id] &&
                      courseCheckoutUrl(shop, r.course.id)
                        ? nbsp(kc(coursePrice(shop)))
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </SidebarLayout>
  );
}
