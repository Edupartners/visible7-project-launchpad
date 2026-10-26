// VISIBLE7 – Cash flow z bankovního účtu (PSD2). NÁVRH – zatím NENASAZENO.
//
// Řetězec: banka → Finbricks (licencovaný AISP) → Sokordia Tech (API) → tato funkce → VISIBLE7.
// Napojení na Sokordia Tech je za rozhraním BankProvider. Teď funguje poskytovatel „demo“
// (ukázková data), adaptér SokordiaProvider se doplní podle jejich dokumentace API.
//
// Zásady:
//  - Přístupové údaje do banky VISIBLE7 nikdy nevidí. Uživatel se přihlásí u banky v okně poskytovatele.
//  - Ukládáme jen měsíční souhrny podle kategorií, žádné jednotlivé transakce ani protistrany.
//  - Jen přihlášený majitel; zápis do tabulek jen tady (service role).
//  - Souhlas v bance platí cca 180 dní – hlídáme consent_expires_at a posíláme upozornění.
// verify_jwt je vypnuté – uživatele ověřujeme sami přes auth.getUser() (stejně jako ostatní funkce).
//
// Akce (POST { action, ... }):
//  connect     → { url }        adresa připojovacího okna poskytovatele
//  callback    → { connection }  po návratu z banky uloží připojení a stáhne souhrny
//  sync        → { months }      ruční aktualizace souhrnů jednoho připojení
//  disconnect  → { ok }          odvolá souhlas u poskytovatele a smaže připojení i souhrny
//  sync_all    (jen plánovač s CRON_SECRET) – denní aktualizace všech aktivních připojení

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET");
const PROVIDER = Deno.env.get("BANK_PROVIDER") ?? "demo"; // „sokordia“ po podpisu smlouvy
const APP_URL = Deno.env.get("APP_URL") ?? "https://visible7.io";
const MONTHS_BACK = 12;

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
  "naklady_zbozi",
  "marketing",
  "provoz",
  "mzdy",
  "dane_odvody",
  "ostatni_vydaje",
] as const;

export interface MonthSummary {
  month: string; // YYYY-MM-01
  income: number;
  expense: number; // kladné číslo
  by_category: Partial<Record<(typeof CATEGORIES)[number], number>>;
  balance_end: number | null;
}

interface ConnectResult {
  url: string;
}
interface CallbackResult {
  provider_ref: string;
  bank_name: string;
  account_mask: string;
  consent_expires_at: string | null;
}

/** Rozhraní poskytovatele. Výměnou adaptéru se zbytek aplikace nemění. */
interface BankProvider {
  connect(state: string, redirectUrl: string): Promise<ConnectResult>;
  callback(params: Record<string, string>): Promise<CallbackResult>;
  monthly(providerRef: string, from: string, to: string): Promise<MonthSummary[]>;
  revoke(providerRef: string): Promise<void>;
}

const firstOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Ukázková data – deterministická podle provider_ref, aby se při každé synchronizaci neměnila. */
const DemoProvider: BankProvider = {
  connect(state, redirectUrl) {
    const url = new URL(redirectUrl);
    url.searchParams.set("state", state);
    url.searchParams.set("ref", `demo-${state.slice(0, 8)}`);
    return Promise.resolve({ url: url.toString() });
  },
  callback(params) {
    return Promise.resolve({
      provider_ref: params.ref ?? `demo-${crypto.randomUUID().slice(0, 8)}`,
      bank_name: "Ukázková banka",
      account_mask: "•••• 4821",
      consent_expires_at: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    });
  },
  monthly(ref, from, to) {
    let seed = [...ref].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const out: MonthSummary[] = [];
    let balance = 40_000;
    for (let d = new Date(from); d <= new Date(to); d.setUTCMonth(d.getUTCMonth() + 1)) {
      const i = out.length;
      const trzby = Math.round((35_000 + i * 6_000) * (0.8 + rnd() * 0.4));
      const zbozi = Math.round(trzby * 0.35);
      const marketing = Math.round(6_000 + rnd() * 3_000);
      const provoz = 9_000;
      const dane = d.getUTCMonth() % 3 === 0 ? Math.round(trzby * 0.12) : 4_500;
      const expense = zbozi + marketing + provoz + dane;
      balance += trzby - expense;
      out.push({
        month: iso(d),
        income: trzby,
        expense,
        by_category: { trzby, naklady_zbozi: -zbozi, marketing: -marketing, provoz: -provoz, dane_odvody: -dane },
        balance_end: balance,
      });
    }
    return Promise.resolve(out);
  },
  revoke() {
    return Promise.resolve();
  },
};

/**
 * Sokordia Tech – DOPLNIT podle dokumentace API (čeká se na ni).
 * Potřebujeme: ověření VISIBLE7 vůči API, adresu připojovacího okna, návratové parametry,
 * souhrny po měsících (ideálně už s kategoriemi), odvolání souhlasu a upozornění (webhook).
 * Klíče jen v Supabase secrets (SOKORDIA_API_URL, SOKORDIA_API_KEY), nikdy v repozitáři.
 */
const SokordiaProvider: BankProvider = {
  connect() {
    throw new Error("Napojení Sokordia Tech čeká na dokumentaci API");
  },
  callback() {
    throw new Error("Napojení Sokordia Tech čeká na dokumentaci API");
  },
  monthly() {
    throw new Error("Napojení Sokordia Tech čeká na dokumentaci API");
  },
  revoke() {
    throw new Error("Napojení Sokordia Tech čeká na dokumentaci API");
  },
};

