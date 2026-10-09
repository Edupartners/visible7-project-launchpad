import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/visible7/client";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ConsentGate } from "@/components/ConsentGate";
import { LoginPage } from "@/components/LoginPage";
import { SetNewPasswordPage } from "@/components/SetNewPasswordPage";

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
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
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

  if (user && recovering) {
    return <SetNewPasswordPage onDone={() => setRecovering(false)} />;
  }

  if (!user) {
    return <LoginPage onLogin={() => { /* stav se aktualizuje přes onAuthStateChange výše */ }} />;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      <ConsentGate key={user.id}>
        <ProjectProvider userId={user.id}>{children}</ProjectProvider>
      </ConsentGate>
    </AuthContext.Provider>
  );
};
