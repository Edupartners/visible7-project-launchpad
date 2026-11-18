import { useEffect, useState } from "react";
import { supabase } from "@/integrations/visible7/client";
import { useAuth } from "@/components/AuthGate";

/** Rozvrh semestrálního studia: povinná setkání (čtvrtky). Nepovinná setkání jsou semináře. */
export const SEMESTER = "2027-jaro";

export interface StudySession {
  id: string;
  code: string | null;
  sort: number;
  starts_at: string | null;
  duration_min: number;
  topic: string;
  gate: string | null;
  lecturer: string | null;
  place: string;
  note: string | null;
  meet_url: string | null;
  recording_url: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export async function loadStudySessions(): Promise<StudySession[]> {
  const { data, error } = await db
    .from("study_sessions")
    .select("id, code, sort, starts_at, duration_min, topic, gate, lecturer, place, note, meet_url, recording_url")
    .eq("semester", SEMESTER)
    .order("sort");
  if (error) return [];
  return (data ?? []) as StudySession[];
}

/** Je přihlášený uživatel studentem semestru? (null = zjišťuje se) */
export const useIsStudent = () => {
  const { user } = useAuth();
  const [is, setIs] = useState<boolean | null>(null);
  useEffect(() => {
    if (!user) {
      setIs(false);
      return;
    }
    let active = true;
    db.from("study_students")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }: { data: unknown }) => active && setIs(!!data));
    return () => {
      active = false;
    };
  }, [user]);
  return is;
};

export const sessionEnd = (s: Pick<StudySession, "starts_at" | "duration_min">) =>
  s.starts_at ? new Date(new Date(s.starts_at).getTime() + s.duration_min * 60000) : null;

/** Setkání, které právě běží nebo je nejbližší. */
export const nextSession = (list: StudySession[], now = Date.now()) =>
  list.find((s) => s.starts_at && (sessionEnd(s)?.getTime() ?? 0) > now) ?? list.find((s) => !s.starts_at) ?? null;

/** Odkaz na připojení ukážeme 30 minut před začátkem až do konce. */
export const canJoin = (s: StudySession, now = Date.now()) =>
  !!s.meet_url &&
  !!s.starts_at &&
  now >= new Date(s.starts_at).getTime() - 30 * 60000 &&
  now <= (sessionEnd(s)?.getTime() ?? 0);

export const formatSessionDate = (iso: string | null) => {
  if (!iso) return "Termín upřesníme";
  const d = new Date(iso);
  const day = d.toLocaleDateString("cs-CZ", {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    timeZone: "Europe/Prague",
  });
  const time = d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague" });
  return `${day} · ${time}`;
};

// Správa (jen pro správce, hlídá RLS a funkce na serveru)
export async function updateStudySession(id: string, patch: Partial<StudySession>) {
  const { error } = await db
    .from("study_sessions")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  return error?.message ?? null;
}
export async function loadStudents(): Promise<{ user_id: string; email: string; added_at: string }[]> {
  const { data } = await db.rpc("admin_students");
  return (data ?? []) as { user_id: string; email: string; added_at: string }[];
}
export async function addStudent(email: string) {
  const { error } = await db.rpc("admin_add_student", { p_email: email });
  return error?.message ?? null;
}
export async function removeStudent(userId: string) {
  const { error } = await db.from("study_students").delete().eq("user_id", userId);
  return error?.message ?? null;
}
