import { BusinessCasePhase } from "@/components/BusinessCasePhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useState } from "react";
import { Target } from "lucide-react";

const StrategyPage = () => {
  const navigate = useNavigate();
  const [completedPhases, setCompletedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  const handleComplete = () => {
    setCompletedPhases((prev) => {
      if (!prev.includes(3)) {
        return [...prev, 3];
      }
      return prev;
    });
  };

  const handleBack = () => {
    navigate("/home");
  };

  const handleStart = () => {
    setShowIntro(false);
  };

  const learningPoints = [
    { text: "Obrat, zisk a marže na dva roky dopředu", color: "bg-emerald-500" },
    { text: "Potřebný kapitál, bod zvratu a návratnost", color: "bg-blue-500" },
    { text: "Kolik smíte dát do marketingu (PNO z vaší marže)", color: "bg-orange-500" },
    { text: "Tři scénáře a komentář AI Michala", color: "bg-violet-500" },
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Strategie a čísla"
          subtitle="Vyplatí se to?"
          description="K nákladům a kanálům z Lean Canvasu doplníte čísla. Aplikace z nich spočítá obrat, zisk, kolik peněz potřebujete na start, bod zvratu a návratnost, a to ve třech scénářích. Z vaší marže vyjde i maximální PNO. Uvidíte tak, kolik můžete dát do marketingu, aniž byste prodělali."
          phaseNumber={3}
          icon={Target}
          learningPoints={learningPoints}
          estimatedTime="45 minut"
          steps={4}
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
      <BusinessCasePhase onComplete={handleComplete} />
    </PageLayout>
  );
};

export default StrategyPage;
