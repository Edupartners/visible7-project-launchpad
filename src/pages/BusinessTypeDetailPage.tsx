import { BusinessTypeRoadmap } from "@/components/BusinessTypeRoadmap";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BusinessTypeDetailPage = () => {
  const navigate = useNavigate();
  const { businessTypeId } = useParams<{ businessTypeId: string }>();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleBack = () => {
    navigate('/implementation');
  };

  return (
    <BusinessTypeRoadmap 
      businessTypeId={businessTypeId || ''} 
      onBack={handleBack} 
    />
  );
};

export default BusinessTypeDetailPage;