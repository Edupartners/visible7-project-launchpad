import { AccessGatePage as AccessGateComponent } from "@/components/AccessGatePage";
import { useNavigate } from "react-router-dom";

const AccessGatePage = () => {
  const navigate = useNavigate();

  const handleAccessGranted = () => {
    navigate('/launcher');
  };

  return (
    <AccessGateComponent onAccessGranted={handleAccessGranted} />
  );
};

export default AccessGatePage;