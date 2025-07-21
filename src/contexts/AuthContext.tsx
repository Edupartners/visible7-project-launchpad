
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  currentUser: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPromoAccess: boolean;
  userName: string | null;
  login: (email: string, hasPromoAccess?: boolean, name?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [hasPromoAccess, setHasPromoAccess] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const storedEmail = localStorage.getItem('currentUser');
    const storedPromoAccess = localStorage.getItem('hasPromoAccess') === 'true';
    const storedUserName = localStorage.getItem('userName');
    
    if (storedEmail) {
      setCurrentUser(storedEmail);
      setHasPromoAccess(storedPromoAccess);
      setUserName(storedUserName);
    }
    
    setIsLoading(false);
  }, []);

  const login = (email: string, hasPromoAccess?: boolean, name?: string) => {
    console.log("🔐 AuthContext - Login:", { email, hasPromoAccess, name });
    
    setCurrentUser(email);
    localStorage.setItem('currentUser', email);
    
    if (hasPromoAccess) {
      setHasPromoAccess(true);
      localStorage.setItem('hasPromoAccess', 'true');
    } else {
      setHasPromoAccess(false);
      localStorage.removeItem('hasPromoAccess');
    }
    
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
    }
  };

  const logout = () => {
    console.log("🚪 AuthContext - Logout");
    setCurrentUser(null);
    setHasPromoAccess(false);
    setUserName(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hasPromoAccess');
    localStorage.removeItem('userName');
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    hasPromoAccess,
    userName,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
