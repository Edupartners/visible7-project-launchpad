
import { BusinessTypeRoadmap } from "@/components/BusinessTypeRoadmap";
import { useNavigate, useParams } from "react-router-dom";

const BusinessTypeDetailPage = () => {
  const navigate = useNavigate();
  const { businessTypeId } = useParams<{ businessTypeId: string }>();

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <BusinessTypeRoadmap 
      businessTypeId={businessTypeId || ''} 
      onBack={handleBack} 
    />
  );
};

export default BusinessTypeDetailPage;
