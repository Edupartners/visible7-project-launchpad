
import { InvestorPitch } from "@/components/InvestorPitch";
import { PageLayout } from "@/components/layout/PageLayout";
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
    navigate('/home');
  };

  return (
    <PageLayout onBack={handleBack}>
      <InvestorPitch onBack={handleBack} />
    </PageLayout>
  );
};

export default InvestorPitchPage;
