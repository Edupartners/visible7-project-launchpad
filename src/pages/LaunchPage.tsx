
import { LaunchPhase } from "@/components/LaunchPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useState } from "react";
import { Rocket } from "lucide-react";

const LaunchPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    setCompletedPhases(prev => {
      if (!prev.includes(6)) {
        return [...prev, 6];
      }
      return prev;
    });
    navigate('/home');
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleStart = () => {
    setShowIntro(false);
  };

  const learningPoints = [
    { text: "Launch strategie a timeline planning", color: "bg-orange-500" },
    { text: "PR a media relations pro launch", color: "bg-violet-500" },
    { text: "Customer onboarding a retention", color: "bg-emerald-500" },
    { text: "Monitoring a optimalizace po launchu", color: "bg-cyan-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Launch"
          subtitle="Úspěšné spuštění na trh"
          description="Fáze Launch se zaměřuje na strategické spuštění vašeho produktu či služby na trh. Vytvoříte detailní launch plán, připravíte PR strategii a nastavíte systémy pro monitorování úspěchu. Naučíte se jak koordinovat všechny aspekty launchu, od technické přípravy až po customer onboarding a retention strategie."
          phaseNumber={6}
          icon={Rocket}
          learningPoints={learningPoints}
          estimatedTime="30 minut"
          steps={5}
          hasAiValidation={false}
          onStart={handleStart}
          onBack={handleBack}
          gradient="from-orange-500/10 to-red-500/10"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout onBack={handleBack}>
      <LaunchPhase onComplete={handleComplete} onBack={handleBack} />
    </PageLayout>
  );
};

export default LaunchPage;
