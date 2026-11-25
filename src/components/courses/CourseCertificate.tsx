import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthGate";
import { useToast } from "@/hooks/use-toast";
import type { BlockVideoRow } from "@/lib/blockVideos";
import { Certificate, issueBonusCertificate, issueCourseCertificate, listMyCertificates } from "@/lib/certificates";
import { courseBonusId, type FeaturedCourse } from "@/lib/courses";
import { celebrate } from "@/lib/celebrate";
import { track } from "@/lib/track";

const sig = (v: BlockVideoRow) => `${v.vimeo_id}:${v.start_sec ?? ""}:${v.end_sec ?? ""}`;

/** Osvědčení o absolvování kurzu: postup, a když je všechno zhlédnuté, vystavení s vlastním jménem. */
export function CourseCertificate({
  course,
  videos,
  all,
  watched,
}: {
  course: FeaturedCourse;
  /** Kapitoly kurzu (bez zdvojení) */
  videos: BlockVideoRow[];
  /** Všechna videa, aby se počítala i kapitola zhlédnutá v jiné kartě */
  all: BlockVideoRow[];
  watched: Set<string>;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const [name, setName] = useState([meta.first_name, meta.last_name].filter(Boolean).join(" "));
  const [busy, setBusy] = useState(false);
  const [cert, setCert] = useState<Certificate | null>(null);
  const bonusId = courseBonusId(course);

  useEffect(() => {
    listMyCertificates().then((list) =>
      setCert(
        list.find((c) =>
          bonusId ? c.kind === "bonus" && c.bonus_key === bonusId : c.kind === "course" && c.bonus_key === course.id,
        ) ?? null,
      ),
    );
  }, [bonusId, course.id]);

  if (videos.length === 0) return null;
  const seenSigs = new Set(all.filter((v) => watched.has(v.id)).map(sig));
  const seen = videos.filter((v) => seenSigs.has(sig(v))).length;
  const pct = Math.round((seen / videos.length) * 100);

  if (cert) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Check className="h-4 w-4" aria-hidden="true" /> Osvědčení o absolvování kurzu máte (kód {cert.code}).
        </p>
        <Button asChild variant="outline" size="sm" className="rounded-[10px]">
          <Link to={`/osvedceni/${cert.code}`}>Zobrazit osvědčení</Link>
        </Button>
      </div>
    );
  }

  if (seen < videos.length) {
    return (
      <div className="rounded-2xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="font-semibold">Osvědčení o absolvování kurzu</span> si vystavíte po zhlédnutí všech lekcí.
            Máte {seen} z {videos.length}.
          </span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full bg-leaf-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { code, error } = bonusId
      ? await issueBonusCertificate(bonusId, name)
      : await issueCourseCertificate(course.id, name);
    setBusy(false);
    if (error || !code) {
      toast({ title: "Osvědčení se nepodařilo vydat", description: error, variant: "destructive" });
      return;
    }
    track("course_certificate", { course: course.id });
    celebrate();
    navigate(`/osvedceni/${code}`, { state: { fresh: true } });
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <p className="flex items-center gap-2 font-semibold">
        <Award className="h-5 w-5 text-primary" aria-hidden="true" /> Kurz máte za sebou. Vystavte si osvědčení o
        absolvování.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jméno a příjmení na osvědčení"
          aria-label="Jméno a příjmení na osvědčení"
          maxLength={120}
          className="sm:max-w-sm"
        />
        <Button type="submit" disabled={busy || name.trim().length < 3} className="rounded-[10px]">
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Vystavit osvědčení
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Osvědčení má ověřovací kód a odkaz, který přidáte na LinkedIn nebo pošlete zaměstnavateli.
      </p>
    </form>
  );
}
