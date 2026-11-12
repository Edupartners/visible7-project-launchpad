import { useCallback } from "react";
import { useProject } from "@/contexts/ProjectContext";

/** Hlavní adresa každé brány. */
export const GATE_MAIN: Record<number, string> = {
  1: "/vision",
  2: "/ideation",
  3: "/strategy",
  4: "/implementation",
  5: "/benchmarking-phase",
  6: "/launch",
  7: "/expansion",
};

const GATE_PATHS: [number, RegExp][] = [
  [1, /^\/vision(\/|$)/],
  [2, /^\/ideation(\/|$)/],
  [3, /^\/strategy(\/|$)/],
  [4, /^\/(implementation(\/|$)|business-type\/)/],
  [5, /^\/(benchmarking-phase(\/|$)|marketing-channel\/)/],
  [6, /^\/launch(\/|$)/],
  [7, /^\/expansion(\/|$)/],
];

/** Do které brány stránka patří (i detail modelu nebo kanálu). */
export const gateOfPath = (path: string): number | null => GATE_PATHS.find(([, re]) => re.test(path))?.[0] ?? null;

const gateOfRoute = (route: string) => {
  const n = Object.entries(GATE_MAIN).find(([, r]) => r === route)?.[0];
  return n ? Number(n) : null;
};

const key = (pid: string, gate: number) => `v7_resume_${pid}_${gate}`;

export const saveResume = (pid: string | undefined, url: string) => {
  const gate = gateOfPath(url.split(/[?#]/)[0]);
  if (!pid || !gate) return;
  try {
    localStorage.setItem(key(pid, gate), url);
  } catch {
    /* soukromé okno */
  }
};

export const readResume = (pid: string | undefined, gate: number) => {
  if (!pid) return null;
  try {
    const v = localStorage.getItem(key(pid, gate));
    return v && gateOfPath(v.split(/[?#]/)[0]) === gate ? v : null;
  } catch {
    return null;
  }
};

/**
 * „Pokračovat, kde jsem skončil“: z hlavní adresy brány udělá adresu posledního místa v bráně
 * (váš model nebo kanál a otevřený blok). Jiné adresy nechá být.
 */
export const useResume = () => {
  const { currentProject } = useProject();
  const pid = currentProject?.id;
  const resume = useCallback(
    (route: string) => {
      const gate = gateOfRoute(route);
      return (gate && readResume(pid, gate)) || route;
    },
    [pid],
  );
  const remember = useCallback((url: string) => saveResume(pid, url), [pid]);
  return { resume, remember };
};
