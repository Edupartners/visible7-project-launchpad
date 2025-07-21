
import { PhasePreview } from "@/components/PhasePreview";
import { useNavigate } from "react-router-dom";

const BenchmarkingPreviewPage = () => {
  const navigate = useNavigate();

  const features = [
    "Srovnávače zboží",
    "Katalogy a marketplace", 
    "PPC kampaně",
    "SEO optimalizace",
    "Sociální sítě",
    "E-mail marketing",
    "SMS marketing",
    "PR & influenceři",
    "Copywriting"
  ];

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <PhasePreview
      phaseId={5}
      title="Benchmarking & Testing"
      subtitle="Marketingové kanály"
      description="Identifikujte nejefektivnější kanály pro váš segment pomocí pokročilých analytických nástrojů a testovacích metod."
      onBack={handleBack}
      features={features}
      estimatedTime="35 min"
    />
  );
};

export default BenchmarkingPreviewPage;
