
import { LauncherPage as LauncherComponent } from "@/components/LauncherPage";
import { useNavigate } from "react-router-dom";

const LauncherPage = () => {
  const navigate = useNavigate();

  const handleAccessGranted = () => {
    // /home je chráněná routa - AuthGate nepřihlášeného uživatele
    // automaticky zobrazí registrační formulář (LoginPage).
    navigate('/home');
  };

  return (
    <LauncherComponent onAccessGranted={handleAccessGranted} />
  );
};

export default LauncherPage;
