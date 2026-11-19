import { useState } from "react";
import { PencilLine, ScanLine, X } from "lucide-react";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { DIAGNOSIS_KEY, Diagnosis } from "@/lib/diagnosis";

const TEXT: Record<string, string> = {
  vision: "Zákazník, problém a konkurence jsou předvyplněné z Rentgenu nápadu.",
  canvas: "Lean Canvas je předvyplněný z Rentgenu nápadu.",
  case: "Příjmy a náklady jsou předvyplněné z Rentgenu nápadu.",
};

const hideKey = (gate: number) => `v7_you_fill_${gate}`;
const isHidden = (gate: number) => {
  try {
    return localStorage.getItem(hideKey(gate)) === "1";
  } catch {
    return false;
  }
};

/**
 * Na začátku brány: projekt vyplňujete vy, AI jen pomáhá. U starších projektů, které předvyplnil
 * rentgen nápadu, upozorní, že je to jen návrh. Po dokončení brány zmizí, jde i zavřít.
 */
export const DiagnosisDraftNote = ({ part, gate }: { part: "vision" | "canvas" | "case"; gate: number }) => {
  const [diagnosis] = useSupabaseProgress<Diagnosis | null>(DIAGNOSIS_KEY, null);
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);
  const [hidden, setHidden] = useState(() => isHidden(gate));
  if (completed.includes(gate)) return null;

  if (diagnosis?.prefilled?.includes(part)) {
    return (
      <p className="flex gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-950 ring-1 ring-sky-200">
        <ScanLine className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
        <span>
          <span className="font-semibold">{TEXT[part]} </span>
          Je to první návrh od AI. Projděte každé pole a přepište ho podle sebe, teprve pak bránu dokončete.
        </span>
      </p>
    );
  }

  if (hidden) return null;
  return (
    <div className="flex gap-3 rounded-2xl bg-leaf-50 p-4 text-sm ring-1 ring-leaf-200">
      <PencilLine className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" aria-hidden="true" />
      <p className="flex-1">
        <span className="font-semibold">Tuhle bránu vyplňujete vy. </span>
        AI vám pomůže s formulací, ale za vás to neudělá. Pište vlastními slovy, klidně stručně. Když si nevíte rady,
        zeptejte se lektora nebo poradce.
      </p>
      <button
        type="button"
        aria-label="Zavřít"
        onClick={() => {
          setHidden(true);
          try {
            localStorage.setItem(hideKey(gate), "1");
          } catch {
            /* bez úložiště */
          }
        }}
        className="h-6 w-6 shrink-0 rounded text-muted-foreground hover:bg-leaf-100"
      >
        <X className="mx-auto h-4 w-4" />
      </button>
    </div>
  );
};
