import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Compass, Gauge, Loader2, PiggyBank, Star, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import { useMarketingContext } from "@/lib/marketingContext";
import {
  CHANNELS,
  Channel,
  ChannelProgress,
  MKT_BLOCKS,
  VERDICT_COPY,
  evaluateTest,
  rankChannels,
} from "@/lib/marketingPlans";
import { stepId } from "@/lib/buildPlans";

interface BenchmarkingTestingPhaseProps {
  onChannelSelect: (channelId: string) => void;
}

const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;
const COMPETITION_KEY = "_konkurence";

/** Fáze 5: kanály seřazené pro projekt, benchmark konkurence, testy a dokončení fáze. */
export function BenchmarkingTestingPhase({ onChannelSelect }: BenchmarkingTestingPhaseProps) {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const ctx = useMarketingContext(currentProject?.id, currentProject?.business_type);
  const [progress, setProgress] = useSupabaseProgress<Record<string, ChannelProgress>>("marketing_progress", {});
  const [completed, setCompleted] = useSupabaseProgress<number[]>("completed_phases", []);
  const [celebrate, setCelebrate] = useState(false);

  if (!ctx.loaded) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ranked = rankChannels(currentProject?.business_type, ctx.fits, ctx.budgetNames);
  const top = ranked.filter((r) => r.score > 0).slice(0, 3);
  const rest = ranked.filter((r) => !top.includes(r));
  const tested = CHANNELS.filter((c) => progress[c.id]?.test);
  const phaseDone = completed.includes(5);

  const comp = progress[COMPETITION_KEY] ?? { steps: [], blocks: [] };
  const compBlock = MKT_BLOCKS.konkurence;
  const toggleComp = (i: number) =>
    setProgress((prev) => {
      const cur = prev[COMPETITION_KEY] ?? { steps: [], blocks: [] };
      const id = stepId("konkurence", i);
      const steps = cur.steps.includes(id) ? cur.steps.filter((s) => s !== id) : [...cur.steps, id];
      return { ...prev, [COMPETITION_KEY]: { ...cur, steps } };
    });

  const reasons = (r: (typeof ranked)[number]) =>
    [
      currentProject?.business_type && r.channel.bestFor.includes(currentProject.business_type)
        ? "hodí se pro váš typ"
        : null,
      r.fit === "doporuceno" ? "AI ve fázi 3: doporučeno" : r.fit === "zvazit" ? "AI ve fázi 3: zvážit" : null,
      r.inBudget ? "máte ho v rozpočtu" : null,
    ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6">
      {celebrate && (
        <PhaseCelebration
          gate={5}
          title="Víte, kde vaše zákazníky najdete"
          message="Máte otestovaný kanál a čísla, podle kterých rozhodnete o rozpočtu."
          nextLabel="Pokračovat na Launch"
          onNext={() => navigate("/launch")}
          onHome={() => navigate("/home")}
        />
      )}

      <header>
        <p className="text-sm font-semibold text-primary">Fáze 5 ze 7</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Marketing a testování</h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Vyberete 2–3 kanály, nastavíte je podle videí, otestujete s malým rozpočtem a podle čísel rozhodnete:
          škálovat, ladit, nebo vypnout.
        </p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: PiggyBank,
              label: "Marketing v byznys case",
              value: ctx.monthlyBudget > 0 ? `${czk(ctx.monthlyBudget)} měsíčně` : "zatím nezadaný",
            },
            {
              icon: Gauge,
              label: "Maximální PNO",
              value: ctx.maxPno !== null ? `${Math.round(ctx.maxPno * 10) / 10} %` : "doplňte byznys case",
            },
            { icon: Compass, label: "Zákazník k vám přichází", value: ctx.firstStep ?? "zvolte typ byznysu" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-bold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </header>

      {/* Doporučené kanály */}
      <section aria-labelledby="zacnete" className="rounded-3xl bg-primary p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold">
            <Star className="h-3.5 w-3.5 fill-current" /> Začněte tady
          </span>
          <p className="text-sm text-white/70">Seřazeno podle vašeho typu byznysu, hodnocení AI a rozpočtu.</p>
        </div>
        <h2 id="zacnete" className="sr-only">
          Doporučené kanály
        </h2>
        {top.length === 0 ? (
          <p className="mt-4 text-white/80">
            Doplňte typ byznysu ve fázi 2 a marketing v byznys case – pak vám kanály seřadíme. Zatím si vyberte z
            přehledu níže.
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {top.map((r, i) => (
              <li key={r.channel.id}>
                <ChannelCard
                  channel={r.channel}
                  progress={progress[r.channel.id]}
                  reasons={reasons(r)}
                  rank={i + 1}
                  value={ctx.valuePerConversion}
                  maxPno={ctx.maxPno}
                  onOpen={() => onChannelSelect(r.channel.id)}
                  featured
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Benchmark konkurence */}
      <section aria-labelledby="konkurence" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div>
            <h2 id="konkurence" className="flex items-center gap-2 text-xl font-bold">
              <Target className="h-5 w-5 text-primary" /> {compBlock.title}
            </h2>
            <p className="mt-1 text-muted-foreground">{compBlock.goal}</p>
          </div>
          {ctx.competitors.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Konkurence z fáze 1: <span className="font-semibold text-foreground">{ctx.competitors.join(", ")}</span>
            </p>
          )}
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {compBlock.steps.map((s, i) => {
            const checked = comp.steps.includes(stepId("konkurence", i));
            return (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1.5 hover:bg-muted/60">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleComp(i)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
                  />
                  <span className={checked ? "text-muted-foreground line-through" : ""}>{s}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Všechny kanály */}
      <section aria-labelledby="vsechny-kanaly">
        <h2 id="vsechny-kanaly" className="text-2xl font-bold tracking-tight">
          Další kanály
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((r) => (
            <li key={r.channel.id}>
              <ChannelCard
                channel={r.channel}
                progress={progress[r.channel.id]}
                reasons={reasons(r)}
                value={ctx.valuePerConversion}
                maxPno={ctx.maxPno}
                onOpen={() => onChannelSelect(r.channel.id)}
                notRecommended={r.fit === "nedoporuceno"}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Dokončení */}
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold">Dokončení fáze</h2>
          <p className="text-muted-foreground">
            {phaseDone
              ? "Fáze Marketing a testování je hotová."
              : tested.length > 0
                ? `Otestováno: ${tested.map((c) => c.name).join(", ")}.`
                : "Fázi dokončíte, až zapíšete výsledek testu aspoň u jednoho kanálu."}
          </p>
        </div>
        <Button
          className="shrink-0 rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
          disabled={tested.length === 0 || phaseDone}
          onClick={() => {
            setCompleted((prev) => (prev.includes(5) ? prev : [...prev, 5]));
            setCelebrate(true);
          }}
        >
          Dokončit fázi Marketing
        </Button>
      </section>
    </div>
  );
}

const ChannelCard = ({
  channel: c,
  progress,
  reasons,
  rank,
  value,
  maxPno,
  onOpen,
  featured = false,
  notRecommended = false,
}: {
  channel: Channel;
  progress?: ChannelProgress;
  reasons: string[];
  rank?: number;
  value: number;
  maxPno: number | null;
  onOpen: () => void;
  featured?: boolean;
  notRecommended?: boolean;
}) => {
  const done = (progress?.blocks ?? []).filter((b) => c.blocks.includes(b)).length;
  const pct = Math.round((done / c.blocks.length) * 100);
  const verdict = progress?.test ? evaluateTest(progress.test, value, maxPno).verdict : null;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex h-full w-full flex-col rounded-2xl p-5 text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        featured ? "bg-white text-foreground" : "border border-border bg-card"
      } ${notRecommended ? "opacity-70" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold leading-tight">
          {rank && <span className="mr-1.5 text-orange-500">{rank}.</span>}
          {c.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            c.kind === "Placený" ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {c.kind}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
      {reasons.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {reasons.map((r) => (
            <li key={r} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} /> {r}
            </li>
          ))}
        </ul>
      )}
      {notRecommended && <p className="mt-3 text-sm text-red-700">AI ve fázi 3: pro vašeho zákazníka nedoporučeno</p>}
      <dl className="mt-4 flex flex-1 flex-wrap items-end gap-x-5 gap-y-1 text-sm">
        <div>
          <dt className="text-muted-foreground">Test</dt>
          <dd className="font-semibold">{c.testBudget > 0 ? `${czk(c.testBudget)} / měs.` : "jen čas"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Nastavení</dt>
          <dd className="font-semibold">{c.setupTime}</dd>
        </div>
      </dl>
      {verdict ? (
        <p className={`mt-4 rounded-lg px-3 py-1.5 text-sm font-semibold ring-1 ${VERDICT_COPY[verdict].tone}`}>
          Výsledek testu: {VERDICT_COPY[verdict].title}
        </p>
      ) : pct > 0 ? (
        <Progress value={pct} className="mt-4 h-1.5" />
      ) : null}
      <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary group-hover:underline">
        {pct > 0 ? "Pokračovat" : "Otevřít kanál"} <ArrowRight className="ml-1 h-4 w-4" />
      </span>
    </button>
  );
};
