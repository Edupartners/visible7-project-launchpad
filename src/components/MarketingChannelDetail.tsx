import { useEffect, useState } from "react";
import { Check, ChevronDown, FlaskConical, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { AdvisorsInline } from "@/components/AdvisorsInline";
import { BlockVideo } from "@/components/BlockVideo";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useMarketingContext } from "@/lib/marketingContext";
import { stepId, type BuildBlock } from "@/lib/buildPlans";
import {
  ChannelProgress,
  ChannelTest,
  MKT_BLOCKS,
  VERDICT_COPY,
  channelById,
  evaluateTest,
} from "@/lib/marketingPlans";

interface MarketingChannelDetailProps {
  channelId: string;
}

const czk = (v: number | null) => (v === null ? "—" : `${Math.round(v).toLocaleString("cs-CZ")} Kč`);
const pctFmt = (v: number | null) => (v === null ? "—" : `${(Math.round(v * 10) / 10).toLocaleString("cs-CZ")} %`);
const EMPTY: ChannelProgress = { steps: [], blocks: [] };

/** Kanál: bloky s videem a test (útrata a výsledky → verdikt podle max. PNO). */
export function MarketingChannelDetail({ channelId }: MarketingChannelDetailProps) {
  const { currentProject } = useProject();
  const ctx = useMarketingContext(currentProject?.id, currentProject?.business_type);
  const [all, setAll] = useSupabaseProgress<Record<string, ChannelProgress>>("marketing_progress", {});
  const [open, setOpen] = useState<string | null>(null);
  const c = channelById(channelId);
  const saved = all[channelId]?.test;
  const [form, setForm] = useState({
    spend: saved?.spend?.toString() ?? "",
    clicks: saved?.clicks?.toString() ?? "",
    conversions: saved?.conversions?.toString() ?? "",
    revenue: saved?.revenue?.toString() ?? "",
  });

  // Uložený test se načítá až po otevření stránky – formulář ho převezme, dokud v něm nic nepíšete.
  useEffect(() => {
    if (!saved) return;
    setForm((f) =>
      f.spend || f.conversions
        ? f
        : {
            spend: String(saved.spend ?? ""),
            clicks: saved.clicks?.toString() ?? "",
            conversions: String(saved.conversions ?? ""),
            revenue: saved.revenue?.toString() ?? "",
          },
    );
  }, [saved]);

  if (!c) return <p className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Tento kanál neznáme.</p>;

  const p = all[c.id] ?? EMPTY;
  const blocks = c.blocks.map((id) => MKT_BLOCKS[id]);
  const doneBlocks = blocks.filter((b) => p.blocks.includes(b.id)).length;
  const current = open ?? blocks.find((b) => !p.blocks.includes(b.id))?.id ?? null;

  const update = (fn: (prev: ChannelProgress) => ChannelProgress) =>
    setAll((prev) => ({ ...prev, [c.id]: fn(prev[c.id] ?? EMPTY) }));

  const toggleStep = (b: BuildBlock, i: number) => {
    setOpen(b.id);
    update((prev) => {
      const id = stepId(b.id, i);
      const steps = prev.steps.includes(id) ? prev.steps.filter((s) => s !== id) : [...prev.steps, id];
      const complete = b.steps.every((_, j) => steps.includes(stepId(b.id, j)));
      return {
        ...prev,
        steps,
        blocks: complete ? Array.from(new Set([...prev.blocks, b.id])) : prev.blocks.filter((x) => x !== b.id),
      };
    });
  };

  const finishBlock = (b: BuildBlock) => {
    update((prev) => ({
      ...prev,
      steps: Array.from(new Set([...prev.steps, ...b.steps.map((_, j) => stepId(b.id, j))])),
      blocks: Array.from(new Set([...prev.blocks, b.id])),
    }));
    setOpen(blocks.find((x) => x.id !== b.id && !p.blocks.includes(x.id))?.id ?? "test");
  };

  const num = (v: string) =>
    v.trim() === "" ? undefined : Math.max(0, Number(v.replace(/\s/g, "").replace(",", ".")));
  const draft: ChannelTest = {
    spend: num(form.spend) ?? 0,
    clicks: num(form.clicks),
    conversions: num(form.conversions) ?? 0,
    revenue: num(form.revenue),
  };
  const result = saved ? evaluateTest(saved, ctx.valuePerConversion, ctx.maxPno) : null;

  const saveTest = () =>
    update((prev) => ({ ...prev, test: { ...draft, date: new Date().toISOString().slice(0, 10) } }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <header className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <p className="text-sm font-semibold text-primary">Fáze 5 · Marketingový kanál</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{c.name}</h1>
        <p className="mt-1 text-muted-foreground">{c.description}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Typ</dt>
            <dd className="font-semibold">{c.kind}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Nastavení</dt>
            <dd className="font-semibold">{c.setupTime}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Testovací rozpočet</dt>
            <dd className="font-semibold">{c.testBudget > 0 ? `${czk(c.testBudget)} / měs.` : "jen váš čas"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Vaše max. PNO</dt>
            <dd className="font-semibold">{pctFmt(ctx.maxPno)}</dd>
          </div>
        </dl>
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm">
            <span className="font-semibold">
              Nastaveno {doneBlocks} z {blocks.length} bloků
            </span>
            {result && <span className="font-semibold">Test: {VERDICT_COPY[result.verdict].title}</span>}
          </div>
          <Progress value={(doneBlocks / blocks.length) * 100} className="h-2.5" />
        </div>
      </header>

      <ol className="space-y-3">
        {blocks.map((b, i) => {
          const done = p.blocks.includes(b.id);
          const expanded = current === b.id;
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
                    {!done ? (
                      <Button className="rounded-[10px]" onClick={() => finishBlock(b)}>
                        <Check className="mr-2 h-4 w-4" /> Blok hotový
                      </Button>
                    ) : (
                      <p className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <Check className="h-4 w-4" strokeWidth={3} /> Blok je hotový
                      </p>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Test kanálu */}
      <section aria-labelledby="test" className="rounded-3xl border-2 border-primary/20 bg-card p-6 sm:p-8">
        <h2 id="test" className="flex items-center gap-2 text-xl font-bold">
          <FlaskConical className="h-5 w-5 text-primary" /> Test kanálu
        </h2>
        <p className="mt-1 text-muted-foreground">
          Po 14 dnech zapište, kolik jste utratili a co to přineslo. Porovnáme to s maximálním PNO z vašeho byznys case.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {(
            [
              ["spend", "Útrata (Kč)", "např. 3 000"],
              ["clicks", "Prokliky", "nepovinné"],
              ["conversions", `Počet ${ctx.conversionLabel}`, "např. 4"],
              ["revenue", "Tržby z kanálu (Kč)", "nepovinné"],
            ] as const
          ).map(([k, label, ph]) => (
            <div key={k}>
              <label htmlFor={`t-${k}`} className="mb-1.5 block text-sm font-semibold">
                {label}
              </label>
              <Input
                id={`t-${k}`}
                inputMode="decimal"
                placeholder={ph}
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Bez tržeb počítáme s hodnotou {czk(ctx.valuePerConversion)} za jednu konverzi z vašeho byznys case.
        </p>
        <Button
          className="mt-4 rounded-[10px]"
          onClick={saveTest}
          disabled={form.spend === "" || form.conversions === ""}
        >
          Vyhodnotit test
        </Button>

        {result && saved && (
          <div className="mt-6 space-y-4">
            <div className={`rounded-2xl p-5 ring-1 ${VERDICT_COPY[result.verdict].tone}`}>
              <p className="text-2xl font-extrabold">{VERDICT_COPY[result.verdict].title}</p>
              <p className="mt-1">{VERDICT_COPY[result.verdict].text}</p>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
              {[
                ["PNO", pctFmt(result.pno)],
                ["Max. PNO", pctFmt(ctx.maxPno)],
                ["Cena za konverzi", czk(result.cpa)],
                ["Cena za proklik", czk(result.cpc)],
                ["Konverzní poměr", pctFmt(result.conversionRate)],
              ].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-muted/50 p-3">
                  <dt className="text-muted-foreground">{l}</dt>
                  <dd className="text-lg font-bold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">Vyhodnoceno {saved.date ? new Date(saved.date).toLocaleDateString("cs-CZ") : ""}. Po dalším testu údaje přepište.</p>
          </div>
        )}
      </section>

      <AdvisorsInline channel={c.id} title={`Poradci pro ${c.name}`} topic={`Marketingový kanál: ${c.name}`} />
    </div>
  );
}
