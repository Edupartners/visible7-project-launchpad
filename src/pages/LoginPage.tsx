import { LoginPage as LoginComponent } from "@/components/LoginPage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (email: string, hasPromoAccess?: boolean, name?: string) => {
    login(email, hasPromoAccess, name);
    navigate('/');
  };

  return (
    <LoginComponent onLogin={handleLogin} />
  );
};

export default LoginPage;