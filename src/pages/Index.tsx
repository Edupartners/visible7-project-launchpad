import { useState, useEffect } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";
import { LauncherPage } from "@/components/LauncherPage";
import { getBetaAccess, isLauncherEnabled } from "@/lib/promoCodes";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [showLauncher, setShowLauncher] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if launcher should be shown
    const launcherEnabled = isLauncherEnabled();
    const betaAccess = getBetaAccess();
    
    if (!launcherEnabled || betaAccess) {
      setShowLauncher(false);
    }
    
    setIsLoading(false);
  }, []);

  const handleLogin = (email: string, hasPromoAccess?: boolean, name?: string) => {
    setCurrentUser(email);
    if (hasPromoAccess) {
      localStorage.setItem('hasPromoAccess', 'true');
    }
    if (name) {
      localStorage.setItem('userName', name);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleLauncherAccess = () => {
    setShowLauncher(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showLauncher) {
    return <LauncherPage onAccessGranted={handleLauncherAccess} />;
  }

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard userEmail={currentUser} onLogout={handleLogout} />;
};

export default Index;
