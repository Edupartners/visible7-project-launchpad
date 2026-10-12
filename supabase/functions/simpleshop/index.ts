// VISIBLE7 – webhook SimpleShopu „po uhrazení“: kupující dostane placené členství.
// Adresu i s tajným klíčem zkopíruje správce v administraci (Platby) do produktu v SimpleShopu
// (záložka Ostatní → Webhook po uhrazení). SimpleShop do ní dosadí {mail}, {id_product}, {id}, {total}.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function readParams(req: Request): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  new URL(req.url).searchParams.forEach((v, k) => (out[k] = v));
  if (req.method === "POST") {
    const type = req.headers.get("content-type") ?? "";
    try {
      if (type.includes("application/json")) {
        const b = (await req.json()) as Record<string, unknown>;
        for (const [k, v] of Object.entries(b)) if (out[k] === undefined && v != null) out[k] = String(v);
      } else {
        const f = await req.formData();
        f.forEach((v, k) => {
          if (out[k] === undefined && typeof v === "string") out[k] = v;
        });
      }
    } catch {
      /* tělo není povinné, údaje jsou v adrese */
    }
  }
  return out;
}

// Nedosazená proměnná ({mail}) = prázdná hodnota
const clean = (v?: string) => (v && !/^\{.*\}$/.test(v) ? v.trim() : "");

Deno.serve(async (req) => {
  if (req.method !== "GET" && req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const p = await readParams(req);

  const { data: ok } = await admin.rpc("check_shop_key", { p_key: p.key ?? "" });
  if (!ok) return json({ error: "Nepovoleno" }, 401);

  const email = clean(p.mail ?? p.email).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "Chybí e-mail kupujícího" }, 400);
  const product = clean(p.product ?? p.id_product);
  const doc = clean(p.doc ?? p.id) || null;
  const total = Number(clean(p.total).replace(",", ".")) || null;

  const { data: setting } = await admin.from("app_settings").select("value").eq("key", "shop").maybeSingle();
  const shop = (setting?.value ?? {}) as { days?: number; product_id?: string };
  // Pokud je nastavené ID produktu, členství dává jen ten produkt (jiné nákupy se jen zaznamenají).
  const matches = !shop.product_id || !product || String(shop.product_id) === product;
  const days = matches ? Math.max(1, Math.min(3650, Number(shop.days) || 183)) : 0;

  const { data: row, error } = await admin
    .from("shop_purchases")
    .upsert(
      { doc_id: doc, email, id_product: product || null, days, total, raw: { ...p, key: undefined } },
      { onConflict: "doc_id", ignoreDuplicates: true },
    )
    .select("id")
    .maybeSingle();
  if (error) {
    console.error(error);
    return json({ error: "Uložení se nepodařilo" }, 500);
  }
  if (!row) return json({ ok: true, duplicate: true });
  if (!days) return json({ ok: true, ignored: "jiný produkt" });

  const { data: applied } = await admin.rpc("apply_purchase", { p_id: row.id });
  return json({ ok: true, applied: !!applied, pending: !applied });
});
