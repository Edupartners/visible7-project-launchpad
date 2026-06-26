import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side náhrada za usePersistedState. Stejné API (key, defaultValue) => [value, setValue],
 * takže v existujících souborech stačí změnit import - zbytek kódu zůstává stejný.
 *
 * Rozdíl proti localStorage verzi:
 * - Data se ukládají do tabulky `user_progress` v Supabase (RLS: každý vidí jen svoje).
 * - Postup je tak dostupný z libovolného zařízení a přežije smazání cache v prohlížeči.
 * - Než se data z databáze stáhnou, používá se defaultValue (žádné "bliknutí" prázdného UI).
 */
export function useSupabaseProgress<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, { loading: boolean }] {
  const [state, setState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  // Načtení existující hodnoty z databáze při prvním renderu / přihlášení
  useEffect(() => {
    let active = true;

    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id ?? null;
      userIdRef.current = userId;

      if (!userId) {
        if (active) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_progress')
        .select('data_value')
        .eq('user_id', userId)
        .eq('data_key', key)
        .maybeSingle();

      if (!active) return;

      if (!error && data) {
        setState(data.data_value as T);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [key]);

  const persist = useCallback(
    async (value: T) => {
      const userId = userIdRef.current;
      if (!userId) {
        console.warn(`useSupabaseProgress: cannot save "${key}", user not logged in`);
        return;
      }
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          { user_id: userId, data_key: key, data_value: value as unknown as Record<string, unknown> },
          { onConflict: 'user_id,data_key' }
        );
      if (error) {
        console.warn(`Failed to save "${key}" to Supabase:`, error);
      }
    },
    [key]
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  return [state, setValue, { loading }];
}
