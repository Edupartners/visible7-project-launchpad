import { BusinessTypeRoadmap } from "@/components/BusinessTypeRoadmap";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BusinessTypeDetailPage = () => {
  const navigate = useNavigate();
  const { businessTypeId } = useParams<{ businessTypeId: string }>();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

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