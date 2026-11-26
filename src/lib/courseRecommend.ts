import { useEffect, useState } from "react";
import { supabase } from "@/integrations/visible7/client";
import { useAuth } from "@/components/AuthGate";
import { EntryAnswers, entryResult } from "@/lib/entryDiagnosis";

/** Které kurzy pomohou s oblastí ze vstupní diagnostiky. */
const SKILL_COURSES: Record<string, string[]> = {
  web: ["web"],
  texty: ["copy"],
  reklama: ["meta", "ppc"],
  mereni: ["ga4"],
};
/** Které kurzy se hodí k typu byznysu, který člověk chce dělat. */
const MODEL_COURSES: Record<string, string[]> = {
  eshop: ["shoptet"],
  "web-eshop": ["shoptet", "web"],
  blog: ["seo", "affiliate"],
  affiliate: ["affiliate", "seo"],
  lms: ["web"],
  "konverzni-web": ["web", "copy"],
};

/**
 * Doporučené kurzy podle vstupní diagnostiky: co se člověk potřebuje doučit a jaký byznys chce dělat.
 * Rychlý start = nejvýš 3 nejdůležitější kurzy, kompletní studium = všechny doporučené.
 */
export function recommendedCourses(a: EntryAnswers | null | undefined): string[] {
  if (!a) return [];
  const r = entryResult(a);
  const ids: string[] = [];
  const add = (xs: string[] = []) => xs.forEach((x) => !ids.includes(x) && ids.push(x));
  r.models.forEach((m) => add(MODEL_COURSES[m]));
  [...r.learn, ...r.some].forEach((s) => add(SKILL_COURSES[s.id]));
  add(["ga4"]);
  return a.level === "start" ? ids.slice(0, 3) : ids;
}

/** Kurzy, které si člověk sám vybral (uložené u účtu, platí pro všechny projekty). */
export function useMyCourses() {
  const { user } = useAuth();
  const initial = ((user?.user_metadata ?? {}) as { my_courses?: string[] }).my_courses ?? [];
  const [mine, setMine] = useState<string[]>(initial);
  useEffect(() => {
    setMine(((user?.user_metadata ?? {}) as { my_courses?: string[] }).my_courses ?? []);
  }, [user]);
  const toggle = async (id: string) => {
    const next = mine.includes(id) ? mine.filter((x) => x !== id) : [...mine, id];
    setMine(next);
    await supabase.auth.updateUser({ data: { my_courses: next } });
  };
  return { mine, toggle };
}
