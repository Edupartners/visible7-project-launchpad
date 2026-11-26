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
  /** Odkaz na okamžitou platbu studia Specialista internetového obchodu (SimpleShop). Prázdné = jen hovor. */
  study_checkout_url?: string;
  /** Odkaz na platbu studia v 5 platbách (SimpleShop). Prázdné = tlačítko se nezobrazí. */
  study_installments_url?: string;
  /** Kolik míst za zvýhodněnou cenu studia zbývá (0 = platí plná cena). */
  study_early_left?: number;
  /** Instalace webu s podporou (brána 4): cena služby v Kč vč. DPH */
  install_price?: number;
  /** Odkaz na platbu instalace (SimpleShop). Prázdné = platba po domluvě. */
  install_checkout_url?: string;
  /** Cena jednoho kurzu v Kč vč. DPH */
  course_price?: number;
  /** Na kolik dní se kurz po zaplacení odemkne */
  course_days?: number;
  /** Kurzy na samostatný prodej: ID produktu v SimpleShopu (pro webhook) a odkaz na platbu */
  courses?: Record<string, { product_id?: string; checkout_url?: string }>;
}

/** Kurzy, které jde koupit samostatně (bez členství). */
export const SINGLE_COURSES = ["seo", "ai_viditelnost", "web"] as const;
export const COURSE_PRICE_DEFAULT = 1490;
export const coursePrice = (s: ShopSettings) => s.course_price || COURSE_PRICE_DEFAULT;
export const courseDays = (s: ShopSettings) => s.course_days || 365;
export const isSingleCourse = (id: string) => (SINGLE_COURSES as readonly string[]).includes(id);
/** Odkaz na platbu kurzu; prázdný = kurz se zatím samostatně neprodává. */
export const courseCheckoutUrl = (s: ShopSettings, id: string) =>
  isSingleCourse(id) ? (s.courses?.[id]?.checkout_url ?? "").trim() : "";

export const SHOP_DEFAULT: ShopSettings = {
  price: 6990,
  months: 12,
  days: 365,
  checkout_url: "",
  anchor: "Kurzy Specialista internetového obchodu s lektorem stojí jednotlivě přes 60 000 Kč.",
  form_id: "",
};

/** Co obsahuje roční členství (od 11/2026). */
export const MEMBER_ITEMS = [
  "Všech 7 bran metodiky VISIBLE7 MICEK® pro jeden vlastní projekt",
  "E-learning s lekcemi od lektorů z praxe",
  "4 vybrané živé semináře s praktiky",
  "AI pomocník, byznys case v Excelu a pitch na A4",
  "Osvědčení za každou bránu, zkouška profesní kvalifikace za zvýhodněnou cenu",
];

export const kc = (n: number) => `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
export const perMonth = (s: ShopSettings) => kc(s.price / Math.max(1, s.months));
export const monthsLabel = (m: number) => (m === 1 ? "1 měsíc" : m < 5 ? `${m} měsíce` : `${m} měsíců`);

/** Roční členství od 11/2026. Dokud je v administraci stará cena 2 990 Kč na půl roku, platí tahle. */
const MEMBERSHIP_2027 = { price: 6990, months: 12, days: 365 };

export async function loadShop(): Promise<ShopSettings> {
  const { data } = await supabase.from("app_settings").select("value").eq("key", "shop").maybeSingle();
  const db = (data as { value?: Partial<ShopSettings> } | null)?.value ?? {};
  return { ...SHOP_DEFAULT, ...db, ...(db.price === 2990 ? MEMBERSHIP_2027 : {}) };
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
