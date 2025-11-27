
import { IdeationPhase } from "@/components/IdeationPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useState } from "react";
import { Lightbulb } from "lucide-react";

const IdeationPage = () => {
  const navigate = useNavigate();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  const handleComplete = () => {
    setCompletedPhases(prev => {
      if (!prev.includes(2)) {
        return [...prev, 2];
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
    { text: "Design Thinking proces - od empatie k testování", color: "bg-violet-500" },
    { text: "Persony a customer journey mapping", color: "bg-emerald-500" },
    { text: "Brainstorming a ideation techniky", color: "bg-orange-500" },
    { text: "Validace nápadů a concept testování", color: "bg-cyan-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Ideation"
          subtitle="Design Thinking a generování nápadů"
          description="Ve fázi Ideation se zaměříme na systematické generování a validaci nápadů pomocí Design Thinking metodiky. Naučíte se vytvářet persony, mapovat customer journey a aplikovat pokročilé brainstorming techniky. Cílem je transformovat vaši vizi z předchozí fáze na konkrétní, validované nápady, které můžete dále rozvíjet."
          phaseNumber={2}
          icon={Lightbulb}
          learningPoints={learningPoints}
          estimatedTime="35 minut"
          steps={6}
          hasAiValidation={true}
          onStart={handleStart}
          onBack={handleBack}
          gradient="from-violet-500/10 to-purple-500/10"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout onBack={handleBack}>
      <IdeationPhase onComplete={handleComplete} onBack={handleBack} />
    </PageLayout>
  );
};

export default IdeationPage;
