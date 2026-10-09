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
 * Cesta přes 7 bran. Zelená = hotovo, oranžová = na řadě, černá = otevřít.
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
                    : `Otevřeno ${count} ze ${gates.length} bran. Pokračujte oranžovou bránou.`}
              </p>
            </div>
            {current && (
              <Button
                className="self-start rounded-[10px] bg-orange-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-orange-600 sm:self-auto"
                onClick={() => onOpen(current.route)}
              >
                {count === 0 ? "Začít bránou 1" : `Pokračovat bránou ${current.id}`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="-mx-2 overflow-x-auto px-2 pb-2 pt-1">
          <ol className="flex min-w-[620px] items-start">
            {gates.map((gate, index) => {
              const isDone = done.has(gate.id);
              const isCurrent = current?.id === gate.id;
              const lineDone =
                isDone &&
                index < gates.length - 1 &&
                (done.has(gates[index + 1].id) || gates[index + 1].id === current?.id);
              return (
                <li key={gate.id} className="relative flex flex-1 flex-col items-center text-center">
                  {index < gates.length - 1 && (
                    <span
                      aria-hidden
                      className={`absolute left-1/2 top-[26px] h-[3px] w-full rounded-full ${lineDone ? "bg-emerald-500" : "bg-border"}`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onOpen(gate.route)}
                    className="group relative z-10 flex flex-col items-center rounded-xl px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Brána ${gate.id}: ${gate.name}${isDone ? " – hotovo" : isCurrent ? " – na řadě" : ""}. Otevřít fázi.`}
                  >
                    <span
                      className={`relative flex h-[54px] w-[54px] items-center justify-center rounded-full text-lg font-bold tabular-nums shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:shadow-md ${
                        isDone
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                            ? "bg-orange-500 text-white ring-4 ring-orange-200"
                            : "border-2 border-foreground bg-card text-foreground"
                      }`}
                    >
                      {isDone ? <Check className="h-6 w-6" strokeWidth={3} /> : gate.id}
                      {isCurrent && (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full ring-2 ring-orange-400 motion-safe:animate-ping motion-safe:[animation-duration:2s]"
                        />
                      )}
                    </span>
                    <span className="mt-2.5 max-w-[7.5rem] text-sm font-semibold leading-tight text-foreground group-hover:underline">
                      {gate.name}
                    </span>
                    <span
                      className={`mt-1 text-xs font-semibold ${
                        isDone ? "text-emerald-700" : isCurrent ? "text-orange-700" : "text-muted-foreground"
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
                    isCurrent ? "bg-orange-50/70" : ""
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isDone ? "text-emerald-600" : isCurrent ? "text-orange-600" : "text-foreground"}`}
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
                    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white">
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
