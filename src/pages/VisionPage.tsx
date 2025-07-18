
import { VisionPhase } from "@/components/VisionPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useState } from "react";
import { Eye } from "lucide-react";

const VisionPage = () => {
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
      if (!prev.includes(1)) {
        return [...prev, 1];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleStart = () => {
    setShowIntro(false);
  };

  const learningPoints = [
    { text: "Blue Ocean Strategy - jak najít volný prostor na trhu", color: "bg-blue-500" },
    { text: "ERRC matice - eliminace, redukce, pozvýšení a vytvoření hodnot", color: "bg-emerald-500" },
    { text: "Hodnotová křivka - positioning vůči konkurenci", color: "bg-violet-500" },
    { text: "AI validace - ověření životaschopnosti vize", color: "bg-orange-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Vision"
          subtitle="Strategie modrého oceánu"
          description="Blue Ocean Strategy vám pomůže najít neobsazený prostor na trhu, kde můžete vytvořit novou poptávku místo konkurování v přeplněném 'červeném oceánu'. ERRC matice (Eliminate-Reduce-Raise-Create) je srdcem této strategie a pomůže vám identifikovat co odstranit z trhu, co zlevnit, co vylepšit a co úplně nového vytvořit. Výsledkem je jedinečná hodnotová propozice, která vás odliší od konkurence."
          phaseNumber={1}
          icon={Eye}
          learningPoints={learningPoints}
          estimatedTime="25 minut"
          steps={5}
          hasAiValidation={true}
          onStart={handleStart}
          onBack={handleBack}
          gradient="from-blue-500/10 to-cyan-500/10"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout onBack={handleBack}>
      <VisionPhase onComplete={handleComplete} onBack={handleBack} />
    </PageLayout>
  );
};

export default VisionPage;
