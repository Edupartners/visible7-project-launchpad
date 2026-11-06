import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock, Compass, Lightbulb, X } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";
import { track } from "@/lib/track";

/**
 * Průvodce bránou (brány 1–3): vede krok po kroku přímo ve formuláři.
 * Aktuální krok je zvýrazněný, ostatní ztlumené. Nad krokem je karta: co udělat (pro úplného začátečníka),
 * kolik času to zabere, příklad z vzorového projektu WeSportly a kdy je hotovo.
 * Stav (krok, vypnuto) je v prohlížeči podle projektu a brány.
 */
export interface GuideStep {
  id: string;
  title: string;
  /** Odhad času, např. „10–15 minut“ */
  time: string;
  /** Vysvětlení pro člověka, který to vidí poprvé. Každá položka je jeden odstavec. */
  explain: string[];
  /** Jak to vyplnil vzorový projekt WeSportly: [pole, text] */
  example: [string, string][];
  /** Kdy je krok hotový (zobrazí se jako kontrola) */
  doneWhen: string;
  done: boolean;
  /** Krok, u kterého je potřeba se opravdu zamyslet */
  think?: boolean;
}

interface Ctx {
  on: boolean;
  current: string | null;
  steps: GuideStep[];
  go: (i: number) => void;
  off: () => void;
}

const GuideCtx = createContext<Ctx>({ on: false, current: null, steps: [], go: () => {}, off: () => {} });

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(k);
    else localStorage.setItem(k, v);
  } catch {
    /* bez úložiště */
  }
};

