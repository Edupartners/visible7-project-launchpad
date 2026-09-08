import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoginPage } from "@/components/LoginPage";
import { AccessPasswordGate } from "@/components/AccessPasswordGate";
import { clearTestSession, fetchTestMode, hasValidTestSession } from "@/lib/testMode";

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
  const [testMode, setTestMode] = useState(false);
  const [testUnlocked, setTestUnlocked] = useState(hasValidTestSession());

  useEffect(() => {
    let active = true;

    // Testovací režim (TEST_MODE secret) se ověřuje na serveru, default je vypnutý.
    fetchTestMode().then((enabled) => {
      if (!active) return;
      setTestMode(enabled);
      if (enabled) {
        setTestUnlocked(hasValidTestSession());
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (testMode) {
      clearTestSession();
      setTestUnlocked(false);
      return;
    }
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  // TEST_MODE: jedno společné heslo místo přihlášení, vše odemčené.
  if (testMode) {
    if (!testUnlocked) {
      return <AccessPasswordGate onUnlocked={() => setTestUnlocked(true)} />;
    }
    return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
  }

  if (!user) {
    return <LoginPage onLogin={() => { /* stav se aktualizuje přes onAuthStateChange výše */ }} />;
  }

  return <AuthContext.Provider value={{ user, signOut }}>{children}</AuthContext.Provider>;
};
