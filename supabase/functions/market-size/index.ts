// VISIBLE7 – Velikost trhu (TAM / SAM / SOM) s vyhledáváním na webu.
//
// Proč samostatná funkce: potřebuje web search a delší běh, ai-assist zůstává beze změny.
// Náklady drží na uzdě:
//  - jen přihlášený vlastník projektu s placeným přístupem (vždy, i při vypnutém paywallu) nebo správce,
//  - 2 výpočty na projekt, sdílí denní limit AI uživatele a celkový denní strop aplikace (tabulka ai_outputs),
//  - max. 6 vyhledávání na výpočet, pevný strop max_tokens.
// Zdroje: do výstupu pouštíme jen odkazy, které vyhledávání opravdu vrátilo (AI nemůže zdroj vymyslet).
// verify_jwt je vypnuté – uživatele ověřujeme sami přes auth.getUser().

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = Deno.env.get("MARKET_MODEL") ?? "claude-sonnet-5";
const GLOBAL_DAILY = Number(Deno.env.get("AI_GLOBAL_DAILY_LIMIT") ?? "2000");
const PER_PROJECT = 2;
const USER_DAILY = 20;
const PHASE = "m";
const STORE_KEY = "market_size";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "content-type": "application/json" } });

const cut = (v: unknown, n = 600) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

const REGIONS: Record<string, string> = { cz: "Česká republika", cz_sk: "Česká republika a Slovensko" };

const SYSTEM = `Jsi analytik trhu pro začínající podnikatele v Česku. Pracuješ s ověřitelnými veřejnými daty (ČSÚ, Eurostat, ČNB, profesní asociace, výroční zprávy firem, studie a průzkumy). Píšeš česky, věcně a stručně. Nikdy nevymýšlíš čísla ani zdroje. Když přesný údaj neexistuje, odvodíš ho z dohledatelných čísel a předpoklad jasně pojmenuješ.`;

const LEVEL = {
  type: "object",
  properties: {
    value_czk: { type: "number", description: "Roční hodnota v Kč (celé číslo)." },
    formula: { type: "string", description: "Výpočet slovy s čísly, např. „430 000 OSVČ × 12 % online × 2 900 Kč“." },
  },
  required: ["value_czk", "formula"],
};

const MARKET_TOOL = {
  name: "market_size",
  description: "Zapíše výsledný odhad velikosti trhu.",
  input_schema: {
    type: "object",
    properties: {
      category: { type: "string", description: "Jak jsi trh vymezil, jednou větou (např. „online kurzy pro OSVČ v ČR“)." },
      tam: LEVEL,
      sam: LEVEL,
      som: LEVEL,
      assumptions: {
        type: "array",
        items: { type: "string" },
        description: "Max. 4 klíčové předpoklady, které nejsou přímo ze zdroje.",
      },
      confidence: { type: "string", enum: ["nizka", "stredni", "vysoka"] },
      confidence_why: { type: "string", description: "Jedna věta, proč taková jistota." },
      sources: {
        type: "array",
        description: "Jen stránky, které jsi opravdu našel vyhledáváním a ze kterých bereš čísla.",
        items: {
          type: "object",
          properties: { url: { type: "string" }, title: { type: "string" }, used_for: { type: "string" } },
          required: ["url", "title", "used_for"],
        },
      },
    },
    required: ["category", "tam", "sam", "som", "assumptions", "confidence", "confidence_why", "sources"],
  },
};

function prompt(vision: string, canvas: string, businessType: string, plan: string, region: string) {
  return `Projekt uživatele:
${vision}

Lean Canvas:
${canvas}

Typ byznysu: ${businessType || "neurčen"}
Plán z byznys casu (realistický scénář, 24 měsíců): ${plan || "zatím nevyplněn"}
Region: ${region}

Úkol: odhadni roční velikost trhu v Kč pro tento projekt v regionu ${region}.
1. Nejdřív vyhledej na webu aktuální čísla (velikost kategorie, počet zákazníků v segmentu, průměrná útrata, podíl online). Hledej česky i anglicky, upřednostni ČSÚ, Eurostat, asociace a studie z posledních 3 let.
2. TAM = celková roční útrata v regionu za kategorii, do které projekt patří.
3. SAM = část TAM, kterou projekt může obsloužit svým modelem, kanálem a zákaznickým segmentem z canvasu.
4. SOM = realisticky získatelná část SAM za 2–3 roky pro malý začínající projekt (obvykle jednotky procent SAM). Porovnej ji s plánem z byznys casu.
5. U každé úrovně napiš výpočet s konkrétními čísly. Čísla ze zdroje uveď ve zdroji, čísla odhadnutá tebou dej do předpokladů.
6. Výsledek zapiš nástrojem market_size. Do zdrojů dej jen stránky, které jsi skutečně našel.`;
}

