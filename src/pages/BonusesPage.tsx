import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Check, Gift, Loader2 } from "lucide-react";
import { SidebarLayout } from "@/components/layout/AppSidebar";
import { BlockVideo } from "@/components/BlockVideo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthGate";
import { useToast } from "@/hooks/use-toast";
import { BONUSES, Bonus, bonusBlock } from "@/lib/bonuses";
import { blockKey, useBlockVideos, videosLabel } from "@/lib/blockVideos";
import { Certificate, issueBonusCertificate, listMyCertificates } from "@/lib/certificates";
import { celebrate } from "@/lib/celebrate";
import { track } from "@/lib/track";

/** Osvědčení za bonus: odemkne se po zhlédnutí všech videí. */
function BonusCertificate({ bonus, cert, onIssued }: { bonus: Bonus; cert: Certificate | null; onIssued: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { videos, watched, ready } = useBlockVideos(blockKey("bonus", bonus.id));
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const [name, setName] = useState([meta.first_name, meta.last_name].filter(Boolean).join(" "));
  const [busy, setBusy] = useState(false);

  if (!ready || videos.length === 0) return null;
  const seen = videos.filter((v) => watched.has(v.id)).length;
  const allSeen = seen === videos.length;

  if (cert) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
          <Check className="h-4 w-4" /> Osvědčení máte vystavené (kód {cert.code}).
        </p>
        <Button asChild variant="outline" size="sm" className="rounded-[10px]">
          <Link to={`/osvedceni/${cert.code}`}>Zobrazit osvědčení</Link>
        </Button>
      </div>
    );
  }

  if (!allSeen) {
    return (
      <p className="flex items-center gap-2 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <Award className="h-4 w-4 shrink-0" />
        Po zhlédnutí všech videí si tu vystavíte osvědčení. Zatím máte {seen} z {videosLabel(videos.length)}.
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { code, error } = await issueBonusCertificate(bonus.id, name);
    setBusy(false);
    if (error || !code) {
      toast({ title: "Osvědčení se nepodařilo vydat", description: error, variant: "destructive" });
      return;
    }
    track("bonus_certificate", { bonus: bonus.id });
    celebrate();
    onIssued();
    navigate(`/osvedceni/${code}`, { state: { fresh: true } });
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <p className="flex items-center gap-2 font-semibold">
        <Award className="h-5 w-5 text-primary" /> Máte všechno zhlédnuté. Vystavte si osvědčení.
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
    </form>
  );
}

const BonusesPage = () => {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const reload = () => listMyCertificates().then(setCerts);
  useEffect(() => {
    reload();
  }, []);

  return (
    <SidebarLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        <header>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            <Gift className="h-8 w-8 text-primary" /> Bonusy
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Krátké videokurzy navíc, mimo sedm bran. Za každý si po zhlédnutí všech videí vystavíte osvědčení.
          </p>
        </header>

        {BONUSES.map((b) => (
          <section key={b.id} className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
            <div>
              <h2 className="text-2xl font-bold">{b.title}</h2>
              <p className="mt-1 max-w-3xl text-muted-foreground">{b.lead}</p>
              <p className="mt-2 max-w-3xl text-sm">{b.why}</p>
            </div>
            <BlockVideo block={bonusBlock(b)} area="bonus" />
            <BonusCertificate
              bonus={b}
              cert={certs.find((c) => c.kind === "bonus" && c.bonus_key === b.id) ?? null}
              onIssued={reload}
            />
          </section>
        ))}
      </div>
    </SidebarLayout>
  );
};

export default BonusesPage;
