import { PhasePreview } from "@/components/PhasePreview";
import { useNavigate } from "react-router-dom";

const LaunchPreviewPage = () => {
  const navigate = useNavigate();

  const features = [
    "KPI tracking dashboard",
    "Paretova analýza produktů",
    "Optimalizace marketingových kanálů", 
    "ROI monitoring",
    "AI doporučení",
    "Export dat a reportů"
  ];

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <PhasePreview
      phaseId={6}
      title="Launch"
      subtitle="Go-to-market strategie"
      description="Připravte si detailní plán uvedení produktu na trh s pokročilými nástroji pro sledování výkonnosti a optimalizaci."
      onBack={handleBack}
      features={features}
      estimatedTime="40 min"
    />
  );
};

export default LaunchPreviewPage;