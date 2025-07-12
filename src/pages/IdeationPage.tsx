import { IdeationPhase } from "@/components/IdeationPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const IdeationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 2 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(2)) {
        return [...prev, 2];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <IdeationPhase onComplete={handleComplete} onBack={handleBack} />
  );
};

export default IdeationPage;