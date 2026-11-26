import { supabase } from "@/integrations/visible7/client";

/**
 * Závěrečný projekt studia (66-043-N). Zadání je v databázi (jen pro studenty), odpovědi studenta také.
 * Klíče odpovědí: f_jmeno, f_datum, f_projekt, f_web a q_<část>_<otázka>.
 */
export type Mode = "P" | "U" | "PU" | "PR";

export interface FpQuestion {
  c: string;
  t: string;
  hs: string[];
  h: string[];
  ph?: string;
  note?: string;
}

export interface FpPart {
  k: string;
  n: string;
  d: string;
  out: string;
  opt?: boolean;
  q: FpQuestion[];
}

export interface FpTemplate {
  version: number;
  modes: Record<Mode, string>;
  criteria: Record<string, [Mode, string]>;
  parts: FpPart[];
}

export type FpAnswers = Record<string, string>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const HEAD_FIELDS = ["f_jmeno", "f_datum", "f_projekt", "f_web"] as const;
/** Kolik znaků musí odpověď mít, aby se počítala jako vyplněná. */
export const MIN_CHARS = 40;

export const qid = (p: FpPart, q: FpQuestion) => `q_${p.k}_${q.c}`;
export const isFilled = (v: string | undefined) => (v ?? "").trim().length >= MIN_CHARS;
/** Povinné otázky: části bez „nepovinné“ a s kritériem hodnoticího standardu. */
export const requiredIds = (t: FpTemplate) =>
  t.parts.filter((p) => !p.opt).flatMap((p) => p.q.filter((q) => q.hs.length).map((q) => qid(p, q)));

export const criterionLabel = (key: string) => `${key.slice(0, 2)} ${key[2]}`;

export async function loadTemplate(): Promise<FpTemplate | null> {
  const { data, error } = await db.from("final_project_template").select("content").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return data.content as FpTemplate;
}

export async function loadAnswers(userId: string): Promise<FpAnswers> {
  const { data } = await db.from("final_projects").select("answers").eq("user_id", userId).maybeSingle();
  return (data?.answers ?? {}) as FpAnswers;
}

export async function saveAnswers(userId: string, answers: FpAnswers): Promise<boolean> {
  const { error } = await db
    .from("final_projects")
    .upsert({ user_id: userId, answers, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return !error;
}

/* ---------- Word (.docx) ---------- */

const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface RunOpts {
  b?: boolean;
  i?: boolean;
  color?: string;
  sz?: number;
}
const run = (text: string, o: RunOpts = {}) =>
  `<w:r><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>${o.b ? "<w:b/>" : ""}${o.i ? "<w:i/>" : ""}${
    o.color ? `<w:color w:val="${o.color}"/>` : ""
  }<w:sz w:val="${o.sz ?? 22}"/></w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;

interface ParaOpts {
  before?: number;
  after?: number;
  keep?: boolean;
  border?: boolean;
}
const para = (runs: string, o: ParaOpts = {}) =>
  `<w:p><w:pPr><w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? 120}"/>${o.keep ? "<w:keepNext/>" : ""}${
    o.border ? '<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="4" w:color="E8823A"/></w:pBdr>' : ""
  }</w:pPr>${runs}</w:p>`;

const textParas = (v: string) => {
  const s = v.trim();
  if (!s) return para(run("Nevyplněno, doplnit před zkouškou.", { i: true, color: "A9511A" }));
  return s
    .split(/\n+/)
    .map((l) => para(run(l)))
    .join("");
};

function documentXml(t: FpTemplate, a: FpAnswers) {
  const g = (id: string) => (a[id] ?? "").trim();
  let b = "";
  b += para(run(g("f_projekt") || "Můj projekt", { b: true, sz: 40, color: "173663" }), { after: 60 });
  b += para(run("Závěrečný projekt · Specialista internetového obchodu (kód 66-043-N)", { sz: 20, color: "5B6475" }), {
    after: 240,
    border: true,
  });
  const row = (l: string, v: string) => para(run(`${l}: `, { b: true }) + run(v || "……………………………"), { after: 60 });
  b += row("Jméno a příjmení", g("f_jmeno"));
  let d = g("f_datum");
  const p = d.split("-");
  if (p.length === 3) d = `${+p[2]}. ${+p[1]}. ${p[0]}`;
  b += row("Datum zkoušky", d);
  b += row("Web", g("f_web"));
  for (const part of t.parts) {
    if (part.opt && !part.q.some((q) => g(qid(part, q)))) continue;
    b += para(run(`${part.k}. ${part.n}`, { b: true, sz: 28, color: "173663" }), {
      before: 360,
      after: 120,
      keep: true,
      border: true,
    });
    for (const q of part.q) {
      if (!q.hs.length && !part.opt && !g(qid(part, q))) continue;
      b += para(run(`${part.k}.${q.c} `, { b: true, color: "A9511A" }) + run(q.t, { b: true }), {
        before: 200,
        after: 80,
        keep: true,
      });
      b += textParas(g(qid(part, q)));
    }
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${b}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
}

export async function buildDocx(t: FpTemplate, a: FpAnswers): Promise<Blob> {
  const { default: JSZip } = await import("jszip");
  const z = new JSZip();
  z.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  );
  z.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  z.file("word/document.xml", documentXml(t, a));
  return z.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export const fileSlug = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
