import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hasValidAccess } from "@/lib/promoCodes";

interface AccessGateProtectionProps {
  children: React.ReactNode;
}

export const AccessGateProtection = ({ children }: AccessGateProtectionProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasValidAccess()) {
      navigate('/access-gate');
    }
  }, [navigate]);

  if (!hasValidAccess()) {
    return null;
  }

  return <>{children}</>;
};