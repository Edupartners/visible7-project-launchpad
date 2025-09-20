import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  // Keep backward compatibility
  isAuthenticated: boolean;
  currentUser: string | null;
  hasPromoAccess: boolean;
  userName: string | null;
  userProfile: any; // Backward compatibility
  userSettings: any; // Backward compatibility
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => any; // More flexible for backward compatibility
  updateSettings: (settings: any) => void; // Backward compatibility
  // Keep backward compatibility
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Backward compatibility states
  const [hasPromoAccess, setHasPromoAccess] = useState<boolean>(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Check localStorage for promo access (backward compatibility)
    const storedPromoAccess = localStorage.getItem('hasPromoAccess') === 'true';
    setHasPromoAccess(storedPromoAccess);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      toast.error(error.message);
    } else {
      toast.success('Zkontrolujte svůj email pro ověření účtu!');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      toast.error('Neplatné přihlašovací údaje');
    } else {
      toast.success('Úspěšně přihlášen!');
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      toast.error('Chyba při odhlášení');
    } else {
      // Clear localStorage for backward compatibility
      localStorage.removeItem('currentUser');
      localStorage.removeItem('hasPromoAccess');
      localStorage.removeItem('userName');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userSettings');
      setHasPromoAccess(false);
      toast.success('Úspěšně odhlášen!');
    }
  };

  const updateProfile = async (updates: any) => {
    if (!user) return { error: new Error('No user logged in') };

    // Handle legacy updates format
    const profileUpdates: Partial<Profile> = {};
    if (updates.firstName) profileUpdates.first_name = updates.firstName;
    if (updates.lastName) profileUpdates.last_name = updates.lastName;
    if (updates.first_name) profileUpdates.first_name = updates.first_name;
    if (updates.last_name) profileUpdates.last_name = updates.last_name;
    
    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) {
      console.error('Profile update error:', error);
      toast.error('Chyba při aktualizaci profilu');
    } else {
      toast.success('Profil byl aktualizován!');
      // Refresh profile data
      await fetchProfile(user.id);
    }

    return { error };
  };

  // Backward compatibility for settings
  const updateSettings = (settings: any) => {
    console.warn('updateSettings is deprecated - settings are now handled differently');
    // For now, just save to localStorage for backward compatibility
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  // Backward compatibility methods
  const login = (email: string, hasPromoAccess?: boolean, name?: string) => {
    // This is for backward compatibility - redirect to proper auth
    console.warn('Using deprecated login method. Use signIn instead.');
    if (hasPromoAccess) {
      setHasPromoAccess(true);
      localStorage.setItem('hasPromoAccess', 'true');
    }
  };

  const logout = () => {
    signOut();
  };

  // Computed values for backward compatibility
  const isAuthenticated = !!user;
  const currentUser = user?.email || null;
  const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user?.email : null;
  
  // Create userProfile for backward compatibility
  const userProfile = user && profile ? {
    id: profile.id,
    email: user.email || '',
    name: userName,
    firstName: profile.first_name,
    lastName: profile.last_name,
    createdAt: profile.created_at,
    lastLogin: new Date().toISOString(),
  } : null;

  // Default settings for backward compatibility
  const userSettings = {
    privacy: {
      dataProcessingConsent: true,
      marketingConsent: false,
      analyticsConsent: false,
    },
    basic: {
      language: 'cs',
      theme: 'system',
    },
    communication: {
      emailNotifications: true,
      newsletter: false,
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    currentUser,
    hasPromoAccess,
    userName,
    userProfile,
    userSettings,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updateSettings,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
