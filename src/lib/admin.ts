import { useEffect, useState } from "react";
import { supabase } from "@/integrations/visible7/client";
import { useAuth } from "@/components/AuthGate";

export interface AdminProject {
  id: string;
  name: string;
  business_type: string | null;
  created_at: string;
  archived_at: string | null;
  last_activity: string;
  gates: number[];
  has_diagnosis: boolean;
  certificates: number;
  ai_calls: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  plan: string;
  access_until: string | null;
  promo_code_used: string | null;
  paid: boolean;
  klub: boolean | null;
  marketing: boolean | null;
  is_admin: boolean;
  projects: AdminProject[];
}

export interface AdminOverview {
  generated_at: string;
  users: AdminUser[];
}

/** Je přihlášený uživatel správce? Ověřuje databáze (tabulka admins), ne prohlížeč. null = ještě se ověřuje. */
export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase.rpc("is_admin").then(({ data }) => {
      if (alive) setIsAdmin(data === true);
    });
    return () => {
      alive = false;
    };
  }, [user]);
  return isAdmin;
};

export const loadAdminOverview = async (): Promise<AdminOverview> => {
  const { data, error } = await supabase.rpc("admin_overview");
  if (error) throw error;
  const overview = data as AdminOverview;
  // Zkušební přístup není platba.
  overview.users = overview.users.map((u) => ({ ...u, paid: u.paid && u.plan !== "trial" }));
  return overview;
};

const DAY = 86_400_000;
export const daysAgo = (iso: string | null | undefined) =>
  iso ? (Date.now() - new Date(iso).getTime()) / DAY : Infinity;

/** Nejvyšší souvislá brána, kterou projekt splnil (0 = jen diagnostika, -1 = nic). */
export const progressOf = (p: AdminProject) => {
  let n = 0;
  while (p.gates.includes(n + 1)) n++;
  return n === 0 && !p.has_diagnosis ? -1 : n;
};

export function adminStats(users: AdminUser[]) {
  const projects = users.flatMap((u) => u.projects.filter((p) => !p.archived_at));
  const funnel = [0, 1, 2, 3, 4, 5, 6, 7].map((gate) => ({
    gate,
    count: projects.filter((p) => (gate === 0 ? p.has_diagnosis || p.gates.length > 0 : p.gates.includes(gate))).length,
  }));
  return {
    users: users.length,
    new7: users.filter((u) => daysAgo(u.created_at) <= 7).length,
    active7: users.filter((u) => daysAgo(u.last_sign_in_at) <= 7).length,
    paid: users.filter((u) => u.paid).length,
    projects: projects.length,
    klub: users.filter((u) => u.klub).length,
    marketing: users.filter((u) => u.marketing).length,
    funnel,
  };
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Ochrana proti vzorcům při otevření v Excelu.
  const safe = /^[=+\-@]/.test(s) && !/^\+?[\d\s]+$/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export function usersCsv(users: AdminUser[], tagNames: (userId: string) => string[] = () => []) {
  const head = [
    "Jméno",
    "E-mail",
    "Telefon",
    "Registrace",
    "Poslední přihlášení",
    "Tarif",
    "Přístup do",
    "Klub",
    "Marketing",
    "Projekty",
    "Splněné brány (max)",
    "Štítky",
  ];
  const rows = users.map((u) => [
    u.name,
    u.email,
    u.phone,
    u.created_at?.slice(0, 10),
    u.last_sign_in_at?.slice(0, 10),
    u.plan,
    u.access_until?.slice(0, 10),
    u.klub ? "ano" : "ne",
    u.marketing ? "ano" : "ne",
    u.projects
      .filter((p) => !p.archived_at)
      .map((p) => p.name)
      .join("; "),
    Math.max(0, ...u.projects.map((p) => p.gates.length)),
    tagNames(u.id).join(", "),
  ]);
  return "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
}

export interface EventStats {
  days: number;
  events: { name: string; count: number; users: number }[];
  daily: { day: string; users: number }[];
}

export const loadEventStats = async (days = 30): Promise<EventStats> => {
  const { data, error } = await supabase.rpc("admin_event_stats", { p_days: days });
  if (error) throw error;
  return data as EventStats;
};

/** Srozumitelné názvy událostí pro přehled. */
export const EVENT_LABELS: Record<string, string> = {
  mega_menu_open: "Otevřel menu Kurzy a videa",
  signup: "Registrace",
  trial_started: "Zkušební přístup zahájen",
  premium_blocked: "Narazil na placenou funkci",
  quiz_start: "Kvíz spuštěn",
  quiz_done: "Kvíz dokončen",
  session_start: "Návštěva aplikace",
  rentgen_start: "Rentgen spuštěn",
  rentgen_done: "Rentgen dokončen",
  rentgen_error: "Rentgen selhal",
  gate_start: "Brána otevřena",
  gate_complete: "Brána dokončena",
  ai_call: "Volání AI",
  promo_redeemed: "Promo kód uplatněn",
  reminder_sent: "Připomínka e-mailem odeslána",
  purchase: "Zaplacené členství",
  promo_failed: "Neplatný promo kód",
  video_play: "Přehrání videa",
  excel_export: "Export do Excelu",
  pitch_pdf: "Pitch stažen do PDF",
  certificate_issued: "Osvědčení vydáno",
  advisor_click: "Kontakt na poradce",
  nsk_interest: "Zájem o zkoušku NSK",
};

/** Kdo jsou uživatelé – rozložení odpovědí z kvízu (poslední vstupní pokus každého uživatele). */
export interface QuizStats {
  respondents: number;
  research_consents: number;
  repeated: number;
  dims: Record<string, { value: string; count: number }[]>;
}

export const loadQuizStats = async (): Promise<QuizStats> => {
  const { data, error } = await supabase.rpc("admin_quiz_stats");
  if (error) throw error;
  return data as QuizStats;
};

interface ResearchRow {
  respondent: string;
  stage: string;
  day: string;
  version: string;
  answers: Record<string, string | number> | null;
  result: { type?: string; barrier?: string; barrierScore?: number; scores?: Record<string, number> } | null;
  gates_done: number[] | null;
}

/** Pseudonymizovaný export pro výzkum – jen uživatelé se souhlasem, bez jmen a e-mailů. */
export async function researchCsv() {
  const { data, error } = await supabase.rpc("admin_research_export");
  if (error) throw error;
  const rows = (data ?? []) as ResearchRow[];
  const answerKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.answers ?? {})))).sort();
  const scoreKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.result?.scores ?? {})))).sort();
  const head = [
    "respondent",
    "etapa",
    "datum",
    "verze",
    ...answerKeys,
    "typ",
    "bariera",
    ...scoreKeys.map((k) => `skore_${k}`),
    "splnene_brany",
    "pocet_bran",
  ];
  const lines = rows.map((r) => [
    r.respondent,
    r.stage,
    r.day,
    r.version,
    ...answerKeys.map((k) => r.answers?.[k]),
    r.result?.type,
    r.result?.barrier,
    ...scoreKeys.map((k) => r.result?.scores?.[k]),
    (r.gates_done ?? []).sort((a, b) => a - b).join(" "),
    (r.gates_done ?? []).length,
  ]);
  return { csv: "﻿" + [head, ...lines].map((l) => l.map(csvCell).join(";")).join("\r\n"), count: rows.length };
}
