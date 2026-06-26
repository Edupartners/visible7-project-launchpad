
import { BusinessTypeRoadmap } from "@/components/BusinessTypeRoadmap";
import { useNavigate, useParams } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";

const BusinessTypeDetailPage = () => {
  const navigate = useNavigate();
  const { businessTypeId } = useParams<{ businessTypeId: string }>();
  const { hasAccess, refresh } = useSubscription();

  const handleBack = () => {
    navigate('/home');
  };

  const handlePaymentSuccess = () => {
    // Stav přístupu se po platbě/promo kódu mění v databázi (subscriptions),
    // takže stačí znovu načíst aktuální stav a vrátit se na dashboard.
    refresh();
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  return (
    <BusinessTypeRoadmap 
      businessTypeId={businessTypeId || ''} 
      onBack={handleBack}
      hasAccess={hasAccess}
      onPaymentSuccess={handlePaymentSuccess}
    />
  );
};

export default BusinessTypeDetailPage;
