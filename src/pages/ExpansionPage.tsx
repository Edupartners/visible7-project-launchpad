import { ExpansionPhase } from "@/components/ExpansionPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const ExpansionPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 7 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(7)) {
        return [...prev, 7];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <ExpansionPhase onComplete={handleComplete} onBack={handleBack} />
  );
};

export default ExpansionPage;