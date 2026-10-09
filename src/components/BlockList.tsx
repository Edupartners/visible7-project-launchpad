import { useState } from "react";
import { Check, ChevronDown, Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockVideo } from "@/components/BlockVideo";
import { stepId, type BuildBlock } from "@/lib/buildPlans";

interface BlockListProps {
  blocks: (BuildBlock & { optional?: boolean })[];
  steps: string[];
  done: string[];
  onToggleStep: (block: BuildBlock, index: number) => void;
  onFinish: (block: BuildBlock) => void;
  /** Převzetí nákladů bloku do byznys case; když chybí, tlačítko se nezobrazí */
  onAddCosts?: (block: BuildBlock) => Promise<boolean>;
}

const czk = (v: number) => `${v.toLocaleString("cs-CZ")} Kč`;

/** Rozbalovací bloky s videem, kroky, tipem a náklady (fáze 4–6). */
export const BlockList = ({ blocks, steps, done, onToggleStep, onFinish, onAddCosts }: BlockListProps) => {
  const [open, setOpen] = useState<string | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const current = open ?? blocks.find((b) => !done.includes(b.id) && !b.optional)?.id ?? null;
  const nextOpen = (except: string) => blocks.find((x) => x.id !== except && !done.includes(x.id) && !x.optional)?.id;

  return (
    <ol className="space-y-3">
      {blocks.map((b, i) => {
        const isDone = done.includes(b.id);
        const expanded = current === b.id;
        const stepsDone = b.steps.filter((_, j) => steps.includes(stepId(b.id, j))).length;
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
                  isDone
                    ? "bg-emerald-600 text-white"
                    : expanded
                      ? "bg-orange-500 text-white"
                      : "border-2 border-foreground"
                }`}
              >
                {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-bold">
                  {b.title}
                  {b.optional && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                      volitelné
                    </span>
                  )}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{b.goal}</span>
              </span>
              <span className="hidden shrink-0 text-sm text-muted-foreground sm:block">
                {stepsDone}/{b.steps.length}
              </span>
              <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>

            {expanded && (
              <div className="grid gap-6 border-t border-border p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <BlockVideo block={b} />
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {b.steps.map((s, j) => {
                      const checked = steps.includes(stepId(b.id, j));
                      return (
                        <li key={j}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1.5 hover:bg-muted/60">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setOpen(b.id);
                                onToggleStep(b, j);
                              }}
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
                  {b.costs && onAddCosts && (
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
                        disabled={added.includes(b.id)}
                        onClick={async () => {
                          if (await onAddCosts(b)) setAdded((a) => [...a, b.id]);
                        }}
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                      >
                        {added.includes(b.id) ? (
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
                  {!isDone ? (
                    <Button
                      className="rounded-[10px]"
                      onClick={() => {
                        onFinish(b);
                        setOpen(nextOpen(b.id) ?? "");
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" /> Blok hotový
                    </Button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <Check className="h-4 w-4" strokeWidth={3} /> Blok je hotový
                      </span>
                      {nextOpen(b.id) && (
                        <Button variant="outline" className="rounded-[10px]" onClick={() => setOpen(nextOpen(b.id)!)}>
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
  );
};
