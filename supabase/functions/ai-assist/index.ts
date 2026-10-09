// VISIBLE7 – AI asistent (fáze 2: Lean Canvas, fáze 3: doporučené hodnoty, orientační náklady a komentář k byznys casu,
// po fázi 3: pitch projektu na jednu stránku A4).
//
// Náklady drží na uzdě:
//  - jen přihlášený vlastník projektu,
//  - limity: 3 návrhy + 3 vyhodnocení/komentáře na fázi a projekt, 20 volání AI denně na uživatele,
//    celkový denní strop pro celou aplikaci (AI_GLOBAL_DAILY_LIMIT, výchozí 300),
//  - levný model (AI_MODEL, výchozí claude-haiku-5-5), pevný strop max_tokens,
//  - vstupy se zkracují, všechna pole canvasu v jednom volání.
// Klíč ANTHROPIC_API_KEY je jen v Supabase secrets, nikdy v prohlížeči.
// verify_jwt je vypnuté (projekt používá nové podpisové klíče) – uživatele ověřujeme sami přes auth.getUser().

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

const COMMENT_TOOL = {
  name: "komentar_byznys_casu",
  description: "Komentář mentora ke spočítanému byznys casu.",
  input_schema: {
    type: "object",
    properties: {
      summary: { type: "string", description: "2–4 věty: co čísla říkají o projektu." },
      sensitivities: { type: "array", items: { type: "string" }, description: "2–4 místa, kde je plán citlivý (předpoklad, na kterém nejvíc záleží)." },
      toVerify: { type: "array", items: { type: "string" }, description: "2–4 předpoklady, které je potřeba ověřit v praxi a jak." },
      nextSteps: { type: "array", items: { type: "string" }, description: "3 konkrétní kroky." },
    },
    required: ["summary", "sensitivities", "toVerify", "nextSteps"],
  },
};

// Fáze 3: obvyklé hodnoty předpokladů podle typu byznysu.
const GROUP_OF: Record<string, string> = {
  eshop: "commerce", "web-eshop": "commerce", dropshipping: "commerce",
  members: "subscription", lms: "subscription", "forum-komunita": "subscription",
  "web-prezentacni": "leads", "konverzni-web": "leads", "squeeze-page": "leads",
  blog: "content", affiliate: "content", marketplace: "marketplace", "vlastni-napad-app": "generic",
};
const ASSUMPTION_FIELDS: Record<string, string[]> = {
  commerce: ["grossMargin", "repeatRate", "growthYear2"],
  subscription: ["grossMargin", "churn", "growthYear2"],
  leads: ["grossMargin", "conversion", "growthYear2"],
  content: ["rpm", "growthYear2"],
  marketplace: ["grossMargin", "commission", "growthYear2"],
  generic: ["grossMargin", "growthYear2"],
};
const FIELD_LABELS: Record<string, string> = {
  grossMargin: "hrubá marže v % z ceny (po zboží, dopravě, platební bráně)",
  repeatRate: "podíl opakovaných nákupů v % objednávek",
  churn: "měsíční odchodovost předplatitelů v %",
  conversion: "konverze kontaktu (poptávky) na zákazníka v %",
  commission: "provize marketplace z prodeje v %",
  rpm: "výnos z reklamy a provizí na 1 000 návštěv v Kč",
  growthYear2: "růst objemu mezi 12. a 24. měsícem v %",
};
const FIELD_MAX: Record<string, number> = { rpm: 3000, growthYear2: 300 };

const assumptionsTool = (fields: string[]) => ({
  name: "doporucene_hodnoty",
  description: "Obvyklé hodnoty předpokladů byznys casu podle oboru.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", enum: fields },
            value: { type: "number" },
            why: { type: "string", description: "Dvě krátké věty: z čeho hodnota vychází a kdy bývá vyšší či nižší." },
          },
          required: ["field", "value", "why"],
        },
      },
    },
    required: ["items"],
  },
});

