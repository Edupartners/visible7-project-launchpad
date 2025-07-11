import { useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard userEmail={currentUser} onLogout={handleLogout} />;
};

export default Index;
