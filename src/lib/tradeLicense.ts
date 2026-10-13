/**
 * Karta „Založte živnost online“ (začátek brány 5, v bráně 6 pro ty, kdo ji přeskočili)
 * a ověření IČO v registru ARES přes edge funkci `ares`.
 * Údaje k roku 2026: poplatek 800 Kč online / 1 000 Kč listinně, zápis do 5 dnů,
 * registrace k dani z příjmů fyzických osob je od 1. 1. 2024 zrušená.
 * Zdroje: BusinessInfo.cz (Vznik živnostenského oprávnění), Finance.cz (Živnost online).
 */
import { supabase } from "@/integrations/visible7/client";

export const TRADE_FEE_ONLINE = 800;
export const TRADE_FEE_PAPER = 1000;
export const RZP_URL = "https://www.rzp.cz/";
export const PORTAL_URL = "https://obcan.portal.gov.cz/";

export type TradeStatus = "prepare" | "fill" | "submitted";
export type TradeMode = "side" | "main";
export type TradeIdentity = "bank" | "eid" | "databox" | "none";

export interface TradeLicenseState {
  status: TradeStatus;
  mode: TradeMode | "";
  identity: TradeIdentity | "";
  /** Už podnikám (stávající živnost nebo s.r.o.) – rovnou jen ověření IČO. */
  existing: boolean;
  submittedAt: string;
}

export const EMPTY_TRADE: TradeLicenseState = {
  status: "prepare",
  mode: "",
  identity: "",
  existing: false,
  submittedAt: "",
};

export interface BusinessVerification {
  ico: string;
  name: string;
  legal_form: string | null;
  established: string | null;
  name_match: boolean;
  verified_at: string;
}

export const LEGAL_FORM_LABELS: Record<string, string> = {
  "101": "Fyzická osoba podnikající podle živnostenského zákona",
  "105": "Fyzická osoba podnikající podle jiných zákonů",
  "107": "Zemědělský podnikatel – fyzická osoba",
  "111": "Veřejná obchodní společnost",
  "112": "Společnost s ručením omezeným",
  "113": "Komanditní společnost",
  "121": "Akciová společnost",
};
export const legalFormLabel = (code: string | null) =>
  code ? (LEGAL_FORM_LABELS[code] ?? `Právní forma ${code}`) : "";

const SHOP = "Velkoobchod a maloobchod";
const COURSES = "Mimoškolní výchova a vzdělávání, pořádání kurzů, školení, včetně lektorské činnosti";
const IT =
  "Poskytování software, poradenství v oblasti informačních technologií, zpracování dat, hostingové a související činnosti a webové portály";
const CONSULTING = "Poradenská a konzultační činnost, zpracování odborných studií a posudků";
const ADS = "Reklamní činnost, marketing, mediální zastoupení";
const BROKER = "Zprostředkování obchodu a služeb";
const PUBLISHING = "Vydavatelské činnosti, polygrafická výroba, knihařské a kopírovací práce";

/** Doporučené obory volné živnosti podle typu byznysu (jedna živnost, obory zdarma navíc). */
export const TRADE_FIELDS: Record<string, string[]> = {
  eshop: [SHOP],
  "web-eshop": [SHOP],
  dropshipping: [SHOP, BROKER],
  members: [COURSES, IT],
  lms: [COURSES, IT],
  "forum-komunita": [IT, ADS],
  "web-prezentacni": [CONSULTING],
  "konverzni-web": [CONSULTING, ADS],
  "squeeze-page": [CONSULTING, ADS],
  blog: [PUBLISHING, ADS],
  affiliate: [BROKER, ADS],
  marketplace: [BROKER, IT],
  "vlastni-napad-app": [IT],
};
export const tradeFieldsFor = (businessType: string | null | undefined) =>
  (businessType && TRADE_FIELDS[businessType]) || [CONSULTING];

/** IČO má 8 číslic a kontrolní číslici (modulo 11). */
export function validIco(raw: string) {
  const ico = raw.replace(/\s/g, "");
  if (!/^\d{8}$/.test(ico)) return false;
  const sum = [...ico.slice(0, 7)].reduce((s, d, i) => s + Number(d) * (8 - i), 0);
  const r = sum % 11;
  const check = r === 0 ? 1 : r === 1 ? 0 : 11 - r;
  return check === Number(ico[7]);
}

export async function loadVerification(projectId: string): Promise<BusinessVerification | null> {
  const { data, error } = await supabase
    .from("business_verifications")
    .select("ico, name, legal_form, established, name_match, verified_at")
    .eq("project_id", projectId)
    .maybeSingle();
  if (error || !data) return null;
  return data as BusinessVerification;
}

export async function verifyIco(
  projectId: string,
  ico: string,
): Promise<{ result?: BusinessVerification; error?: string }> {
  const { data, error } = await supabase.functions.invoke("ares", {
    body: { project_id: projectId, ico: ico.replace(/\s/g, "") },
  });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        return { error: body?.error ?? "Ověření se nepodařilo." };
      } catch {
        /* ignore */
      }
    }
    return { error: "Registr ARES teď neodpovídá. Zkuste to prosím za chvíli." };
  }
  return { result: data as BusinessVerification };
}
