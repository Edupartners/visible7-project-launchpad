/**
 * Testovací stránka (smoke test): jednoduchá konverzní stránka z dat bran 1–3.
 * Ověří zájem dřív, než uživatel začne v bráně 4 stavět. Vlastník je provozovatelem
 * stránky a správcem e-mailů zájemců; VISIBLE7 je zpracovatel.
 */
import { supabase } from "@/integrations/visible7/client";
import { ErrcMatrix, VISION_KEYS, VisionBasics, errcTexts, loadProjectKeys } from "@/lib/projectData";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export type BlockId = "hero" | "problem" | "solution" | "benefits" | "audience" | "about" | "price" | "faq" | "form";
export type Template = "svetla" | "tmava" | "tepla";

export interface PageContent {
  order: BlockId[];
  off: BlockId[];
  hero: { title: string; subtitle: string; cta: string };
  problem: { title: string; items: string[] };
  solution: { title: string; text: string };
  benefits: { title: string; items: { title: string; text: string }[] };
  audience: { title: string; yes: string[]; no: string[] };
  /** Kdo za tím stojí – důvěra. */
  about: { title: string; name: string; text: string; photo: string | null };
  price: { title: string; amount: string; note: string };
  faq: { title: string; items: { q: string; a: string }[] };
  form: { title: string; text: string; button: string; success: string; askName: boolean };
}

export interface TestPage {
  id: string;
  project_id: string;
  user_id: string;
  slug: string;
  status: "draft" | "published";
  template: Template;
  accent: string;
  content: PageContent;
  logo_url: string | null;
  hero_url: string | null;
  operator_name: string;
  operator_email: string;
  meta_pixel_id: string | null;
  ga4_id: string | null;
  goal_visits: number;
  goal_rate: number;
  notify_leads: boolean;
  published_at: string | null;
}

/** Co se smí ukázat na veřejné stránce. */
export type PublicPage = Pick<
  TestPage,
  | "slug"
  | "template"
  | "accent"
  | "content"
  | "logo_url"
  | "hero_url"
  | "operator_name"
  | "operator_email"
  | "meta_pixel_id"
  | "ga4_id"
> & { project_name: string };

export const BLOCK_LABELS: Record<BlockId, string> = {
  hero: "Úvod",
  problem: "Problém",
  solution: "Řešení",
  benefits: "Výhody",
  audience: "Pro koho to je",
  about: "Kdo za tím stojí",
  price: "Cena",
  faq: "Časté otázky",
  form: "Formulář",
};

export const TEMPLATES: { id: Template; label: string; text: string }[] = [
  { id: "svetla", label: "Světlá", text: "Bílá a vzdušná" },
  { id: "tmava", label: "Černá", text: "Produktová, výrazná" },
  { id: "tepla", label: "Teplá", text: "Jemně teplé tóny" },
];

export const ACCENTS = ["#f97316", "#2563eb", "#059669", "#db2777", "#7c3aed", "#173663"];

/** Zdroje pro odkazy do reklam a sdílení (?z=…). */
export const SOURCES = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "chatgpt", label: "ChatGPT Ads" },
  { id: "google", label: "Google" },
  { id: "skupiny", label: "Skupiny a fóra" },
  { id: "email", label: "E-mail známým" },
];

export const SOURCE_LABELS: Record<string, string> = {
  primo: "Přímo / neznámý",
  ...Object.fromEntries(SOURCES.map((s) => [s.id, s.label])),
};

const firstSentences = (text: string, max = 3) =>
  text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim().replace(/[.]$/, ""))
    .filter(Boolean)
    .slice(0, max);

const czk = (v: number) => `${Math.round(v).toLocaleString("cs-CZ")} Kč`;

