import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Lightbulb, PlayCircle, Plus, Star, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { supabase } from "@/integrations/visible7/client";
import { AdvisorsInline } from "@/components/AdvisorsInline";
import { PhaseCelebration } from "@/components/PhaseCelebration";
import {
  BuildBlock,
  BuildCost,
  BuildProgress,
  EMPTY_PROGRESS,
  blocksOf,
  buildType,
  stepId,
  typeStats,
} from "@/lib/buildPlans";
import { CostItem, newId } from "@/lib/businessCase";

interface BusinessTypeRoadmapProps {
  businessTypeId: string;
}

const czk = (v: number) => `${v.toLocaleString("cs-CZ")} Kč`;

/** Video k bloku z Vimea; dokud není, zobrazí se zástupná plocha. */
const BlockVideo = ({ block }: { block: BuildBlock }) => {
  const [play, setPlay] = useState(false);
  if (!block.vimeoId) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(216_62%_22%)] to-[hsl(216_45%_32%)] text-center text-white">
        <Video className="h-8 w-8 text-white/60" />
        <p className="mt-2 font-semibold">Video k bloku „{block.title}“</p>
        <p className="text-sm text-white/60">připravujeme</p>
      </div>
    );
  }
  const src = `https://player.vimeo.com/video/${block.vimeoId}?dnt=1${block.vimeoHash ? `&h=${block.vimeoHash}` : ""}${play ? "&autoplay=1" : ""}`;
  return play ? (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={src}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={`Video: ${block.title}`}
      />
    </div>
  ) : (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative flex aspect-video w-full items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(216_62%_22%)] to-[hsl(28_58%_38%)]"
      aria-label={`Přehrát video: ${block.title}`}
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg transition-transform group-hover:scale-110">
        <PlayCircle className="h-9 w-9" />
      </span>
      {block.videoMinutes && (
        <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white">
          {block.videoMinutes} min
        </span>
      )}
    </button>
  );
};