function assumptionsPrompt(vision: string, canvas: string, businessType: string, fields: string[], caseData: unknown) {
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Lean Canvas:
${canvas}

Typ byznysu: ${BUSINESS_TYPES[businessType] ?? "neurčen"}

Co už uživatel zadal v byznys casu: ${JSON.stringify(caseData ?? {}).slice(0, 1500)}

Úkol: pro tento konkrétní projekt na českém online trhu doporuč realistické hodnoty těchto předpokladů:
${fields.map((f) => `- ${f}: ${FIELD_LABELS[f]}`).join("\n")}
U každé hodnoty napiš přesně dvě krátké věty pro laika: z čeho vychází (obvyklé rozpětí v oboru) a kdy bývá vyšší či nižší.
Buď spíš opatrný než optimistický. Hodnotu uveď jako jedno číslo (u procent bez znaku %). Zde výjimečně číselné hodnoty uvádět smíš.`;
}

// Fáze 3: orientační částky nákladů.
const COSTS_TOOL = {
  name: "orientacni_naklady",
  description: "Orientační částky nákladových položek a chybějící položky.",
  input_schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "id položky ze seznamu" },
            low: { type: "number" },
            typical: { type: "number" },
            high: { type: "number" },
            why: { type: "string", description: "Jedna krátká věta: co částka zahrnuje nebo na čem závisí." },
            fit: { type: "string", enum: ["doporuceno", "zvazit", "nedoporuceno"] },
            fitWhy: { type: "string", description: "Jedna krátká věta, proč položka (ne)dává smysl pro tento projekt." },
          },
          required: ["id", "low", "typical", "high", "why", "fit", "fitWhy"],
        },
      },
      missing: {
        type: "array",
        description: "Nejvýš 4 důležité položky, které v seznamu chybějí.",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            kind: { type: "string", enum: ["jednorazove", "mesicni", "marketing"] },
            typical: { type: "number" },
            why: { type: "string" },
          },
          required: ["name", "kind", "typical", "why"],
        },
      },
    },
    required: ["items", "missing"],
  },
};

function costsPrompt(vision: string, canvas: string, businessType: string, costs: { id: string; name: string; kind: string }[], revenue: unknown) {
  const kindLabel: Record<string, string> = {
    jednorazove: "jednorázově před spuštěním (Kč celkem)",
    mesicni: "měsíční provoz (Kč za měsíc)",
    marketing: "marketing (Kč za měsíc)",
  };
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Lean Canvas:
${canvas}

Typ byznysu: ${BUSINESS_TYPES[businessType] ?? "neurčen"}
Plán příjmů zadaný uživatelem: ${JSON.stringify(revenue ?? {}).slice(0, 800)}

Nákladové položky (id | název | druh):
${costs.map((c) => `${c.id} | ${c.name} | ${kindLabel[c.kind] ?? c.kind}`).join("\n")}

Úkol: pro každou položku odhadni orientační částku v Kč bez DPH pro začínající online projekt v Česku v roce 2026 – nízkou (low), obvyklou (typical) a vysokou (high). Drž se podnikatelského minimalismu: začínající projekt, rozjezd s malými náklady, žádná agentura tam, kde to zvládne podnikatel sám nebo levný nástroj. U marketingu vycházej z rozpočtu, který dává smysl k plánovaným příjmům.
U každé položky urči fit: „doporuceno“ = pro tento projekt opravdu potřebná nebo u marketingu kanál s dobrou konverzí pro tohoto zákazníka; „zvazit“ = může pomoct, ale není nutná hned nebo je konverze nejistá; „nedoporuceno“ = pro tento projekt a zákazníka nedává smysl (např. kanál, kde cílový zákazník nehledá nebo nenakupuje). U marketingu hodnoť hlavně pohledem konverze: kde tento zákazník reálně nakupuje nebo poptává. Do fitWhy napiš jednu krátkou větu proč.
Do missing dej nejvýš 4 důležité položky, které v seznamu chybějí (např. účetní, platební brána, vlastní odměna), jinak prázdné pole.
Zde výjimečně částky uvádět smíš – jsou to orientační odhady, uživatel je přepíše.`;
}

// Fáze 3: vyplnění celého byznys casu jedním voláním (příjmy + náklady + hodnocení).
const REVENUE_LABELS: Record<string, string> = {
  price: "cena pro zákazníka v Kč bez DPH (u e-shopu průměrná objednávka, u předplatného měsíční cena, u zakázek hodnota zakázky, u marketplace průměrný prodej)",
  volume12: "objem za měsíc ve 12. měsíci po spuštění (objednávky / noví zákazníci / kontakty / návštěvy / prodeje podle typu)",
  ...FIELD_LABELS,
};

