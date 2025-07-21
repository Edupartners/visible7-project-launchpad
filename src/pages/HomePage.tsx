
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { SimpleRegistrationModal } from "@/components/SimpleRegistrationModal";
import { useAuth } from "@/contexts/AuthContext";
import { getTrialStatus, cleanupOldBetaAccess } from "@/lib/promoCodes";

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, login, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  useEffect(() => {
    // Clean up old beta access keys and migrate to trial system
    cleanupOldBetaAccess();
    
    const shouldShowRegistration = searchParams.get('register') === 'true';
    
    // Debug logs for current state
    console.log("🚀 HomePage - State Check:");
    console.log("  isAuthenticated:", isAuthenticated);
    console.log("  shouldShowRegistration:", shouldShowRegistration);
    
    // If user should register, show registration modal
    if (shouldShowRegistration && !isAuthenticated) {
      console.log("📝 Showing registration modal");
      setShowRegistrationModal(true);
      // Remove the register param from URL
      setSearchParams(new URLSearchParams());
    }
    
    setIsLoading(false);
  }, [isAuthenticated, searchParams, setSearchParams]);

  const handleRegister = (email: string, name: string) => {
    console.log("📋 Registering user:", email, name);
    login(email, false, name);
    setShowRegistrationModal(false);
  };

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Dashboard 
        userEmail={currentUser || "guest@example.com"} 
        onLogout={logout} 
        isAuthenticated={isAuthenticated}
      />
      
      <SimpleRegistrationModal 
        isOpen={showRegistrationModal}
        onClose={handleCloseRegistrationModal}
        onRegister={handleRegister}
      />
    </>
  );
};

export default HomePage;
