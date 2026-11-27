import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Dlaždice na úvodní stránce: stejný styl jako v profilu, klik otevře stránku. */
export function HomeTile({
  to,
  icon,
  value,
  label,
  color,
  className = "",
}: {
  to: string;
  icon: ReactNode;
  value: string;
  label: string;
  color: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`flex h-36 w-full flex-col justify-between overflow-hidden rounded-2xl p-4 text-white transition-[filter] hover:brightness-110 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring sm:h-40 sm:p-5 ${color} ${className}`}
    >
      {icon}
      <span>
        <span
          className={`block truncate font-extrabold leading-none tracking-tight ${
            value.length > 6 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {value}
        </span>
        <span className="mt-1 block text-xs font-semibold leading-tight opacity-90 sm:text-sm">{label}</span>
      </span>
    </Link>
  );
}
