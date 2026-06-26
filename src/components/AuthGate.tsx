import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoginPage } from "@/components/LoginPage";

interface AuthContextValue {
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ user: null, signOut: async () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

/**
 * Hlídá přihlášení přes Supabase Auth. Pokud uživatel není přihlášen,
 * zobrazí LoginPage namísto chráněného obsahu - žádná routa pod tímto
 * wrapperem tak není dostupná bez přihlášení (na rozdíl od dřívějšího
 * stavu, kdy HomePage natvrdo předstírala isAuthenticated=true).
 */
export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={() => { /* stav se aktualizuje přes onAuthStateChange výše */ }} />;
  }

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
};
