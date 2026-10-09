import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { GrowthPhase } from "@/components/GrowthPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";

const learningPoints = [
  { text: "Kdy jste připravení růst a kdy ještě ne", color: "bg-emerald-500" },
  { text: "Která páka růstu vám přinese nejvíc: cena, věrnost, noví zákazníci", color: "bg-blue-500" },
  { text: "Past růstu: proč víc zakázek může znamenat nedostatek peněz", color: "bg-orange-500" },
  { text: "Kdy a za kolik najmout prvního člověka", color: "bg-violet-500" },
];

const ExpansionPage = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const back = () => navigate("/home");
  return (
    <PageLayout onBack={back}>
      {showIntro ? (
        <PhaseIntroTemplate
          title="Růst"
          subtitle="Rosťte podle marže, ne podle pocitu"
          description="Projekt běží a chcete víc. Tady zjistíte, jestli jste na růst připravení, která páka vám přinese nejvíc zisku, kolik peněz růst spolkne dřív, než vám zákazníci zaplatí, a kdy si můžete dovolit prvního člověka. Bez zbytečných nákladů."
          phaseNumber={7}
          icon={TrendingUp}
          learningPoints={learningPoints}
          estimatedTime="40 minut"
          steps={5}
          onStart={() => setShowIntro(false)}
          onBack={back}
          gradient="from-emerald-500/10 to-teal-500/10"
        />
      ) : (
        <GrowthPhase />
      )}
    </PageLayout>
  );
};

export default ExpansionPage;
