import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "v7_test_access";

export interface TestGateSession {
  expiresAt: number;
}

/** Zjistí na serveru, zda je testovací režim (TEST_MODE secret) zapnutý. Default: vypnutý. */
export const fetchTestMode = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke("access-gate", {
      body: { action: "status" },
    });
    if (error) return false;
    return Boolean((data as { testMode?: boolean } | null)?.testMode);
  } catch {
    return false;
  }
};

/** Ověří sdílené heslo proti serverovému secretu. Heslo nikdy není v klientském kódu. */
export const verifyAccessPassword = async (
  password: string
): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.functions.invoke("access-gate", {
    body: { action: "verify", password },
  });

  const payload = data as { success?: boolean; error?: string; expiresAt?: number } | null;

  if (payload?.success && payload.expiresAt) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ expiresAt: payload.expiresAt }));
    return { success: true };
  }

  return { success: false, error: payload?.error ?? error?.message ?? "Ověření se nezdařilo." };
};

/** Platná lokální session (30 dní), aby se heslo neptalo při každém načtení. */
export const hasValidTestSession = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as TestGateSession;
    if (!parsed?.expiresAt || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const clearTestSession = () => localStorage.removeItem(STORAGE_KEY);
