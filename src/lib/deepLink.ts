import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Odkaz z hledání v lekcích: ?blok=<id karty>&lekce=<id videa>.
 * Otevře kartu, video si pak přehrávač vybere sám (useDeepLinkLesson).
 */
export function useDeepLinkBlock(ids: string[], open: (id: string) => void) {
  const [sp] = useSearchParams();
  const blok = sp.get("blok");
  const lekce = sp.get("lekce");
  useEffect(() => {
    if (!blok || !ids.includes(blok)) return;
    open(blok);
    if (!lekce) {
      const t = setTimeout(() => document.getElementById(`blok-${blok}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blok, lekce, ids.join(",")]);
}

/** Id lekce z odkazu, pokud patří do tohoto seznamu videí. */
export function useDeepLinkLesson(videoIds: string[]): string | null {
  const [sp] = useSearchParams();
  const lekce = sp.get("lekce");
  return lekce && videoIds.includes(lekce) ? lekce : null;
}
