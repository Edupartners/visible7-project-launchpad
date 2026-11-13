import { supabase } from "@/integrations/visible7/client";

/** Kontrolní otázky před osvědčením. Otázky losuje a hodnotí server, správné odpovědi klient nemá. */
export const QUIZ_GATES = [1, 2, 3, 4, 5];
export const QUIZ_SIZE = 5;
export const QUIZ_PASS = 4;

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}
export interface QuizRun {
  attempt: string;
  gate: number;
  questions: QuizQuestion[];
}
export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
  results: {
    id: string;
    chosen: number;
    correct: number;
    ok: boolean;
    explanation: string | null;
    topic: string | null;
  }[];
}

/** Které brány kontrolní otázky vyžaduje osvědčení. */
export const quizGatesFor = (kind: string, phase: number | null) =>
  kind === "zamer" ? QUIZ_GATES : kind === "phase" && phase && QUIZ_GATES.includes(phase) ? [phase] : [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (fn: string, args: Record<string, unknown>) => (supabase as any).rpc(fn, args);

export async function quizStatus(projectId: string): Promise<number[]> {
  const { data, error } = await rpc("quiz_status", { p_project_id: projectId });
  if (error || !Array.isArray(data)) return [];
  return data as number[];
}

export async function startQuiz(projectId: string, gate: number): Promise<{ run?: QuizRun; error?: string }> {
  const { data, error } = await rpc("quiz_start", { p_project_id: projectId, p_gate: gate });
  if (error) return { error: error.message };
  return { run: data as QuizRun };
}

export async function submitQuiz(attempt: string, answers: number[]): Promise<{ result?: QuizResult; error?: string }> {
  const { data, error } = await rpc("quiz_submit", { p_attempt: attempt, p_answers: answers });
  if (error) return { error: error.message };
  return { result: data as QuizResult };
}
