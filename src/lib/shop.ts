import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/visible7/client";

/** Nastavení prodeje členství (mění správce v administraci → Platby). Ceny jsou včetně DPH. */
export interface ShopSettings {
  price: number;
  months: number;
  days: number;
  checkout_url: string;
  anchor: string;
  product_id?: string;
  /** ID formuláře SimpleShopu pro vložení do stránky /clenstvi (z kódu: data-SimpleShopForm="…") */
  form_id?: string;
}

export const SHOP_DEFAULT: ShopSettings = {
  price: 2990,
  months: 6,
  days: 183,
  checkout_url: "",
  anchor: "Kurz Specialista internetového obchodu s lektorem stojí 49 000 Kč.",
  form_id: "",
};

export const kc = (n: number) => `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
export const perMonth = (s: ShopSettings) => kc(s.price / Math.max(1, s.months));
export const monthsLabel = (m: number) => (m === 1 ? "1 měsíc" : m < 5 ? `${m} měsíce` : `${m} měsíců`);

export async function loadShop(): Promise<ShopSettings> {
  const { data } = await supabase.from("app_settings").select("value").eq("key", "shop").maybeSingle();
  return { ...SHOP_DEFAULT, ...((data as { value?: Partial<ShopSettings> } | null)?.value ?? {}) };
}

export const useShop = () =>
  useQuery({ queryKey: ["shop"], queryFn: loadShop, staleTime: 10 * 60_000 }).data ?? SHOP_DEFAULT;

export async function saveShop(s: ShopSettings) {
  const { error } = await supabase
    .from("app_settings")
    .update({ value: s as unknown as never, updated_at: new Date().toISOString() } as never)
    .eq("key", "shop");
  if (error) throw error;
}

/** Kam vede „Koupit členství“: vložený formulář na /clenstvi, jinak odkaz na SimpleShop, jinak ceník. */
export const canBuy = (s: ShopSettings) => !!(s.form_id || s.checkout_url);

/** Čísla s mezerou (49 000 Kč) se nesmí zalomit na dva řádky. */
export const nbsp = (t: string) => t.replace(/(\d) (\d)/g, "$1\u00a0$2").replace(/ Kč/g, "\u00a0Kč");

/** Startovací cena pro prvních N členů (nastavení app_settings.founder_offer, počítá funkce founder_offer). */
export interface FounderOffer {
  seats: number;
  left: number;
  next_price: number;
}

export async function loadFounderOffer(): Promise<FounderOffer | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("founder_offer");
  if (error || !data) return null;
  return data as FounderOffer;
}

export const useFounderOffer = () =>
  useQuery({ queryKey: ["founder-offer"], queryFn: loadFounderOffer, staleTime: 60_000 }).data ?? null;

/** „zbývá 1 místo / 3 místa / 12 míst“ */
export const seatsLabel = (n: number) => `${n} ${n === 1 ? "místo" : n >= 2 && n <= 4 ? "místa" : "míst"}`;

/** Rezervační stránka v Google Kalendáři: 20 min konzultace zdarma (pilotní provoz, vyhodnotit 01/2027). */
export const FREE_CONSULT_URL = "https://calendar.app.google/Lh1bJygQnhK12CMN7";
