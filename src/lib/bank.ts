import { supabase } from "@/integrations/visible7/client";
import { type CashMonth } from "@/lib/cashflow";

/**
 * Napojení bankovního účtu přes Goodveri Finspector (funkce bank-sync).
 * Pilot: funkce pouští jen správce. Do aplikace chodí jen měsíční souhrny, žádné jednotlivé platby.
 */

export interface BankConnection {
  id: string;
  provider: "goodveri" | "goodveri_pdf" | "demo";
  bank_code: string | null;
  bank_name: string;
  account_mask: string;
  status: "pending" | "active" | "expired" | "revoked" | "error";
  consent_expires_at: string | null;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
}

export interface BankMonth extends CashMonth {
  connection_id: string;
  tags: Record<string, number>;
  tx_count: number;
}

export interface BankProviderInfo {
  code: string;
  name: string;
  logo: string | null;
}

export async function loadBankData(): Promise<{ connections: BankConnection[]; months: BankMonth[] }> {
  const [{ data: connections }, { data: months }] = await Promise.all([
    supabase
      .from("bank_connections")
      .select(
        "id, provider, bank_code, bank_name, account_mask, status, consent_expires_at, last_sync_at, last_error, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("cashflow_months")
      .select("connection_id, month, income, expense, by_category, tags, tx_count, balance_end")
      .order("month"),
  ]);
  return {
    connections: (connections ?? []) as BankConnection[],
    months: ((months ?? []) as BankMonth[]).map((m) => ({
      ...m,
      income: Number(m.income),
      expense: Number(m.expense),
      balance_end: m.balance_end === null ? null : Number(m.balance_end),
    })),
  };
}

/**
 * Sloučí souhrny všech aktivních připojení do kalendářních měsíců `months`.
 * Zůstatek je součet zůstatků; když za měsíc chybí, převezme se poslední známý.
 */
export function mergeMonths(rows: BankMonth[], months: string[], activeIds: Set<string>): CashMonth[] {
  const lastBalance = new Map<string, number>();
  return months.map((month) => {
    const here = rows.filter((r) => r.month === month && activeIds.has(r.connection_id));
    const by_category: Record<string, number> = {};
    for (const r of here)
      for (const [k, v] of Object.entries(r.by_category ?? {})) by_category[k] = (by_category[k] ?? 0) + Number(v);
    for (const r of here) if (r.balance_end !== null) lastBalance.set(r.connection_id, r.balance_end);
    const balance = [...lastBalance.values()].reduce((s, v) => s + v, 0);
    return {
      month,
      income: here.reduce((s, r) => s + r.income, 0),
      expense: here.reduce((s, r) => s + r.expense, 0),
      by_category,
      balance_end: lastBalance.size ? balance : null,
    };
  });
}

export interface BankResult {
  error?: string;
  code?: string;
  detail?: string;
  [k: string]: unknown;
}

export async function bankSync(action: string, payload: Record<string, unknown> = {}): Promise<BankResult> {
  const { data, error } = await supabase.functions.invoke("bank-sync", { body: { action, ...payload } });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const body = await ctx.json();
        return { error: body?.error ?? "Napojení účtu se nepodařilo.", code: body?.code, detail: body?.detail };
      } catch {
        /* ignore */
      }
    }
    return { error: "Napojení účtu se nepodařilo. Zkuste to prosím za chvíli." };
  }
  return (data ?? {}) as BankResult;
}

/** Soubor → base64 bez prefixu data:… (pro Goodveri Statement). */
export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export const STATUS_LABEL: Record<BankConnection["status"], string> = {
  pending: "čeká na přihlášení v bance",
  active: "aktivní",
  expired: "souhlas vypršel",
  revoked: "odvoláno",
  error: "chyba při aktualizaci",
};

/** Popisky štítků Goodveri, které se na podnikatelském účtu objevují nejčastěji. */
export const TAG_LABEL: Record<string, string> = {
  invoicecredit: "Úhrady faktur",
  factoringcredit: "Faktoring",
  ownersaccountcredit: "Z vlastního účtu",
  ownersaccountdebit: "Na vlastní účet",
  familyaccountcredit: "Z účtu rodiny",
  familyaccountdebit: "Na účet rodiny",
  taxes_DPH: "DPH",
  taxes_DPPO: "Daň z příjmů PO",
  taxes_DPFO: "Daň z příjmů FO",
  taxes_SIL: "Silniční daň",
  taxes_NEM: "Daň z nemovitosti",
  taxes_PAU: "Paušální daň",
  healthinsurancedebit: "Zdravotní pojištění",
  sickness_insurance_con_debit: "Nemocenské pojištění",
  pension_con_debit: "Sociální pojištění",
  rentdebit: "Nájem",
  telcodebit: "Telefon",
  internetdebit: "Internet",
  otheritservicesdebit: "IT služby",
  subscriptiondebit: "Předplatné",
  insurancedebit: "Pojištění",
  fueldebit: "Pohonné hmoty",
  electricitydebit: "Elektřina",
  energydebit: "Energie",
  otherretaildebit: "Nákupy",
  electrostoredebit: "Elektro",
  horecadebit: "Restaurace",
  instalment: "Splátky",
  kontokorentdebit: "Kontokorent",
  loan: "Úvěr",
  refundscredit: "Vratky",
  taxescredit: "Vratka daně",
};
