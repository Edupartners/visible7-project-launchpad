import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useAllBlockVideos } from "@/lib/blockVideos";
import { coursesProgress } from "@/lib/courses";

/** „Pokračovat v kurzu“: rozkoukaný kurz s nejvyšším postupem a jeho další lekce. Bez rozkoukaného kurzu odkaz na e-learning (fallback), jinak nic. */
export function ContinueCourse({
  showAllLink = true,
  fallback = false,
}: {
  showAllLink?: boolean;
  fallback?: boolean;
}) {
  const { videos: all, watched, ready } = useAllBlockVideos();
  if (!ready) return null;
  const started = coursesProgress(all, watched).filter((r) => r.done > 0 && r.done < r.total);
  if (started.length === 0)
    return fallback ? (
      <Link
        to="/kurzy"
        className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:bg-muted/50"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf-700">
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-bold">E-learning</span>
          <span className="block text-sm text-muted-foreground">
            Kurzy od lektorů z praxe. Za každý dokončený kurz osvědčení o absolvování.
          </span>
        </span>
        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    ) : null;
  const r = [...started].sort((a, b) => b.pct - a.pct)[0];
  return (
    <section
      aria-label="Pokračovat v kurzu"
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:flex-row"
    >
      <img src={r.course.cover} alt="" className="aspect-[16/9] w-full object-cover sm:aspect-auto sm:w-56" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-semibold text-leaf-700">Pokračovat v kurzu</p>
          <h2 className="mt-0.5 text-xl font-bold leading-snug">{r.course.title}</h2>
          {r.next && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <PlayCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> Další lekce: {r.next.title}
            </p>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">
            Hotovo {r.pct} %{" "}
            <span className="font-normal text-muted-foreground">
              · {r.done} z {r.total} lekcí
            </span>
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div className="h-full bg-leaf-500" style={{ width: `${r.pct}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to={`/kurz/${r.course.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white hover:bg-primary/90"
          >
            Pokračovat <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {showAllLink && (
            <Link to="/kurzy" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Všechny kurzy v e-learningu
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
