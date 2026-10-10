import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useProject } from "@/contexts/ProjectContext";
import { JourneyMap } from "@/components/diagnosis/JourneyMap";
import type { BusinessCaseData } from "@/lib/businessCase";
import { DIAGNOSIS_KEY, Diagnosis, MapPoint, caseFromDiagnosis, journeyMap, targetIncome } from "@/lib/diagnosis";

/** Výzva k rentgenu (když ještě není), jinak živá mapa A → D z aktuálního byznys casu. */
export const DashboardJourney = ({ prominent }: { prominent: boolean }) => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [diagnosis, , { loading }] = useSupabaseProgress<Diagnosis | null>(DIAGNOSIS_KEY, null);
  const [bc] = useSupabaseProgress<BusinessCaseData | null>("business_case", null);
  const [launch] = useSupabaseProgress<{ reached?: Record<string, string> } | null>("launch_plan", null);

  const map = useMemo(() => {
    if (!diagnosis) return null;
    const live = bc?.revenue?.volume12 ? bc : caseFromDiagnosis(diagnosis.ai);
    return journeyMap(
      currentProject?.business_type ?? diagnosis.ai.businessType,
      live,
      targetIncome(diagnosis.answers),
    );
  }, [diagnosis, bc, currentProject?.business_type]);

  if (loading) return null;

  if (!diagnosis) {
    return (
      <section
        aria-label="Rentgen nápadu"
        className={`flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${
          prominent ? "bg-primary text-white" : "border border-border bg-card"
        }`}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
              prominent ? "bg-orange-500 text-white" : "bg-primary/10 text-primary"
            }`}
          >
            <ScanLine className="h-7 w-7" />
          </span>
          <div>
            <p className={`text-sm font-semibold ${prominent ? "text-orange-300" : "text-primary"}`}>
              {prominent ? "Začněte tady" : "Nové"}
            </p>
            <h2 className="text-2xl font-bold tracking-tight">Rentgen nápadu</h2>
            <p className={`mt-1 max-w-lg ${prominent ? "text-white/80" : "text-muted-foreground"}`}>
              Čtyři otázky a AI vám ukáže, jestli nápad obstojí, kolik bude stát a kdy vás může uživit.
            </p>
            <p
              className={`mt-2 flex items-center gap-1.5 text-sm ${prominent ? "text-white/60" : "text-muted-foreground"}`}
            >
              <Clock className="h-4 w-4" /> asi 10 minut · zdarma
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/rentgen")}
          className="h-12 shrink-0 rounded-[10px] bg-orange-500 px-6 text-base font-semibold text-white hover:bg-orange-600"
        >
          Udělat rentgen <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>
    );
  }

  const reached: MapPoint["id"][] = ["A"];
  if (launch?.reached?.mvp) reached.push("B");

  return (
    <section aria-labelledby="mapa" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="mapa" className="text-lg font-bold">
            Vaše cesta z bodu A do bodu D
          </h2>
          <p className="text-sm text-muted-foreground">
            {bc?.revenue?.volume12 ? "Počítáno z vašeho byznys casu." : "Počítáno z rentgenu nápadu."} Upravíte-li čísla
            v bráně 3, mapa se zpřesní.
          </p>
        </div>
        <Button variant="outline" className="rounded-[10px]" onClick={() => navigate("/rentgen")}>
          <ScanLine className="mr-2 h-4 w-4" /> Rentgen
        </Button>
      </div>
      {map && (
        <div className="mt-6">
          <JourneyMap points={map.points} reached={reached} />
        </div>
      )}
    </section>
  );
};
