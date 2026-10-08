import type { LucideIcon } from "lucide-react";
import { ArrowRight, Award, Check, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Gate {
  id: number;
  name: string;
  icon: LucideIcon;
  route: string;
}

interface GateJourneyProps {
  gates: Gate[];
  completed: number[];
  onOpen: (route: string) => void;
}

/** Cesta přes 7 bran: otevřené brány jsou odznaky, aktuální brána je zvýrazněná. */
export const GateJourney = ({ gates, completed, onOpen }: GateJourneyProps) => {
  const done = new Set(completed);
  const current = gates.find((g) => !done.has(g.id)) ?? null;
  const count = gates.filter((g) => done.has(g.id)).length;

  return (
    <Card className="card-apple p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-apple-title">Cesta přes 7 bran</h2>
          <p className="text-apple-subtitle mt-1">
            {count === 0
              ? "Každá dokončená fáze otevře bránu a přinese odznak."
              : count === gates.length
                ? "Všech 7 bran je otevřených. Gratulujeme!"
                : `Otevřeno ${count} ze ${gates.length} bran.`}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <Award className="h-4 w-4" />
          {count}/{gates.length} odznaků
        </div>
      </div>

      <div className="-mx-2 overflow-x-auto px-2 pb-2">
        <ol className="flex min-w-[640px] items-start">
          {gates.map((gate, index) => {
            const isDone = done.has(gate.id);
            const isCurrent = current?.id === gate.id;
            const Icon = gate.icon;
            const nextDone = index < gates.length - 1 && done.has(gates[index + 1].id);
            return (
              <li key={gate.id} className="relative flex flex-1 flex-col items-center text-center">
                {index < gates.length - 1 && (
                  <span
                    aria-hidden
                    className={`absolute left-1/2 top-7 h-1 w-full rounded-full ${
                      isDone && (nextDone || gates[index + 1].id === current?.id) ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => onOpen(gate.route)}
                  className="group relative z-10 flex flex-col items-center focus:outline-none"
                  aria-label={`Brána ${gate.id}: ${gate.name}${isDone ? " – otevřena" : isCurrent ? " – aktuální" : ""}`}
                >
                  <span
                    className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-transform group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-primary ${
                      isDone
                        ? "border-transparent bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md"
                        : isCurrent
                          ? "border-primary bg-background text-primary shadow-sm"
                          : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Award className="h-7 w-7" /> : <Icon className="h-6 w-6" />}
                    {isDone && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -inset-1 animate-pulse rounded-[1.1rem] border-2 border-primary/30" aria-hidden />
                    )}
                  </span>
                  <span className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Brána {gate.id}
                  </span>
                  <span
                    className={`mt-0.5 max-w-[7rem] text-sm leading-tight ${
                      isDone ? "font-semibold text-foreground" : isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
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

      <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        {current ? (
          <>
            <p className="text-sm text-muted-foreground">
              Další krok: <span className="font-semibold text-foreground">Brána {current.id} – {current.name}</span>
            </p>
            <Button className="btn-apple" onClick={() => onOpen(current.route)}>
              {count === 0 ? "Začít" : "Pokračovat"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <PartyPopper className="h-4 w-4 text-primary" />
            Prošli jste celou metodiku VISIBLE7.
          </p>
        )}
      </div>
    </Card>
  );
};
