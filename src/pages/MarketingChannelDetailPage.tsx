import { MarketingChannelDetail } from "@/components/MarketingChannelDetail";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MarketingChannelDetailPage = () => {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleBack = () => {
    navigate('/benchmarking');
  };

  return (
    <MarketingChannelDetail 
      channelId={channelId || ''} 
      onBack={handleBack} 
    />
  );
};

export default MarketingChannelDetailPage;