const provider = (name: string): BankProvider => (name === "sokordia" ? SokordiaProvider : DemoProvider);

type Admin = ReturnType<typeof createClient>;

/** Stáhne souhrny za posledních 12 měsíců a uloží je (přepíše stejné měsíce). */
async function syncConnection(
  admin: Admin,
  conn: { id: string; user_id: string; provider: string; provider_ref: string },
) {
  const to = firstOfMonth(new Date());
  const from = new Date(to);
  from.setUTCMonth(from.getUTCMonth() - (MONTHS_BACK - 1));
  const months = await provider(conn.provider).monthly(conn.provider_ref, iso(from), iso(to));
  const rows = months.map((m) => ({
    connection_id: conn.id,
    user_id: conn.user_id,
    month: m.month,
    income: Math.round(m.income * 100) / 100,
    expense: Math.round(m.expense * 100) / 100,
    by_category: Object.fromEntries(
      Object.entries(m.by_category).filter(([k]) => (CATEGORIES as readonly string[]).includes(k)),
    ),
    balance_end: m.balance_end,
    updated_at: new Date().toISOString(),
  }));
  if (rows.length) await admin.from("cashflow_months").upsert(rows, { onConflict: "connection_id,month" });
  await admin
    .from("bank_connections")
    .update({ last_sync_at: new Date().toISOString(), status: "active", last_error: null })
    .eq("id", conn.id);
  return rows.length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Plánovač: denní aktualizace všech aktivních připojení a označení prošlých souhlasů.
  if (body.action === "sync_all") {
    if (!CRON_SECRET || req.headers.get("x-cron-secret") !== CRON_SECRET) return json({ error: "Zakázáno" }, 403);
    await admin
      .from("bank_connections")
      .update({ status: "expired" })
      .eq("status", "active")
      .lt("consent_expires_at", new Date().toISOString());
    const { data: conns } = await admin
      .from("bank_connections")
      .select("id, user_id, provider, provider_ref")
      .eq("status", "active");
    let ok = 0;
    for (const c of conns ?? []) {
      try {
        await syncConnection(admin, c);
        ok++;
      } catch (e) {
        await admin.from("bank_connections").update({ status: "error", last_error: String(e).slice(0, 300) }).eq("id", c.id);
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

  // Pilot: jen placený přístup nebo správce (stejně jako velikost trhu).
  const [{ data: accRow }, { data: adminRow }] = await Promise.all([
    admin.from("user_access").select("plan, access_until").eq("user_id", user.id).maybeSingle(),
    admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  const paid =
    (["mesic", "ctvrtleti", "rok", "kod", "clenstvi"].includes(accRow?.plan ?? "") &&
      (!accRow?.access_until || new Date(accRow.access_until).getTime() > Date.now())) ||
    !!adminRow;
  if (!paid) return json({ error: "Napojení účtu je součástí placeného přístupu.", code: "premium" }, 402);

  try {
    if (body.action === "connect") {
      // state svazuje návrat z banky s uživatelem (ochrana proti podvržení)
      const state = crypto.randomUUID();
      await admin.from("bank_connections").insert({
        user_id: user.id,
        project_id: body.projectId ?? null,
        provider: PROVIDER,
        provider_ref: `pending-${state}`,
        status: "pending",
      });
      const res = await provider(PROVIDER).connect(state, `${APP_URL}/cash-flow?pripojeno=1`);
      return json(res);
    }

    if (body.action === "callback") {
      const state = String(body.state ?? "");
      const { data: pending } = await admin
        .from("bank_connections")
        .select("id, user_id, provider")
        .eq("provider_ref", `pending-${state}`)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!pending) return json({ error: "Připojení nenalezeno nebo vypršelo." }, 404);
      const r = await provider(pending.provider).callback(body);
      await admin
        .from("bank_connections")
        .update({
          provider_ref: r.provider_ref,
          bank_name: r.bank_name,
          account_mask: r.account_mask,
          consent_expires_at: r.consent_expires_at,
          status: "active",
        })
        .eq("id", pending.id);
      const months = await syncConnection(admin, {
        id: pending.id,
        user_id: user.id,
        provider: pending.provider,
        provider_ref: r.provider_ref,
      });
      return json({ connection: { id: pending.id, bank_name: r.bank_name, account_mask: r.account_mask }, months });
    }

    if (body.action === "sync" || body.action === "disconnect") {
      const { data: conn } = await admin
        .from("bank_connections")
        .select("id, user_id, provider, provider_ref")
        .eq("id", body.connectionId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!conn) return json({ error: "Připojení nenalezeno." }, 404);
      if (body.action === "sync") return json({ months: await syncConnection(admin, conn) });
      // Nejdřív odvolat souhlas u poskytovatele, pak smazat (souhrny kaskádou).
      if (!conn.provider_ref.startsWith("pending-")) await provider(conn.provider).revoke(conn.provider_ref);
      await admin.from("bank_connections").delete().eq("id", conn.id);
      return json({ ok: true });
    }
  } catch (e) {
    console.error("bank-sync failed", body.action, String(e));
    return json({ error: "Napojení účtu teď nefunguje. Zkuste to prosím za chvíli." }, 502);
  }

  return json({ error: "Neplatný požadavek" }, 400);
});
