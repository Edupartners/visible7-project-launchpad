import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import { ImplementationPhase } from "@/components/ImplementationPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";

const learningPoints = [
  { text: "Uvidíte cestu zákazníka pro svůj typ byznysu" },
  { text: "Postavíte web, e-shop nebo jiný projekt po blocích s videem" },
  { text: "Projdete právní minimum a měření návštěvnosti" },
  { text: "Náklady převezmete jedním klikem do byznys case" },
];

const ImplementationPage = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const back = () => navigate("/home");
  return (
    <PageLayout onBack={back}>
      {showIntro ? (
        <PhaseIntroTemplate
          title="Implementace"
          subtitle="Postavte to sami, bez programátora"
          description="Typ byznysu už máte z brány 2. Tady dostanete plán tvorby přesně pro něj, od domény až po kontrolu před spuštěním. Každý blok má instruktážní video a kroky, které si odškrtáte. E-shop postavíte na Shoptetu, web na WordPressu."
          phaseNumber={4}
          icon={Wrench}
          learningPoints={learningPoints}
          estimatedTime="podle typu, obvykle 5–14 dní"
          steps={7}
          onStart={() => setShowIntro(false)}
          onBack={back}
        />
      ) : (
        <ImplementationPhase onSelectBusinessType={(id) => navigate(`/business-type/${id}`)} />
      )}
    </PageLayout>
  );
};

export default ImplementationPage;
