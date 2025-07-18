import { ImplementationPhase } from "@/components/ImplementationPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const ImplementationPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 4 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(4)) {
        return [...prev, 4];
      }
      return prev;
    });
    navigate('/home');
  };

  const handleBack = () => {
    navigate('/home');
  };

  const handleSelectBusinessType = (businessTypeId: string) => {
    navigate(`/business-type/${businessTypeId}`);
  };

  return (
    <ImplementationPhase 
      onComplete={handleComplete} 
      onBack={handleBack} 
      onSelectBusinessType={handleSelectBusinessType} 
    />
  );
};

export default ImplementationPage;