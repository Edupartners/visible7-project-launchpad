import { BenchmarkingTestingPhase } from "@/components/BenchmarkingTestingPhase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistedState } from "@/hooks/usePersistedState";

const BenchmarkingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [completedPhases, setCompletedPhases] = usePersistedState<number[]>("completed_phases", []);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleComplete = () => {
    // Mark phase 5 as completed
    setCompletedPhases(prev => {
      if (!prev.includes(5)) {
        return [...prev, 5];
      }
      return prev;
    });
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleChannelSelect = (channelId: string) => {
    navigate(`/marketing-channel/${channelId}`);
  };

  return (
    <BenchmarkingTestingPhase 
      onChannelSelect={handleChannelSelect} 
      onBack={handleBack} 
    />
  );
};

export default BenchmarkingPage;