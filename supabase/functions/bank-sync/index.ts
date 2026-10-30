// VISIBLE7 – Cash flow z bankovního účtu přes Goodveri Finspector (PSD2).
//
// Řetězec: banka → Finbricks (licencovaný AISP) → Goodveri / SokordiaTech (Finspector API) → tato funkce → VISIBLE7.
// Dokumentace: „Goodveri FINSPECTOR – Popis API“ (5. 3. 2026), „Goodveri identity – získání přístupu“,
// swagger gv-finspector-swagger20251011.json, „Finspector – Status code“, „ST Classification cycles 1.1“.
//
// Zásady:
//  - Přístupové údaje do banky VISIBLE7 nikdy nevidí. Uživatel se přihlásí u banky na stránce, kam ho pošle Goodveri.
//  - Transakce zpracujeme jen v paměti. Ukládáme jen měsíční souhrny podle kategorií a štítků Goodveri,
//    žádné jednotlivé transakce, texty plateb ani protistrany.
//  - Pilot: jen správce (BANK_SYNC_ACCESS=admins, výchozí). Později „paid“ = placený přístup.
//  - Klíče jen v Supabase secrets (GOODVERI_*), nikdy v repozitáři.
//  - Testovací režim: dokud nejsou přístupy nastavené, funkce místo Goodveri vrací vymyšlená data
//    ve stejném formátu (mockGv) a „přihlášení v bance“ je cvičná stránka /cvicna-banka.
//    Jakmile se vloží GOODVERI_API_URL + CLIENT_ID + SECRET, testovací režim se sám vypne.
// verify_jwt je vypnuté – uživatele ověřujeme sami přes auth.getUser() (stejně jako ostatní funkce).
//
// Akce (POST { action, ... }):
//  providers   → { providers }           seznam bank (Goodveri ProviderList)
//  connect     → { url } | { connection } { providerCode, userAgent } – adresa přihlášení do banky
//  callback    → { connection, months }  { clientId } – po návratu z banky uloží účet a stáhne souhrny
//  sync        → { months }              { connectionId } – ruční aktualizace
//  disconnect  → { ok }                  { connectionId } – odvolá souhlas u Goodveri a smaže data
//  statement   → { connection, months }  { files: [{ name, content(base64), password? }] } – PDF výpisy
//  sync_all    (jen plánovač s CRON_SECRET) – denní aktualizace všech aktivních připojení

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const APP_URL = Deno.env.get("APP_URL") ?? "https://visible7.io";
const ACCESS = Deno.env.get("BANK_SYNC_ACCESS") ?? "admins"; // „admins“ (pilot) | „paid“

// Goodveri – přístupy dodá SokordiaTech (Petr Bartošek). Bez nich běží testovací režim (mockGv).
const GV_API = (Deno.env.get("GOODVERI_API_URL") ?? "").replace(/\/+$/, ""); // např. https://…/ (bez /api)
const GV_IDENTITY = Deno.env.get("GOODVERI_IDENTITY_URL") ?? "https://identity.goodveri.online/connect/token";
const GV_CLIENT_ID = Deno.env.get("GOODVERI_CLIENT_ID") ?? "";
const GV_CLIENT_SECRET = Deno.env.get("GOODVERI_CLIENT_SECRET") ?? "";
const GV_SCOPE = Deno.env.get("GOODVERI_SCOPE") ?? "";
const GV_COUNTRY = "CZE";
// Historie: hned po přihlášení v bance (silné ověření) jde stáhnout až 365 dní. Dalších 180 dní
// (dokud klient souhlas neodvolá) se smí ptát jen na 90 dní zpět (Petr Bartošek, 30. 10. 2026).
const HISTORY_DAYS_FIRST = 365;
const HISTORY_DAYS_REFRESH = 89;
const CONSENT_DAYS = 180;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });

