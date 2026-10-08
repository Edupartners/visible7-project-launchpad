import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Crown, ExternalLink, FileBadge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { CertificateIssueDialog } from "@/components/CertificateIssueDialog";
import { Certificate, CertificateKind, GATE_NAMES, certificateTitle, listMyCertificates } from "@/lib/certificates";

interface Offer {
  kind: CertificateKind;
  phase: number | null;
}

/** Získaná osvědčení a ta, která si uživatel může v aktuálním projektu vydat. */
export const CertificatesPanel = ({ completed }: { completed: number[] }) => {
  const { currentProject } = useProject();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [dialog, setDialog] = useState<Offer | null>(null);

  useEffect(() => {
    listMyCertificates().then(setCerts);
  }, [currentProject?.id]);

  const done = new Set(completed);
  const has = (kind: CertificateKind, phase: number | null) =>
    certs.some((c) => c.project_id === currentProject?.id && c.kind === kind && (c.phase ?? null) === phase);

  const offers: Offer[] = [];
  if ([1, 2, 3, 4, 5, 6, 7].every((p) => done.has(p)) && !has("gold", null)) offers.push({ kind: "gold", phase: null });
  if ([1, 2, 3, 4].every((p) => done.has(p)) && !has("zamer", null)) offers.push({ kind: "zamer", phase: null });
  [1, 2, 3, 4, 5, 6, 7].forEach((p) => {
    if (done.has(p) && !has("phase", p)) offers.push({ kind: "phase", phase: p });
  });

  if (certs.length === 0 && offers.length === 0) return null;

  return (
    <Card className="card-apple p-6">
      <div className="mb-4 flex items-center gap-2">
        <FileBadge className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Osvědčení</h2>
      </div>

      {offers.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-muted-foreground">K vydání v projektu „{currentProject?.name}“:</p>
          <div className="flex flex-wrap gap-2">
            {offers.map((o) => (
              <Button
                key={`${o.kind}-${o.phase ?? 0}`}
                variant={o.kind === "phase" ? "outline" : "default"}
                className={`rounded-xl ${o.kind === "gold" ? "bg-amber-500 text-white hover:bg-amber-500/90" : ""}`}
                onClick={() => setDialog(o)}
              >
                {o.kind === "gold" ? <Crown className="mr-2 h-4 w-4" /> : <Award className="mr-2 h-4 w-4" />}
                {o.kind === "phase" ? `Fáze ${o.phase}: ${GATE_NAMES[o.phase ?? 0]}` : certificateTitle(o.kind, o.phase)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {certs.length > 0 && (
        <ul className="divide-y divide-border/60">
          {certs.map((c) => (
            <li key={c.code} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{certificateTitle(c.kind, c.phase)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {c.project_name} · {new Date(c.issued_at).toLocaleDateString("cs-CZ")} · {c.code}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-lg">
                <Link to={`/osvedceni/${c.code}`}>
                  Zobrazit
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <CertificateIssueDialog
          open={!!dialog}
          onOpenChange={(o) => !o && setDialog(null)}
          kind={dialog.kind}
          phase={dialog.phase}
        />
      )}
    </Card>
  );
};
