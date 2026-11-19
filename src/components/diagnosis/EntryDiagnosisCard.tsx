import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Výzva ke vstupní diagnostice na nástěnce (první krok nového projektu). */
export const EntryDiagnosisCard = () => {
  const navigate = useNavigate();
  return (
    <section
      aria-label="Vstupní diagnostika"
      className="flex flex-col gap-5 rounded-2xl bg-primary p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-signal text-signal-foreground">
          <Compass className="h-7 w-7" />
        </span>
        <div>
          <p className="text-sm font-semibold text-signal">Začněte tady</p>
          <h2 className="text-2xl font-bold tracking-tight">Co už umíte a co vám chybí ke startu</h2>
          <p className="mt-1 max-w-lg text-white/80">
            Zjistíte, na co máte talent, co už zvládáte a co se doučíte. Bez hodnocení nápadu, jen mapa pro vás.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-white/60">
            <Clock className="h-4 w-4" /> asi 4 minuty · zdarma
          </p>
        </div>
      </div>
      <Button
        onClick={() => navigate("/diagnostika")}
        className="v7-trap-btn v7-phi-sm h-12 shrink-0 pl-6 pr-12 text-base font-bold text-signal-foreground"
      >
        Udělat diagnostiku <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </section>
  );
};
