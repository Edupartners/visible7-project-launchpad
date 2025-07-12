import { LaunchPhase } from "@/components/LaunchPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const LaunchPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 6 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(6)) {
        return [...prev, 6];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <LaunchPhase onComplete={handleComplete} onBack={handleBack} />
  );
};

export default LaunchPage;