import { createClient } from '@supabase/supabase-js';

/**
 * Klient pro vlastní Supabase projekt VISIBLE7 (ne Lovable Cloud).
 *
 * Adresa a veřejný (anon) klíč jsou určené pro prohlížeč – nejsou tajné,
 * přístup k datům hlídají pravidla RLS přímo v databázi.
 * Záměrně nejsou v .env ani v src/integrations/supabase/*, protože tyto soubory
 * generuje Lovable a mohl by je přepsat zpět na Lovable Cloud.
 */
export const VISIBLE7_SUPABASE_URL = 'https://mpftsyraaozarfpnnzjn.supabase.co';
export const VISIBLE7_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZnRzeXJhYW96YXJmcG5uempuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMjcwMDksImV4cCI6MjA3OTgwMzAwOX0.Rj7kzgzrrn7zk1g0d7_XebH9ESX6b7I2MkhBi-h5c74';

export const supabase = createClient(VISIBLE7_SUPABASE_URL, VISIBLE7_SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
