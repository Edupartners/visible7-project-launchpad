
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
    setCompletedPhases(prev => {
      if (!prev.includes(3)) {
        return [...prev, 3];
      }
      return prev;
    });
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleStart = () => {
    setShowIntro(false);
  };

  const learningPoints = [
    { text: "Obrat, zisk a marže na dva roky dopředu", color: "bg-emerald-500" },
    { text: "Potřebný kapitál, bod zvratu a návratnost", color: "bg-blue-500" },
    { text: "Kolik smíte dát do marketingu (PNO z vaší marže)", color: "bg-orange-500" },
    { text: "Tři scénáře a komentář AI mentora", color: "bg-violet-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Byznys case"
          subtitle="Vyplatí se to?"
          description="Náklady a kanály z Lean Canvasu doplníte o čísla. Aplikace spočítá obrat, zisk, potřebný kapitál, bod zvratu a návratnost ve třech scénářích. Maximální PNO odvodí z vaší marže, takže uvidíte, kolik smíte utratit za marketing."
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
