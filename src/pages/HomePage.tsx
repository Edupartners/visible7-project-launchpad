import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { getBetaAccess, isLauncherEnabled } from "@/lib/promoCodes";

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if launcher should be shown
    const launcherEnabled = isLauncherEnabled();
    const betaAccess = getBetaAccess();
    
    if (launcherEnabled && !betaAccess) {
      navigate('/launcher');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setIsLoading(false);
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Dashboard userEmail={currentUser} onLogout={logout} />
  );
};

export default HomePage;