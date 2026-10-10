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
  return data as AdminOverview;
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

export function usersCsv(users: AdminUser[]) {
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
  ]);
  return "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
}
