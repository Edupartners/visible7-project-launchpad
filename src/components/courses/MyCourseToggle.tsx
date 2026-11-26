import { Star } from "lucide-react";
import { useMyCourses } from "@/lib/courseRecommend";

/** Přidat / odebrat kurz z „Mých kurzů“ v profilu. */
export function MyCourseToggle({ id }: { id: string }) {
  const { mine, toggle } = useMyCourses();
  const on = mine.includes(id);
  return (
    <button
      type="button"
      onClick={() => toggle(id)}
      aria-pressed={on}
      className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
    >
      <Star className={`h-4 w-4 ${on ? "fill-amber-400 text-amber-500" : "text-muted-foreground"}`} />
      {on ? "V mých kurzech" : "Přidat do mých kurzů"}
    </button>
  );
}
