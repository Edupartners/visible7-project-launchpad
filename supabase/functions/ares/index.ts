// VISIBLE7 – ověření IČO projektu ve veřejném registru ARES (Ministerstvo financí).
// Volá přihlášený uživatel: POST { project_id, ico }.
// Ověření běží na serveru, aby se výsledek nedal podvrhnout – osvědčení Gold ho vyžaduje.
// Ukládáme jen IČO, název, právní formu a datum vzniku. Adresu ani jiné údaje z ARES ne.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const ARES_URL = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/** Kontrolní číslice IČO (modulo 11). */
export function validIco(ico: string) {
  if (!/^\d{8}$/.test(ico)) return false;
  const sum = [...ico.slice(0, 7)].reduce((s, d, i) => s + Number(d) * (8 - i), 0);
  const r = sum % 11;
  const check = r === 0 ? 1 : r === 1 ? 0 : 11 - r;
  return check === Number(ico[7]);
}

const LEGAL_FORMS: Record<string, string> = {
  "101": "Fyzická osoba podnikající podle živnostenského zákona",
  "105": "Fyzická osoba podnikající podle jiných zákonů",
  "107": "Zemědělský podnikatel – fyzická osoba",
  "111": "Veřejná obchodní společnost",
  "112": "Společnost s ručením omezeným",
  "113": "Komanditní společnost",
  "121": "Akciová společnost",
  "141": "Obecně prospěšná společnost",
  "205": "Družstvo",
  "706": "Spolek",
};
const PERSON_FORMS = new Set(["101", "105", "107"]);

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

type Ares = {
  ico?: string;
  obchodniJmeno?: string;
  pravniForma?: string;
  datumVzniku?: string;
  datumZaniku?: string;
  seznamRegistraci?: Record<string, string>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: u } = await userClient.auth.getUser(jwt);
  const user = u?.user;
  if (!user) return json({ error: "Přihlaste se prosím znovu." }, 401);

  const body = (await req.json().catch(() => ({}))) as { project_id?: string; ico?: string };
  const ico = String(body.ico ?? "").replace(/\s/g, "");
  if (!body.project_id) return json({ error: "Chybí projekt." }, 400);
  if (!validIco(ico)) return json({ error: "Tohle nevypadá jako platné IČO. Má 8 číslic – zkontrolujte ho." }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", body.project_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!project) return json({ error: "Projekt nenalezen." }, 404);

  let res: Response;
  try {
    res = await fetch(ARES_URL + ico, { headers: { accept: "application/json" } });
  } catch {
    return json({ error: "Registr ARES teď neodpovídá. Zkuste to prosím za chvíli." }, 503);
  }
  if (res.status === 404) {
    return json({
      error:
        "IČO v registru ARES zatím není. Pokud jste živnost ohlásili teprve nedávno, zkuste to za pár dní – zápis trvá do 5 pracovních dnů.",
    }, 404);
  }
  if (!res.ok) return json({ error: "Registr ARES teď neodpovídá. Zkuste to prosím za chvíli." }, 503);

  const a = (await res.json()) as Ares;
  const reg = a.seznamRegistraci ?? {};
  const active =
    !a.datumZaniku && ["stavZdrojeRzp", "stavZdrojeRos", "stavZdrojeRes"].some((k) => reg[k] === "AKTIVNI");
  if (!active) return json({ error: "Subjekt s tímto IČO už podle ARES nepodniká." }, 409);

  const name = (a.obchodniJmeno ?? "").trim();
  const form = a.pravniForma ?? null;
  const meta = (user.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const last = norm(meta.last_name ?? "");
  const nameMatch = !!form && PERSON_FORMS.has(form) && !!last && norm(name).includes(last);

  const row = {
    project_id: body.project_id,
    user_id: user.id,
    ico,
    name,
    legal_form: form,
    established: a.datumVzniku ?? null,
    name_match: nameMatch,
    verified_at: new Date().toISOString(),
  };
  const { error } = await admin.from("business_verifications").upsert(row, { onConflict: "project_id" });
  if (error) return json({ error: "Ověření se nepodařilo uložit." }, 500);
  await admin.from("events").insert({
    user_id: user.id,
    name: "business_verified",
    props: { legal_form: form, new_business: !!a.datumVzniku && a.datumVzniku >= user.created_at.slice(0, 10) },
  });

  return json({
    ico,
    name,
    legal_form: form,
    legal_form_label: form ? LEGAL_FORMS[form] ?? `Právní forma ${form}` : null,
    established: a.datumVzniku ?? null,
    name_match: nameMatch,
    verified_at: row.verified_at,
  });
});
