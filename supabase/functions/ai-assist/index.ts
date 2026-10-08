// VISIBLE7 – AI asistent (fáze 2: Lean Canvas).
//
// Náklady drží na uzdě:
//  - jen přihlášený vlastník projektu,
//  - limity: 3 návrhy + 3 vyhodnocení na fázi a projekt, 20 volání AI denně na uživatele,
//    celkový denní strop pro celou aplikaci (AI_GLOBAL_DAILY_LIMIT, výchozí 300),
//  - levný model (AI_MODEL, výchozí claude-haiku-5-5), pevný strop max_tokens,
//  - vstupy se zkracují, všechna pole canvasu v jednom volání.
// Klíč ANTHROPIC_API_KEY je jen v Supabase secrets, nikdy v prohlížeči.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = Deno.env.get("AI_MODEL") ?? "claude-haiku-5-5";
const GLOBAL_DAILY = Number(Deno.env.get("AI_GLOBAL_DAILY_LIMIT") ?? "300");

const LIMITS = { navrh: 3, vyhodnoceni: 3, userDaily: 20 };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const BUSINESS_TYPES: Record<string, string> = {
  "web-prezentacni": "Web (prezentační)",
  blog: "Blog",
  "squeeze-page": "Squeeze Page",
  "web-eshop": "Web + E-shop",
  dropshipping: "Dropshipping",
  members: "Members (placený obsah)",
  "konverzni-web": "Konverzní web",
  affiliate: "Affiliate",
  eshop: "E-shop",
  lms: "LMS (online kurzy)",
  marketplace: "Marketplace",
  "forum-komunita": "Fórum/komunitní platforma",
  "vlastni-napad-app": "Vlastní nápad app",
};

const CANVAS_KEYS = [
  "problem",
  "solution",
  "uniqueValueProposition",
  "customerSegments",
  "existingAlternatives",
  "channels",
  "costStructure",
  "revenueStreams",
] as const;

const CANVAS_LABELS: Record<string, string> = {
  problem: "Problém",
  solution: "Řešení",
  uniqueValueProposition: "Unikátní hodnota (USP)",
  customerSegments: "Segment zákazníků",
  existingAlternatives: "Existující alternativy",
  channels: "Marketingové kanály",
  costStructure: "Náklady",
  revenueStreams: "Příjmy",
};

const cut = (v: unknown, n = 1200) => (typeof v === "string" ? v.trim().slice(0, n) : "");

type ErrcItem = { text?: string; lowCost?: number; premium?: number; mine?: number };

