import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ADVISORS } from "@/lib/advisors";
import { track } from "@/lib/track";

/**
 * Průvodce v mezikrocích: po registraci uvítání, po rentgenu a po každé bráně jedno okno
 * „hotovo – teď tohle – proč“. Každé okno se v projektu ukáže jen jednou; průvodce jde vypnout.
 */
type Step = { title: string; done?: string; next: string; why: string; cta: string; to: string };

const STEPS: Record<string, Step> = {
  welcome: {
    title: "Dobrý den, vítejte ve VISIBLE7",
    next: "Začněte rentgenem nápadu",
    why: "Čtyři otázky, pět minut. Hned uvidíte, jestli nápad obstojí, kolik bude stát a kdy vás může uživit. Pak vás provedu sedmi branami od nápadu k prvním zákazníkům.",
    cta: "Udělat rentgen nápadu",
    to: "/rentgen",
  },
  rentgen: {
    title: "Rentgen máte hotový",
    done: "Víte, jak nápad obstojí a co ověřit jako první.",
    next: "Brána 1: Vize",
    why: "Najdete, čím budete jiní než levná i prémiová konkurence (modrý oceán). Rentgen bránu předvyplnil, vy ji jen opravíte.",
    cta: "Otevřít bránu 1",
    to: "/vision",
  },
  "1": {
    title: "Máte svůj modrý oceán",
    done: "Víte, čím se odlišíte, a máte první osvědčení.",
    next: "Brána 2: Ideace",
    why: "Celý byznys poskládáte na jednu stránku (Lean Canvas). AI Michal navrhne zbylá pole a typ byznysu.",
    cta: "Otevřít bránu 2",
    to: "/ideation",
  },
  "2": {
    title: "Byznys máte na jedné stránce",
    done: "Zákazník, problém, řešení, kanály, náklady i příjmy.",
    next: "Brána 3: Strategie a čísla",
    why: "Spočítáte, kolik peněz potřebujete, kdy se dostanete do zisku a kolik smíte dát do marketingu.",
    cta: "Otevřít bránu 3",
    to: "/strategy",
  },
  "3": {
    title: "Víte, jestli se to vyplatí",
    done: "Máte čísla na dva roky a tři scénáře.",
    next: "Brána 4: Implementace",
    why: "Postavíte web nebo e-shop podle postupu pro váš typ byznysu, krok za krokem s videi.",
    cta: "Otevřít bránu 4",
    to: "/implementation",
  },
  "4": {
    title: "Projekt má svůj web",
    done: "Víte, jak ho postavit a co na něm nesmí chybět.",
    next: "Brána 5: Budování poptávky",
    why: "Vyberete marketingové kanály, kde váš zákazník opravdu nakupuje, a otestujete zájem.",
    cta: "Otevřít bránu 5",
    to: "/benchmarking-phase",
  },
  "5": {
    title: "Víte, kde najít zákazníky",
    done: "Máte kanály seřazené podle vašeho zákazníka.",
    next: "Brána 6: Launch",
    why: "Spustíte projekt, získáte první zákazníky a vyřídíte živnost a úřady.",
    cta: "Otevřít bránu 6",
    to: "/launch",
  },
  "6": {
    title: "Projekt je spuštěný",
    done: "První zákazníci a sledované ukazatele.",
    next: "Brána 7: Expanze",
    why: "Naplánujete růst: tým, automatizaci a další trhy.",
    cta: "Otevřít bránu 7",
    to: "/expansion",
  },
  "7": {
    title: "Prošli jste všech 7 bran",
    done: "Od nápadu po růst. Gratuluji.",
    next: "Certifikace a zkouška",
    why: "Stáhněte si osvědčení a certifikaci. Kdo chce doklad uznaný státem, může složit zkoušku profesní kvalifikace.",
    cta: "Moje osvědčení",
    to: "/settings#osvedceni",
  },
};

const ORDER = ["welcome", "rentgen", "1", "2", "3", "4", "5", "6", "7"];
const OFF_KEY = "v7_guide_off";
const seenKey = (projectId: string) => `v7_guide_seen_${projectId}`;
const michal = ADVISORS.find((a) => a.name.includes("Míček"));

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* bez úložiště */
  }
};

export const JourneyGuide = ({ projectId, stage }: { projectId: string; stage: string }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [off, setOff] = useState(false);
  const step = STEPS[stage];

  useEffect(() => {
    if (!step || read(OFF_KEY) === "1") return;
    const seen = (read(seenKey(projectId)) ?? "").split(",");
    if (seen.includes(stage)) return;
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [projectId, stage, step]);

  if (!step) return null;
  const idx = ORDER.indexOf(stage);

  const close = (go: boolean) => {
    const seen = new Set((read(seenKey(projectId)) ?? "").split(",").filter(Boolean));
    seen.add(stage);
    write(seenKey(projectId), [...seen].join(","));
    if (off) write(OFF_KEY, "1");
    track("guide_step", { stage, action: go ? "go" : "close", off });
    setOpen(false);
    if (go) navigate(step.to);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close(false)}>
      <DialogContent className="max-w-md">
        <div className="flex items-center gap-3">
          {michal?.photo && (
            <img
              src={michal.photo}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full bg-muted object-cover object-top ring-2 ring-signal/50"
            />
          )}
          <div className="min-w-0">
            <DialogTitle className="text-xl font-extrabold tracking-tight">{step.title}</DialogTitle>
            {stage === "welcome" && <p className="text-xs text-muted-foreground">Michal Míček, autor metodiky</p>}
          </div>
        </div>

        {/* Kde na cestě jste: rentgen + 7 bran */}
        <ol className="mt-2 flex items-center gap-1.5" aria-label="Vaše cesta">
          {ORDER.slice(1).map((s, i) => {
            const state = i + 1 <= idx ? "done" : i === idx ? "now" : "todo";
            return (
              <li
                key={s}
                title={s === "rentgen" ? "Rentgen nápadu" : `Brána ${s}`}
                className={`flex h-7 flex-1 items-center justify-center rounded-md text-xs font-bold ${
                  state === "done"
                    ? "bg-leaf-500 text-white"
                    : state === "now"
                      ? "bg-signal text-signal-foreground ring-2 ring-leaf-600"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" /> : s === "rentgen" ? "R" : s}
              </li>
            );
          })}
        </ol>

        <DialogDescription asChild>
          <div className="space-y-3 text-base text-foreground">
            {step.done && (
              <p className="flex gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" aria-hidden="true" />
                {step.done}
              </p>
            )}
            <p>
              <span className="block text-xs font-bold uppercase tracking-[0.1em] text-leaf-700">Teď</span>
              <span className="text-lg font-bold">{step.next}</span>
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.why}</p>
          </div>
        </DialogDescription>

        <div className="mt-2 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => close(true)}
            className="v7-trap-btn v7-phi-sm inline-flex h-12 items-center justify-center gap-2 pl-6 pr-11 font-bold text-signal-foreground"
          >
            {step.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" checked={off} onChange={(e) => setOff(e.target.checked)} />
              Průvodce už neukazovat
            </label>
            <button
              type="button"
              onClick={() => close(false)}
              className="font-semibold text-muted-foreground hover:text-foreground"
            >
              Teď ne
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
