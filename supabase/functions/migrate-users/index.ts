// Převod uživatelů z LearnWorlds: správce jedním klikem založí účty lidem, kteří mají čekající převod
// (shop_purchases s id_product = 'learnworlds-prevod' a applied_at IS NULL).
// Účet vznikne s potvrzeným e-mailem a bez hesla, NEPOSÍLÁ se žádný e-mail. Heslo si člověk nastaví sám
// přes „Zapomenuté heslo“. Při založení účtu triggery v databázi samy přidělí členství a převedená osvědčení.
// verify_jwt je vypnuté (nové podpisové klíče) – volajícího ověřujeme přes auth.getUser() a tabulku admins.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Přihlaste se prosím znovu." }, 401);
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: userData } = await userClient.auth.getUser(jwt);
  const user = userData?.user;
  if (!user) return json({ error: "Přihlaste se prosím znovu." }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: isAdmin } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!isAdmin) return json({ error: "Jen pro správce." }, 403);

  const { data: rows, error } = await admin
    .from("shop_purchases")
    .select("email, raw")
    .eq("id_product", "learnworlds-prevod")
    .is("applied_at", null);
  if (error) return json({ error: error.message }, 500);

  const seen = new Set<string>();
  let created = 0;
  const failed: string[] = [];
  for (const r of rows ?? []) {
    const email = String(r.email).trim().toLowerCase();
    if (seen.has(email)) continue;
    seen.add(email);
    const raw = (r.raw ?? {}) as { first_name?: string; last_name?: string };
    const { error: e } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { first_name: raw.first_name ?? "", last_name: raw.last_name ?? "", source: "learnworlds" },
    });
    if (e) failed.push(`${email}: ${e.message}`);
    else created++;
  }
  console.log("migrate-users", user.id, "created", created, "failed", failed.length);
  return json({ created, failed });
});
