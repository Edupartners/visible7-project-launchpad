import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { BenchmarkingTestingPhase } from "@/components/BenchmarkingTestingPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";

const learningPoints = [
  { text: "Které 2–3 kanály se hodí právě pro vašeho zákazníka", color: "bg-emerald-500" },
  { text: "Jak kanál nastavit podle videa", color: "bg-sky-500" },
  { text: "Kde a čím inzeruje vaše konkurence", color: "bg-violet-500" },
  { text: "Kdy kanál škálovat, ladit nebo vypnout podle PNO", color: "bg-orange-500" },
];

const BenchmarkingPage = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const back = () => navigate("/home");

  return (
    <PageLayout onBack={back}>
      {showIntro ? (
        <PhaseIntroTemplate
          title="Budování poptávky"
          subtitle="Kde najdete zákazníky a co se vyplatí"
          description="Kanály máte seřazené podle svého projektu. Vyberete si, nastavíte je podle videí a vyzkoušíte s malým rozpočtem. Výsledek pak porovnáte s maximálním PNO z byznys case. Uvidíte, kam se vyplatí dát peníze a co vypnout."
          phaseNumber={5}
          icon={BarChart3}
          learningPoints={learningPoints}
          estimatedTime="35 minut + 14 dní test"
          steps={4}
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
