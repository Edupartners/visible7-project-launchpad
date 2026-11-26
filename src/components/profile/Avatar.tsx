import { useAuth } from "@/components/AuthGate";

/** Iniciály ze jména, jinak z e-mailu. */
export const initialsOf = (first?: string, last?: string, email?: string) => {
  const i = `${(first ?? "").trim()[0] ?? ""}${(last ?? "").trim()[0] ?? ""}`;
  return (i || (email ?? "?").slice(0, 2)).toUpperCase();
};

/** Profilová fotka uživatele, nebo iniciály na barevném podkladu. */
export function UserAvatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  const { user } = useAuth();
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string; avatar_url?: string };
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };
  return meta.avatar_url ? (
    <img src={meta.avatar_url} alt="" style={style} className={`shrink-0 rounded-full object-cover ${className}`} />
  ) : (
    <span
      style={style}
      className={`flex shrink-0 items-center justify-center rounded-full bg-leaf-500 font-bold text-white ${className}`}
      aria-hidden="true"
    >
      {initialsOf(meta.first_name, meta.last_name, user?.email ?? "")}
    </span>
  );
}
