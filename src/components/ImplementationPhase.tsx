import { Link } from "react-router-dom";
import { ArrowRight, Blocks, Clock, ListChecks, PlayCircle, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import {
  BLOCKS,
  BUILD_TYPES,
  BuildProgress,
  BuildType,
  Difficulty,
  blocksOf,
  buildType,
  typeStats,
} from "@/lib/buildPlans";

interface ImplementationPhaseProps {
  onSelectBusinessType: (businessTypeId: string) => void;
}

const DIFF_STYLE: Record<Difficulty, string> = {
  Nízká: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Střední: "bg-amber-50 text-amber-700 ring-amber-200",
  Vyšší: "bg-red-50 text-red-700 ring-red-200",
};

const czk = (v: number) => `${v.toLocaleString("cs-CZ")} Kč`;

const progressOf = (t: BuildType, all: Record<string, BuildProgress>) => {
  const p = all[t.id];
  if (!p) return 0;
  return Math.round((p.blocks.filter((b) => t.blocks.includes(b)).length / t.blocks.length) * 100);
};

/** Fáze 4: přehled všech typů, typ z fáze 2 výrazně nahoře. */
export const ImplementationPhase = ({ onSelectBusinessType }: ImplementationPhaseProps) => {
  const { currentProject } = useProject();
  const [all] = useSupabaseProgress<Record<string, BuildProgress>>("build_progress", {});
  const mine = buildType(currentProject?.business_type);
  const sharedBlocks = new Set(BUILD_TYPES.flatMap((t) => t.blocks)).size;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold text-primary">Fáze 4 ze 7</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tvorba</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Postavíte web, e-shop nebo jiný typ projektu krok za krokem. Každý blok má instruktážní video, kroky k
          odškrtnutí a náklady, které převezmete do byznys case.
        </p>
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Blocks className="h-4 w-4 text-primary" />
            <dt className="sr-only">Typů</dt>
            <dd>
              <span className="font-bold">{BUILD_TYPES.length}</span> typů online byznysu
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-primary" />
            <dt className="sr-only">Bloků</dt>
            <dd>
              <span className="font-bold">{sharedBlocks}</span> bloků s videem
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <dt className="sr-only">Kroků</dt>
            <dd>
              <span className="font-bold">{Object.values(BLOCKS).reduce((s, b) => s + b.steps.length, 0)}</span>{" "}
              konkrétních kroků
            </dd>
          </div>
        </dl>
      </header>

      {/* Váš plán */}
      {mine ? (
        <section
          aria-label="Váš plán tvorby"
          className="overflow-hidden rounded-3xl bg-primary text-white shadow-[0_30px_60px_-35px_hsl(216_62%_24%/0.7)]"
        >
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold">
                <Star className="h-3.5 w-3.5 fill-current" /> Váš typ z fáze 2
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{mine.name}</h2>
              <p className="mt-2 text-lg text-white/75">{mine.description}</p>
              <TypeFacts t={mine} light />
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  onClick={() => onSelectBusinessType(mine.id)}
                  className="h-12 rounded-xl bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
                >
                  {progressOf(mine, all) > 0 ? "Pokračovat v plánu" : "Otevřít plán tvorby"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <span className="text-sm text-white/60">Hotovo {progressOf(mine, all)} %</span>
              </div>
            </div>
            <ol className="space-y-1.5 self-center rounded-2xl bg-white/[0.06] p-3">
              {blocksOf(mine).map((b, i) => {
                const done = all[mine.id]?.blocks.includes(b.id);
                return (
                  <li key={b.id} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        done ? "bg-emerald-500 text-white" : "border border-white/30 text-white/70"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold">{b.title}</span>
                    <PlayCircle className="h-4 w-4 shrink-0 text-white/40" aria-label="Instruktážní video" />
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border-2 border-dashed border-orange-300 bg-orange-50 p-6 sm:p-8">
          <h2 className="text-xl font-bold">Ještě nemáte zvolený typ byznysu</h2>
          <p className="mt-1 text-muted-foreground">
            Zvolte ho ve{" "}
            <Link to="/ideation" className="font-semibold text-primary underline">
              fázi 2 Lean Canvas
            </Link>{" "}
            (AI ho umí doporučit), nebo otevřete plán kteréhokoli typu níže a nastavte ho jako svůj.
          </p>
        </section>
      )}

      {/* Všechny typy */}
      <section aria-labelledby="vsechny">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h2 id="vsechny" className="text-2xl font-bold tracking-tight">
            Všechny typy online byznysu
          </h2>
          <p className="text-sm text-muted-foreground">
            <Sparkles className="mr-1 inline h-4 w-4 text-orange-500" />
            Nejčastěji začínají lidé webem, e-shopem nebo squeeze page.
          </p>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUILD_TYPES.map((t) => {
            const isMine = t.id === mine?.id;
            const pct = progressOf(t, all);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onSelectBusinessType(t.id)}
                  className={`group flex h-full w-full flex-col rounded-2xl border bg-card p-5 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isMine ? "border-orange-300 ring-2 ring-orange-200" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold leading-tight">{t.name}</h3>
                    {isMine ? (
                      <span className="shrink-0 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                        Váš typ
                      </span>
                    ) : t.popular ? (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Nejčastější
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.description}</p>
                  <TypeFacts t={t} compact />
                  {pct > 0 && <Progress value={pct} className="mt-4 h-1.5" />}
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
                    {pct > 0 ? `Hotovo ${pct} % · pokračovat` : "Zobrazit plán"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

/** Čísla o typu: platforma, čas, bloky, náklady. */
const TypeFacts = ({ t, light = false, compact = false }: { t: BuildType; light?: boolean; compact?: boolean }) => {
  const s = typeStats(t);
  const muted = light ? "text-white/60" : "text-muted-foreground";
  return (
    <dl className={`mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm ${compact ? "" : "sm:grid-cols-4"}`}>
      <div>
        <dt className={muted}>Platforma</dt>
        <dd className="font-semibold">{t.platform}</dd>
      </div>
      <div>
        <dt className={muted}>Náročnost</dt>
        <dd>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${
              light ? "bg-white/10 text-white ring-white/20" : DIFF_STYLE[t.difficulty]
            }`}
          >
            {t.difficulty}
          </span>
        </dd>
      </div>
      <div>
        <dt className={muted}>Bloky a kroky</dt>
        <dd className="font-semibold">
          {s.blocks} bloků, {s.steps} kroků
        </dd>
      </div>
      <div>
        <dt className={muted}>Čas a start</dt>
        <dd className="flex items-center gap-1 font-semibold">
          <Clock className="h-3.5 w-3.5" /> {t.duration}
          {s.oneOff > 0 && <span className={`font-normal ${muted}`}>· od {czk(s.oneOff)}</span>}
        </dd>
      </div>
    </dl>
  );
};
