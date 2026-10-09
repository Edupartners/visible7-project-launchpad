import { BUILD_TYPES } from "@/lib/buildPlans";

/** Typy online byznysu (výběr ve fázi 2, plán tvorby ve fázi 4 – viz lib/buildPlans). */
export const businessTypes = BUILD_TYPES.map(({ id, name, description, difficulty, duration }) => ({
  id,
  name,
  description,
  difficulty,
  duration,
}));
