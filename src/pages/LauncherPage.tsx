
import { LauncherPage as LauncherComponent } from "@/components/LauncherPage";
import { useNavigate } from "react-router-dom";

const LauncherPage = () => {
  const navigate = useNavigate();

  const handleAccessGranted = () => {
    navigate('/home?register=true');
  };

  return (
    <LauncherComponent onAccessGranted={handleAccessGranted} />
  );
};

export default LauncherPage;
