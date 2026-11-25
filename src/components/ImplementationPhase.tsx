import { Link } from "react-router-dom";
import { Blocks, Check, ListChecks, PlayCircle, Star } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { BLOCKS, BUILD_TYPES, BuildProgress, BuildType, FunnelStage, buildType, typeStats } from "@/lib/buildPlans";
import { MethodFigures } from "@/components/MethodFigures";
import { InstallSupport } from "@/components/implementation/InstallSupport";

interface ImplementationPhaseProps {
  onSelectBusinessType: (businessTypeId: string) => void;
}

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
  const ordered = mine ? [mine, ...BUILD_TYPES.filter((t) => t.id !== mine.id)] : BUILD_TYPES;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6">
      <header>
        <p className="text-sm font-semibold text-primary">Fáze 4 ze 7</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Implementace</h1>
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

      <InstallSupport />

      {/* Typy byznysu jako katalog kurzů: váš typ první a zeleně */}
      <section id="typy" aria-labelledby="vsechny" className="scroll-mt-24">
        <div id="plan" className="scroll-mt-24" />
        <h2 id="vsechny" className="text-2xl font-bold tracking-tight">
          Co budete stavět
        </h2>
        {mine ? (
          <p className="mt-1 text-muted-foreground">
            Zeleně je váš typ z fáze 2. Klikněte na kartu a otevře se plán s videi a kroky.
          </p>
        ) : (
          <p className="mt-1 text-muted-foreground">
            Typ byznysu jste ještě nezvolili. Vyberte ho ve{" "}
            <Link to="/ideation" className="font-semibold text-primary underline">
              fázi 2 Lean Canvas
            </Link>
            , nebo otevřete kterýkoli plán níže.
          </p>
        )}
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((t) => (
            <li key={t.id}>
              <BuildTypeCard
                t={t}
                pct={progressOf(t, all)}
                isMine={t.id === mine?.id}
                onOpen={() => onSelectBusinessType(t.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <MethodFigures
        ids={["10_trychtyr"]}
        intro="U každého typu byznysu najdete i procesní diagram: kdo co dělá, kdy jde jaký e-mail a kde vyděláváte."
      />
    </div>
  );
};

const STAGE_DOT: Record<FunnelStage, string> = {
  zdroj: "bg-sky-500",
  web: "bg-primary",
  konverze: "bg-orange-500",
  potom: "bg-leaf-500",
};

/** Karta typu byznysu jako v katalogu kurzů: náhled cesty zákazníka, název, platforma, délka a postup. */
const BuildTypeCard = ({
  t,
  pct,
  isMine,
  onOpen,
}: {
  t: BuildType;
  pct: number;
  isMine: boolean;
  onOpen: () => void;
}) => {
  const s = typeStats(t);
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-card text-left transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        isMine ? "border-transparent ring-[3px] ring-leaf-500" : "border-border"
      }`}
    >
      {/* Náhled: cesta zákazníka místo obrázku */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted/60 px-5 pb-4 pt-11">
        {isMine ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-leaf-500 px-2.5 py-1 text-xs font-bold text-white">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Váš typ z fáze 2
          </span>
        ) : t.popular ? (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-foreground">
            Nejčastější
          </span>
        ) : null}
        {pct === 100 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-leaf-700">
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" /> Hotovo
          </span>
        )}
        <ol className="space-y-1.5" aria-label="Cesta zákazníka">
          {t.funnel.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 shrink-0 rounded-full ${STAGE_DOT[f.stage]}`} aria-hidden="true" />
              <span className="truncate">{f.label}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold leading-snug">{t.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description}</p>
        <p className="mt-auto pt-3 text-sm text-muted-foreground">
          {t.platform} · {s.blocks} bloků s videem · {t.duration}
        </p>
        {pct > 0 && pct < 100 && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`Hotovo ${pct} %`}>
            <div className="h-full bg-leaf-500" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </button>
  );
};
