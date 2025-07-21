import { PhasePreview } from "@/components/PhasePreview";
import { useNavigate } from "react-router-dom";

const ExpansionPreviewPage = () => {
  const navigate = useNavigate();

  const features = [
    "Výpočet hodnoty práce",
    "Pravidlo 30% energie do růstu",
    "Cashflow management",
    "Parametry připravenosti na růst",
    "Sebereflexi a plánování",
    "AI analýzy a doporučení"
  ];

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <PhasePreview
      phaseId={7}
      title="Expansion"
      subtitle="Škálování a růst"
      description="Strategie pro rozšiřování a zvyšování tržního podílu s pokročilými nástroji pro řízení růstu a optimalizaci procesů."
      onBack={handleBack}
      features={features}
      estimatedTime="50 min"
    />
  );
};

export default ExpansionPreviewPage;