import { supabase } from "@/integrations/visible7/client";

export type CertificateKind = "phase" | "zamer" | "gold";

export interface Certificate {
  code: string;
  project_id?: string;
  kind: CertificateKind;
  phase: number | null;
  holder_name: string;
  project_name: string;
  launch_url: string | null;
  issued_at: string;
  /** Ověřené IČO (jen Gold) */
  ico?: string | null;
}

export const GATE_NAMES: Record<number, string> = {
  1: "Vize",
  2: "Ideace",
  3: "Strategie a čísla",
  4: "Implementace",
  5: "Budování poptávky",
  6: "Launch",
  7: "Expanze",
};

export const ISSUER_LINE = "Edu Partners s.r.o. | Partner: World eCommerce Business School | VISIBLE7 MICEK®";
export const ISSUER_ORG = "Edu Partners s.r.o.";

/** Název osvědčení tak, jak se zobrazí na osvědčení a na LinkedInu. */
export const certificateTitle = (kind: CertificateKind, phase: number | null) => {
  if (kind === "gold") return "VISIBLE7 Gold – Spuštěný projekt";
  if (kind === "zamer") return "VISIBLE7 MICEK® – Podnikatelský záměr";
  return `VISIBLE7 MICEK® – Fáze ${phase}: ${GATE_NAMES[phase ?? 0] ?? ""}`;
};

export const certificateDescription = (kind: CertificateKind, phase: number | null) => {
  if (kind === "gold")
    return "za projití všech sedmi bran metodiky VISIBLE7 MICEK® a spuštění vlastního projektu na trh";
  if (kind === "zamer")
    return "za zpracování podnikatelského záměru ve fázích 1–4 metodiky VISIBLE7 MICEK®: vize, ideace, strategie a čísla a implementace";
  return `za absolvování fáze ${phase} – ${GATE_NAMES[phase ?? 0] ?? ""} – metodiky VISIBLE7 MICEK®`;
};

/** Obsah fáze pro osvědčení a jeho přílohu: co se probíralo, co účastník umí a co odevzdal. */
export interface PhaseContent {
  skills: string[];
  topics: string[];
  outputs: string[];
}

export const PHASE_CONTENT: Record<number, PhaseContent> = {
  1: {
    skills: ["analýza trhu a konkurence", "návrh hodnotové nabídky (USP)"],
    topics: [
      "Strategie modrého oceánu: matice ERRC, Six Paths, mapa užitku",
      "Strategický profil projektu proti prémiové i nízkonákladové konkurenci",
      "Hodnotová nabídka a USP, vitamín vs. lék na bolest",
      "Hooked model: návyk a opakovaný návrat zákazníka",
    ],
    outputs: ["Vize a odlišení projektu", "Matice ERRC a hodnotová křivka"],
  },
  2: {
    skills: ["návrh byznys modelu", "řízení rizik projektu"],
    topics: [
      "Lean Canvas: problém, zákazník, řešení, kanály, příjmy a náklady",
      "Výběr typu online byznysu (12+1 modelů)",
      "Pre-mortem a SWOT analýza",
      "Projektový plán a milníky",
    ],
    outputs: ["Lean Canvas projektu", "Zvolený model byznysu"],
  },
  3: {
    skills: ["finanční plánování", "výpočet návratnosti a bodu zvratu"],
    topics: [
      "Business case na 24 měsíců: tržby, náklady, cash flow",
      "Bod zvratu, ROI, PNO a LTV/CAC",
      "Daňový režim a forma podnikání (OSVČ, paušální daň, s.r.o.)",
    ],
    outputs: ["Business case v Excelu"],
  },
  4: {
    skills: ["tvorba webu a e-shopu", "nastavení prodejního trychtýře"],
    topics: [
      "Doména, hosting a platforma podle modelu (Shoptet, WordPress a další)",
      "Platby, doprava a právní náležitosti (obchodní podmínky, GDPR, cookies)",
      "Prodejní trychtýř a automatické e-maily",
      "AI-first web: struktura, FAQ a data pro vyhledávače i AI",
    ],
    outputs: ["Spuštěný web nebo e-shop"],
  },
  5: {
    skills: ["výkonnostní marketing", "měření a vyhodnocování kampaní"],
    topics: [
      "Měření: Google Analytics 4 a Tag Manager",
      "PPC: Google Ads, Sklik, reklama na Facebooku",
      "SEO a viditelnost ve vyhledávání s AI",
      "Affiliate a A/B testování",
    ],
    outputs: ["Měřicí plán", "Otestované marketingové kanály s výsledky"],
  },
  6: {
    skills: ["uvedení produktu na trh", "řízení podle KPI"],
    topics: [
      "MVP a launch plán",
      "Klíčové ukazatele (KPI) a jejich sledování",
      "Živnostenský list, datová schránka a úřady",
      "První platící zákazníci a retence",
    ],
    outputs: ["Spuštěný projekt s prvními zákazníky"],
  },
  7: {
    skills: ["plánování růstu", "automatizace a vedení týmu"],
    topics: [
      "Růst podle marže a predikce zákazníků",
      "Automatizace procesů a první nábor",
      "Věrnostní program",
      "Caesarův kvadrant: rozložení energie",
    ],
    outputs: ["Plán růstu"],
  },
};

const phasesOf = (kind: CertificateKind, phase: number | null) =>
  kind === "gold" ? [1, 2, 3, 4, 5, 6, 7] : kind === "zamer" ? [1, 2, 3, 4] : phase ? [phase] : [];

/** Krátký výčet dovedností na přední stranu osvědčení. */
export const certificateSkills = (kind: CertificateKind, phase: number | null) =>
  phasesOf(kind, phase).flatMap((p) => PHASE_CONTENT[p]?.skills.slice(0, kind === "phase" ? 2 : 1) ?? []);

/** Obsah po fázích pro přílohu osvědčení. */
export const certificateSyllabus = (kind: CertificateKind, phase: number | null) =>
  phasesOf(kind, phase).map((p) => ({ phase: p, name: GATE_NAMES[p], ...PHASE_CONTENT[p] }));

export const certificateUrl = (code: string) => `${window.location.origin}/osvedceni/${code}`;

export const linkedInAddUrl = (c: Certificate) => {
  const d = new Date(c.issued_at);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: certificateTitle(c.kind, c.phase),
    organizationName: ISSUER_ORG,
    issueYear: String(d.getFullYear()),
    issueMonth: String(d.getMonth() + 1),
    certUrl: certificateUrl(c.code),
    certId: c.code,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
};

export async function issueCertificate(args: {
  projectId: string;
  kind: CertificateKind;
  phase?: number | null;
  holderName: string;
  launchUrl?: string | null;
}): Promise<{ code?: string; error?: string }> {
  const { data, error } = await supabase.rpc("issue_certificate", {
    p_project_id: args.projectId,
    p_kind: args.kind,
    p_phase: args.kind === "phase" ? (args.phase ?? null) : null,
    p_holder_name: args.holderName,
    p_launch_url: args.launchUrl ?? null,
  });
  if (error) return { error: error.message };
  return { code: data as string };
}

export async function verifyCertificate(code: string): Promise<Certificate | null> {
  const { data, error } = await supabase.rpc("verify_certificate", { p_code: code });
  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as Certificate;
}

export async function listMyCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from("certificates")
    .select("code, project_id, kind, phase, holder_name, project_name, launch_url, issued_at, ico")
    .order("issued_at", { ascending: false });
  if (error || !data) return [];
  return data as Certificate[];
}