/** Kategorie souhrnu – stejné jako v aplikaci (src/lib/cashflow.ts). */
export const CATEGORIES = [
  "trzby",
  "ostatni_prijmy",
  "vklady_prevody",
  "naklady_zbozi",
  "marketing",
  "provoz",
  "mzdy",
  "dane_odvody",
  "ostatni_vydaje",
  "vybery_prevody",
] as const;
type Category = (typeof CATEGORIES)[number];
/** Převody mezi vlastními účty a vklady/výběry majitele mění hotovost, ale nejsou tržba ani náklad. */
const TRANSFERS: Category[] = ["vklady_prevody", "vybery_prevody"];

// ---------------------------------------------------------------------------------------------
// Goodveri Finspector – klient
// ---------------------------------------------------------------------------------------------

class GoodveriError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}
/** Kódy, kdy je potřeba znovu udělit souhlas v bance (Finspector – Status code). */
const CONSENT_CODES = new Set([103, 104, 105, 107, 702, 727, 754, 761, 802]);

const configured = () => !!(GV_API && GV_CLIENT_ID && GV_CLIENT_SECRET);
/** Sandbox Goodveri (https://sandbox-finspector.goodveri.online, scope sc:demo:finspector) – data nejsou skutečná. */
const SANDBOX = /sandbox/i.test(GV_API) || /demo/i.test(GV_SCOPE);

let token: { value: string; until: number } | null = null;
async function gvToken(): Promise<string> {
  if (token && token.until > Date.now() + 60_000) return token.value;
  const form = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: GV_CLIENT_ID,
    client_secret: GV_CLIENT_SECRET,
  });
  if (GV_SCOPE) form.set("scope", GV_SCOPE);
  const res = await fetch(GV_IDENTITY, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!res.ok) throw new GoodveriError(101, `Goodveri identity ${res.status}`);
  const data = await res.json();
  // expires_in je v sekundách; token používáme většinu doby platnosti (doporučení Goodveri)
  token = { value: data.access_token, until: Date.now() + Number(data.expires_in ?? 600) * 1000 };
  return token.value;
}

async function gv<T>(method: string, body: Record<string, unknown>): Promise<T> {
  if (!configured()) return mockGv(method, body) as T;
  const call = async () =>
    fetch(`${GV_API}/api/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${await gvToken()}` },
      body: JSON.stringify({ requestId: crypto.randomUUID(), ...body }),
    });
  let res = await call();
  if (res.status === 401) {
    token = null; // token mohl vypršet dřív, zkusíme jednou znovu
    res = await call();
  }
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* ne-JSON odpověď */
  }
  if (!res.ok) {
    const code = Number((data as { resultCode?: number }).resultCode ?? res.status);
    throw new GoodveriError(code, `${method} ${res.status}: ${String(data.detail ?? data.title ?? data.message ?? text).slice(0, 200)}`);
  }
  const rc = (data as { resultCode?: number }).resultCode;
  if (typeof rc === "number" && rc !== 0) {
    throw new GoodveriError(rc, `${method} resultCode ${rc}: ${String(data.message ?? "").slice(0, 200)}`);
  }
  return data as T;
}

interface GvAmount {
  value: number;
  currency: string;
}
interface GvTransaction {
  date: string;
  amount?: GvAmount;
  tags?: string[] | null;
}
interface GvStatement {
  accountNumber?: string | null;
  bankCode?: string | null;
  accountName?: string | null;
  productName?: string | null;
  name?: string | null;
  startDate?: string;
  endDate?: string;
  startBalance?: GvAmount;
  endBalance?: GvAmount;
  transactions?: GvTransaction[] | null;
}
interface GvAccount {
  id?: string | null;
  accountName?: string | null;
  productName?: string | null;
  ibanCode?: string | null;
  accountNumber?: string | null;
  balance?: GvAmount;
}


// ---------------------------------------------------------------------------------------------
// Testovací režim – vymyšlená data ve formátu Finspector API (jen dokud nejsou přístupy)
// ---------------------------------------------------------------------------------------------

