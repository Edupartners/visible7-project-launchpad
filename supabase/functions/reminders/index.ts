// VISIBLE7 – připomínky e-mailem (Brevo), aby lidé dokončili práci.
// Spouští se jednou denně z pg_cron s klíčem z Vault (hlavička x-cron-key).
// Správce si může nechat poslat ukázky všech připomínek sobě: POST { test: true } s jeho přihlášením.
// Servisní sdělení k vlastnímu účtu – bez nabídek; v každém e-mailu odkaz na odhlášení.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const BREVO_KEY = Deno.env.get("BREVO_API_KEY");
const APP_URL = Deno.env.get("APP_URL") ?? "https://visible7.io";
const SENDER = { name: "VISIBLE7 MICEK", email: Deno.env.get("REMINDER_SENDER") ?? "info@visible7.io" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const GATE_NAMES: Record<number, string> = {
  1: "Modrý oceán",
  2: "Lean Canvas",
  3: "Byznys case",
  4: "Tvorba",
  5: "Marketing a testování",
  6: "Launch",
  7: "Růst",
};

type Kind = "rentgen" | "gate" | "trial_end" | "inactive14";
type Data = { project?: string | null; done?: number; next_gate?: number | null; until?: string | null };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, paragraphs: string[], cta: string, href: string, unsubscribe: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1b2a4a">
  <p style="font-size:18px;font-weight:bold;margin:0 0 16px">VISIBLE7 MICEK®</p>
  <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
  ${paragraphs.map((p) => `<p style="font-size:15px;line-height:1.6;margin:0 0 14px">${p}</p>`).join("\n  ")}
  <p style="margin:10px 0 24px">
    <a href="${href}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${cta}</a>
  </p>
  <p style="font-size:13px;color:#6b7280;line-height:1.5;margin:0">
    Tuhle připomínku posíláme, protože máte účet ve VISIBLE7. Nechcete je dostávat?
    <a href="${unsubscribe}" style="color:#6b7280">Odhlásit připomínky</a>.<br>
    Edu Partners s.r.o., Raisova 889/5, Ostrava · visible7.io
  </p>
</div>`;
}

function compose(kind: Kind, d: Data, unsubscribe: string) {
  const home = `${APP_URL}/home`;
  const project = d.project ? `„${esc(d.project)}“` : "váš projekt";
  switch (kind) {
    case "rentgen":
      return {
        subject: "Váš nápad čeká – stačí 10 minut",
        html: layout(
          "Obstojí váš nápad?",
          [
            "Dobrý den,",
            "zaregistrovali jste se do VISIBLE7, ale Rentgen nápadu ještě čeká. Jsou to 4 otázky a za 10 minut víte, jestli nápad dává smysl, kolik bude stát a kdy vás může uživit.",
            "Žádná teorie – rovnou uvidíte čísla a mapu cesty od dneška k prvním zákazníkům.",
          ],
          "Udělat Rentgen nápadu",
          `${APP_URL}/rentgen`,
          unsubscribe,
        ),
      };
    case "gate": {
      const g = d.next_gate ?? 1;
      return {
        subject: `${GATE_NAMES[g] ?? "Další brána"} na vás čeká`,
        html: layout(
          `Další krok: brána ${g} ${GATE_NAMES[g] ?? ""}`,
          [
            "Dobrý den,",
            `u projektu ${project} máte hotovo ${d.done ?? 0} ze 7 bran. Navažte tam, kde jste skončili – všechno je uložené.`,
            "Stačí jeden krátký krok dnes. Podnikání se staví po malých kouscích, ne naráz.",
          ],
          "Pokračovat v projektu",
          home,
          unsubscribe,
        ),
      };
    }
    case "trial_end":
      return {
        subject: "Zítra končí 7 dní plného přístupu",
        html: layout(
          "Zkušební přístup zítra končí",
          [
            "Dobrý den,",
            "zítra vám končí 7 dní plného přístupu do všech bran VISIBLE7. Pokud máte něco rozdělaného, dnes je dobrý den to dotáhnout.",
            "Vaše data zůstávají uložená i potom – nic se neztratí.",
          ],
          "Otevřít projekt",
          home,
          unsubscribe,
        ),
      };
    case "inactive14":
      return {
        subject: `Jak je na tom ${d.project ? esc(d.project) : "váš projekt"}?`,
        html: layout(
          "Dlouho jsme se neviděli",
          [
            "Dobrý den,",
            `u projektu ${project} máte hotovo ${d.done ?? 0} ze 7 bran. Kdykoli se k němu můžete vrátit – všechno je uložené.`,
            "Tohle je poslední připomínka, dál už vás nebudeme rušit.",
          ],
          "Vrátit se k projektu",
          home,
          unsubscribe,
        ),
      };
  }
}

async function send(to: string, kind: Kind, d: Data, unsubscribe: string) {
  const { subject, html } = compose(kind, d, unsubscribe);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_KEY!, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: SENDER,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      headers: { "List-Unsubscribe": `<${unsubscribe}>` },
      tags: ["pripominka", kind],
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);
  if (!BREVO_KEY) return json({ error: "Chybí BREVO_API_KEY" }, 503);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const body = (await req.json().catch(() => ({}))) as { test?: boolean; dry?: boolean };

  // A) Ukázky pro správce
  if (body.test) {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
    const { data: u } = await userClient.auth.getUser(jwt);
    const user = u?.user;
    if (!user?.email) return json({ error: "Přihlaste se prosím znovu." }, 401);
    const { data: isAdmin } = await admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!isAdmin) return json({ error: "Jen pro správce" }, 403);
    const sample: Data = { project: "Ukázkový projekt", done: 2, next_gate: 3, until: null };
    const unsub = `${APP_URL}/odhlasit?t=ukazka`;
    const kinds: Kind[] = ["rentgen", "gate", "trial_end", "inactive14"];
    for (const k of kinds) await send(user.email, k, sample, unsub);
    return json({ sent: kinds.length, to: user.email });
  }

  // B) Denní rozeslání (jen s klíčem z Vault)
  const key = req.headers.get("x-cron-key") ?? "";
  const { data: ok } = await admin.rpc("check_cron_key", { p_key: key });
  if (!ok) return json({ error: "Nepovoleno" }, 401);

  const { data: rows, error } = await admin.rpc("reminder_candidates", { p_limit: 200 });
  if (error) return json({ error: error.message }, 500);
  const list = (rows ?? []) as { user_id: string; email: string; kind: Kind; data: Data; unsubscribe_token: string | null }[];
  if (body.dry) return json({ candidates: list.map((r) => ({ kind: r.kind, data: r.data })) });

  let sent = 0;
  const failed: string[] = [];
  for (const r of list) {
    try {
      let token = r.unsubscribe_token;
      if (!token) {
        const { data: t } = await admin.rpc("ensure_email_prefs", { p_user: r.user_id });
        token = t as string;
      }
      await send(r.email, r.kind, r.data, `${APP_URL}/odhlasit?t=${token}`);
      await admin.from("email_log").insert({ user_id: r.user_id, kind: r.kind, meta: r.data });
      await admin.from("events").insert({ user_id: r.user_id, name: "reminder_sent", props: { kind: r.kind } });
      sent++;
    } catch (e) {
      console.error(e);
      failed.push(r.kind);
    }
  }
  return json({ candidates: list.length, sent, failed: failed.length });
});
