import { Check } from "lucide-react";
import { MapPoint, rangeLabel } from "@/lib/diagnosis";

interface JourneyMapProps {
  points: MapPoint[];
  /** Body, které už uživatel skutečně splnil */
  reached?: MapPoint["id"][];
  dark?: boolean;
}

/** Mapa cesty A → B → C → D: na počítači vodorovně, na mobilu svisle. */
export const JourneyMap = ({ points, reached = ["A"], dark = false }: JourneyMapProps) => (
  <ol className="relative grid gap-6 md:grid-cols-4 md:gap-4" aria-label="Mapa cesty od nápadu k firmě">
    {/* Spojnice */}
    <span
      aria-hidden="true"
      className={`absolute left-6 top-6 h-[calc(100%-3rem)] w-0.5 md:left-[12.5%] md:right-[12.5%] md:top-6 md:h-0.5 md:w-auto ${
        dark ? "bg-white/20" : "bg-border"
      }`}
    />
    {points.map((p) => {
      const done = reached.includes(p.id);
      const key = p.id === "C";
      const never = p.id !== "A" && p.from === null;
      return (
        <li key={p.id} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
          <span
            className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${
              done
                ? "bg-emerald-500 text-white"
                : key
                  ? "bg-orange-500 text-white ring-4 ring-orange-500/25"
                  : dark
                    ? "border-2 border-white/40 bg-[hsl(var(--primary))] text-white"
                    : "border-2 border-primary bg-background text-primary"
            }`}
          >
            {done && p.id !== "A" ? <Check className="h-5 w-5" strokeWidth={3} /> : p.id}
          </span>
          <div className="min-w-0 pt-1 md:pt-0">
            <p className="font-bold">{p.title}</p>
            <p
              className={`text-sm font-semibold ${
                never
                  ? dark
                    ? "text-red-200"
                    : "text-red-700"
                  : key
                    ? dark
                      ? "text-orange-300"
                      : "text-orange-700"
                    : ""
              }`}
            >
              {rangeLabel(p)}
            </p>
            <p className={`mt-0.5 text-sm leading-snug ${dark ? "text-white/70" : "text-muted-foreground"}`}>
              {p.text}
            </p>
          </div>
        </li>
      );
    })}
  </ol>
);
