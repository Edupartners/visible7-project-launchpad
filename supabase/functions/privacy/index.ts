// VISIBLE7 – mazání dat na žádost uživatele.
//  - action "purge_project": smaže obsah projektu (data fází, výstupy AI, web projektu se zájemci a obrázky).
//    Řádek projektu zůstane archivovaný jen kvůli vydaným osvědčením (název a typ byznysu).
//  - action "delete_account": smaže účet. Na auth.users jsou navázané cizí klíče ON DELETE CASCADE,
//    takže zmizí projekty, data, výstupy AI, osvědčení, souhlasy, události i nastavení e-mailů.
//    Nákupy (shop_purchases) zůstanou bez vazby na účet (ON DELETE SET NULL): doklady musíme
//    uchovávat podle zákona o účetnictví a o DPH. Smažou se i e-maily na čekací listině a u pracovních listů.
// verify_jwt je vypnuté (nové podpisové klíče) – uživatele ověřujeme přes auth.getUser().
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BUCKET = "test-pages";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type Admin = ReturnType<typeof createClient>;

/** Smaže soubory v úložišti pod danou cestou (složka uživatele nebo stránky). */
async function removeFolder(admin: Admin, prefix: string) {
  const { data } = await admin.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (!data?.length) return;
  const files: string[] = [];
  for (const item of data) {
    const path = `${prefix}/${item.name}`;
    if (item.id) files.push(path);
    else await removeFolder(admin, path); // podsložka
  }
  if (files.length) await admin.storage.from(BUCKET).remove(files);
}

async function purgeProject(admin: Admin, userId: string, projectId: string) {
  const { data: pages } = await admin.from("test_pages").select("id").eq("project_id", projectId);
  for (const p of pages ?? []) await removeFolder(admin, `${userId}/${p.id}`);
  const steps = [
    admin.from("test_pages").delete().eq("project_id", projectId), // zájemci mizí kaskádou
    admin.from("project_data").delete().eq("project_id", projectId),
    admin.from("ai_outputs").delete().eq("project_id", projectId),
    admin.from("business_verifications").delete().eq("project_id", projectId),
    admin.from("events").update({ project_id: null }).eq("project_id", projectId),
  ];
  for (const s of steps) {
    const { error } = await s;
    if (error) throw new Error(error.message);
  }
  const { error } = await admin
    .from("projects")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", projectId);
  if (error) throw new Error(error.message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Přihlaste se prosím znovu." }, 401);
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
  const user = userData?.user;
  if (userErr || !user) return json({ error: "Přihlaste se prosím znovu." }, 401);

  let body: { action?: string; projectId?: string; confirm?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  try {
    if (body.action === "purge_project") {
      if (!body.projectId) return json({ error: "Neplatný požadavek" }, 400);
      const { data: project } = await admin.from("projects").select("id, user_id").eq("id", body.projectId).maybeSingle();
      if (!project || project.user_id !== user.id) return json({ error: "Projekt nenalezen" }, 404);
      await purgeProject(admin, user.id, project.id);
      return json({ ok: true });
    }

    if (body.action === "delete_account") {
      if (body.confirm !== "SMAZAT") return json({ error: "Pro potvrzení napište SMAZAT." }, 400);
      const { data: isAdmin } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
      if (isAdmin) return json({ error: "Účet administrátora nejde smazat z aplikace." }, 403);

      await removeFolder(admin, user.id);
      if (user.email) {
        const emails = [...new Set([user.email, user.email.toLowerCase()])];
        await admin.from("waitlist_bank").delete().in("email", emails);
        await admin.from("worksheet_leads").delete().in("email", emails);
      }
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) throw new Error(error.message);
      return json({ ok: true });
    }

    return json({ error: "Neplatný požadavek" }, 400);
  } catch (e) {
    console.error("privacy", body.action, e instanceof Error ? e.message : e);
    return json({ error: "Smazání se nepodařilo. Zkuste to prosím znovu, nebo nám napište." }, 500);
  }
});
