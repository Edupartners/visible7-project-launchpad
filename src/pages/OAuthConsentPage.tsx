import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { LoginPage } from "@/components/LoginPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AuthorizationDetails = {
  client?: { name?: string | null } | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;

export default function OAuthConsentPage() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setCheckingSession(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Chybí parametr authorization_id.");
        return;
      }
      const { data, error: detailsError } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (detailsError) {
        setError(detailsError.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, user]);

  const decide = useCallback(
    async (approve: boolean) => {
      setBusy(true);
      const { data, error: decisionError } = approve
        ? await oauth().approveAuthorization(authorizationId)
        : await oauth().denyAuthorization(authorizationId);
      if (decisionError) {
        setBusy(false);
        setError(decisionError.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("Autorizační server nevrátil přesměrování.");
        return;
      }
      window.location.href = target;
    },
    [authorizationId],
  );

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  // Přihlášení proběhne na stejné URL, takže po loginu zůstáváme na consent stránce.
  if (!user) {
    return (
      <LoginPage
        redirectTo={window.location.origin + window.location.pathname + window.location.search}
        onLogin={() => { /* session se aktualizuje přes onAuthStateChange */ }}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-primary/5 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">V7</span>
          </div>
          <span className="font-semibold">VISIBLE7 MICEK™</span>
        </div>

        {error ? (
          <>
            <h1 className="text-xl font-semibold">Požadavek se nepodařilo zpracovat</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Načítám požadavek…</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold">
              Připojit {details.client?.name ?? "aplikaci"} k vašemu účtu?
            </h1>
            <p className="text-sm text-muted-foreground">
              {details.client?.name ?? "Tato aplikace"} bude moci pracovat s vaším postupem
              a předplatným ve VISIBLE7 pod vaším účtem ({user.email}).
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
                Povolit
              </Button>
              <Button className="flex-1" variant="outline" disabled={busy} onClick={() => decide(false)}>
                Zamítnout
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}