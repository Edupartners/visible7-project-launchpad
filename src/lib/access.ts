import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/visible7/client";
import { useAuth } from "@/components/AuthGate";

/**
 * Úroveň přístupu přihlášeného uživatele.
 *  - zdarma: brány 1–2, rentgen, kvíz
 *  - trial: 3 dny (nastavení trial_days) všechny brány a videa (bez prémiových výstupů)
 *  - placený: vše včetně Excelu, osvědčení 3–7, pitche a plného limitu AI
 * Dokud je v databázi vypnutý přepínač paywall_enabled, je odemčeno všechno (pilot bez plateb).
 * Skutečné zámky hlídá i databáze a AI funkce – tohle je jen zobrazení.
 */
export interface Access {
  loading: boolean;
  paywall: boolean;
  plan: string;
  until: string | null;
  paid: boolean;
  trial: boolean;
  trialUsed: boolean;
  /** Může do bran 3–7 */
  full: boolean;
  /** Excel, osvědčení 3–7, pitch */
  premium: boolean;
  refresh: () => void;
}

const PAID_PLANS = ["mesic", "ctvrtleti", "rok", "kod", "clenstvi"];

export function useAccess(): Access {
  const { user } = useAuth();
  const [state, setState] = useState<Omit<Access, "refresh">>({
    loading: true,
    paywall: false,
    plan: "free",
    until: null,
    paid: false,
    trial: false,
    trialUsed: false,
    full: true,
    premium: true,
  });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: setting }, { data: row }] = await Promise.all([
        supabase.from("app_settings").select("value").eq("key", "paywall_enabled").maybeSingle(),
        user
          ? supabase
              .from("user_access")
              .select("plan, access_until, trial_used_at")
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (!alive) return;
      const paywall = (setting as { value?: unknown } | null)?.value === true;
      const r = row as { plan?: string; access_until?: string | null; trial_used_at?: string | null } | null;
      const plan = r?.plan ?? "free";
      const until = r?.access_until ?? null;
      const valid = !until || new Date(until).getTime() > Date.now();
      const paid = PAID_PLANS.includes(plan) && valid;
      const trial = plan === "trial" && !!until && valid;
      setState({
        loading: false,
        paywall,
        plan,
        until,
        paid,
        trial,
        trialUsed: !!r?.trial_used_at,
        full: !paywall || paid || trial,
        premium: !paywall || paid,
      });
    })();
    return () => {
      alive = false;
    };
  }, [user, tick]);

  return { ...state, refresh };
}

/** Brány 1 a 2 jsou zdarma. */
export const FREE_GATES = [1, 2];

export const daysLeft = (until: string | null) =>
  until ? Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / 86_400_000)) : null;
