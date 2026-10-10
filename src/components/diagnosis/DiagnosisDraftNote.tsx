import { ScanLine } from "lucide-react";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { DIAGNOSIS_KEY, Diagnosis } from "@/lib/diagnosis";

const TEXT: Record<string, string> = {
  vision: "Zákazník, problém a konkurence jsou předvyplněné z Rentgenu nápadu.",
  canvas: "Lean Canvas je předvyplněný z Rentgenu nápadu.",
  case: "Příjmy a náklady jsou předvyplněné z Rentgenu nápadu.",
};

/** Upozornění, že bránu předvyplnil rentgen – je to návrh, ne hotová práce. Po dokončení brány zmizí. */
export const DiagnosisDraftNote = ({ part, gate }: { part: "vision" | "canvas" | "case"; gate: number }) => {
  const [diagnosis] = useSupabaseProgress<Diagnosis | null>(DIAGNOSIS_KEY, null);
  const [completed] = useSupabaseProgress<number[]>("completed_phases", []);
  if (!diagnosis?.prefilled?.includes(part) || completed.includes(gate)) return null;
  return (
    <p className="flex gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-950 ring-1 ring-sky-200">
      <ScanLine className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />
      <span>
        <span className="font-semibold">{TEXT[part]} </span>
        Je to první návrh od AI. Projděte každé pole a přepište ho podle sebe, teprve pak bránu dokončete.
      </span>
    </p>
  );
};
