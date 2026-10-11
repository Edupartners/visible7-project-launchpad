import { supabase } from "@/integrations/visible7/client";
import { track } from "@/lib/track";

/** Promo kódy: uplatnění přihlášeným uživatelem a odkaz ?kod=… z pozvánky. */
export const PENDING_PROMO_KEY = "v7_promo_pending";

export interface RedeemResult {
  ok: boolean;
  message: string;
}

export async function redeemPromo(code: string): Promise<RedeemResult> {
  const clean = code.trim();
  if (!clean) return { ok: false, message: "Zadejte kód." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("redeem_promo", { p_code: clean });
  if (error) return { ok: false, message: "Kód se nepodařilo ověřit. Zkuste to prosím znovu." };
  const r = data as { status: string; message?: string; until?: string | null; days?: number };
  if (r.status !== "ok") return { ok: false, message: r.message ?? "Kód nelze použít." };
  track("promo_redeemed_client", { days: r.days ?? 0 });
  const until = r.until ? new Date(r.until).toLocaleDateString("cs-CZ") : null;
  return {
    ok: true,
    message: until ? `Hotovo! Máte plný přístup do ${until}.` : "Hotovo! Kód je uplatněný.",
  };
}

/** Uloží kód z adresy (?kod=XYZ), aby se uplatnil po přihlášení nebo registraci. */
export function capturePromoFromUrl() {
  try {
    const kod = new URLSearchParams(window.location.search).get("kod");
    if (kod && /^[A-Za-z0-9_-]{3,40}$/.test(kod)) localStorage.setItem(PENDING_PROMO_KEY, kod);
  } catch {
    /* bez úložiště se kód zadá ručně */
  }
}

export function takePendingPromo(): string | null {
  try {
    const kod = localStorage.getItem(PENDING_PROMO_KEY);
    if (kod) localStorage.removeItem(PENDING_PROMO_KEY);
    return kod;
  } catch {
    return null;
  }
}

/** Náhodný čitelný kód pro správce (bez snadno zaměnitelných znaků). */
export function generateCode(prefix = "V7") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint32Array(6);
  crypto.getRandomValues(arr);
  return `${prefix}-${Array.from(arr, (n) => chars[n % chars.length]).join("")}`;
}
