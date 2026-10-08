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
}

export const GATE_NAMES: Record<number, string> = {
  1: "Modrý oceán",
  2: "Lean Canvas",
  3: "Byznys case",
  4: "Tvorba",
  5: "Marketing a testování",
  6: "Launch",
  7: "Růst",
};

export const ISSUER_LINE = "Edu Partners s.r.o. | Partner: World eCommerce Business School | VISIBLE7 MICEK™";
export const ISSUER_ORG = "Edu Partners s.r.o.";

/** Název osvědčení tak, jak se zobrazí na osvědčení a na LinkedInu. */
export const certificateTitle = (kind: CertificateKind, phase: number | null) => {
  if (kind === "gold") return "VISIBLE7 Gold – Spuštěný projekt";
  if (kind === "zamer") return "VISIBLE7 MICEK™ – Podnikatelský záměr";
  return `VISIBLE7 MICEK™ – Fáze ${phase}: ${GATE_NAMES[phase ?? 0] ?? ""}`;
};

export const certificateDescription = (kind: CertificateKind, phase: number | null) => {
  if (kind === "gold")
    return "za projití všech sedmi bran metodiky VISIBLE7 MICEK™ a spuštění vlastního projektu na trh";
  if (kind === "zamer")
    return "za zpracování podnikatelského záměru ve fázích 1–4 metodiky VISIBLE7 MICEK™: modrý oceán, Lean Canvas, byznys case a tvorba";
  return `za absolvování fáze ${phase} – ${GATE_NAMES[phase ?? 0] ?? ""} – metodiky VISIBLE7 MICEK™`;
};

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
    p_phase: args.kind === "phase" ? args.phase ?? null : null,
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
    .select("code, project_id, kind, phase, holder_name, project_name, launch_url, issued_at")
    .order("issued_at", { ascending: false });
  if (error || !data) return [];
  return data as Certificate[];
}
