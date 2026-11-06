/** Fáze průvodce: uvítání → po rentgenu → po nejvyšší dokončené bráně. */
export const stageFor = (hasDiagnosis: boolean, completed: number[]) => {
  const top = Math.max(0, ...completed.filter((n) => n >= 1 && n <= 7));
  if (top > 0) return String(top);
  return hasDiagnosis ? "rentgen" : "welcome";
};