const MOCK_BANKS = [
  { providerCode: "MOCK_A", name: "Cvičná banka", logo: null },
  { providerCode: "MOCK_B", name: "Cvičná spořitelna", logo: null },
  { providerCode: "MOCK_C", name: "Testovací fintech", logo: null },
];

/** Rok pohybů podnikatelského účtu se štítky Goodveri, deterministicky podle seed. */
function mockStatement(seed: string, days: number, accountNumber: string): GvStatement {
  let x = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 233280, 7);
  const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  const txs: GvTransaction[] = [];
  const add = (d: Date, value: number, tags: string[]) => {
    if (d < start || d > end) return;
    txs.push({ date: d.toISOString().slice(0, 19), amount: { value: Math.round(value), currency: "CZK" }, tags });
  };
  const months = Math.ceil(days / 30) + 1;
  for (let i = months; i >= 0; i--) {
    const y = end.getFullYear();
    const m = end.getMonth() - i;
    const day = (n: number) => new Date(y, m, n, 10);
    const growth = 1 + (months - i) * 0.03; // podnik pomalu roste
    // tržby: 6–10 úhrad faktur, jedna pravidelná od stálého klienta
    const invoices = 5 + Math.floor(rnd() * 4);
    for (let k = 0; k < invoices; k++)
      add(day(2 + Math.floor(rnd() * 26)), (4_500 + rnd() * 6_000) * growth, ["credit", "transfer", "invoicecredit"]);
    add(day(5), 15_000, ["credit", "transfer", "invoicecredit", "credit10in12"]);
    // výdaje
    add(day(1), -12_000, ["debit", "transfer", "rentdebit", "debit10in12"]);
    add(day(8), -890, ["debit", "transfer", "telcodebit", "debit10in12"]);
    add(day(9), -1_250, ["debit", "card", "otheritservicesdebit"]);
    add(day(12), -490, ["debit", "card", "subscriptiondebit", "debit10in12"]);
    add(day(14), -(6_000 + rnd() * 6_000) * growth, ["debit", "card", "otherretaildebit"]);
    add(day(18), -(1_500 + rnd() * 2_000), ["debit", "card", "fueldebit"]);
    add(day(20), -3_143, ["debit", "transfer", "healthinsurancedebit", "debit10in12"]);
    add(day(20), -4_759, ["debit", "transfer", "pension_con_debit", "debit10in12"]);
    // bez štítku účelu – typicky reklama nebo spolupracovník (Goodveri je nepozná)
    add(day(16), -(4_000 + rnd() * 4_000), ["debit", "card"]);
    add(day(25), -(7_000 + rnd() * 3_000), ["debit", "transfer"]);
    // výběr majitele na osobní účet
    add(day(27), -10_000, ["debit", "transfer", "ownersaccountdebit"]);
    // DPH čtvrtletně
    if (((m % 12) + 12) % 12 % 3 === 0) add(day(24), -(9_000 + rnd() * 6_000) * growth, ["debit", "transfer", "taxes_DPH"]);
  }
  txs.sort((a, b) => a.date.localeCompare(b.date));
  const movement = txs.reduce((s, t) => s + (t.amount?.value ?? 0), 0);
  const endBalance = 140_000 + Math.round(rnd() * 20_000);
  return {
    accountNumber,
    bankCode: "0000",
    accountName: "Podnikatelský účet (test)",
    productName: "Cvičný účet",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    startBalance: { value: endBalance - movement, currency: "CZK" },
    endBalance: { value: endBalance, currency: "CZK" },
    transactions: txs,
  };
}

