import { VisionPhase } from "@/components/VisionPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { useState } from "react";
import { Eye } from "lucide-react";

const VisionPage = () => {
  const navigate = useNavigate();
  const [completedPhases, setCompletedPhases] = useSupabaseProgress<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  const handleComplete = () => {
    setCompletedPhases((prev) => {
      if (!prev.includes(1)) {
        return [...prev, 1];
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
    { text: "Komu prodáváte a jaký problém řešíte", color: "bg-blue-500" },
    { text: "Matice ERRC: co vynechat, snížit, zvýšit a vytvořit", color: "bg-emerald-500" },
    { text: "Hodnotová křivka: jak si stojíte proti levné a prémiové konkurenci", color: "bg-violet-500" },
    { text: "USP: jeden důvod, proč si zákazník vybere právě vás", color: "bg-orange-500" },
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Vize"
          subtitle="Vitamín, nebo lék? Najděte, kde můžete inovovat"
          description="Většina lidí začne tím, že dělá totéž co ostatní, jen o kousek levněji. To je červený oceán, kde se všichni perou o cenu. Modrý oceán je místo, kde zatím nikdo není, a dostanete se tam tím, že zákazníkovi přinesete novou hodnotu. Pomůže vám s tím matice ERRC: co úplně vynecháte, co uděláte méně, co uděláte lépe a co přinesete nového. Na konci máte jednu větu, proč si zákazník vybere právě vás."
          phaseNumber={1}
          icon={Eye}
          learningPoints={learningPoints}
          estimatedTime="25 minut"
          steps={5}
          hasAiValidation={false}
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
