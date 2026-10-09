import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket } from "lucide-react";
import { LaunchPhase } from "@/components/LaunchPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";

const learningPoints = [
  { text: "Proč začít jedním produktem a úzkou skupinou zákazníků", color: "bg-orange-500" },
  { text: "Milníky MVP, bod zvratu a návratnost z vašeho byznys case", color: "bg-violet-500" },
  { text: "Živnost, úřady, datová schránka a odvody v roce 2026", color: "bg-emerald-500" },
  { text: "Účetnictví od prvního dne a kdy (ne)zakládat s.r.o.", color: "bg-cyan-500" },
];

const LaunchPage = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const back = () => navigate("/home");
  return (
    <PageLayout onBack={back}>
      {showIntro ? (
        <PhaseIntroTemplate
          title="Launch"
          subtitle="Start mikrobyznysu v Česku"
          description="Spustíte jeden produkt pro jednu úzkou skupinu zákazníků, s rozpočtem, o který si můžete dovolit přijít. Projdete vše, co je potřeba vyřídit – živnost, úřady, datovou schránku, odvody a účetnictví – a nastavíte milníky MVP podle svého byznys case."
          phaseNumber={6}
          icon={Rocket}
          learningPoints={learningPoints}
          estimatedTime="40 minut"
          steps={3}
          onStart={() => setShowIntro(false)}
          onBack={back}
          gradient="from-orange-500/10 to-red-500/10"
        />
      ) : (
        <LaunchPhase />
      )}
    </PageLayout>
  );
};

export default LaunchPage;
