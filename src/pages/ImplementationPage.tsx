import { useNavigate } from "react-router-dom";
import { ImplementationPhase } from "@/components/ImplementationPhase";
import { PageLayout } from "@/components/layout/PageLayout";

const ImplementationPage = () => {
  const navigate = useNavigate();
  return (
    <PageLayout onBack={() => navigate("/home")}>
      <ImplementationPhase onSelectBusinessType={(id) => navigate(`/business-type/${id}`)} />
    </PageLayout>
  );
};

export default ImplementationPage;
