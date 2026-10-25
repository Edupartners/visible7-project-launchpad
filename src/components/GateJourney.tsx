import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Gate {
  id: number;
  name: string;
  icon: LucideIcon;
  route: string;
  description?: string;
  time?: string;
}

interface GateJourneyProps {
  gates: Gate[];
  completed: number[];
  onOpen: (route: string) => void;
  /** Nadpis a tlačítko nad pásem (na přehledu je nahradí karta „Na řadě“). */
  showHeader?: boolean;
  /** Seznam fází pod pásem (na přehledu ho nahrazují karty fází). */
  showList?: boolean;
}

/**
 * Cesta přes 7 bran (zkosené dílky – podpis aplikace). Zelená = hotovo, limetková = na řadě, obrys = otevřít.
 * Nahoře pás bran (každá brána je tlačítko), pod ním seznam fází se stavem.
 */
export const GateJourney = ({ gates, completed, onOpen, showHeader = true, showList = true }: GateJourneyProps) => {
  const done = new Set(completed);
  const current = gates.find((g) => !done.has(g.id)) ?? null;
  const count = gates.filter((g) => done.has(g.id)).length;

  return (
    <section className="rounded-2xl border border-border bg-card">
      {/* Pás bran */}
      <div className={`px-6 pb-6 sm:px-8 ${showList ? "border-b border-border" : ""} ${showHeader ? "pt-7" : "pt-6"}`}>
        {showHeader && (
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Cesta přes 7 bran</h2>
              <p className="mt-1 text-muted-foreground">
                {count === 0
                  ? "Klikněte na bránu 1 a začněte. Každá dokončená fáze bránu otevře."
                  : count === gates.length
                    ? "Všech 7 bran je otevřených."
                    : `Otevřeno ${count} ze ${gates.length} bran. Pokračujte zvýrazněnou bránou.`}
              </p>
            </div>
            {current && (
              <Button
                className="v7-trap-btn self-start rounded-none pl-5 text-base font-bold text-signal-foreground sm:self-auto"
                onClick={() => onOpen(current.route)}
              >
                {count === 0 ? "Začít bránou 1" : `Pokračovat bránou ${current.id}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="-mx-2 overflow-x-auto px-2 pb-2 pt-1">
          <ol className="grid min-w-[620px] grid-cols-7 gap-2.5">
            {gates.map((gate) => {
              const isDone = done.has(gate.id);
              const isCurrent = current?.id === gate.id;
              return (
                <li key={gate.id} className="flex">
                  <button
                    type="button"
                    onClick={() => onOpen(gate.route)}
                    className="group flex w-full flex-col items-start gap-2 rounded-lg p-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Brána ${gate.id}: ${gate.name}${isDone ? " – hotovo" : isCurrent ? " – na řadě" : ""}. Otevřít fázi.`}
                  >
                    <span
                      className={`flex h-[52px] w-full -skew-x-[14deg] items-center justify-center text-lg font-bold tabular-nums transition-transform duration-150 group-hover:-translate-y-0.5 ${
                        isDone
                          ? "bg-emerald-700 text-white"
                          : isCurrent
                            ? "bg-signal text-signal-foreground shadow-[0_0_0_3px_hsl(var(--primary))]"
                            : "border-[1.5px] border-foreground/45 bg-card text-foreground"
                      }`}
                    >
                      <span className="skew-x-[14deg]">
                        {isDone ? <Check className="h-6 w-6" strokeWidth={3} /> : gate.id}
                      </span>
                    </span>
                    <span className="mt-1 text-sm font-semibold leading-tight text-foreground group-hover:underline">
                      {gate.name}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isDone ? "text-emerald-700" : isCurrent ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {isDone ? "Hotovo" : isCurrent ? "Na řadě" : "Otevřít"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Seznam fází */}
      {showList && (
        <ul>
          {gates.map((gate) => {
            const isDone = done.has(gate.id);
            const isCurrent = current?.id === gate.id;
            const Icon = gate.icon;
            return (
              <li key={gate.id} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => onOpen(gate.route)}
                  className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/60 focus:outline-none focus-visible:bg-muted sm:gap-4 sm:px-8 ${
                    isCurrent ? "bg-signal/15" : ""
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isDone ? "text-emerald-600" : isCurrent ? "text-foreground" : "text-foreground"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {gate.id}. {gate.name}
                    </span>
                    {gate.description && (
                      <span className="block text-sm text-muted-foreground">{gate.description}</span>
                    )}
                  </span>
                  {gate.time && !isDone && (
                    <span className="hidden shrink-0 text-sm tabular-nums text-muted-foreground sm:block">
                      {gate.time}
                    </span>
                  )}
                  {isDone ? (
                    <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-700 sm:w-28 sm:justify-end">
                      <Check className="h-4 w-4" strokeWidth={3} /> Hotovo
                    </span>
                  ) : isCurrent ? (
                    <span className="flex shrink-0 items-center gap-0.5 v7-para-sm bg-signal px-4 py-1 text-sm font-bold text-signal-foreground">
                      Na řadě <ChevronRight className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-foreground sm:w-28 sm:justify-end">
                      Otevřít <ChevronRight className="h-4 w-4" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
