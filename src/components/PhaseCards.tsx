import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Award, Check, ChevronRight, Clock, PencilLine, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PHASE_VIDEOS, hasVideo, vimeoEmbedUrl } from "@/lib/phaseVideos";

export interface PhaseCardData {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  route: string;
  time: string;
}

interface PhaseCardsProps {
  phases: PhaseCardData[];
  completed: number[];
  certified: number[];
  watched: number[];
  onOpen: (route: string) => void;
  onWatched: (phase: number) => void;
  onCertificate: () => void;
}

/** Grafický náhled fáze – dokud není vlastní obrázek z videa. */
const Cover = ({ phase, state }: { phase: PhaseCardData; state: "done" | "current" | "todo" }) => {
  const Icon = phase.icon;
  const video = PHASE_VIDEOS[phase.id];
  if (video?.cover) {
    return <img src={video.cover} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />;
  }
  return (
    <div
      className={`absolute inset-0 overflow-hidden ${
        state === "current"
          ? "bg-gradient-to-br from-[hsl(216_62%_24%)] via-[hsl(216_55%_30%)] to-orange-500"
          : "bg-gradient-to-br from-[hsl(216_62%_20%)] via-[hsl(216_50%_28%)] to-[hsl(28_58%_38%)]"
      }`}
    >
      <span
        aria-hidden
        className="absolute -bottom-7 right-3 select-none text-[8.5rem] font-extrabold leading-none text-white/10"
      >
        {phase.id}
      </span>
      <Icon aria-hidden className="absolute bottom-4 left-4 h-10 w-10 text-white/85" strokeWidth={1.5} />
      <span className="absolute left-4 top-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
        Brána {phase.id}
      </span>
    </div>
  );
};

const Step = ({
  done,
  active,
  icon: Icon,
  label,
}: {
  done: boolean;
  active?: boolean;
  icon: LucideIcon;
  label: string;
}) => (
  <li
    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
      done
        ? "bg-emerald-50 text-emerald-700"
        : active
          ? "bg-orange-50 text-orange-700"
          : "bg-muted text-muted-foreground"
    }`}
  >
    {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Icon className="h-3.5 w-3.5" />}
    {label}
  </li>
);

/**
 * Fáze jako karty kurzu: náhled s úvodním videem, popis a tři kroky
 * (podívat se na video → vyplnit fázi → získat osvědčení).
 */
export const PhaseCards = ({
  phases,
  completed,
  certified,
  watched,
  onOpen,
  onWatched,
  onCertificate,
}: PhaseCardsProps) => {
  const [playing, setPlaying] = useState<PhaseCardData | null>(null);
  const done = new Set(completed);
  const current = phases.find((p) => !done.has(p.id)) ?? null;

  return (
    <>
      <ol className="space-y-4">
        {phases.map((phase) => {
          const isDone = done.has(phase.id);
          const isCurrent = current?.id === phase.id;
          const state = isDone ? "done" : isCurrent ? "current" : "todo";
          const video = PHASE_VIDEOS[phase.id];
          const withVideo = hasVideo(phase.id);
          const seen = watched.includes(phase.id);
          const hasCert = certified.includes(phase.id);

          return (
            <li
              key={phase.id}
              className={`overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md ${
                isCurrent ? "border-orange-300 ring-2 ring-orange-200" : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Náhled */}
                <button
                  type="button"
                  onClick={() => (withVideo ? setPlaying(phase) : onOpen(phase.route))}
                  className="group relative aspect-video w-full shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:aspect-auto sm:min-h-[11rem] sm:w-72"
                  aria-label={
                    withVideo ? `Přehrát úvodní video k fázi ${phase.name}` : `Otevřít fázi ${phase.id}: ${phase.name}`
                  }
                >
                  <Cover phase={phase} state={state} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
                      {withVideo ? (
                        <Play className="ml-1 h-6 w-6 fill-current" />
                      ) : (
                        <ChevronRight className="h-7 w-7" />
                      )}
                    </span>
                  </span>
                  <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
                    {withVideo ? `Video${video?.minutes ? ` · ${video.minutes} min` : ""}` : "Video připravujeme"}
                  </span>
                  {isDone && (
                    <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow">
                      <Check className="h-5 w-5" strokeWidth={3} />
                    </span>
                  )}
                </button>

                {/* Obsah */}
                <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isDone ? "text-emerald-700" : isCurrent ? "text-orange-700" : "text-muted-foreground"
                      }`}
                    >
                      {isDone ? "Hotovo" : isCurrent ? "Na řadě" : `Fáze ${phase.id}`}
                    </p>
                    <h3 className="mt-0.5 text-xl font-bold tracking-tight">
                      {phase.id}. {phase.name}
                    </h3>
                    <p className="mt-1 text-muted-foreground">{phase.description}</p>
                  </div>

                  <ul className="flex flex-wrap gap-2" aria-label="Kroky fáze">
                    <Step
                      done={seen}
                      active={isCurrent && withVideo && !seen}
                      icon={Play}
                      label={withVideo ? "Podívat se na video" : "Video brzy"}
                    />
                    <Step
                      done={isDone}
                      active={isCurrent && (seen || !withVideo)}
                      icon={PencilLine}
                      label="Vyplnit fázi"
                    />
                    <Step done={hasCert} active={isDone && !hasCert} icon={Award} label="Získat osvědčení" />
                  </ul>

                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
                    {isDone && !hasCert ? (
                      <>
                        <Button className="rounded-[10px]" onClick={onCertificate}>
                          <Award className="mr-2 h-4 w-4" /> Získat osvědčení
                        </Button>
                        <Button variant="ghost" className="rounded-[10px]" onClick={() => onOpen(phase.route)}>
                          Otevřít fázi
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant={isCurrent ? "default" : "outline"}
                        className={`rounded-[10px] ${isCurrent ? "bg-orange-500 text-white hover:bg-orange-600" : ""}`}
                        onClick={() => onOpen(phase.route)}
                      >
                        {isDone ? "Otevřít fázi" : isCurrent ? (done.size === 0 ? "Začít" : "Pokračovat") : "Otevřít"}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" /> asi {phase.time}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-4xl gap-3 p-3 sm:p-4">
          <DialogTitle className="px-1 text-lg">{playing && `Fáze ${playing.id}: ${playing.name}`}</DialogTitle>
          {playing && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={vimeoEmbedUrl(PHASE_VIDEOS[playing.id])}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={`Úvodní video – ${playing.name}`}
              />
            </div>
          )}
          {playing && (
            <div className="flex justify-end gap-2 px-1">
              <Button
                className="rounded-[10px]"
                onClick={() => {
                  onWatched(playing.id);
                  const route = playing.route;
                  setPlaying(null);
                  onOpen(route);
                }}
              >
                Mám zhlédnuto, jdu vyplnit fázi <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