/** První verze obsahu z dat bran 1–3. Uživatel všechno přepíše. */
export function draftContent(input: {
  projectName: string;
  basics: Partial<VisionBasics>;
  errc: ErrcMatrix | null;
  usp: string;
  price: number | null;
}): PageContent {
  const { basics, errc, usp, price, projectName } = input;
  const offering = basics.offering?.trim() ?? "";
  const customer = basics.customer?.trim() ?? "";
  const problems = basics.problem ? firstSentences(basics.problem) : [];
  const gains = errc ? [...errcTexts(errc, "create"), ...errcTexts(errc, "raise")].slice(0, 3) : [];
  const title = usp.trim() || basics.slogan?.trim() || projectName;
  return {
    order: ["hero", "problem", "solution", "benefits", "audience", "about", "price", "faq", "form"],
    off: ["about"],
    hero: {
      title: title.slice(0, 120),
      subtitle: [offering, customer && `Pro ${customer.charAt(0).toLowerCase()}${customer.slice(1)}`]
        .filter(Boolean)
        .join(". ")
        .slice(0, 260),
      cta: "Chci vědět jako první",
    },
    problem: {
      title: "Znáte to?",
      items: problems.length ? problems : ["Popište první problém zákazníka", "Druhý problém", "Třetí problém"],
    },
    solution: {
      title: "Jak vám pomůžeme",
      text: offering || "Popište, co přesně nabízíte a jak to zákazníkovi pomůže.",
    },
    benefits: {
      title: "Co získáte",
      items: (gains.length ? gains : ["První výhoda", "Druhá výhoda", "Třetí výhoda"]).map((g) => ({
        title: g.slice(0, 80),
        text: "",
      })),
    },
    audience: {
      title: "Pro koho to je",
      yes: customer ? [customer] : ["Pro koho to je"],
      no: ["Pro koho to není"],
    },
    about: {
      title: "Kdo za tím stojí",
      name: "",
      text: "",
      photo: null,
    },
    price: {
      title: "Kolik to bude stát",
      amount: price ? czk(price) : "",
      note: "Orientační cena při spuštění. Kdo se zapíše teď, dostane zvýhodnění.",
    },
    faq: {
      title: "Časté otázky",
      items: [
        { q: "Kdy to bude k dispozici?", a: "Právě to připravujeme. Zapsaní se to dozví jako první." },
        { q: "Platím teď něco?", a: "Ne. Zápisem se k ničemu nezavazujete." },
      ],
    },
    form: {
      title: "Chcete to mezi prvními?",
      text: "Zanechte e-mail a dáme vám vědět, jakmile spustíme.",
      button: "Zapsat se",
      success: "Děkujeme! Ozveme se, jakmile spustíme.",
      askName: false,
    },
  };
}

const ABOUT_DEFAULT: PageContent["about"] = { title: "Kdo za tím stojí", name: "", text: "", photo: null };

/** Doplní bloky, které starší stránky ještě nemají. */
export function normalizeContent(c: PageContent): PageContent {
  if (c.about && c.order.includes("about")) return c;
  const order: BlockId[] = c.order.filter((b) => b !== "about");
  const at = order.indexOf("price") >= 0 ? order.indexOf("price") : order.length - 1;
  order.splice(at, 0, "about");
  return {
    ...c,
    about: c.about ?? ABOUT_DEFAULT,
    order,
    off: c.about ? c.off : [...c.off.filter((b) => b !== "about"), "about"],
  };
}

export const consentText = (p: Pick<PublicPage, "operator_name" | "operator_email">, project: string) =>
  `Souhlasím se zpracováním svého e-mailu: ${p.operator_name || "provozovatel stránky"} mi bude posílat informace o projektu ${project}. Souhlas mohu kdykoli odvolat na ${p.operator_email || "kontaktním e-mailu provozovatele"}.`;

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "projekt";

export const validSlug = (s: string) => /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/.test(s);
export const pageUrl = (slug: string, source?: string) =>
  `${window.location.origin}/t/${slug}${source ? `?z=${source}` : ""}`;

// ---- Vlastník ----
export async function loadMyPage(projectId: string): Promise<TestPage | null> {
  const { data } = await db.from("test_pages").select("*").eq("project_id", projectId).maybeSingle();
  const p = (data as TestPage | null) ?? null;
  return p ? { ...p, content: normalizeContent(p.content) } : null;
}

