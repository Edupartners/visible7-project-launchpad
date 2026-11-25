import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Check } from "lucide-react";
import { useAllBlockVideos, type BlockVideoRow } from "@/lib/blockVideos";
import { Certificate, listMyCertificates } from "@/lib/certificates";
import { FEATURED_COURSES, courseBonusId, courseVideos } from "@/lib/courses";

const sig = (v: BlockVideoRow) => `${v.vimeo_id}:${v.start_sec ?? ""}:${v.end_sec ?? ""}`;

/**
 * Kurzy, do kterých patří videa z této stránky, s postupem a osvědčením o absolvování.
 * Videa zhlédnutá tady se do kurzu započítají.
 */
export function RelatedCourses({ blockKeys }: { blockKeys: string[] }) {
  const { videos: all, watched, ready } = useAllBlockVideos();
  const [certs, setCerts] = useState<Certificate[]>([]);
  useEffect(() => {
    listMyCertificates().then(setCerts);
  }, []);

  const courses = FEATURED_COURSES.filter((c) => c.keys.some((k) => blockKeys.includes(k)));
  if (!ready || courses.length === 0) return null;
  const seenSigs = new Set(all.filter((v) => watched.has(v.id)).map(sig));

  const rows = courses
    .map((c) => {
      const vids = courseVideos(c, all);
      const seen = vids.filter((v) => seenSigs.has(sig(v))).length;
      const bonusId = courseBonusId(c);
      const cert = certs.find((x) =>
        bonusId ? x.kind === "bonus" && x.bonus_key === bonusId : x.kind === "course" && x.bonus_key === c.id,
      );
      return { c, total: vids.length, seen, cert };
    })
    .filter((r) => r.total > 0);
  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="kurzy-osvedceni" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 id="kurzy-osvedceni" className="flex items-center gap-2 text-lg font-bold">
        <Award className="h-5 w-5 text-primary" aria-hidden="true" /> Kurzy a osvědčení o absolvování
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Videa z tohoto plánu patří do {rows.length === 1 ? "kurzu" : "kurzů"} níže. Co zhlédnete tady, započítá se. Po
        dokončení kurzu si vystavíte osvědčení.
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map(({ c, total, seen, cert }) => {
          const done = seen >= total;
          return (
            <li key={c.id} className="flex items-center gap-4">
              <img
                src={c.cover}
                alt=""
                loading="lazy"
                className="hidden h-12 w-20 shrink-0 rounded-lg object-cover sm:block"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">{c.title}</p>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div className="h-full bg-leaf-500" style={{ width: `${Math.round((seen / total) * 100)}%` }} />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {seen} z {total} lekcí
                  </span>
                </div>
              </div>
              {cert ? (
                <Link
                  to={`/osvedceni/${cert.code}`}
                  className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <Check className="h-4 w-4" aria-hidden="true" /> Osvědčení
                </Link>
              ) : (
                <Link
                  to={`/kurz/${c.id}`}
                  className={`inline-flex shrink-0 items-center rounded-xl px-3 py-2 text-sm font-bold ${
                    done ? "bg-primary text-white hover:bg-primary/90" : "border border-border hover:bg-muted"
                  }`}
                >
                  {done ? "Vystavit osvědčení" : "Otevřít kurz"}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
