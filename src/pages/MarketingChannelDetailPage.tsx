import { MarketingChannelDetail } from "@/components/MarketingChannelDetail";
import { useNavigate, useParams } from "react-router-dom";

const MarketingChannelDetailPage = () => {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <MarketingChannelDetail 
      channelId={channelId || ''} 
      onBack={handleBack} 
    />
  );
};

export default MarketingChannelDetailPage;