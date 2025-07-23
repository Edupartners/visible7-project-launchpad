
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserSettings, defaultUserSettings } from '@/types/user';

interface AuthContextType {
  currentUser: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPromoAccess: boolean;
  userName: string | null;
  userProfile: UserProfile | null;
  userSettings: UserSettings;
  login: (email: string, hasPromoAccess?: boolean, name?: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultUserSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const storedEmail = localStorage.getItem('currentUser');
    const storedPromoAccess = localStorage.getItem('hasPromoAccess') === 'true';
    const storedUserName = localStorage.getItem('userName');
    const storedProfile = localStorage.getItem('userProfile');
    const storedSettings = localStorage.getItem('userSettings');
    
    if (storedEmail) {
      setCurrentUser(storedEmail);
      setHasPromoAccess(storedPromoAccess);
      setUserName(storedUserName);
      
      if (storedProfile) {
        try {
          setUserProfile(JSON.parse(storedProfile));
        } catch (error) {
          console.warn('Failed to parse stored profile:', error);
        }
      }
      
      if (storedSettings) {
        try {
          setUserSettings({ ...defaultUserSettings, ...JSON.parse(storedSettings) });
        } catch (error) {
          console.warn('Failed to parse stored settings:', error);
        }
      }
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

    // Create default profile if none exists
    if (!userProfile) {
      const defaultProfile: UserProfile = {
        id: crypto.randomUUID(),
        email,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      setUserProfile(defaultProfile);
      localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
    }
  };

  const logout = () => {
    console.log("🚪 AuthContext - Logout");
    setCurrentUser(null);
    setHasPromoAccess(false);
    setUserName(null);
    setUserProfile(null);
    setUserSettings(defaultUserSettings);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hasPromoAccess');
    localStorage.removeItem('userName');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userSettings');
  };

  const updateProfile = (profileUpdates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile = { ...userProfile, ...profileUpdates };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Update userName if name was changed
    if (profileUpdates.name) {
      setUserName(profileUpdates.name);
      localStorage.setItem('userName', profileUpdates.name);
    }
  };

  const updateSettings = (settingsUpdates: Partial<UserSettings>) => {
    const updatedSettings = { ...userSettings, ...settingsUpdates };
    setUserSettings(updatedSettings);
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings));
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    hasPromoAccess,
    userName,
    userProfile,
    userSettings,
    login,
    logout,
    updateProfile,
    updateSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