const autofillTool = (fields: string[]) => ({
  name: "vyplneni_byznys_casu",
  description: "Návrh všech hodnot byznys casu.",
  input_schema: {
    type: "object",
    properties: {
      revenue: assumptionsTool(fields).input_schema.properties.items,
      items: COSTS_TOOL.input_schema.properties.items,
      missing: COSTS_TOOL.input_schema.properties.missing,
    },
    required: ["revenue", "items", "missing"],
  },
});

function autofillPrompt(
  vision: string,
  canvas: string,
  businessType: string,
  fields: string[],
  costs: { id: string; name: string; kind: string }[],
  revenue: unknown,
) {
  const kindLabel: Record<string, string> = {
    jednorazove: "jednorázově před spuštěním (Kč celkem)",
    mesicni: "měsíční provoz (Kč za měsíc)",
    marketing: "marketing (Kč za měsíc)",
  };
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Lean Canvas:
${canvas}

Typ byznysu: ${BUSINESS_TYPES[businessType] ?? "neurčen"}
Co už uživatel zadal: ${JSON.stringify(revenue ?? {}).slice(0, 800)}

Nákladové položky (id | název | druh):
${costs.length ? costs.map((c) => `${c.id} | ${c.name} | ${kindLabel[c.kind] ?? c.kind}`).join("\n") : "(zatím žádné)"}

Úkol: navrhni realistický byznys case pro tento projekt na českém online trhu v roce 2026. Buď spíš opatrný než optimistický a drž se podnikatelského minimalismu (rozjezd s malými náklady, bez agentur tam, kde to zvládne podnikatel sám).
1) revenue: hodnoty těchto polí, u každého dvě krátké věty pro laika (z čeho vychází a kdy bývá vyšší či nižší):
${fields.map((f) => `- ${f}: ${REVENUE_LABELS[f] ?? f}`).join("\n")}
2) items: pro každou nákladovou položku orientační částku v Kč bez DPH (low, typical, high), krátké why a hodnocení fit: „doporuceno“ = opravdu potřebná nebo u marketingu kanál s dobrou konverzí pro tohoto zákazníka; „zvazit“ = může pomoct, ale ne hned nebo s nejistou konverzí; „nedoporuceno“ = pro tohoto zákazníka nedává smysl. Marketing hodnoť pohledem konverze: kde tento zákazník reálně nakupuje nebo poptává. Marketingový rozpočet sladi s plánovanými příjmy.
3) missing: nejvýš 4 důležité položky, které chybějí (např. účetní, platební brána, vlastní odměna, hlavní marketingový kanál), s orientační částkou.
Zde výjimečně čísla a částky uvádět smíš – jsou to orientační odhady, uživatel je přepíše.`;
}

function commentPrompt(vision: string, canvas: string, businessType: string, caseJson: string) {
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Lean Canvas:
${canvas}

Typ byznysu: ${BUSINESS_TYPES[businessType] ?? "neurčen"}

Spočítaný byznys case (horizont 24 měsíců, měsíc 0 = investice před spuštěním; scénáře opatrný = 60 %, realistický = 100 %, optimistický = 140 % plánovaného objemu; částky v Kč; PNO = marketing / obrat; max. PNO = hrubá marže − ostatní náklady v % obratu − cílový zisk):
${caseJson}

Úkol: okomentuj výsledek jako zkušený mentor. Čísla nepřepočítávej ani nevymýšlej nová, pracuj jen s uvedenými. Nevynášej verdikt „ano/ne“.
- Upozorni, pokud chybí důležitá nákladová položka typická pro tento typ byznysu (např. vlastní odměna, účetní, platební brána) nebo pokud předpoklady (marže, objem, konverze, odchodovost) vypadají pro tento typ nereálně.
- Porovnej skutečné PNO s maximálním a řekni, co z toho plyne pro marketing.
- U opatrného scénáře řekni, co by to znamenalo pro potřebný kapitál.`;
}

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
- Marketingové kanály: 3–5 kanálů nejvhodnějších pro tohoto zákazníka (např. Google Ads, Sklik, Meta, ChatGPT Ads, TikTok, srovnávače, e-mail, SEO, influenceři).`;
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

const AUDIENCES: Record<string, string> = {
  investor: "investor (business angel nebo fond) – zajímá ho růst, návratnost a proč právě tento tým",
  banka: "banka nebo úvěr – zajímá ji schopnost splácet, stabilní příjmy, rizika a zajištění",
  partner: "obchodní partner nebo spoluzakladatel – zajímá ho společná příležitost, role a co do toho kdo vloží",
};

const PITCH_TOOL = {
  name: "pitch_na_jednu_stranku",
  description: "Podklady pro pitch projektu na jednu stranu A4. Krátké, úderné texty bez opakování.",
  input_schema: {
    type: "object",
    properties: {
      oneLiner: { type: "string", description: "Jedna věta: co děláme, pro koho a čím se lišíme. Max 160 znaků." },
      problem: { type: "string", description: "Problém zákazníka. 1–2 věty, max 280 znaků." },
      solution: { type: "string", description: "Řešení – co přesně nabízíme. 1–2 věty, max 280 znaků." },
      customer: { type: "string", description: "Kdo je zákazník a proč koupí. 1–2 věty, max 240 znaků." },
      difference: {
        type: "string",
        description: "Čím jsme lepší než levná i prémiová konkurence (modrý oceán). 1–2 věty, max 280 znaků.",
      },
      businessModel: { type: "string", description: "Jak projekt vydělává. 1–2 věty, max 240 znaků." },
      goToMarket: { type: "string", description: "Jak se dostaneme k zákazníkům (kanály). 1–2 věty, max 220 znaků." },
      ask: {
        type: "string",
        description: "Co od příjemce chceme a na co to použijeme. Čísla jen z byznys casu. 1–2 věty, max 260 znaků.",
      },
      risk: { type: "string", description: "Hlavní riziko a jak ho snížíme. 1 věta, max 200 znaků." },
      milestones: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string", description: "Konkrétní milník, max 80 znaků." },
      },
      elevatorPitch: { type: "string", description: "Mluvený pitch na 60 sekund, 5–7 vět, max 750 znaků." },
    },
    required: ["oneLiner", "problem", "solution", "customer", "difference", "businessModel", "goToMarket", "ask", "risk", "milestones", "elevatorPitch"],
  },
};

const PITCH_LIMITS: Record<string, number> = {
  oneLiner: 170, problem: 300, solution: 300, customer: 260, difference: 300, businessModel: 260,
  goToMarket: 240, ask: 280, risk: 220, elevatorPitch: 800,
};

function pitchPrompt(vision: string, canvas: string, businessType: string, numbers: string, audience: string) {
  return `Výstup fáze 1 (Modrý oceán):
