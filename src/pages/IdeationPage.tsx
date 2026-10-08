
import { IdeationPhase } from "@/components/IdeationPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useState } from "react";
import { Lightbulb } from "lucide-react";

const IdeationPage = () => {
  const navigate = useNavigate();
  const [completedPhases, setCompletedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  const handleComplete = () => {
    setCompletedPhases(prev => {
      if (!prev.includes(2)) {
        return [...prev, 2];
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
    { text: "Celý byznys na jedné stránce – 8 polí Lean Canvasu", color: "bg-violet-500" },
    { text: "Navázání na modrý oceán: zákazník, problém, USP", color: "bg-emerald-500" },
    { text: "Volba typu online byznysu", color: "bg-orange-500" },
    { text: "Vyhodnocení canvasu s AI mentorem", color: "bg-cyan-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Lean Canvas"
          subtitle="Celý byznys na jedné stránce"
          description="Z modrého oceánu převezmeme zákazníka, problém a USP. AI pomocník navrhne zbylá pole – řešení, kanály, náklady a příjmy – a odhadne typ online byznysu. Vy rozhodnete, co použijete. Nakonec canvas vyhodnotí AI mentor."
          phaseNumber={2}
          icon={Lightbulb}
          learningPoints={learningPoints}
          estimatedTime="25 minut"
          steps={4}
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
