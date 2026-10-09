import { useNavigate, useParams } from "react-router-dom";
import { MarketingChannelDetail } from "@/components/MarketingChannelDetail";
import { PageLayout } from "@/components/layout/PageLayout";

const MarketingChannelDetailPage = () => {
  const navigate = useNavigate();
  const { channelId = "" } = useParams<{ channelId: string }>();
  return (
    <PageLayout onBack={() => navigate("/benchmarking-phase")}>
      <MarketingChannelDetail key={channelId} channelId={channelId} />
    </PageLayout>
  );
};

export default MarketingChannelDetailPage;
