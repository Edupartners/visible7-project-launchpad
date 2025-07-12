import { VisionPhase } from "@/components/VisionPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const VisionPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 1 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(1)) {
        return [...prev, 1];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <VisionPhase onComplete={handleComplete} onBack={handleBack} />
  );
};

export default VisionPage;