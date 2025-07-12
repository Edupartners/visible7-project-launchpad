import { InvestorPitch } from "@/components/InvestorPitch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const InvestorPitchPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  return (
    <InvestorPitch onBack={handleBack} />
  );
};

export default InvestorPitchPage;