const scrollToStep = (id: string) =>
  setTimeout(() => {
    const el = document.getElementById(`guide-${id}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({ top, behavior: "smooth" });
  }, 60);

export const GateGuideProvider = ({
  gate,
  steps,
  children,
}: {
  gate: number;
  steps: GuideStep[];
  children: React.ReactNode;
}) => {
  const { currentProject } = useProject();
  const pid = currentProject?.id ?? "none";
  const stepKey = `v7_gate_guide_${pid}_${gate}`;
  const offKey = `v7_gate_guide_off_${pid}_${gate}`;
  const [on, setOn] = useState(true);
  const [current, setCurrent] = useState<string | null>(null);

  // Načtení stavu: uložený krok, jinak první nehotový.
  useEffect(() => {
    setOn(read(offKey) !== "1");
    const saved = read(stepKey);
    if (saved && steps.some((s) => s.id === saved)) setCurrent(saved);
    else setCurrent((steps.find((s) => !s.done) ?? steps[0])?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, gate]);

  const go = useCallback(
    (i: number) => {
      const s = steps[Math.max(0, Math.min(steps.length - 1, i))];
      if (!s) return;
      setCurrent(s.id);
      write(stepKey, s.id);
      track("gate_guide_step", { gate, step: s.id });
      scrollToStep(s.id);
    },
    [steps, stepKey, gate],
  );

  const off = useCallback(() => {
    setOn(false);
    write(offKey, "1");
    track("gate_guide_off", { gate, step: current });
  }, [offKey, gate, current]);

  const start = () => {
    setOn(true);
    write(offKey, null);
    const first = steps.find((s) => !s.done) ?? steps[0];
    if (first) go(steps.indexOf(first));
  };

  const value = useMemo(() => ({ on, current, steps, go, off }), [on, current, steps, go, off]);
  const doneCount = steps.filter((s) => s.done).length;
  const idx = steps.findIndex((s) => s.id === current);

  return (
    <GuideCtx.Provider value={value}>
      {/* Lišta průvodce: kde jsem a kolik zbývá */}
      <div className="sticky top-14 z-30 -mx-1 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:top-16">
        {on ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-2 text-sm font-bold">
              <Compass className="h-4 w-4 text-leaf-600" aria-hidden="true" /> Průvodce bránou
            </span>
            <ol className="flex flex-1 items-center gap-1.5" aria-label="Kroky brány">
              {steps.map((s, i) => (
                <li key={s.id} className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => go(i)}
                    title={`${i + 1}. ${s.title}`}
                    className={`block h-2 w-full rounded-full transition-colors ${
                      s.id === current ? "bg-signal ring-2 ring-leaf-500" : s.done ? "bg-leaf-500" : "bg-muted"
                    }`}
                  >
                    <span className="sr-only">
                      Krok {i + 1}: {s.title}
                      {s.done ? " (hotovo)" : ""}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <span className="text-sm text-muted-foreground">
              Krok {idx + 1} z {steps.length} · hotovo {doneCount}
            </span>
            <button
              type="button"
              onClick={off}
              className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" /> Vypnout
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Hotovo {doneCount} z {steps.length} kroků
            </span>
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 text-sm font-semibold text-leaf-700 hover:underline"
            >
              <Compass className="h-4 w-4" aria-hidden="true" /> Projít s průvodcem krok za krokem
            </button>
          </div>
        )}
      </div>
      {children}
    </GuideCtx.Provider>
  );
};

/** Obal jednoho kroku: nad aktuálním krokem karta průvodce, ostatní kroky ztlumené. */
export const GuideStepBlock = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { on, current, steps, go, off } = useContext(GuideCtx);
  const i = steps.findIndex((s) => s.id === id);
  const step = steps[i];
  const active = on && current === id;
  const dimmed = on && current !== null && !active;
  const last = i === steps.length - 1;

  return (
    <div
      id={`guide-${id}`}
      className={`scroll-mt-32 rounded-[1.4rem] transition-all duration-300 ${
        active ? "bg-leaf-50 p-2 ring-[3px] ring-signal sm:p-3" : ""
      } ${dimmed ? "opacity-40 hover:opacity-90" : ""}`}
    >
      {active && step && (
        <div className="mb-3 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-leaf-700">
              Krok {i + 1} z {steps.length}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold">
              <Clock className="h-4 w-4" aria-hidden="true" /> {step.time}
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight">{step.title}</h3>
          {step.think && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900">
              <Lightbulb className="h-4 w-4" aria-hidden="true" /> Tady se opravdu zamyslete. Na tomhle kroku stojí
              všechno další.
            </p>
          )}
          <div className="mt-3 space-y-2 leading-relaxed">
            {step.explain.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-leaf-200 bg-leaf-50 p-4 text-sm">
            <p className="font-bold">Příklad: vzorový projekt WeSportly</p>
            <p className="text-muted-foreground">
              Krátká videa, jak si sám opravit a seřídit kolo, a pod nimi správný díl.
            </p>
            <dl className="mt-2 space-y-1.5">
              {step.example.map(([k, v]) => (
                <div key={k}>
                  <dt className="inline font-semibold">{k}: </dt>
                  <dd className="inline">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p
            className={`mt-4 flex items-start gap-2 text-sm font-semibold ${step.done ? "text-leaf-700" : "text-muted-foreground"}`}
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                step.done ? "bg-leaf-500 text-white" : "border-2 border-muted-foreground/40"
              }`}
            >
              {step.done && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
            </span>
            Hotovo, když: {step.doneWhen}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {i > 0 && (
              <button
                type="button"
                onClick={() => go(i - 1)}
                className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border px-4 font-semibold hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zpět
              </button>
            )}
            {!last ? (
              <button
                type="button"
                disabled={!step.done}
                onClick={() => go(i + 1)}
                className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Další krok: {steps[i + 1].title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!step.done}
                onClick={() => {
                  off();
                  document.getElementById("guide-finish")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="v7-trap-btn inline-flex h-11 items-center gap-2 pl-5 pr-10 font-bold text-signal-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hotovo, zkontrolovat bránu <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            {!step.done && !last && (
              <button
                type="button"
                onClick={() => go(i + 1)}
                className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
              >
                Přeskočit zatím
              </button>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
};
