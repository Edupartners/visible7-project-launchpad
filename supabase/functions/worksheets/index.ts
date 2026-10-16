// VISIBLE7 – pracovní listy ke stažení za e-mail (stránka /pracovni-listy).
// Uloží zájemce a pošle mu odkaz na listy (Brevo). Souhlas s tipy je dobrovolný a ukládá se zvlášť.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BREVO_KEY = Deno.env.get("BREVO_API_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "https://visible7.io";
const SENDER = { name: "VISIBLE7 MICEK", email: Deno.env.get("REMINDER_SENDER") ?? "info@visible7.io" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;
const SLUG_RE = /^[a-z0-9-]{3,60}$/;

function mail(title: string, file: string) {
  const link = `${APP_URL}${file}`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1b2a4a">
  <p style="font-size:13px;color:#e8823a;font-weight:bold;letter-spacing:1px;margin:0">VISIBLE7 MICEK®</p>
  <h1 style="font-size:22px;margin:6px 0 14px">Vaše pracovní listy: ${esc(title)}</h1>
  <p style="font-size:15px;line-height:1.5">Děkujeme za zájem. Listy si stáhnete tady:</p>
  <p style="margin:22px 0"><a href="${link}" style="background:#173663;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">Stáhnout PDF</a></p>
  <p style="font-size:15px;line-height:1.5">Ke každému listu najdete ve VISIBLE7 video, jak ho vyplnit. A když si chcete nápad rovnou otestovat, rentgen nápadu zdarma zabere do 10 minut:</p>
  <p><a href="${APP_URL}/?utm_source=email&utm_medium=pracovni-listy" style="color:#173663;font-weight:bold">Otestovat nápad zdarma →</a></p>
  <p style="font-size:12px;color:#6b7280;margin-top:28px">Tento e-mail jste dostali, protože jste si na visible7.io vyžádali pracovní listy. Edu Partners s.r.o., Raisova 889/5, Ostrava.</p>
</div>`;
  return { subject: `Pracovní listy VISIBLE7: ${title}`, html };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);
  const b = (await req.json().catch(() => ({}))) as {
    email?: string;
    sheet?: string;
    title?: string;
    file?: string;
    marketing?: boolean;
    consent_text?: string;
    source?: string;
  };
  const email = String(b.email ?? "")
    .trim()
    .toLowerCase();
  const sheet = String(b.sheet ?? "");
  const file = String(b.file ?? "");
  if (!EMAIL_RE.test(email) || email.length > 160) return json({ error: "Zkontrolujte prosím e-mail." }, 400);
  if (!SLUG_RE.test(sheet) || !/^\/listy\/[a-z0-9-]+\.pdf$/.test(file)) return json({ error: "Neznámý list." }, 400);
  const title = String(b.title ?? "").slice(0, 120);
  const marketing = b.marketing === true;
  const consent = String(b.consent_text ?? "").slice(0, 600);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // Ochrana proti zneužití: nejvýš 10 žádostí z jednoho e-mailu za hodinu.
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await admin
    .from("worksheet_leads")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", since);
  if ((count ?? 0) >= 10) return json({ error: "Příliš mnoho žádostí, zkuste to prosím později." }, 429);

  const { error } = await admin.from("worksheet_leads").insert({
    email,
    sheet,
    marketing,
    consent_text: marketing ? consent : "",
    source:
      String(b.source ?? "web")
        .replace(/[^a-z0-9_-]/gi, "")
        .slice(0, 40) || "web",
  });
  if (error) return json({ error: "Uložení se nepodařilo." }, 500);

  let sent = false;
  if (BREVO_KEY) {
    const { subject, html } = mail(title || "pracovní list", file);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": BREVO_KEY, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email }],
        subject,
        htmlContent: html,
        tags: ["pracovni-listy", sheet],
      }),
    });
    sent = res.ok;
  }
  return json({ ok: true, sent });
});