function describeVision(raw: Record<string, unknown>): string {
  const b = (raw["vision_project_data"] ?? {}) as Record<string, unknown>;
  const errc = (raw["vision_errc_v2"] ?? {}) as Record<string, ErrcItem[]>;
  const usp = cut(raw["vision_usp"]);
  const q = (k: string, label: string) => {
    const items = (errc[k] ?? []).filter((i) => i?.text?.trim()).slice(0, 8);
    if (!items.length) return "";
    return `${label}: ` + items.map((i) => `${cut(i.text, 120)} (levná ${i.lowCost ?? "?"}, prémiová ${i.premium ?? "?"}, já ${i.mine ?? "?"})`).join("; ");
  };
  return [
    `Název projektu: ${cut(b.name, 120) || "—"}`,
    `Slogan: ${cut(b.slogan, 200) || "—"}`,
    `Komu (zákazník): ${cut(b.customer) || "—"}`,
    `Problém zákazníka: ${cut(b.problem) || "—"}`,
    `Co prodávám: ${cut(b.offering) || "—"}`,
    `Levná konkurence: ${cut(b.lowCostName, 120) || "—"}`,
    `Prémiová konkurence: ${cut(b.premiumName, 120) || "—"}`,
    q("eliminate", "ERRC – Eliminovat"),
    q("reduce", "ERRC – Snížit"),
    q("raise", "ERRC – Zvýšit"),
    q("create", "ERRC – Vytvořit"),
    `USP: ${usp || "—"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function describeCanvas(canvas: Record<string, unknown>): string {
  return CANVAS_KEYS.map((k) => `${CANVAS_LABELS[k]}: ${cut(canvas[k]) || "(prázdné)"}`).join("\n");
}

const SYSTEM = `Jsi zkušený český podnikatelský mentor metodiky VISIBLE7 MICEK™ (autor Michal Míček, Edu Partners s.r.o.).
Pomáháš začínajícím podnikatelům s online projekty. Píšeš česky, věcně, konkrétně a srozumitelně pro laika, bez anglicismů tam, kde existuje české slovo.
Vycházíš z modrého oceánu: projekt má přidat hodnotu oproti levné i prémiové konkurenci (Hormoziho rovnice hodnoty: vysněný výsledek × pravděpodobnost úspěchu ÷ (čas × úsilí)).
Předpokládej, že jde o online projekt. Nevymýšlej konkrétní čísla, ceny ani částky – náklady a příjmy uváděj jen jako položky.
Výstup vždy předej výhradně voláním nástroje.`;

const SUGGEST_TOOL = {
  name: "navrh_canvasu",
  description: "Návrh vyplnění Lean Canvasu a odhad typu online byznysu.",
  input_schema: {
    type: "object",
    properties: {
      businessType: { type: "string", enum: Object.keys(BUSINESS_TYPES) },
      businessTypeReason: { type: "string", description: "Jedna věta, proč tento typ." },
      fields: {
        type: "object",
        properties: Object.fromEntries(
          CANVAS_KEYS.map((k) => [k, { type: "string", description: CANVAS_LABELS[k] }]),
        ),
        required: [...CANVAS_KEYS],
      },
    },
    required: ["businessType", "businessTypeReason", "fields"],
  },
};

const EVALUATE_TOOL = {
  name: "vyhodnoceni_canvasu",
  description: "Vyhodnocení Lean Canvasu.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "2–3 věty celkového dojmu." },
      criteria: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            rating: { type: "string", enum: ["silné", "v pořádku", "doplnit"] },
            comment: { type: "string" },
          },
          required: ["name", "rating", "comment"],
        },
      },
      contradictions: { type: "array", items: { type: "string" } },
      nextSteps: { type: "array", items: { type: "string" } },
    },
    required: ["summary", "criteria", "contradictions", "nextSteps"],
  },
};

function suggestPrompt(vision: string, canvas: string) {
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Současný stav Lean Canvasu:
${canvas}

Úkol:
1) Odhadni nejvhodnější typ online byznysu (businessType) z povoleného seznamu: ${Object.entries(BUSINESS_TYPES)
    .map(([id, n]) => `${id} = ${n}`)
    .join(", ")}.
2) Navrhni text pro všech 8 polí Lean Canvasu. Každé pole 2–4 krátké věty nebo výčet. Navaž na fázi 1 a na to, co už uživatel napsal – jeho text zpřesni, nepřepisuj jeho záměr.
- Náklady: výčet typických položek online projektu tohoto typu (např. doména a hosting, nástroje, reklama, tvorba obsahu, poplatky platební brány), bez částek.
- Příjmy: výčet zdrojů příjmů (např. jednorázový prodej, předplatné, upsell), bez částek.
- Marketingové kanály: 3–5 kanálů nejvhodnějších pro tohoto zákazníka.`;
}

function evaluatePrompt(vision: string, canvas: string, businessType: string) {
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Typ byznysu: ${BUSINESS_TYPES[businessType] ?? "neurčen"}

Lean Canvas k vyhodnocení:
${canvas}

Úkol: vyhodnoť canvas jako mentor. Nevynášej verdikt „ano/ne“, rozhodnutí je na podnikateli.
- criteria: přesně tato kritéria v tomto pořadí – „Problém a zákazník“, „Řešení a USP“, „Odlišení od konkurence“, „Cesta k zákazníkovi“, „Náklady a příjmy“. U každého hodnocení a jedna až dvě věty komentáře.
- contradictions: rozpory mezi poli canvasu nebo mezi canvasem a fází 1 (může být prázdné).
- nextSteps: 3 konkrétní kroky, co udělat teď (např. ověřit problém rozhovorem s 5 zákazníky).`;
}

async function callClaude(prompt: string, tool: typeof SUGGEST_TOOL | typeof EVALUATE_TOOL, maxTokens: number) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: SYSTEM,
      tools: [tool],
      tool_choice: { type: "tool", name: tool.name },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Anthropic error", res.status, text.slice(0, 500));
    throw new Error(`AI ${res.status}`);
  }
  const data = await res.json();
  const block = (data.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  if (!block) throw new Error("AI nevrátila strukturovaný výstup");
  return { output: block.input as Record<string, unknown>, usage: data.usage ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  // 1) Kdo volá
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userErr || !user) return json({ error: "Přihlaste se prosím znovu." }, 401);

  let body: { projectId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const { projectId, action } = body;
  if (!projectId || (action !== "canvas_suggest" && action !== "canvas_evaluate")) {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const kind = action === "canvas_suggest" ? "navrh" : "vyhodnoceni";

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

  // 2) Vlastnictví projektu
  const { data: project } = await admin
    .from("projects")
    .select("id, user_id, business_type")
    .eq("id", projectId)
    .maybeSingle();
  if (!project || project.user_id !== user.id) return json({ error: "Projekt nenalezen" }, 404);

  // 3) Limity
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [perProject, perUser, global] = await Promise.all([
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("phase", "2").eq("kind", kind),
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", dayAgo),
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
  ]);
  const usedProject = perProject.count ?? 0;
  const usedDaily = perUser.count ?? 0;
  const limit = LIMITS[kind];
  if (usedProject >= limit) {
    return json({ error: `Limit ${limit} ${kind === "navrh" ? "návrhů" : "vyhodnocení"} pro tento projekt je vyčerpán.`, code: "limit_project" }, 429);
  }
  if (usedDaily >= LIMITS.userDaily) {
    return json({ error: "Dnešní limit AI je vyčerpán. Zkuste to zítra.", code: "limit_daily" }, 429);
  }
  if ((global.count ?? 0) >= GLOBAL_DAILY) {
    return json({ error: "AI je dnes vytížená. Zkuste to prosím zítra.", code: "limit_global" }, 429);
  }

  if (!API_KEY) return json({ error: "AI zatím není zapnutá.", code: "ai_off" }, 503);

  // 4) Data projektu (čteme na serveru – klient je nemůže podstrčit)
  const { data: rows } = await admin
    .from("project_data")
    .select("data_key, data_value")
    .eq("project_id", projectId)
    .in("data_key", ["vision_project_data", "vision_errc_v2", "vision_usp", "ideation_lean_canvas"]);
  const raw = Object.fromEntries((rows ?? []).map((r) => [r.data_key, r.data_value]));
  const vision = describeVision(raw);
  const canvasObj = (raw["ideation_lean_canvas"] ?? {}) as Record<string, unknown>;
  const canvas = describeCanvas(canvasObj);

  if (kind === "vyhodnoceni") {
    const filled = CANVAS_KEYS.filter((k) => cut(canvasObj[k]).length > 0).length;
    if (filled < 7) return json({ error: "Nejdřív vyplňte alespoň 7 polí canvasu." }, 400);
  }

  // 5) Volání AI
  let result: { output: Record<string, unknown>; usage: unknown };
  try {
    result =
      kind === "navrh"
        ? await callClaude(suggestPrompt(vision, canvas), SUGGEST_TOOL, 1600)
        : await callClaude(evaluatePrompt(vision, canvas, project.business_type ?? ""), EVALUATE_TOOL, 1400);
  } catch (e) {
    console.error(e);
    return json({ error: "AI teď neodpovídá. Zkuste to prosím za chvíli." }, 502);
  }

  const output = result.output;
  if (kind === "navrh" && !(String(output.businessType) in BUSINESS_TYPES)) output.businessType = "vlastni-napad-app";

  await admin.from("ai_outputs").insert({
    project_id: projectId,
    user_id: user.id,
    phase: "2",
    kind,
    output: { ...output, _model: MODEL, _usage: result.usage },
  });

  return json({
    output,
    remaining: {
      [kind]: limit - usedProject - 1,
      daily: LIMITS.userDaily - usedDaily - 1,
    },
  });
});
