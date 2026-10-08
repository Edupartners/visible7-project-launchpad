import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/visible7/client';
import { useProject } from '@/contexts/ProjectContext';

/**
 * Ukládání postupu ve fázích. Stejné API jako dřív (key, defaultValue) => [value, setValue],
 * takže komponenty fází se nemusely měnit.
 *
 * Data se ukládají do tabulky `project_data` k aktuálně otevřenému projektu
 * (RLS: uživatel vidí jen data svých projektů). Po přepnutí projektu se hodnota
 * načte znovu pro nový projekt.
 */
export function useSupabaseProgress<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, { loading: boolean }] {
  const { currentProject } = useProject();
  const projectId = currentProject?.id ?? null;

  const [state, setState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const defaultRef = useRef(defaultValue);
  const projectIdRef = useRef<string | null>(projectId);
  projectIdRef.current = projectId;

  useEffect(() => {
    let active = true;
    setState(defaultRef.current);

    if (!projectId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('project_data')
        .select('data_value')
        .eq('project_id', projectId)
        .eq('data_key', key)
        .maybeSingle();

      if (!active) return;
      if (!error && data) {
        setState((data as { data_value: unknown }).data_value as T);
      }
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [key, projectId]);

  const persist = useCallback(
    async (value: T) => {
      const pid = projectIdRef.current;
      if (!pid) {
        console.warn(`useSupabaseProgress: "${key}" nelze uložit, není otevřený žádný projekt`);
        return;
      }
      const { error } = await supabase
        .from('project_data')
        .upsert(
          { project_id: pid, data_key: key, data_value: value as unknown },
          { onConflict: 'project_id,data_key' }
        );
      if (error) {
        console.warn(`Uložení "${key}" se nezdařilo:`, error);
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
