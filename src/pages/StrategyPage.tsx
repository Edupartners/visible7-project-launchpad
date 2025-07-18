
import { StrategyBusinessPhase } from "@/components/StrategyBusinessPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useState } from "react";
import { Target } from "lucide-react";

const StrategyPage = () => {
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
      if (!prev.includes(3)) {
        return [...prev, 3];
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
    { text: "Business model canvas a revenue streams", color: "bg-emerald-500" },
    { text: "Analýza konkurence a market positioning", color: "bg-blue-500" },
    { text: "Pricing strategie a cost structure", color: "bg-orange-500" },
    { text: "Go-to-market strategie", color: "bg-violet-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Strategy & Business"
          subtitle="Obchodní model a tržní strategie"
          description="V této fázi vytvoříte kompletní obchodní model pomocí Business Model Canvas. Analyzujete konkurenci, definujete pricing strategii a připravíte go-to-market plán. Zaměříme se na praktické aspekty spuštění vašeho projektu včetně kalkulace nákladů, stanovení cen a identifikace klíčových metrik úspěchu."
          phaseNumber={3}
          icon={Target}
          learningPoints={learningPoints}
          estimatedTime="40 minut"
          steps={7}
          hasAiValidation={true}
          onStart={handleStart}
          onBack={handleBack}
          gradient="from-emerald-500/10 to-green-500/10"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout onBack={handleBack}>
      <StrategyBusinessPhase onComplete={handleComplete} onBack={handleBack} />
    </PageLayout>
  );
};

export default StrategyPage;
