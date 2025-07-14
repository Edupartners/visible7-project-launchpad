import { LauncherPage as LauncherComponent } from "@/components/LauncherPage";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { hasValidAccess } from "@/lib/promoCodes";

const LauncherPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasValidAccess()) {
      navigate('/access-gate');
    }
  }, [navigate]);

  const handleAccessGranted = () => {
    navigate('/login');
  };

  return (
    <LauncherComponent onAccessGranted={handleAccessGranted} />
  );
};

export default LauncherPage;