
import { BenchmarkingTestingPhase } from "@/components/BenchmarkingTestingPhase";
import { PageLayout } from "@/components/layout/PageLayout";
import { PhaseIntroTemplate } from "@/components/layout/PhaseIntroTemplate";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";
import { useState } from "react";
import { BarChart3 } from "lucide-react";

const BenchmarkingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);
  const [showIntro, setShowIntro] = useState(true);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    setCompletedPhases(prev => {
      if (!prev.includes(5)) {
        return [...prev, 5];
      }
      return prev;
    });
    navigate('/home');
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleChannelSelect = (channelId: string) => {
    navigate(`/marketing-channel/${channelId}`);
  };

  const handleStart = () => {
    setShowIntro(false);
  };

  const learningPoints = [
    { text: "A/B testování a experiment design", color: "bg-cyan-500" },
    { text: "Marketingové kanály a channel mix", color: "bg-emerald-500" },
    { text: "Performance metriky a KPI tracking", color: "bg-violet-500" },
    { text: "Benchmarking proti konkurenci", color: "bg-orange-500" }
  ];

  if (showIntro) {
    return (
      <PageLayout onBack={handleBack}>
        <PhaseIntroTemplate
          title="Benchmarking & Testing"
          subtitle="Testování a optimalizace výkonu"
          description="V této fázi se zaměříme na systematické testování a benchmarking vašeho řešení. Naučíte se nastavit A/B testy, analyzovat marketingové kanály a sledovat klíčové metriky výkonu. Cílem je optimalizovat váš produkt a marketing na základě reálných dat a srovnání s konkurencí."
          phaseNumber={5}
          icon={BarChart3}
          learningPoints={learningPoints}
          estimatedTime="45 minut"
          steps={8}
          hasAiValidation={true}
          onStart={handleStart}
          onBack={handleBack}
          gradient="from-cyan-500/10 to-blue-500/10"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout onBack={handleBack}>
      <BenchmarkingTestingPhase 
        onChannelSelect={handleChannelSelect} 
        onBack={handleBack} 
      />
    </PageLayout>
  );
};

export default BenchmarkingPage;
