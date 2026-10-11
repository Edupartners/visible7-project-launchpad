import { supabase } from "@/integrations/visible7/client";
import { gaEvent } from "@/lib/cookieConsent";

/**
 * Záznam události do vlastní databáze (tabulka events). Nikdy neblokuje ani nehází chybu –
 * když uživatel není přihlášený nebo zápis selže, událost se tiše zahodí.
 * Milníky (registrace, brány, rentgen, osvědčení, AI) zapisuje databáze sama.
 */
export function track(name: string, props: Record<string, unknown> = {}, projectId?: string | null) {
  // Kopie do Google Analytics (bez osobních údajů; s cookies jen po souhlasu).
  if (name !== "session_start") gaEvent(name, props);
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      await supabase.from("events").insert({ name, props, project_id: projectId ?? null });
    } catch {
      /* analytika nesmí rozbít aplikaci */
    }
  })();
}

/** Jedna událost session_start na otevřenou kartu prohlížeče. */
export function trackSessionStart() {
  try {
    if (sessionStorage.getItem("v7_session_tracked")) return;
    sessionStorage.setItem("v7_session_tracked", "1");
  } catch {
    /* bez sessionStorage zapíšeme vždy */
  }
  track("session_start", {
    path: window.location.pathname,
    ref: document.referrer ? new URL(document.referrer).hostname : null,
  });
}
