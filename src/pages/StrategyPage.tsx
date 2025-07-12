import { StrategyBusinessPhase } from "@/components/StrategyBusinessPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const StrategyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 3 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(3)) {
        return [...prev, 3];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <StrategyBusinessPhase onComplete={handleComplete} onBack={handleBack} />
  );
};

export default StrategyPage;