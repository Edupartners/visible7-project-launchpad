import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { useMarketingContext } from "@/lib/marketingContext";
import { CHANNELS, rankChannels } from "@/lib/marketingPlans";
import { useAllBlockVideos } from "@/lib/blockVideos";
import {
  ALWAYS_RECOMMENDED,
  CHANNELS_WITH_COURSE,
  COURSE_CHANNELS,
  MARKETING_COURSE_IDS,
  courseById,
  courseVideos,
} from "@/lib/courses";
import { CourseCard } from "@/components/courses/CourseCard";

interface BenchmarkingTestingPhaseProps {
  onChannelSelect: (channelId: string) => void;
}

/**
 * Fáze 5 jednoduše: kurzy marketingu jako v katalogu LMS a pod nimi další marketingové kanály.
 * Co se hodí k projektu (typ byznysu, hodnocení AI, rozpočet), svítí zeleně.
 */
export function BenchmarkingTestingPhase({ onChannelSelect }: BenchmarkingTestingPhaseProps) {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const ctx = useMarketingContext(currentProject?.id, currentProject?.business_type);
  const [completed, setCompleted] = useSupabaseProgress<number[]>("completed_phases", []);
  const [celebrate, setCelebrate] = useState(false);
  const { videos: all, watched } = useAllBlockVideos();

  if (!ctx.loaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ranked = rankChannels(currentProject?.business_type, ctx.fits, ctx.budgetNames);
  const topIds = new Set(
    ranked
      .filter((r) => r.score > 0)
      .slice(0, 3)
      .map((r) => r.channel.id),
  );
  const courses = MARKETING_COURSE_IDS.map(courseById).filter(Boolean) as NonNullable<ReturnType<typeof courseById>>[];
  const recommendedCourse = (id: string) =>
    ALWAYS_RECOMMENDED.includes(id) || (COURSE_CHANNELS[id] ?? []).some((ch) => topIds.has(ch));
  const sortedCourses = [...courses].sort((a, b) => Number(recommendedCourse(b.id)) - Number(recommendedCourse(a.id)));
  const channels = CHANNELS.filter((c) => !CHANNELS_WITH_COURSE.includes(c.id)).sort(
    (a, b) => Number(topIds.has(b.id)) - Number(topIds.has(a.id)),
  );
  const phaseDone = completed.includes(5);

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-6 sm:px-6">
      {celebrate && (
        <PhaseCelebration
          gate={5}
          title="Víte, kde vaše zákazníky najdete"
          message="Máte vybrané kanály a víte, jak je nastavit."
          nextLabel="Pokračovat na Launch"
          onNext={() => navigate("/launch")}
          onHome={() => navigate("/home")}
        />
      )}

      <header>
        <p className="text-sm font-semibold text-primary">Fáze 5 ze 7</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Marketing a budování poptávky</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Vyberte si kurzy, které se hodí k vašemu projektu. Zeleně jsou ty, které vám doporučujeme.
        </p>
      </header>

      <section aria-labelledby="kurzy">
        <h2 id="kurzy" className="text-2xl font-bold tracking-tight">
          Kurzy marketingu
        </h2>
        {topIds.size === 0 && (
          <p className="mt-1 text-sm text-muted-foreground">
            Doporučení podle projektu uvidíte, až vyberete typ byznysu ve fázi 2 a marketing v byznys case.
          </p>
        )}
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCourses.map((c) => (
            <li key={c.id}>
              <CourseCard
                course={c}
                videos={courseVideos(c, all)}
                watched={watched}
                recommended={recommendedCourse(c.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="kanaly">
        <h2 id="kanaly" className="text-2xl font-bold tracking-tight">
          Marketingové kanály
        </h2>
        <p className="mt-1 text-muted-foreground">Další cesty k zákazníkům s návodem krok za krokem.</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((c) => {
            const rec = topIds.has(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onChannelSelect(c.id)}
                  className={`flex h-full w-full flex-col rounded-2xl border bg-card p-4 text-left transition-shadow hover:shadow-md ${
                    rec ? "border-transparent ring-[3px] ring-leaf-500" : "border-border"
                  }`}
                >
                  {rec && (
                    <span className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-leaf-500 px-2 py-0.5 text-xs font-bold text-white">
                      <Sparkles className="h-3 w-3" aria-hidden="true" /> Hodí se vám
                    </span>
                  )}
                  <span className="font-bold leading-snug">{c.name}</span>
                  <span className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</span>
                  <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-semibold text-primary">
                    Návod <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Dokončení fáze</h2>
          <p className="text-muted-foreground">
            {phaseDone
              ? "Fáze Budování poptávky je hotová."
              : "Až si projdete kurzy, které se vám hodí, fázi dokončete."}
          </p>
        </div>
        <Button
          className="shrink-0 rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={phaseDone}
          onClick={() => {
            setCompleted((prev) => (prev.includes(5) ? prev : [...prev, 5]));
            setCelebrate(true);
          }}
        >
          Dokončit fázi
        </Button>
      </section>
    </div>
  );
}
