import { useNavigate } from "react-router-dom";
import { UnifiedHeader } from "./layout/UnifiedHeader";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { GateJourney } from "./GateJourney";
import { CertificatesPanel } from "./CertificatesPanel";
import { GATE_NAMES } from "@/lib/certificates";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { Button } from "@/components/ui/button";
import { Target, Lightbulb, TrendingUp, Wrench, BarChart3, Rocket, Layers, FileText } from "lucide-react";

const phases = [
  { id: 1, description: "Najděte místo mezi levnou a prémiovou konkurencí.", icon: Target, time: "45 min", route: "/vision" },
  { id: 2, description: "Celý byznys na jedné stránce, s návrhy od AI.", icon: Lightbulb, time: "25 min", route: "/ideation" },
  { id: 3, description: "Návratnost, PNO, bod zvratu a potřebný kapitál.", icon: TrendingUp, time: "60 min", route: "/strategy" },
  { id: 4, description: "Postup tvorby podle typu vašeho byznysu.", icon: Wrench, time: "20 min", route: "/implementation" },
  { id: 5, description: "Marketingové kanály seřazené podle vašeho zákazníka.", icon: BarChart3, time: "35 min", route: "/benchmarking-phase" },
  { id: 6, description: "Spuštění projektu a sledované ukazatele.", icon: Rocket, time: "40 min", route: "/launch" },
  { id: 7, description: "Jak projekt rozšiřovat, když už běží.", icon: Layers, time: "50 min", route: "/expansion" },
];

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
  isAuthenticated?: boolean;
}

export const Dashboard = ({
  userEmail,
  onLogout,
  isAuthenticated = true
}: DashboardProps) => {
  const navigate = useNavigate();
  // Postup uživatele - jeden projekt, ukládá se v Supabase (cross-device)
  const [completedPhases] = useSupabaseProgress<number[]>("completed_phases", []);

  const allCoreCompleted = completedPhases.filter(id => id <= 3).length === 3;

  const handleInvestorPitchClick = () => {
    navigate('/investor-pitch');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <UnifiedHeader showTrialInfo={false} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ProjectSwitcher />

        <div className="mb-8">
          <GateJourney
            gates={phases.map((p) => ({ ...p, name: GATE_NAMES[p.id] }))}
            completed={completedPhases}
            onOpen={(route) => navigate(route)}
          />
        </div>

        <div className="mb-8">
          <CertificatesPanel completed={completedPhases} />
        </div>

        {/* Investor pitch po fázích 1–3 */}
        {allCoreCompleted && (
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <FileText className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Prezentace pro investory</h3>
                <p className="text-muted-foreground">Z dat fází 1–3 sestavíme prezentaci vašeho projektu.</p>
              </div>
            </div>
            <Button onClick={handleInvestorPitchClick} className="btn-apple shrink-0">
              Sestavit prezentaci
            </Button>
          </section>
        )}
      </div>

    </div>
  );
};
