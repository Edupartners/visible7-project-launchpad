import { ADVISORS, initials } from "@/lib/advisors";

/** Fotka lektora podle příjmení z karet poradců. Bez fotky vrací undefined (zobrazí se iniciály). */
export const lecturerPhoto = (name?: string | null) => {
  if (!name) return undefined;
  const surname = name.trim().split(/\s+/).slice(-1)[0];
  return ADVISORS.find((a) => a.name.includes(surname) && a.photo)?.photo;
};

/** Kolečko s fotkou lektora a jeho jméno. */
export const LecturerChip = ({
  name,
  size = "md",
  dark = false,
}: {
  name?: string | null;
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}) => {
  if (!name)
    return <span className={`text-sm ${dark ? "text-white/70" : "text-muted-foreground"}`}>Lektor bude upřesněn</span>;
  const photo = lecturerPhoto(name);
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      {photo ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          className={`${box} shrink-0 rounded-full object-cover ring-2 ${dark ? "ring-white/30" : "ring-white"} shadow-sm`}
        />
      ) : (
        <span
          className={`${box} flex shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            dark ? "bg-white/15 text-white" : "bg-leaf-100 text-leaf-800"
          }`}
          aria-hidden="true"
        >
          {initials(name)}
        </span>
      )}
      <span className={`truncate text-sm font-semibold ${dark ? "text-white" : ""}`}>{name}</span>
    </span>
  );
};
