import { track } from "@/lib/track";
import React, { useState } from "react";
import { ArrowRight, Award, Check, Clock, ListChecks, Play, Sparkles, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthGate";
import { BadgeIcon, LEVELS, mottoOfDay } from "@/components/GrowthBadge";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { GATE_NAMES } from "@/lib/certificates";
import { PHASE_VIDEOS, hasVideo, vimeoEmbedUrl } from "@/lib/phaseVideos";

interface LearningPoint {
  text: string;
  color?: string;
}

interface PhaseIntroTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  phaseNumber: number;
  icon: React.ComponentType<{ className?: string }>;
  learningPoints: LearningPoint[];
  estimatedTime: string;
  steps: number;
  hasAiValidation?: boolean;
  onStart: () => void;
  onBack: () => void;
  /** Zachováno kvůli kompatibilitě, vzhled je jednotný */
  gradient?: string;
  videoDescription?: string;
  supportingMaterials?: unknown[];
}

/** Úvodní věta každé brány – proč se do ní pustit právě teď. */
const HOOK: Record<number, string> = {
  1: "Proč by lidé měli jít k vám, a ne ke konkurenci? Tady na to najdete odpověď.",
  2: "Celý byznys dáte na jednu stránku. AI vám s tím pomůže, rozhodujete ale vy.",
  3: "Nejdřív si spočítáte, kolik můžete ztratit. Teprve potom, kolik vyděláte.",
  4: "Teď se staví. U každého bloku máte video, jak na to.",
  5: "Najdete zákazníky. A zjistíte, kolik vás jeden doopravdy stojí.",
  6: "Den D. Jeden produkt, jeden kanál a první zákazník, který zaplatí.",
  7: "Projekt běží. Teď ho necháte růst tak, aby vám po cestě nedošly peníze.",
};

/**
 * Úvod fáze: kompaktní hero (kde jsem, o čem brána je, odznak) s videem vedle, pod ním co se naučím.
 * Jedna šablona pro všechny brány.
 */
export const PhaseIntroTemplate = ({
  title,
  subtitle,
  description,
  phaseNumber,
  icon: Icon,
  learningPoints,
  estimatedTime,
  steps,
  hasAiValidation = false,
  onStart,
  onBack,
}: PhaseIntroTemplateProps) => {
  const { user } = useAuth();
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);
  const [playing, setPlaying] = useState(false);
  const firstName = (user?.user_metadata as { first_name?: string } | undefined)?.first_name?.trim();
  const done = new Set(completed);
  const doneCount = [1, 2, 3, 4, 5, 6, 7].filter((n) => done.has(n)).length;
  const thisDone = done.has(phaseNumber);
  const name = title || GATE_NAMES[phaseNumber];
  const level = LEVELS[phaseNumber];
  const video = PHASE_VIDEOS[phaseNumber];
  const withVideo = hasVideo(phaseNumber);

  const start = () => {
    track("gate_start", { gate: phaseNumber, again: thisDone });
    onStart();
  };

  const ctaLabel = thisDone
    ? `Otevřít bránu ${phaseNumber}`
    : doneCount === 0 && phaseNumber === 1
      ? "Začít cestu"
      : `Začít bránu ${phaseNumber}`;

  const greeting = thisDone
    ? `${firstName ? `${firstName}, tuhle` : "Tuhle"} bránu už máte otevřenou. Kdykoli se k ní můžete vrátit.`
    : doneCount === 0
      ? `Vítejte${firstName ? `, ${firstName}` : ""}. Před vámi je sedm bran.`
      : `Paráda${firstName ? `, ${firstName}` : ""}. Za sebou máte už ${doneCount} ${doneCount === 1 ? "bránu" : doneCount < 5 ? "brány" : "bran"}.`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Hero: kde jsem, o čem brána je, video vedle */}
      <section className="overflow-hidden rounded-[28px] bg-primary p-5 text-white sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <ol className="flex items-center gap-1" aria-label={`Brána ${phaseNumber} ze 7`}>
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <li
                    key={n}
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      done.has(n)
                        ? "bg-emerald-500 text-white"
                        : n === phaseNumber
                          ? "bg-signal text-signal-foreground ring-4 ring-signal/30"
                          : "border border-white/25 text-white/50"
                    }`}
                    title={GATE_NAMES[n]}
                  >
                    {done.has(n) ? <Check className="h-3 w-3" strokeWidth={3} /> : n}
                  </li>
                ))}
              </ol>
              <span className="text-sm font-semibold text-white/70">Brána {phaseNumber} ze 7</span>
            </div>

            <p className="mt-4 text-sm font-semibold text-signal">{greeting}</p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              <Icon className="h-6 w-6 shrink-0 text-white/80" />
              {name}
            </h1>
            <p className="mt-2 max-w-xl leading-snug text-white/85">{HOOK[phaseNumber]}</p>

            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" /> {estimatedTime}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="h-4 w-4" aria-hidden="true" /> {steps}{" "}
                {steps === 1 ? "krok" : steps >= 2 && steps <= 4 ? "kroky" : "kroků"}
              </span>
              {hasAiValidation && (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" aria-hidden="true" /> AI Michal
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={start}
              className="mt-5 v7-trap-btn v7-phi-sm inline-flex h-12 items-center justify-center gap-2 pl-7 pr-11 text-base font-bold text-signal-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-signal/60"
            >
              {ctaLabel}
              <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <BadgeIcon level={phaseNumber} size={32} />
              <p className="text-sm text-white/80">
                {thisDone ? "Máte" : "Získáte"} <span className="font-bold text-white">odznak {level?.name}</span> a
                osvědčení s ověřovacím kódem pro LinkedIn.
              </p>
            </div>
          </div>

          {withVideo ? (
            <button
              type="button"
              onClick={() => {
                track("video_play", { where: "phase_intro", phase: phaseNumber });
                setPlaying(true);
              }}
              className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-black/25 ring-1 ring-white/15"
              aria-label={`Přehrát úvodní video k bráně ${name}`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </span>
              {video?.minutes ? (
                <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold">
                  {video.minutes} min
                </span>
              ) : null}
            </button>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl bg-black/25 text-center ring-1 ring-white/15">
              <Video className="h-8 w-8 text-white/50" />
              <p className="mt-2 font-semibold">Úvodní video připravujeme</p>
            </div>
          )}
        </div>
      </section>

      {/* Co v této bráně uděláte */}
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-bold">Co v této bráně uděláte</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {learningPoints.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {i + 1}
              </span>
              <span className="pt-0.5">{p.text}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Proč */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Proč na tom záleží</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <figure className="flex flex-col justify-center v7-trap bg-signal/25 p-6 pr-12 sm:pr-14 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-foreground">Heslo dne</p>
          <blockquote className="mt-2 text-2xl font-bold leading-snug tracking-tight">„{mottoOfDay()}“</blockquote>
        </figure>
      </section>

      {/* Akce */}
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <button
          type="button"
          onClick={start}
          className="v7-trap-btn v7-phi-lg inline-flex h-14 items-center justify-center gap-2 pl-8 pr-12 text-lg font-bold text-signal-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        >
          {ctaLabel}
          <ArrowRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Zpět na přehled
        </button>
      </div>

      <Dialog open={playing} onOpenChange={setPlaying}>
        <DialogContent className="max-w-4xl gap-3 p-3 sm:p-4">
          <DialogTitle className="px-1 text-lg">
            Brána {phaseNumber}: {name}
          </DialogTitle>
          {playing && video && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={vimeoEmbedUrl(video)}
                className="h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={`Úvodní video: ${name}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
