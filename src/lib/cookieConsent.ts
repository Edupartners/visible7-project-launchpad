/**
 * Souhlas s cookies (Google Consent Mode v2).
 * Výchozí stav nastavuje index.html (vše kromě nezbytných vypnuto); tady se ukládá volba uživatele
 * a posílá do Google tagu / Tag Manageru.
 */
export const COOKIE_KEY = "v7_cookie_consent";
export const COOKIE_VERSION = "2026-10-11";
export const OPEN_COOKIES_EVENT = "v7-open-cookies";

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  at: string;
  v: string;
}

type Gtag = (...args: unknown[]) => void;
const gtag = (...args: unknown[]) => {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof g === "function") g(...args);
};

export function readConsent(): CookieConsent | null {
  try {
    const c = JSON.parse(localStorage.getItem(COOKIE_KEY) || "null") as CookieConsent | null;
    return c && c.v === COOKIE_VERSION ? c : null;
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean, marketing: boolean): CookieConsent {
  const c: CookieConsent = { analytics, marketing, at: new Date().toISOString(), v: COOKIE_VERSION };
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(c));
  } catch {
    /* bez úložiště platí volba jen do zavření stránky */
  }
  gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: marketing ? "granted" : "denied",
    ad_user_data: marketing ? "granted" : "denied",
    ad_personalization: marketing ? "granted" : "denied",
  });
  const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  dl?.push({ event: "cookie_consent_update", analytics, marketing });
  return c;
}

export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_COOKIES_EVENT));

/** Událost do Google Analytics (jen když uživatel povolil měření – jinak ji Consent Mode nepošle s cookies). */
export function gaEvent(name: string, props: Record<string, unknown> = {}) {
  const clean: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "number" || typeof v === "boolean") clean[k] = v;
    else if (typeof v === "string") clean[k] = v.slice(0, 100);
  }
  gtag("event", name, clean);
}
