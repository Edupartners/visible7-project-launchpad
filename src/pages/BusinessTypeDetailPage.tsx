import { useNavigate, useParams } from "react-router-dom";
import { BusinessTypeRoadmap } from "@/components/BusinessTypeRoadmap";
import { PageLayout } from "@/components/layout/PageLayout";

const BusinessTypeDetailPage = () => {
  const navigate = useNavigate();
  const { businessTypeId = "" } = useParams<{ businessTypeId: string }>();
  return (
    <PageLayout onBack={() => navigate("/implementation")}>
      <BusinessTypeRoadmap key={businessTypeId} businessTypeId={businessTypeId} />
    </PageLayout>
  );
};

export default BusinessTypeDetailPage;