type Block = Record<string, unknown> & { type: string };

async function call(messages: unknown[], forceTool: boolean) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 6,
          user_location: { type: "approximate", country: "CZ", timezone: "Europe/Prague" },
        },
        MARKET_TOOL,
      ],
      tool_choice: forceTool ? { type: "tool", name: "market_size" } : { type: "auto" },
      messages,
    }),
  });
  if (!res.ok) {
    console.error("Anthropic error", res.status, (await res.text()).slice(0, 500));
    throw new Error(`AI ${res.status}`);
  }
  return (await res.json()) as {
    content: Block[];
    stop_reason: string;
    usage?: { input_tokens?: number; output_tokens?: number; server_tool_use?: { web_search_requests?: number } };
  };
}

/** Smyčka: vyhledávání (i s pause_turn) → nástroj market_size. Max. 4 kola. */
async function run(userPrompt: string) {
  const messages: unknown[] = [{ role: "user", content: userPrompt }];
  const seen = new Map<string, string>();
  const usage = { input_tokens: 0, output_tokens: 0, web_search_requests: 0 };
  for (let round = 0; round < 4; round++) {
    const data = await call(messages, round === 3);
    usage.input_tokens += data.usage?.input_tokens ?? 0;
    usage.output_tokens += data.usage?.output_tokens ?? 0;
    usage.web_search_requests += data.usage?.server_tool_use?.web_search_requests ?? 0;
    for (const b of data.content ?? []) {
      if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        for (const r of b.content as { type: string; url?: string; title?: string }[]) {
          if (r.type === "web_search_result" && r.url) seen.set(r.url, cut(r.title, 160));
        }
      }
    }
    const tool = (data.content ?? []).find((b) => b.type === "tool_use" && b.name === "market_size");
    if (tool) return { output: tool.input as Record<string, unknown>, seen, usage };
    if (data.stop_reason === "max_tokens") throw new Error("AI odpověď byla useknutá");
    messages.push({ role: "assistant", content: data.content });
    // pause_turn: stačí poslat obsah zpět a pokračovat; jinak si o zápis výsledku řekneme.
    if (data.stop_reason !== "pause_turn") {
      messages.push({ role: "user", content: "Teď prosím zapiš výsledek nástrojem market_size." });
    }
  }
  throw new Error("AI nevrátila výsledek");
}

const normUrl = (u: string) => u.replace(/#.*$/, "").replace(/\/$/, "");

function clean(o: Record<string, unknown>, seen: Map<string, string>) {
  const money = (v: unknown) => Math.round(Math.min(Math.max(Number(v) || 0, 0), 1e13));
  const level = (v: unknown) => {
    const l = (v ?? {}) as Record<string, unknown>;
    return { value_czk: money(l.value_czk), formula: cut(l.formula, 320) };
  };
  // TAM ≥ SAM ≥ SOM (kdyby AI pořadí popletla, nevystavíme nesmysl).
  const lv = [level(o.tam), level(o.sam), level(o.som)];
  const sorted = [...lv.map((l) => l.value_czk)].sort((a, b) => b - a);
  lv.forEach((l, i) => (l.value_czk = sorted[i]));
  const known = new Map([...seen.keys()].map((u) => [normUrl(u), u]));
  const sources = ((o.sources as Record<string, unknown>[]) ?? [])
    .map((s) => ({ url: known.get(normUrl(String(s.url ?? ""))), title: cut(s.title, 160), used_for: cut(s.used_for, 200) }))
    .filter((s): s is { url: string; title: string; used_for: string } => !!s.url)
    .filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i)
    .slice(0, 8)
    .map((s) => ({ ...s, title: s.title || seen.get(s.url) || s.url }));
  const confidence = ["nizka", "stredni", "vysoka"].includes(String(o.confidence)) ? String(o.confidence) : "nizka";
  return {
    category: cut(o.category, 200),
    tam: lv[0],
    sam: lv[1],
    som: lv[2],
    assumptions: ((o.assumptions as unknown[]) ?? []).map((a) => cut(a, 240)).filter(Boolean).slice(0, 4),
    // Bez jediného dohledaného zdroje nemůže být jistota vyšší než nízká.
    confidence: sources.length ? confidence : "nizka",
    confidence_why: cut(o.confidence_why, 240),
    sources,
  };
}