export async function createPage(projectId: string, projectName: string, userEmail: string): Promise<TestPage> {
  const raw = await loadProjectKeys(projectId, [...Object.values(VISION_KEYS), "business_case"]);
  const bc = raw.business_case as { revenue?: { price?: number } } | undefined;
  const content = draftContent({
    projectName,
    basics: (raw[VISION_KEYS.basics] as VisionBasics | undefined) ?? {},
    errc: (raw[VISION_KEYS.errc] as ErrcMatrix | undefined) ?? null,
    usp: (raw[VISION_KEYS.usp] as string | undefined) ?? "",
    price: bc?.revenue?.price || null,
  });
  const base = slugify(projectName);
  for (let i = 0; i < 4; i++) {
    const slug = i === 0 ? base : `${base.slice(0, 42)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await db
      .from("test_pages")
      .insert({ project_id: projectId, slug, content, operator_email: userEmail })
      .select("*")
      .single();
    if (!error) return data as TestPage;
    if (error.code !== "23505") throw error;
    // Unikátní konflikt: buď už stránka projektu existuje, nebo je adresa obsazená.
    const existing = await loadMyPage(projectId);
    if (existing) return existing;
  }
  throw new Error("Nepodařilo se vytvořit adresu stránky.");
}

export type PagePatch = Partial<Omit<TestPage, "id" | "project_id" | "user_id">>;

export async function savePage(id: string, patch: PagePatch) {
  const { error } = await db
    .from("test_pages")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") throw new Error("Tahle adresa je už obsazená. Zkuste jinou.");
    throw new Error(error.message || "Uložení se nepodařilo.");
  }
}

export async function uploadImage(userId: string, pageId: string, kind: "logo" | "hero" | "about", file: File) {
  if (file.size > 3 * 1024 * 1024) throw new Error("Obrázek je větší než 3 MB.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${pageId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("test-pages").upload(path, file, { contentType: file.type });
  if (error) throw new Error("Nahrání obrázku se nepodařilo. Použijte JPG, PNG nebo WebP do 3 MB.");
  return supabase.storage.from("test-pages").getPublicUrl(path).data.publicUrl;
}

export interface StatRow {
  day: string;
  source: string;
  visits: number;
  clicks: number;
  leads: number;
}
export interface Lead {
  id: string;
  email: string;
  name: string;
  source: string;
  created_at: string;
}

export async function loadStats(pageId: string): Promise<StatRow[]> {
  const { data } = await db.from("test_page_stats").select("day, source, visits, clicks, leads").eq("page_id", pageId);
  return (data ?? []) as StatRow[];
}

export async function loadLeads(pageId: string): Promise<Lead[]> {
  const { data } = await db
    .from("test_page_leads")
    .select("id, email, name, source, created_at")
    .eq("page_id", pageId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}

export async function deleteLead(id: string) {
  await db.from("test_page_leads").delete().eq("id", id);
}

export type Verdict = "data" | "zelena" | "oranzova" | "cervena";

/** Vyhodnocení testu podle cíle: dost návštěv a podíl zápisů. */
export function evaluate(visits: number, leads: number, goalVisits: number, goalRate: number) {
  const rate = visits ? (leads / visits) * 100 : 0;
  let verdict: Verdict = "data";
  if (visits >= goalVisits) verdict = rate >= goalRate ? "zelena" : rate >= goalRate / 2 ? "oranzova" : "cervena";
  return { rate, verdict, progress: Math.min(100, (visits / goalVisits) * 100) };
}

export function leadsCsv(leads: Lead[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = leads.map((l) =>
    [l.email, l.name, SOURCE_LABELS[l.source] ?? l.source, new Date(l.created_at).toLocaleString("cs-CZ")]
      .map(esc)
      .join(";"),
  );
  return "﻿" + ["E-mail;Jméno;Zdroj;Zapsáno", ...rows].join("\n");
}

// ---- Veřejná stránka ----
export async function loadPublicPage(slug: string): Promise<PublicPage | null> {
  const { data } = await db.rpc("test_page_public", { p_slug: slug });
  const p = (data as PublicPage | null) ?? null;
  return p ? { ...p, content: normalizeContent(p.content) } : null;
}

export async function hit(slug: string, source: string, kind: "visit" | "click" = "visit") {
  await db.rpc("test_page_hit", { p_slug: slug, p_source: source, p_kind: kind });
}

export async function submitLead(slug: string, email: string, name: string, source: string, consent: string) {
  const { data, error } = await db.rpc("test_page_lead", {
    p_slug: slug,
    p_email: email,
    p_name: name,
    p_source: source,
    p_consent: consent,
  });
  if (error) {
    const msg = String(error.message ?? "");
    throw new Error(
      msg.includes("e-mail")
        ? "Zkontrolujte prosím e-mail."
        : msg.includes("později")
          ? msg
          : "Odeslání se nepodařilo.",
    );
  }
  return data as "ok" | "dup";
}

/** AI přepíše texty stránky z dat bran 1–3 (cena a pořadí bloků zůstanou). */
export async function generateCopy(projectId: string, current: PageContent): Promise<PageContent> {
  const { data, error } = await supabase.functions.invoke("ai-assist", { body: { projectId, action: "landing" } });
  if (error) {
    let message = "AI teď neodpovídá. Zkuste to prosím za chvíli.";
    try {
      const ctx = (error as { context?: Response }).context;
      const body = ctx ? await ctx.json() : null;
      if (body?.error) message = body.error;
    } catch {
      /* obecná zpráva */
    }
    throw new Error(message);
  }
  const o = (data as { output: Partial<PageContent> }).output;
  return {
    ...current,
    hero: { ...current.hero, ...o.hero },
    problem: { ...current.problem, ...o.problem },
    solution: { ...current.solution, ...o.solution },
    benefits: { ...current.benefits, ...o.benefits },
    about: current.about,
    audience: { ...current.audience, ...o.audience },
    faq: { ...current.faq, ...o.faq },
    form: { ...current.form, ...o.form, askName: current.form.askName },
  };
}
