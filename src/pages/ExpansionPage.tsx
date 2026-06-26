
import { ExpansionPhase } from "@/components/ExpansionPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

const ExpansionPage = () => {
  const navigate = useNavigate();
  const [completedPhases, setCompletedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  const handleComplete = () => {
    setCompletedPhases(prev => {
      if (!prev.includes(7)) {
        return [...prev, 7];
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
    { text: "Scaling strategie a growth hacking", color: "bg-emerald-500" },
    { text: "Expanze na nové trhy a segmenty", color: "bg-blue-500" },
    { text: "Organizační růst a team building", color: "bg-violet-500" },
    { text: "Financování růstu a investice", color: "bg-orange-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Expansion"
          subtitle="Škálování a růst businness"
          description="V závěrečné fázi Expansion se zaměříme na udržitelný růst a škálování vašeho businessu. Naučíte se growth hacking techniky, strategii expanze na nové trhy a jak řídit organizační růst. Probereme také možnosti financování růstu a jak připravit business na další fázi vývoje."
          phaseNumber={7}
          icon={TrendingUp}
          learningPoints={learningPoints}
          estimatedTime="35 minut"
          steps={6}
          hasAiValidation={false}
          onStart={handleStart}
          onBack={handleBack}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout onBack={handleBack}>
      <ExpansionPhase onComplete={handleComplete} onBack={handleBack} />
    </PageLayout>
  );
};

export default ExpansionPage;
