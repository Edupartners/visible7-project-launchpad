import { supabase } from "@/integrations/visible7/client";

/** Žádost o instalaci webu s podporou (brána 4). */
export interface InstallRequest {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  hosting: "mam" | "nemam";
  domain: string | null;
  web_type: string | null;
  billing: string | null;
  note: string | null;
  status: InstallStatus;
  site_url: string | null;
  created_at: string;
}

export type InstallStatus = "nova" | "zaplaceno" | "instalace" | "hotovo" | "zruseno";

export const INSTALL_STATUS: Record<InstallStatus, string> = {
  nova: "Nová",
  zaplaceno: "Zaplaceno",
  instalace: "Instalujeme",
  hotovo: "Hotovo",
  zruseno: "Zrušeno",
};

export const WEB_TYPES = ["Prezentační web", "E-shop", "Prodejní stránka", "Jiné, napíšu do poznámky"];

/** Ceník hostingu a domén u WEDOS (hosting i doména jsou na jméno zákazníka). */
export const WEDOS_PRICES_URL = "https://vedos.cz/webhosting/srovnani/";

export async function myLatestInstall(userId: string): Promise<InstallRequest | null> {
  const { data } = await supabase
    .from("install_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as InstallRequest | null) ?? null;
}
