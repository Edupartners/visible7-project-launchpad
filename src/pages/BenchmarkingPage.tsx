import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { BenchmarkingTestingPhase } from "@/components/BenchmarkingTestingPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";

const learningPoints = [
  { text: "Které kurzy a kanály se hodí k vašemu projektu", color: "bg-emerald-500" },
  { text: "Jak nastavit reklamu krok za krokem s lektory z praxe", color: "bg-sky-500" },
  { text: "Jak měřit výsledky v Google Analytics", color: "bg-violet-500" },
];

const BenchmarkingPage = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const back = () => navigate("/home");

  return (
    <PageLayout onBack={back}>
      {showIntro ? (
        <PhaseIntroTemplate
          title="Marketing a budování poptávky"
          subtitle="Kde najdete zákazníky a co se vyplatí"
          description="Kurzy marketingu od lektorů z praxe. Zeleně uvidíte ty, které se hodí k vašemu projektu."
          phaseNumber={5}
          icon={BarChart3}
          learningPoints={learningPoints}
          estimatedTime="podle vybraných kurzů"
          steps={3}
          onStart={() => setShowIntro(false)}
          onBack={back}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
      ) : (
        <BenchmarkingTestingPhase onChannelSelect={(id) => navigate(`/marketing-channel/${id}`)} />
      )}
    </PageLayout>
  );
};

export default BenchmarkingPage;
