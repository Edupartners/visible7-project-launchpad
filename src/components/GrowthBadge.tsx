import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Compass, Crown, Eye, Hammer, Lightbulb, Megaphone, Rocket, TrendingUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/visible7/client";
import { useProject } from "@/contexts/ProjectContext";

interface Level {
  name: string;
  icon: LucideIcon;
  /** Co úroveň znamená */
  text: string;
}

/** Úroveň = počet otevřených bran v nejdále dotaženém projektu. */
export const LEVELS: Level[] = [
  { name: "Průzkumník", icon: Compass, text: "Právě vyrážíte. Otevřete první bránu." },
  { name: "Vizionář", icon: Eye, text: "Víte, čím se odlišíte od konkurence." },
  { name: "Architekt", icon: Lightbulb, text: "Máte celý byznys na jedné stránce." },
  { name: "Stratég", icon: TrendingUp, text: "Znáte svá čísla a víte, kolik potřebujete." },
  { name: "Tvůrce", icon: Hammer, text: "Váš projekt dostává skutečnou podobu." },
  { name: "Marketér", icon: Megaphone, text: "Víte, kde vaši zákazníci nakupují." },
  { name: "Zakladatel", icon: Rocket, text: "Projekt je venku. Gratulujeme." },
  { name: "Podnikatel Gold", icon: Crown, text: "Prošli jste všech 7 bran. Tohle dokáže málokdo." },
];

const MOTTOS = [
  "Štěstí přeje odvážným.",
  "Hotové je lepší než dokonalé.",
  "Malými kroky k velkým cílům.",
  "Nejlepší čas začít byl včera. Druhý nejlepší je dnes.",
  "Kdo chce, hledá způsob. Kdo nechce, hledá důvod.",
  "Nejdřív se dívej, kolik můžeš ztratit, ne kolik vyděláš.",
  "Každý expert byl jednou začátečník.",
  "Cesta vzniká tím, že po ní jdeš.",
  "Odvaha neznamená nebát se. Znamená jít i tak.",
  "Bez práce nejsou koláče.",
];

/** Heslo dne – každý den jiné, pro všechny stejné. */
export const mottoOfDay = (d = new Date()) => {
  const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86_400_000);
  return MOTTOS[day % MOTTOS.length];
};

/** Barva odznaku podle úrovně: bronz → stříbro → zlato. */
const tier = (lvl: number) =>
  lvl >= 7
    ? { fill: "#d4a017", ring: "#f5d76e", text: "#fff" }
    : lvl >= 5
      ? { fill: "#c9971c", ring: "#f0d58a", text: "#fff" }
      : lvl >= 3
        ? { fill: "#8a96a8", ring: "#d5dbe4", text: "#fff" }
        : lvl >= 1
          ? { fill: "#a8612f", ring: "#e3b48f", text: "#fff" }
          : { fill: "#cbd5e1", ring: "#e2e8f0", text: "#334155" };

export const BadgeIcon = ({ level, size = 44 }: { level: number; size?: number }) => {
  const Icon = LEVELS[level].icon;
  const t = tier(level);
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" className="absolute inset-0">
        <path d="M24 2 43 13v22L24 46 5 35V13z" fill={t.fill} stroke={t.ring} strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <Icon className="relative" style={{ width: size * 0.42, height: size * 0.42, color: t.text }} strokeWidth={2.2} />
    </span>
  );
};

/** Osobní odznak vpravo nahoře: úroveň podle otevřených bran a heslo dne. */
export const GrowthBadge = ({ currentCompleted }: { currentCompleted: number }) => {
  const { projects } = useProject();
  const [best, setBest] = useState(0);
  const ids = projects.map((p) => p.id).join(",");

  useEffect(() => {
    if (!ids) return;
    supabase
      .from("project_data")
      .select("data_value")
      .eq("data_key", "completed_phases")
      .in("project_id", ids.split(","))
      .then(({ data }) => {
        const counts = ((data ?? []) as { data_value: unknown }[]).map((r) =>
          Array.isArray(r.data_value) ? new Set(r.data_value as number[]).size : 0,
        );
        setBest(Math.max(0, ...counts));
      });
  }, [ids]);

  const level = Math.min(Math.max(best, currentCompleted), 7);
  const current = LEVELS[level];
  const next = level < 7 ? LEVELS[level + 1] : null;
  const motto = mottoOfDay();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card py-2 pl-2 pr-4 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Váš odznak: ${current.name}, úroveň ${level} ze 7. Zobrazit podrobnosti.`}
        >
          <BadgeIcon level={level} />
          <span className="min-w-0">
            <span className="block text-xs text-muted-foreground">Úroveň {level} ze 7</span>
            <span className="block font-bold leading-tight">{current.name}</span>
            <span className="hidden max-w-[15rem] truncate text-xs italic text-muted-foreground sm:block">{motto}</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-3">
            <BadgeIcon level={level} size={56} />
            <div>
              <p className="text-lg font-bold leading-tight">{current.name}</p>
              <p className="text-sm text-muted-foreground">{current.text}</p>
            </div>
          </div>
          <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm italic">„{motto}“</p>
        </div>
        <ol className="max-h-72 overflow-y-auto p-2">
          {LEVELS.map((l, i) => (
            <li
              key={l.name}
              className={`flex items-center gap-3 rounded-lg px-2 py-1.5 ${i === level ? "bg-orange-50" : ""} ${
                i > level ? "opacity-45" : ""
              }`}
            >
              <BadgeIcon level={i} size={28} />
              <span className="flex-1 text-sm font-semibold">{l.name}</span>
              <span className="text-xs text-muted-foreground">{i === 0 ? "start" : `brána ${i}`}</span>
            </li>
          ))}
        </ol>
        {next && (
          <p className="border-t border-border p-3 text-sm text-muted-foreground">
            Další odznak <span className="font-semibold text-foreground">{next.name}</span> získáte otevřením brány{" "}
            {level + 1}.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
};
