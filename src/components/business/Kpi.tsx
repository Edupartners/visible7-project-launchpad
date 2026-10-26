/** Velké číslo v pásu (Můj podnik, Cash flow). */
export const Kpi = ({
  label,
  value,
  note,
  hero = false,
}: {
  label: string;
  value: string;
  note: string;
  hero?: boolean;
}) => (
  <div className={`rounded-2xl p-5 ${hero ? "bg-leaf-800 text-white" : "bg-card ring-1 ring-border"}`}>
    <p className={`text-xs font-bold uppercase tracking-[0.12em] ${hero ? "text-white/70" : "text-muted-foreground"}`}>
      {label}
    </p>
    <p className="mt-2 whitespace-nowrap text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl lg:text-[1.75rem] xl:text-3xl">
      {value}
    </p>
    <p className={`mt-1 text-sm ${hero ? "text-white/75" : "text-muted-foreground"}`}>{note}</p>
  </div>
);