function describe(raw: Record<string, unknown>) {
  const v = (raw.vision_project_data ?? {}) as Record<string, unknown>;
  const lines = [
    ["Název", v.name],
    ["Slogan", v.slogan],
    ["Zákazník", v.customer],
    ["Problém", v.problem],
    ["Nabídka", v.offering],
    ["Levná konkurence", v.lowCostName],
    ["Prémiová konkurence", v.premiumName],
    ["USP", raw.vision_usp],
  ]
    .filter(([, x]) => cut(x))
    .map(([k, x]) => `${k}: ${cut(x, 400)}`);
  const c = (raw.ideation_lean_canvas ?? {}) as Record<string, unknown>;
  const canvas = Object.entries(c)
    .filter(([, x]) => typeof x === "string" && cut(x))
    .slice(0, 12)
    .map(([k, x]) => `${k}: ${cut(x, 400)}`);
  return { vision: lines.join("\n") || "(nevyplněno)", canvas: canvas.join("\n") || "(nevyplněno)", filled: lines.length + canvas.length };
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

  let body: { projectId?: string; region?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const projectId = body.projectId;
  const regionKey = body.region && body.region in REGIONS ? body.region : "cz";
  if (!projectId) return json({ error: "Neplatný požadavek" }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: project } = await admin
    .from("projects")
    .select("id, user_id, business_type")
    .eq("id", projectId)
    .maybeSingle();
  if (!project || project.user_id !== user.id) return json({ error: "Projekt nenalezen" }, 404);

  // Jen placený přístup, bez ohledu na přepínač paywallu (výpočet stojí reálné peníze). Správce může testovat.
  const [{ data: accRow }, { data: adminRow }] = await Promise.all([
    admin.from("user_access").select("plan, access_until").eq("user_id", user.id).maybeSingle(),
    admin.from("admins").select("user_id").eq("user_id", user.id).maybeSingle(),
  ]);
  const paid =
    (["mesic", "ctvrtleti", "rok", "kod", "clenstvi"].includes(accRow?.plan ?? "") &&
      (!accRow?.access_until || new Date(accRow.access_until).getTime() > Date.now())) ||
    !!adminRow;
  if (!paid) {
    return json({ error: "Velikost trhu je součástí placeného přístupu.", code: "premium" }, 402);
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [perProject, perUser, global] = await Promise.all([
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("phase", PHASE),
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", dayAgo),
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
  ]);
  if ((perProject.count ?? 0) >= PER_PROJECT) {
    return json({ error: `Limit ${PER_PROJECT} výpočtů trhu pro tento projekt je vyčerpán.`, code: "limit_project" }, 429);
  }
  if ((perUser.count ?? 0) >= USER_DAILY) {
    return json({ error: "Dnešní limit AI je vyčerpán. Zkuste to zítra.", code: "limit_daily" }, 429);
  }
  if ((global.count ?? 0) >= GLOBAL_DAILY) {
    return json({ error: "AI je dnes vytížená. Zkuste to prosím zítra.", code: "limit_global" }, 429);
  }
  if (!API_KEY) return json({ error: "AI zatím není zapnutá.", code: "ai_off" }, 503);

  const { data: rows } = await admin
    .from("project_data")
    .select("data_key, data_value")
    .eq("project_id", projectId)
    .in("data_key", ["vision_project_data", "vision_usp", "ideation_lean_canvas", "business_case_summary"]);
  const raw = Object.fromEntries((rows ?? []).map((r) => [r.data_key, r.data_value])) as Record<string, unknown>;
  const { vision, canvas, filled } = describe(raw);
  if (filled < 3) return json({ error: "Nejdřív vyplňte zákazníka, problém a nabídku v bráně 1 nebo canvas." }, 400);
  const plan = JSON.stringify(
    ((raw.business_case_summary as Record<string, unknown> | undefined)?.scenare as Record<string, unknown> | undefined)
      ?.realisticky ?? "",
  ).slice(0, 800);

  let result;
  try {
    result = await run(prompt(vision, canvas, project.business_type ?? "", plan, REGIONS[regionKey]));
  } catch (e) {
    console.error("market-size failed", String(e));
    return json({ error: "Výpočet se nepodařil. Zkuste to prosím za chvíli." }, 502);
  }
  const output = { ...clean(result.output, result.seen), region: regionKey, created_at: new Date().toISOString() };

  await Promise.all([
    admin.from("ai_outputs").insert({
      project_id: projectId,
      user_id: user.id,
      phase: PHASE,
      kind: "navrh",
      output: { ...output, _model: MODEL, _usage: result.usage },
    }),
    admin
      .from("project_data")
      .upsert({ project_id: projectId, data_key: STORE_KEY, data_value: output }, { onConflict: "project_id,data_key" }),
  ]);

  return json({ output, remaining: PER_PROJECT - (perProject.count ?? 0) - 1 });
});
