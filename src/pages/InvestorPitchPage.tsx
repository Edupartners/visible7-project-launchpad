
import { InvestorPitch } from "@/components/InvestorPitch";
import { PageLayout } from "@/components/layout/PageLayout";
import { useNavigate } from "react-router-dom";

const InvestorPitchPage = () => {
  const navigate = useNavigate();

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