/** Plán tvorby pro jeden typ byznysu: bloky s videem, kroky a náklady. */
export const BusinessTypeRoadmap = ({ businessTypeId }: BusinessTypeRoadmapProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setBusinessType } = useProject();
  const t = buildType(businessTypeId);
  const [all, setAll] = useSupabaseProgress<Record<string, BuildProgress>>("build_progress", {});
  const [completed, setCompleted] = useSupabaseProgress<number[]>("completed_phases", []);
  const [open, setOpen] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [addedCosts, setAddedCosts] = useState<string[]>([]);

  if (!t) {
    return <p className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Tento typ byznysu neznáme.</p>;
  }

  const p = all[t.id] ?? EMPTY_PROGRESS;
  const blocks = blocksOf(t);
  const stats = typeStats(t);
  const doneBlocks = blocks.filter((b) => p.blocks.includes(b.id)).length;
  const pct = Math.round((doneBlocks / blocks.length) * 100);
  const isMine = currentProject?.business_type === t.id;
  const allDone = doneBlocks === blocks.length;
  const phaseDone = completed.includes(4);
  const current = open ?? blocks.find((b) => !p.blocks.includes(b.id))?.id ?? null;

  const update = (patch: (prev: BuildProgress) => BuildProgress) =>
    setAll((prev) => ({ ...prev, [t.id]: patch(prev[t.id] ?? EMPTY_PROGRESS) }));

  const toggleStep = (b: BuildBlock, i: number) => {
    // Rozpracovaný blok zůstane otevřený, i když se odškrtnutím posledního kroku dokončí.
    setOpen(b.id);
    update((prev) => {
      const id = stepId(b.id, i);
      const steps = prev.steps.includes(id) ? prev.steps.filter((s) => s !== id) : [...prev.steps, id];
      const allSteps = b.steps.every((_, j) => steps.includes(stepId(b.id, j)));
      const blocksDone = allSteps ? Array.from(new Set([...prev.blocks, b.id])) : prev.blocks.filter((x) => x !== b.id);
      return { ...prev, steps, blocks: blocksDone };
    });
  };

  const finishBlock = (b: BuildBlock) => {
    update((prev) => ({
      ...prev,
      steps: Array.from(new Set([...prev.steps, ...b.steps.map((_, j) => stepId(b.id, j))])),
      blocks: Array.from(new Set([...prev.blocks, b.id])),
    }));
    const next = blocks.find((x) => x.id !== b.id && !p.blocks.includes(x.id));
    setOpen(next?.id ?? null);
  };

  const addCosts = async (b: BuildBlock, costs: BuildCost[]) => {
    if (!currentProject) return;
    const { data } = await supabase
      .from("project_data")
      .select("data_value")
      .eq("project_id", currentProject.id)
      .eq("data_key", "business_case")
      .maybeSingle();
    const bc = (data?.data_value as { costs?: CostItem[] } | null) ?? {};
    const existing = bc.costs ?? [];
    const names = new Set(existing.map((c) => c.name.toLowerCase()));
    const fresh = costs
      .filter((c) => !names.has(c.name.toLowerCase()))
      .map((c) => ({ id: newId(), name: c.name, amount: c.amount, kind: c.kind }) as CostItem);
    if (fresh.length) {
      const { error } = await supabase.from("project_data").upsert(
        {
          project_id: currentProject.id,
          data_key: "business_case",
          data_value: { ...bc, costs: [...existing, ...fresh] },
        },
        { onConflict: "project_id,data_key" },
      );
      if (error) {
        toast({ title: "Náklady se nepodařilo převzít", variant: "destructive" });
        return;
      }
    }
    setAddedCosts((a) => [...a, b.id]);
    toast({
      title: fresh.length ? "Náklady jsou v byznys case" : "Tyto náklady už v byznys case máte",
      description: fresh.some((c) => !c.amount) ? "U položek bez částky ji doplňte ve fázi 3." : undefined,
    });
  };

  const finishPhase = () => {
    setCompleted((prev) => (prev.includes(4) ? prev : [...prev, 4]));
    setCelebrate(true);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      {celebrate && (
        <PhaseCelebration
          gate={4}
          title="Projekt má skutečnou podobu"
          message="Další brána ukáže, kde vaše zákazníky najdete a kolik do marketingu dát."
          nextLabel="Pokračovat na Marketing a testování"
          onNext={() => navigate("/benchmarking-phase")}
          onHome={() => navigate("/home")}
        />
      )}

      {/* Hlavička */}
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-primary">Fáze 4 · Plán tvorby</p>
          {isMine && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              <Star className="h-3 w-3 fill-current" /> Váš typ
            </span>
          )}
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t.name}</h1>
        <p className="mt-1 text-muted-foreground">{t.description}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Platforma</dt>
            <dd className="font-semibold">{t.platform}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bloky</dt>
            <dd className="font-semibold">
              {stats.blocks} bloků, {stats.steps} kroků
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Čas</dt>
            <dd className="font-semibold">
              {t.duration} (asi {stats.hours} h práce)
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Náklady na start</dt>
            <dd className="font-semibold">
              od {czk(stats.oneOff)}
              {stats.monthly > 0 && ` + ${czk(stats.monthly)}/měs.`}
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-semibold">
              Hotovo {doneBlocks} z {blocks.length} bloků
            </span>
            <span className="text-muted-foreground">{pct} %</span>
          </div>
          <Progress value={pct} className="h-2.5" />
        </div>
        {!isMine && currentProject && (
          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {currentProject.business_type
                ? "Tohle není typ, který jste zvolili ve fázi 2. Plán si můžete prohlédnout, nebo typ změnit."
                : "Zatím nemáte zvolený typ byznysu."}
            </p>
            <Button
              variant="outline"
              className="shrink-0 rounded-[10px]"
              onClick={async () => {
                const ok = await setBusinessType(currentProject.id, t.id);
                toast(
                  ok
                    ? { title: `Váš typ je teď ${t.name}` }
                    : { title: "Typ se nepodařilo změnit", variant: "destructive" },
                );
              }}
            >
              Nastavit jako můj typ
            </Button>
          </div>
        )}
      </header>

      {/* Bloky */}
      <ol className="space-y-3">
        {blocks.map((b, i) => {
          const done = p.blocks.includes(b.id);
          const expanded = current === b.id;
          const stepsDone = b.steps.filter((_, j) => p.steps.includes(stepId(b.id, j))).length;
          return (
            <li
              key={b.id}
              className={`overflow-hidden rounded-2xl border bg-card ${expanded ? "border-primary/40 shadow-md" : "border-border"}`}
            >
              <button
                type="button"
                onClick={() => setOpen(expanded ? "" : b.id)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 p-4 text-left sm:p-5"
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                    done
                      ? "bg-emerald-600 text-white"
                      : expanded
                        ? "bg-orange-500 text-white"
                        : "border-2 border-foreground"
                  }`}
                >
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{b.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">{b.goal}</span>
                </span>
                <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                  {stepsDone}/{b.steps.length} ·{" "}
                  {b.minutes >= 60 ? `${Math.round(b.minutes / 60)} h` : `${b.minutes} min`}
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>

              {expanded && (
                <div className="grid gap-6 border-t border-border p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                  <BlockVideo block={b} />
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {b.steps.map((s, j) => {
                        const checked = p.steps.includes(stepId(b.id, j));
                        return (
                          <li key={j}>
                            <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1.5 hover:bg-muted/60">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleStep(b, j)}
                                className="mt-0.5 h-5 w-5 shrink-0 accent-[hsl(var(--primary))]"
                              />
                              <span className={checked ? "text-muted-foreground line-through" : ""}>{s}</span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                    {b.tip && (
                      <p className="flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                        <Lightbulb className="h-4 w-4 shrink-0" /> {b.tip}
                      </p>
                    )}
                    {b.costs && (
                      <div className="rounded-lg border border-border p-3 text-sm">
                        <p className="font-semibold">Náklady</p>
                        <ul className="mt-1 text-muted-foreground">
                          {b.costs.map((c) => (
                            <li key={c.name}>
                              {c.name}
                              {c.amount > 0 && `: ${czk(c.amount)}${c.kind === "mesicni" ? " měsíčně" : ""}`}
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => addCosts(b, b.costs!)}
                          disabled={addedCosts.includes(b.id)}
                          className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                        >
                          {addedCosts.includes(b.id) ? (
                            <>
                              <Check className="h-4 w-4" /> Převzato do byznys case
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" /> Převzít do byznys case
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {!done ? (
                      <Button className="rounded-[10px]" onClick={() => finishBlock(b)}>
                        <Check className="mr-2 h-4 w-4" /> Blok hotový
                      </Button>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <Check className="h-4 w-4" strokeWidth={3} /> Blok je hotový
                        </span>
                        {blocks.some((x) => !p.blocks.includes(x.id)) && (
                          <Button
                            variant="outline"
                            className="rounded-[10px]"
                            onClick={() => setOpen(blocks.find((x) => !p.blocks.includes(x.id))?.id ?? null)}
                          >
                            Další blok
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <AdvisorsInline phase={4} title="Potřebujete s tvorbou pomoct?" />

      {/* Dokončení fáze */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-xl font-bold">Adresa vašeho webu</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Uložíme ji k projektu. Použije se v dalších fázích a na osvědčení VISIBLE7 Gold.
        </p>
        <Input
          className="mt-3"
          type="url"
          placeholder="https://www.vas-web.cz"
          defaultValue={p.url ?? ""}
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (url !== (p.url ?? "")) update((prev) => ({ ...prev, url }));
          }}
          aria-label="Adresa webu"
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {phaseDone
              ? "Fáze Tvorba je hotová."
              : !isMine
                ? "Fázi dokončíte v plánu svého typu byznysu."
                : allDone
                  ? "Všechny bloky jsou hotové."
                  : `Zbývá ${blocks.length - doneBlocks} ${blocks.length - doneBlocks === 1 ? "blok" : blocks.length - doneBlocks < 5 ? "bloky" : "bloků"}.`}
          </p>
          <Button
            className="rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={!isMine || !allDone || phaseDone}
            onClick={finishPhase}
          >
            Dokončit fázi Tvorba
          </Button>
        </div>
      </section>
    </div>
  );
};