function mockGv(method: string, body: Record<string, unknown>): unknown {
  const client = String(body.clientCode ?? body.refNo ?? "test");
  switch (method) {
    case "ProviderList":
      return { providers: MOCK_BANKS };
    case "AccountAuth": {
      const url = new URL(`${APP_URL}/cvicna-banka`);
      url.searchParams.set("bank", String(body.providerCode ?? ""));
      url.searchParams.set("return", String(body.returnUrl ?? `${APP_URL}/cash-flow`));
      return { authenticated: false, authenticationUrl: url.toString(), message: "test" };
    }
    case "AccountList":
      return {
        resultCode: 0,
        accounts: [
          {
            id: `acc-${client.slice(0, 8)}`,
            accountName: "Podnikatelský účet (test)",
            accountNumber: `19-${String(client.replace(/\D/g, "").slice(0, 6)).padEnd(6, "4")}8211/0000`,
            balance: { value: 90_000, currency: "CZK" },
          },
        ],
      };
    case "AccountInfo":
      return { resultCode: 0, statements: [mockStatement(client, Number(body.days ?? 180), "123456821")] };
    case "Statement":
      return { resultCode: 0, statements: [mockStatement(client, 92, "987654321")] };
    case "RevokeAuth":
      return { code: 0, message: "OK" };
    default:
      throw new GoodveriError(735, `Testovací režim: metoda ${method} není`);
  }
}

const mask = (acc?: string | null) => {
  const digits = (acc ?? "").replace(/[^0-9]/g, "");
  return digits ? `•••• ${digits.slice(-4)}` : "";
};

// ---------------------------------------------------------------------------------------------
// Mapování štítků Goodveri (ST Classification cycles 1.1) na kategorie VISIBLE7
// Klasifikace Goodveri je stavěná hlavně na osobní účty (scoring). Mzdy a marketing zatím neumí –
// ty zůstanou v „ostatních výdajích“, dokud se nedomluví vlastní štítky (cyklus 8 Custom tag).
// ---------------------------------------------------------------------------------------------

const has = (tags: Set<string>, ...names: string[]) => names.some((n) => tags.has(n));
const hasPrefix = (tags: Set<string>, prefix: string) => [...tags].some((t) => t.startsWith(prefix));

function categorize(tagList: string[], value: number): Category {
  const t = new Set(tagList.map((x) => x.trim()));
  const credit = t.has("credit") ? true : t.has("debit") ? false : value >= 0;

  if (credit) {
    if (has(t, "ownersaccountcredit", "familyaccountcredit", "cashdeposit", "depositcredit")) return "vklady_prevody";
    if (has(t, "invoicecredit", "factoringcredit")) return "trzby";
    if (
      has(
        t,
        "loan",
        "kontokorentcredit",
        "microloan",
        "loanhypo",
        "refundscredit",
        "taxescredit",
        "insurancecredit",
        "investmentcredit",
        "wrongpaymentcredit",
        "errorpaymentcredit",
        "verificationcredit",
        "salary",
        "pensioncredit",
        "sickpaycredit",
        "socialbenefits",
      ) ||
      [...t].some((x) => /(telco|energy|electricity|water|gas|utilities|internet|entertainment|transport|healthinsurance)credit$/.test(x))
    )
      return "ostatni_prijmy";
    // Na podnikatelském účtu je běžná příchozí platba nejčastěji úhrada od zákazníka.
    return "trzby";
  }

  if (has(t, "ownersaccountdebit", "familyaccountdebit")) return "vybery_prevody";
  if (
    hasPrefix(t, "taxes_") ||
    has(t, "othertaxesdebit", "healthinsurancedebit", "sickness_insurance_con_debit", "pension_con_debit", "opt_pension_con_debit")
  )
    return "dane_odvody";
  if (
    has(
      t,
      "rentdebit",
      "electricitydebit",
      "sipodebit",
      "waterdebit",
      "utilitiesdebit",
      "energydebit",
      "gasdebit",
      "telcodebit",
      "internetdebit",
      "otheritservicesdebit",
      "subscriptiondebit",
      "insurancedebit",
      "fueldebit",
      "publictransportdebit",
      "transportdebit",
      "tollsvignettesdebit",
      "educationdebit",
    )
  )
    return "provoz";
  if (
    has(
      t,
      "electrostoredebit",
      "drugstoresdebit",
      "otherretaildebit",
      "furnituredebit",
      "fashiondebit",
      "foodgroceries",
      "hobbydebit",
      "giftsandflowersdebit",
    )
  )
    return "naklady_zbozi";
  return "ostatni_vydaje";
}