${vision}

Lean Canvas:
${canvas}

Typ byznysu: ${BUSINESS_TYPES[businessType] ?? "neurčen"}

Čísla z byznys casu (realistický scénář, 24 měsíců, Kč):
${numbers}

Příjemce pitche: ${AUDIENCES[audience] ?? AUDIENCES.investor}

Úkol: připrav podklady pro pitch projektu na jednu stranu A4 pro tohoto příjemce.
- Piš první osobou množného čísla („nabízíme“), sebevědomě, ale bez přehánění a bez prázdných frází typu „revoluční“ nebo „unikátní řešení“.
- Každý text drž v zadané délce – stránka se musí vejít na jednu A4.
- Čísla a částky smíš uvést JEN ty, které jsou výše v byznys casu. Žádné vymyšlené velikosti trhu, procenta ani reference.
- Pole „ask“ přizpůsob příjemci: investor = kapitál za podíl, banka = úvěr a jak ho splatíme, partner = co společně uděláme a kdo co vloží. Vycházej z potřebného kapitálu.
- Milníky: 3 konkrétní kroky na nejbližších 12 měsíců (např. „První platící zákazník do 3. měsíce“).
- Elevator pitch je mluvený text pro osobní setkání.`;
}

async function callClaude(prompt: string, tool: { name: string; description: string; input_schema: unknown }, maxTokens: number) {
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
  // Useknutý výstup neukládáme (a nezapočítá se do limitu).
  if (data.stop_reason === "max_tokens") throw new Error("AI odpověď byla useknutá");
  const block = (data.content ?? []).find((c: { type: string }) => c.type === "tool_use");
  if (!block) throw new Error("AI nevrátila strukturovaný výstup");
  return { output: block.input as Record<string, unknown>, usage: data.usage ?? null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Metoda není povolena" }, 405);

  // 1) Kdo volá
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "Přihlaste se prosím znovu." }, 401);
  const userClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
  const user = userData?.user;
  if (userErr || !user) return json({ error: "Přihlaste se prosím znovu." }, 401);

  let body: { projectId?: string; action?: string; audience?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const { projectId, action } = body;
  const audience = body.audience && body.audience in AUDIENCES ? body.audience : "investor";
  if (!projectId || !["canvas_suggest", "canvas_evaluate", "case_comment", "case_assumptions", "case_costs", "case_autofill", "pitch"].includes(action ?? "")) {
    return json({ error: "Neplatný požadavek" }, 400);
  }
  const kind =
    action === "canvas_suggest" || action === "case_assumptions" || action === "case_costs" || action === "case_autofill" || action === "pitch"
      ? "navrh"
      : "vyhodnoceni";
  // Odhady nákladů mají vlastní limit (fáze „3n“), aby nesdílely limit s doporučenými procenty.
  const phase = action === "pitch" ? "p" : action === "case_autofill" ? "3a" : action === "case_costs" ? "3n" : action === "case_comment" || action === "case_assumptions" ? "3" : "2";

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
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).eq("project_id", projectId).eq("phase", phase).eq("kind", kind),
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", dayAgo),
    admin.from("ai_outputs").select("id", { count: "exact", head: true }).gte("created_at", dayAgo),
  ]);
  const usedProject = perProject.count ?? 0;
  const usedDaily = perUser.count ?? 0;
  const limit = LIMITS[kind];
  if (usedProject >= limit) {
    const what = action === "pitch" ? "pitchů" : action === "case_autofill" ? "vyplnění s AI" : action === "case_costs" ? "odhadů nákladů" : action === "case_assumptions" ? "doporučení" : kind === "navrh" ? "návrhů" : phase === "3" ? "komentářů" : "vyhodnocení";
    return json({ error: `Limit ${limit} ${what} pro tento projekt je vyčerpán.`, code: "limit_project" }, 429);
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
    .in("data_key", ["vision_project_data", "vision_errc_v2", "vision_usp", "ideation_lean_canvas", "business_case_summary", "business_case"]);
  const raw = Object.fromEntries((rows ?? []).map((r) => [r.data_key, r.data_value]));
  const vision = describeVision(raw);
  const canvasObj = (raw["ideation_lean_canvas"] ?? {}) as Record<string, unknown>;
  const canvas = describeCanvas(canvasObj);

  const caseSummary = raw["business_case_summary"] as Record<string, unknown> | undefined;
  if ((action === "case_comment" || action === "pitch") && !caseSummary?.scenare) {
    return json({ error: "Nejdřív vyplňte příjmy a náklady byznys casu." }, 400);
  }

  const group = GROUP_OF[project.business_type ?? ""] ?? "generic";
  const assumptionFields = ASSUMPTION_FIELDS[group];
  const autofillFields = [group === "content" ? "rpm" : "price", "volume12", ...assumptionFields.filter((f) => f !== "rpm")];
  if ((action === "case_assumptions" || action === "case_autofill") && !project.business_type) {
    return json({ error: "Nejdřív zvolte typ byznysu ve fázi 2." }, 400);
  }

  const caseCosts = (((raw["business_case"] as Record<string, unknown> | undefined)?.costs ?? []) as {
    id: string;
    name: string;
    kind: string;
  }[])
    .filter((c) => c?.id && c?.name?.trim())
    .slice(0, 30)
    .map((c) => ({ id: String(c.id).slice(0, 40), name: cut(c.name, 80), kind: String(c.kind) }));
  if (action === "case_costs" && caseCosts.length === 0) {
    return json({ error: "Nejdřív přidejte nákladové položky." }, 400);
  }

  if (action === "canvas_evaluate") {
    const filled = CANVAS_KEYS.filter((k) => cut(canvasObj[k]).length > 0).length;
    if (filled < 7) return json({ error: "Nejdřív vyplňte alespoň 7 polí canvasu." }, 400);
  }

  // 5) Volání AI
  let result: { output: Record<string, unknown>; usage: unknown };
  try {
    result =
      action === "pitch"
        ? await callClaude(
            pitchPrompt(
              vision,
              canvas,
              project.business_type ?? "",
              JSON.stringify((caseSummary?.scenare as Record<string, unknown> | undefined)?.realisticky ?? {}).slice(0, 2000),
              audience,
            ),
            PITCH_TOOL,
            3000,
          )
        : action === "canvas_suggest"
        ? await callClaude(suggestPrompt(vision, canvas), SUGGEST_TOOL, 2400)
        : action === "canvas_evaluate"
          ? await callClaude(evaluatePrompt(vision, canvas, project.business_type ?? ""), EVALUATE_TOOL, 2500)
          : action === "case_autofill"
            ? await callClaude(
                autofillPrompt(
                  vision,
                  canvas,
                  project.business_type ?? "",
                  autofillFields,
                  caseCosts,
                  (raw["business_case"] as Record<string, unknown> | undefined)?.revenue,
                ),
                autofillTool(autofillFields),
                5000,
              )
          : action === "case_costs"
            ? await callClaude(
                costsPrompt(vision, canvas, project.business_type ?? "", caseCosts, (raw["business_case"] as Record<string, unknown> | undefined)?.revenue),
                COSTS_TOOL,
                4000,
              )
          : action === "case_assumptions"
            ? await callClaude(
                assumptionsPrompt(
                  vision,
                  canvas,
                  project.business_type ?? "",
                  assumptionFields,
                  (raw["business_case"] as Record<string, unknown> | undefined)?.revenue,
                ),
                assumptionsTool(assumptionFields),
                1500,
              )
            : await callClaude(
              commentPrompt(vision, canvas, project.business_type ?? "", JSON.stringify(caseSummary).slice(0, 6000)),
              COMMENT_TOOL,
              2500,
            );
  } catch (e) {
    console.error(e);
    return json({ error: "AI teď neodpovídá. Zkuste to prosím za chvíli." }, 502);
  }

  const output = result.output;
  if (action === "canvas_suggest" && !(String(output.businessType) in BUSINESS_TYPES)) output.businessType = "vlastni-napad-app";
  // Jen povolená pole, rozumné meze, jedno doporučení na pole.
  const cleanRevenue = (list: unknown, allowed: string[]) => {
    const seen = new Set<string>();
    const max: Record<string, number> = { ...FIELD_MAX, price: 10_000_000, volume12: 10_000_000 };
    return ((list as { field: string; value: number; why: string }[]) ?? [])
      .filter((i) => allowed.includes(i.field) && !seen.has(i.field) && seen.add(i.field))
      .map((i) => ({
        field: i.field,
        value: Math.round(Math.min(Math.max(Number(i.value) || 0, 0), max[i.field] ?? 100) * 10) / 10,
        why: String(i.why ?? "").slice(0, 400),
      }));
  };
  if (action === "pitch") {
    for (const [k, n] of Object.entries(PITCH_LIMITS)) output[k] = String(output[k] ?? "").trim().slice(0, n);
    output.milestones = ((output.milestones as unknown[]) ?? []).slice(0, 3).map((m) => String(m).slice(0, 90));
    output.audience = audience;
  }
  if (action === "case_assumptions") output.items = cleanRevenue(output.items, assumptionFields);
  if (action === "case_autofill") output.revenue = cleanRevenue(output.revenue, autofillFields);

  if (action === "case_costs" || action === "case_autofill") {
    const ids = new Set(caseCosts.map((c) => c.id));
    const money = (v: unknown) => Math.round(Math.min(Math.max(Number(v) || 0, 0), 10_000_000));
    output.items = ((output.items as Record<string, unknown>[]) ?? [])
      .filter((i) => ids.has(String(i.id)))
      .map((i) => {
        const [low, typical, high] = [money(i.low), money(i.typical), money(i.high)].sort((a, b) => a - b);
        const fit = ["doporuceno", "zvazit", "nedoporuceno"].includes(String(i.fit)) ? String(i.fit) : "zvazit";
        return { id: String(i.id), low, typical, high, why: String(i.why ?? "").slice(0, 300), fit, fitWhy: String(i.fitWhy ?? "").slice(0, 300) };
      });
    output.missing = ((output.missing as Record<string, unknown>[]) ?? [])
      .filter((m) => ["jednorazove", "mesicni", "marketing"].includes(String(m.kind)) && String(m.name ?? "").trim())
      .slice(0, 4)
      .map((m) => ({ name: String(m.name).slice(0, 70), kind: String(m.kind), typical: money(m.typical), why: String(m.why ?? "").slice(0, 300) }));
  }

  await admin.from("ai_outputs").insert({
    project_id: projectId,
    user_id: user.id,
    phase,
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
