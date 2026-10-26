import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Store } from "lucide-react";
import { loadProfile } from "@/lib/deadlines";

/** Na úvodní stránce pro ty, kdo už podnikají: vstup do „Můj podnik“. */
export const MyBusinessTeaser = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let alive = true;
    loadProfile().then((p) => alive && setShow(!!p && p.form !== "nezacal"));
    return () => {
      alive = false;
    };
  }, []);
  if (!show) return null;
  return (
    <Link
      to="/muj-podnik"
      className="group flex items-center gap-4 rounded-2xl bg-leaf-800 p-5 text-white transition-colors hover:bg-leaf-900 sm:p-6"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Store className="h-5 w-5 text-leaf-300" aria-hidden="true" />
      </span>
      <span className="flex-1">
        <span className="block text-lg font-bold">Můj podnik</span>
        <span className="block text-sm text-white/75">Peníze, nejbližší termíny a úřady na jednom místě.</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
};
