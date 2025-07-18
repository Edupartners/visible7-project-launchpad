import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { getTrialStatus, cleanupOldBetaAccess } from "@/lib/promoCodes";

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clean up old beta access keys and migrate to trial system
    cleanupOldBetaAccess();
    
    const trialStatus = getTrialStatus();
    
    // Debug logs for current state
    console.log("🚀 HomePage - State Check:");
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  trialStatus:", trialStatus);
    
    // If user is not authenticated, redirect to launcher (landing page)
    if (!isAuthenticated) {
      console.log("🔄 Redirecting to launcher page");
      navigate('/launcher');
      return;
    }
    
    console.log("✅ User authenticated, staying on home page");
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