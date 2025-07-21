
import { BusinessTypeRoadmap } from "@/components/BusinessTypeRoadmap";
import { useNavigate, useParams } from "react-router-dom";
import { usePersistedState } from "@/hooks/usePersistedState";
import { getPromoCodeAccess } from "@/lib/promoCodes";

const BusinessTypeDetailPage = () => {
  const navigate = useNavigate();
  const { businessTypeId } = useParams<{ businessTypeId: string }>();
  const [hasAccess, setHasAccess] = usePersistedState<boolean>("hasAccess", false);
  const promoCodeAccess = !!getPromoCodeAccess();

  const handleBack = () => {
    navigate('/home');
  };

  const handlePaymentSuccess = () => {
    console.log("💳 Template payment successful, granting global access");
    
    // Set unified access state
    setHasAccess(true);
    
    // Force localStorage update to ensure persistence
    localStorage.setItem('hasAccess', 'true');
    
    console.log("✅ Global access granted:", { 
      hasAccess: true, 
      localStorage: localStorage.getItem('hasAccess') 
    });

    // Navigate back to home to force Dashboard to reload with new access state
    setTimeout(() => {
      console.log("🔄 Navigating back to home to sync access state");
      navigate('/home');
    }, 1000);
  };

  return (
    <BusinessTypeRoadmap 
      businessTypeId={businessTypeId || ''} 
      onBack={handleBack}
      hasAccess={hasAccess || promoCodeAccess}
      onPaymentSuccess={handlePaymentSuccess}
    />
  );
};

export default BusinessTypeDetailPage;
