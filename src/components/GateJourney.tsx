import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
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
}

/**
 * Cesta přes 7 bran. Nahoře pás bran (měděné = otevřené, modrý kroužek = aktuální),
 * pod ním seznam fází s popisem a stavem.
 */
export const GateJourney = ({ gates, completed, onOpen }: GateJourneyProps) => {
  const done = new Set(completed);
  const current = gates.find((g) => !done.has(g.id)) ?? null;
  const count = gates.filter((g) => done.has(g.id)).length;

  return (
    <section className="rounded-2xl border border-border bg-card">
      {/* Pás bran */}
      <div className="border-b border-border px-6 pb-6 pt-7 sm:px-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">Cesta přes 7 bran</h2>
            <p className="mt-1 text-muted-foreground">
              {count === 0
                ? "Každá dokončená fáze otevře bránu. Za otevřené brány získáte osvědčení."
                : count === gates.length
                  ? "Všech 7 bran je otevřených."
                  : `Otevřeno ${count} ze ${gates.length} bran.`}
            </p>
          </div>
          {current && (
            <Button className="btn-apple self-start sm:self-auto" onClick={() => onOpen(current.route)}>
              {count === 0 ? "Začít bránou 1" : `Pokračovat bránou ${current.id}`}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="-mx-2 overflow-x-auto px-2 pb-1">
          <ol className="flex min-w-[600px] items-start">
            {gates.map((gate, index) => {
              const isDone = done.has(gate.id);
              const isCurrent = current?.id === gate.id;
              const lineDone = isDone && index < gates.length - 1 && (done.has(gates[index + 1].id) || gates[index + 1].id === current?.id);
              return (
                <li key={gate.id} className="relative flex flex-1 flex-col items-center text-center">
                  {index < gates.length - 1 && (
                    <span
                      aria-hidden
                      className={`absolute left-1/2 top-[22px] h-[2px] w-full ${lineDone ? "bg-gate-copper" : "bg-border"}`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onOpen(gate.route)}
                    className="group relative z-10 flex flex-col items-center rounded-xl px-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Brána ${gate.id}: ${gate.name}${isDone ? " – otevřena" : isCurrent ? " – na řadě" : ""}`}
                  >
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-base font-bold tabular-nums transition-colors ${
                        isDone
                          ? "bg-gate-copper text-white"
                          : isCurrent
                            ? "border-2 border-primary bg-card text-primary"
                            : "border border-border bg-card text-muted-foreground group-hover:border-primary/40"
                      }`}
                    >
                      {isDone ? <Check className="h-5 w-5" strokeWidth={3} /> : gate.id}
                    </span>
                    <span
                      className={`mt-2.5 max-w-[7.5rem] text-sm leading-tight ${
                        isDone || isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {gate.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Seznam fází */}
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
                className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/60 focus:outline-none focus-visible:bg-muted sm:px-8"
              >
                <Icon className={`h-5 w-5 shrink-0 ${isDone ? "text-gate-copper" : "text-muted-foreground"}`} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {gate.id}. {gate.name}
                  </span>
                  {gate.description && <span className="block text-sm text-muted-foreground">{gate.description}</span>}
                </span>
                {gate.time && !isDone && (
                  <span className="hidden shrink-0 text-sm tabular-nums text-muted-foreground sm:block">{gate.time}</span>
                )}
                <span
                  className={`shrink-0 text-right text-sm font-semibold sm:w-28 ${
                    isDone ? "text-gate-copper" : isCurrent ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isDone ? "Hotovo" : isCurrent ? "Na řadě" : "Otevřít"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