export interface MonthSummary {
  month: string; // YYYY-MM-01
  income: number;
  expense: number; // kladné číslo
  by_category: Partial<Record<Category, number>>;
  tags: Record<string, number>;
  tx_count: number;
  balance_end: number | null;
}

const monthOf = (d: string) => `${d.slice(0, 7)}-01`;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Z výpisů Goodveri spočítá měsíční souhrny (jen CZK). Transakce se nikam neukládají. */
function summarize(statements: GvStatement[]): MonthSummary[] {
  const months = new Map<string, MonthSummary>();
  const get = (m: string) => {
    let s = months.get(m);
    if (!s) {
      s = { month: m, income: 0, expense: 0, by_category: {}, tags: {}, tx_count: 0, balance_end: null };
      months.set(m, s);
    }
    return s;
  };
  // zůstatek ke konci měsíce: od konečného zůstatku výpisu odečítáme pohyby pozdějších měsíců
  const balanceByMonth = new Map<string, number>();

  for (const st of statements) {
    const txs = (st.transactions ?? []).filter((x) => (x.amount?.currency ?? "CZK") === "CZK" && x.date);
    for (const tx of txs) {
      const value = Number(tx.amount?.value ?? 0);
      const tags = (tx.tags ?? []).filter(Boolean);
      const cat = categorize(tags, value);
      const s = get(monthOf(tx.date));
      s.tx_count++;
      s.by_category[cat] = (s.by_category[cat] ?? 0) + value;
      if (!TRANSFERS.includes(cat)) {
        if (value >= 0) s.income += value;
        else s.expense += -value;
      }
      for (const tag of tags) {
        // směr, formu a periodicitu nesčítáme, nic neříkají o účelu platby
        if (/^(debit|credit|transfer|card|cash|norepeat|debitd?\d|creditd?\d)$|^(debit|credit)d?\d|^norepeat/.test(tag)) continue;
        s.tags[tag] = (s.tags[tag] ?? 0) + value;
      }
    }

    if (st.endBalance && (st.endBalance.currency ?? "CZK") === "CZK" && st.endDate) {
      const endMonth = monthOf(st.endDate);
      const byMonth = new Map<string, number>();
      for (const tx of txs) byMonth.set(monthOf(tx.date), (byMonth.get(monthOf(tx.date)) ?? 0) + Number(tx.amount?.value ?? 0));
      const all = [...new Set([...byMonth.keys(), endMonth])].sort().reverse();
      let bal = Number(st.endBalance.value);
      for (const m of all) {
        if (m > endMonth) continue;
        balanceByMonth.set(m, (balanceByMonth.get(m) ?? 0) + bal);
        bal -= byMonth.get(m) ?? 0;
      }
    }
  }

  return [...months.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((s) => ({
      ...s,
      income: round2(s.income),
      expense: round2(s.expense),
      by_category: Object.fromEntries(Object.entries(s.by_category).map(([k, v]) => [k, round2(v as number)])),
      tags: Object.fromEntries(Object.entries(s.tags).map(([k, v]) => [k, round2(v)])),
      balance_end: balanceByMonth.has(s.month) ? round2(balanceByMonth.get(s.month)!) : null,
    }));
}

// ---------------------------------------------------------------------------------------------
// Uložení
// ---------------------------------------------------------------------------------------------

type Admin = ReturnType<typeof createClient>;
interface Conn {
  id: string;
  user_id: string;
  provider: string;
  provider_ref: string;
  bank_code: string | null;
}

async function saveMonths(admin: Admin, conn: Conn, months: MonthSummary[]) {
  const rows = months.map((m) => ({
    connection_id: conn.id,
    user_id: conn.user_id,
    month: m.month,
    income: m.income,
    expense: m.expense,
    by_category: m.by_category,
    tags: m.tags,
    tx_count: m.tx_count,
    balance_end: m.balance_end,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length) {
    const { error } = await admin.from("cashflow_months").upsert(rows, { onConflict: "connection_id,month" });
    if (error) throw new Error(`Uložení souhrnů: ${error.message}`);
  }
  return rows.length;
}

/** Jen celé měsíce uvnitř okna – neúplný nejstarší měsíc by přepsal dřív uložená úplná data. */
const fullMonths = (months: MonthSummary[], days: number) => {
  const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  return months.filter((m) => m.month >= from);
};

async function syncGoodveri(admin: Admin, conn: Conn, days = HISTORY_DAYS_REFRESH) {
  try {
    const info = await gv<{ statements?: GvStatement[] }>("AccountInfo", {
      clientCode: conn.provider_ref,
      providerCode: conn.bank_code,
      refNo: conn.id,
      countryCode: GV_COUNTRY,
      days,
      calcLogic: 0,
    });
    const n = await saveMonths(admin, conn, fullMonths(summarize(info.statements ?? []), days));
    await admin
      .from("bank_connections")
      .update({ last_sync_at: new Date().toISOString(), status: "active", last_error: null })
      .eq("id", conn.id);
    return n;
  } catch (e) {
    const expired = e instanceof GoodveriError && CONSENT_CODES.has(e.code);
    await admin
      .from("bank_connections")
      .update({ status: expired ? "expired" : "error", last_error: String(e).slice(0, 300) })
      .eq("id", conn.id);
    throw e;
  }
}

/** IP uživatele pro AccountAuth (Goodveri ji vyžaduje, banka ji vidí při přihlášení). */
const userIp = (req: Request) =>
  (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
  req.headers.get("cf-connecting-ip") ||
  req.headers.get("x-real-ip") ||
  "127.0.0.1";

// ---------------------------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const action = String(body.action ?? "");
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Plánovač: denní aktualizace všech aktivních PSD2 připojení.
  if (action === "sync_all") {
    if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) return json({ error: "Zakázáno" }, 403);
    if (!configured()) return json({ synced: 0, total: 0, note: "not_configured" });
    // Po 180 dnech od přihlášení v bance souhlas neplatí – připojení označíme a nesynchronizujeme.
    await admin
      .from("bank_connections")
      .update({ status: "expired" })
      .eq("provider", "goodveri")
      .eq("status", "active")
      .lt("consent_expires_at", new Date().toISOString());
    const { data: conns } = await admin
      .from("bank_connections")
      .select("id, user_id, provider, provider_ref, bank_code")
      .eq("provider", "goodveri")
      .eq("status", "active");
    let ok = 0;
    for (const c of conns ?? []) {
      try {
        await syncGoodveri(admin, c as Conn);
        ok++;
      } catch {
        /* stav už je uložený u připojení */
      }
    }
    return json({ synced: ok, total: conns?.length ?? 0 });
  }

  // Ostatní akce jen pro přihlášeného uživatele.
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Přihlaste se prosím znovu." }, 401);
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: userData } = await userClient.auth.getUser(jwt);
  const user = userData?.user;
  if (!user) return json({ error: "Přihlaste se prosím znovu." }, 401);

  // Pilot: jen správce. Po pilotu BANK_SYNC_ACCESS=paid pustí i placený přístup.
  const [{ data: adminRow }, { data: accRow }] = await Promise.all([
    admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
    admin.from("user_access").select("plan, access_until").eq("user_id", user.id).maybeSingle(),
  ]);
  const paid =
    ["mesic", "ctvrtleti", "rok", "kod", "clenstvi"].includes(accRow?.plan ?? "") &&
    (!accRow?.access_until || new Date(accRow.access_until).getTime() > Date.now());
  const allowed = !!adminRow || (ACCESS === "paid" && paid);
  if (!allowed) return json({ error: "Napojení účtu zatím testujeme v uzavřeném pilotu.", code: "pilot" }, 403);

  // Bez přístupů běží testovací režim (mockGv) – vidí ho jen správce, protože ostatní sem nepustíme.
  const test = !configured();
  const label = test ? " (test)" : SANDBOX ? " (sandbox)" : "";

  try {
    if (action === "providers") {
      const r = await gv<{ providers?: { providerCode?: string; name?: string; logo?: string }[] }>("ProviderList", {
        countryCode: GV_COUNTRY,
      });
      return json({
        test,
        sandbox: !test && SANDBOX,
        providers: (r.providers ?? [])
          .filter((p) => p.providerCode)
          .map((p) => ({ code: p.providerCode, name: p.name ?? p.providerCode, logo: p.logo ?? null })),
      });
    }

    if (action === "connect") {
      const providerCode = String(body.providerCode ?? "");
      if (!providerCode) return json({ error: "Vyberte banku." }, 400);
      const clientCode = crypto.randomUUID();
      const { data: conn, error } = await admin
        .from("bank_connections")
        .insert({
          user_id: user.id,
          project_id: body.projectId ?? null,
          provider: "goodveri",
          provider_ref: clientCode,
          bank_code: providerCode,
          bank_name: `${String(body.bankName ?? providerCode).slice(0, 70)}${label}`,
          status: "pending",
        })
        .select("id, user_id, provider, provider_ref, bank_code")
        .single();
      if (error || !conn) throw new Error(`Založení připojení: ${error?.message}`);
      const r = await gv<{ authenticated?: boolean; authenticationUrl?: string | null; message?: string }>(
        "AccountAuth",
        {
          clientCode,
          providerCode,
          refNo: conn.id,
          countryCode: GV_COUNTRY,
          returnUrl: `${APP_URL}/cash-flow?clientId=${clientCode}`,
          userIp: userIp(req),
          userBrowserAgent: String(body.userAgent ?? req.headers.get("user-agent") ?? "Mozilla/5.0").slice(0, 400),
        },
      );
      if (r.authenticationUrl) return json({ url: r.authenticationUrl });
      // Banka uživatele už zná (platné silné přihlášení) – rovnou dokončíme.
      return json(await finishConnect(admin, conn as Conn));
    }

    if (action === "callback") {
      const clientId = String(body.clientId ?? "");
      const { data: conn } = await admin
        .from("bank_connections")
        .select("id, user_id, provider, provider_ref, bank_code")
        .eq("provider", "goodveri")
        .eq("provider_ref", clientId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!conn) return json({ error: "Připojení nenalezeno nebo patří jinému účtu." }, 404);
      return json(await finishConnect(admin, conn as Conn));
    }

    if (action === "statement") {
      const files = Array.isArray(body.files) ? (body.files as { name?: string; content?: string; password?: string }[]) : [];
      if (!files.length || files.length > 12) return json({ error: "Nahrajte 1 až 12 PDF výpisů." }, 400);
      const ref = crypto.randomUUID();
      const r = await gv<{ statements?: GvStatement[] }>("Statement", {
        refNo: ref,
        countryCode: GV_COUNTRY,
        calcLogic: 0,
        files: files.map((f, i) => ({
          name: `${i + 1}-${String(f.name ?? "vypis.pdf").replace(/[^\w.\-]/g, "_")}`,
          type: "application/pdf",
          content: String(f.content ?? ""),
          password: f.password || null,
        })),
      });
      const statements = r.statements ?? [];
      if (!statements.length) return json({ error: "Z výpisů se nepodařilo načíst žádné transakce." }, 422);
      const first = statements[0];
      const { data: conn, error } = await admin
        .from("bank_connections")
        .insert({
          user_id: user.id,
          project_id: body.projectId ?? null,
          provider: "goodveri_pdf",
          provider_ref: ref,
          bank_code: first.bankCode ?? null,
          bank_name: `PDF výpisy${first.bankCode && !test ? ` ${first.bankCode}` : ""}${label}`,
          account_mask: mask(first.accountNumber),
          status: "active",
          last_sync_at: new Date().toISOString(),
        })
        .select("id, user_id, provider, provider_ref, bank_code")
        .single();
      if (error || !conn) throw new Error(`Uložení výpisů: ${error?.message}`);
      const months = await saveMonths(admin, conn as Conn, summarize(statements));
      return json({ connection: { id: conn.id }, months });
    }

    if (action === "sync" || action === "disconnect") {
      const { data: conn } = await admin
        .from("bank_connections")
        .select("id, user_id, provider, provider_ref, bank_code, status")
        .eq("id", String(body.connectionId ?? ""))
        .eq("user_id", user.id)
        .maybeSingle();
      if (!conn) return json({ error: "Připojení nenalezeno." }, 404);
      if (action === "sync") {
        if (conn.provider !== "goodveri") return json({ error: "PDF výpisy se aktualizují novým nahráním." }, 400);
        if (conn.status === "expired")
          return json({ error: "Souhlas v bance vypršel (platí 180 dní). Odpojte účet a připojte ho znovu.", code: "consent" }, 409);
        return json({ months: await syncGoodveri(admin, conn as Conn) });
      }
      // Nejdřív odvolat souhlas u Goodveri, pak smazat (souhrny jdou kaskádou).
      if (conn.provider === "goodveri" && conn.status !== "pending") {
        try {
          await gv("RevokeAuth", { clientCode: conn.provider_ref, refNo: conn.id });
        } catch (e) {
          // 400 = nic k odvolání (souhlas už neplatí) – smažeme i tak
          if (!(e instanceof GoodveriError && (e.code === 400 || CONSENT_CODES.has(e.code)))) throw e;
        }
      }
      await admin.from("bank_connections").delete().eq("id", conn.id);
      return json({ ok: true });
    }
  } catch (e) {
    console.error("bank-sync failed", action, String(e));
    if (e instanceof GoodveriError && CONSENT_CODES.has(e.code)) {
      return json({ error: "Souhlas v bance vypršel nebo ještě nebyl udělen. Připojte účet znovu.", code: "consent" }, 409);
    }
    return json({ error: "Napojení účtu teď nefunguje. Zkuste to prosím za chvíli.", detail: String(e).slice(0, 300) }, 502);
  }

  return json({ error: "Neplatný požadavek" }, 400);
});

/** Po přihlášení v bance: načte účty (název, maska), aktivuje připojení a stáhne souhrny. */
async function finishConnect(admin: Admin, conn: Conn) {
  const list = await gv<{ accounts?: GvAccount[] }>("AccountList", {
    clientCode: conn.provider_ref,
    providerCode: conn.bank_code,
    refNo: conn.id,
    countryCode: GV_COUNTRY,
  });
  const accounts = list.accounts ?? [];
  const a = accounts[0];
  await admin
    .from("bank_connections")
    .update({
      account_mask: accounts.length > 1 ? `${accounts.length} účty` : mask(a?.accountNumber ?? a?.ibanCode),
      currency: a?.balance?.currency ?? "CZK",
      status: "active",
      // Souhlas platí 180 dní od přihlášení v bance (Goodveri ho v API nevrací).
      consent_expires_at: new Date(Date.now() + CONSENT_DAYS * 86_400_000).toISOString(),
      last_error: null,
    })
    .eq("id", conn.id);
  const months = await syncGoodveri(admin, conn, HISTORY_DAYS_FIRST);
  return { connection: { id: conn.id }, months, accounts: accounts.length };
}
