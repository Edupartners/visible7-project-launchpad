import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionState {
  loading: boolean;
  status: 'trial' | 'active' | 'expired' | null;
  hasAccess: boolean;
  trialEndsAt: string | null;
  accessUntil: string | null;
  daysRemaining: number;
}

const EMPTY_STATE: SubscriptionState = {
  loading: true,
  status: null,
  hasAccess: false,
  trialEndsAt: null,
  accessUntil: null,
  daysRemaining: 0,
};

function computeDaysRemaining(trial: string | null, access: string | null): number {
  const dates = [trial, access].filter(Boolean).map((d) => new Date(d as string).getTime());
  if (dates.length === 0) return 0;
  const latest = Math.max(...dates);
  const diff = latest - Date.now();
  return diff > 0 ? Math.ceil(diff / (24 * 60 * 60 * 1000)) : 0;
}

/**
 * Server-side náhrada za useTrial.ts.
 * Stav přístupu (trial / promo kód / aktivní platba) se počítá z databáze,
 * takže ho nelze obejít smazáním dat v prohlížeči.
 */
export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(EMPTY_STATE);

  const refresh = useCallback(async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      setState({ ...EMPTY_STATE, loading: false });
      return;
    }

    const { data, error } = await (supabase as any)
      .from('subscriptions')
      .select('status, trial_ends_at, access_until')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    const subscriptionData = data as { status: string; trial_ends_at: string | null; access_until: string | null } | null;

    if (error || !subscriptionData) {
      console.warn('Failed to load subscription:', error);
      setState({ ...EMPTY_STATE, loading: false });
      return;
    }

    const now = Date.now();
    const trialActive = subscriptionData.trial_ends_at ? new Date(subscriptionData.trial_ends_at).getTime() > now : false;
    const accessActive = subscriptionData.access_until ? new Date(subscriptionData.access_until).getTime() > now : false;
    const hasAccess = subscriptionData.status === 'active' || trialActive || accessActive;

    setState({
      loading: false,
      status: hasAccess ? (trialActive && !accessActive ? 'trial' : 'active') : 'expired',
      hasAccess,
      trialEndsAt: subscriptionData.trial_ends_at,
      accessUntil: subscriptionData.access_until,
      daysRemaining: computeDaysRemaining(subscriptionData.trial_ends_at, subscriptionData.access_until),
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const redeemPromoCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const { data, error } = await supabase.functions.invoke('redeem-promo-code', {
      body: { code },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (error) {
      return { success: false, message: 'Nepodařilo se uplatnit kód. Zkuste to znovu.' };
    }
    if (data?.success) {
      await refresh();
    }
    return { success: !!data?.success, message: data?.message ?? data?.error ?? 'Neznámá chyba' };
  };

  return { ...state, refresh, redeemPromoCode };
}
