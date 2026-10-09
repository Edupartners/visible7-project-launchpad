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
  1: "Každý úspěšný byznys začal jednou otázkou: čím budu jiný?",
  2: "Z nápadu uděláte plán na jednu stránku. AI vám s tím pomůže.",
  3: "Čísla nelžou. Za hodinu budete vědět, jestli se to vyplatí.",
  4: "Teď to postavíte. Krok za krokem, s videem u každého bloku.",
  5: "Najdete zákazníky – a zjistíte, kolik vás doopravdy stojí.",
  6: "Den D. Jeden produkt, jeden kanál, první platící zákazník.",
  7: "Projekt běží. Teď ho necháte růst – bez pasti.",
};

/**
 * Úvod fáze: kde v cestě jsem, proč do toho jít, co získám (odznak a osvědčení), video a co se naučím.
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
  const name = GATE_NAMES[phaseNumber] ?? title;
  const level = LEVELS[phaseNumber];
  const video = PHASE_VIDEOS[phaseNumber];
  const withVideo = hasVideo(phaseNumber);

  const ctaLabel = thisDone
    ? `Otevřít bránu ${phaseNumber}`
    : doneCount === 0 && phaseNumber === 1
      ? "Začít cestu"
      : `Začít bránu ${phaseNumber}`;

  const greeting = thisDone
    ? `${firstName ? `${firstName}, tuhle` : "Tuhle"} bránu už máte otevřenou. Vraťte se k ní, kdykoli potřebujete.`
    : doneCount === 0
      ? `Vítejte${firstName ? `, ${firstName}` : ""}! Začínáte cestu přes 7 bran.`
      : `Skvělá práce${firstName ? `, ${firstName}` : ""}! ${doneCount} ${doneCount === 1 ? "bránu" : doneCount < 5 ? "brány" : "bran"} máte za sebou.`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[28px] bg-primary text-white">
        <div className="relative p-6 sm:p-10">
          {/* Cesta přes 7 bran */}
          <div className="flex flex-wrap items-center gap-3">
            <ol className="flex items-center gap-1.5" aria-label={`Brána ${phaseNumber} ze 7`}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <li
                  key={n}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    done.has(n)
                      ? "bg-emerald-500 text-white"
                      : n === phaseNumber
                        ? "bg-orange-500 text-white ring-4 ring-orange-500/30"
                        : "border border-white/25 text-white/50"
                  }`}
                  title={GATE_NAMES[n]}
                >
                  {done.has(n) ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
                </li>
              ))}
            </ol>
            <span className="text-sm font-semibold text-white/70">Brána {phaseNumber} ze 7</span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="font-semibold text-orange-300">{greeting}</p>
              <h1 className="mt-2 flex items-center gap-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                <Icon className="h-9 w-9 shrink-0 text-white/80 sm:h-11 sm:w-11" />
                {name}
              </h1>
              <p className="mt-2 text-xl text-white/80">{subtitle}</p>
              <p className="mt-5 max-w-xl text-lg font-medium leading-snug">{HOOK[phaseNumber]}</p>
              <button
                type="button"
                onClick={onStart}
                className="mt-7 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-lg font-semibold text-white shadow-lg shadow-orange-900/20 hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
              >
                {ctaLabel}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Odměna */}
            <div className="rounded-2xl bg-white/[0.08] p-5 ring-1 ring-white/15">
              <p className="text-sm font-semibold text-white/70">
                {thisDone ? "Za tuhle bránu už máte" : "Za tuhle bránu získáte"}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <BadgeIcon level={phaseNumber} size={52} />
                <div>
                  <p className="font-bold">Odznak {level?.name}</p>
                  <p className="text-sm text-white/70">{level?.text}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
                <Award className="h-4 w-4 text-orange-300" /> Osvědčení s ověřovacím kódem pro LinkedIn
              </p>
            </div>
          </div>
        </div>

        {/* Údaje o bráně */}
        <dl className="relative flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 bg-black/10 px-6 py-4 text-sm sm:px-10">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-white/60" />
            <dt className="sr-only">Čas</dt>
            <dd>{estimatedTime}</dd>
          </div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-white/60" />
            <dt className="sr-only">Kroky</dt>
            <dd>{steps} kroků</dd>
          </div>
          {hasAiValidation && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white/60" />
              <dt className="sr-only">AI</dt>
              <dd>AI pomocník</dd>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-white/60" />
            <dt className="sr-only">Video</dt>
            <dd>
              {withVideo
                ? `Úvodní video${video?.minutes ? ` · ${video.minutes} min` : ""}`
                : "Úvodní video připravujeme"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Video a co se naučíte */}
      <section className="grid gap-6 rounded-3xl border border-border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {withVideo ? (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(216_62%_20%)] to-[hsl(28_58%_38%)]"
            aria-label={`Přehrát úvodní video k bráně ${name}`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </button>
        ) : (
          <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(216_62%_20%)] to-[hsl(216_45%_32%)] text-center text-white">
            <Video className="h-9 w-9 text-white/60" />
            <p className="mt-2 font-semibold">Úvodní video k bráně {name}</p>
            <p className="text-sm text-white/60">připravujeme</p>
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold">Co v této bráně uděláte</h2>
          <ol className="mt-4 space-y-3">
            {learningPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {i + 1}
                </span>
                <span className="pt-0.5">{p.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Proč */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-bold">Proč na tom záleží</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <figure className="flex flex-col justify-center rounded-3xl bg-orange-50 p-6 ring-1 ring-orange-200 sm:p-8">
          <p className="text-sm font-semibold text-orange-700">Heslo dne</p>
          <blockquote className="mt-2 text-2xl font-bold leading-snug tracking-tight">„{mottoOfDay()}“</blockquote>
        </figure>
      </section>

      {/* Akce */}
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-lg font-semibold text-white hover:bg-orange-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
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
                title={`Úvodní video – ${name}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
