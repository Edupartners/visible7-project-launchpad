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
          title="Tvorba"
          subtitle="Postavte to – bez programátora"
          description="Typ byznysu jste zvolili ve fázi 2. Teď dostanete plán tvorby přesně pro něj: bloky od domény po kontrolu před spuštěním, u každého instruktážní video a kroky k odškrtnutí. E-shop postavíte na Shoptetu, web na WordPressu."
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
