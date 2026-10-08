import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Download, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProject } from "@/contexts/ProjectContext";
import { CertificateIssueDialog } from "@/components/CertificateIssueDialog";
import {
  Certificate,
  CertificateKind,
  GATE_NAMES,
  certificateTitle,
  linkedInAddUrl,
  listMyCertificates,
} from "@/lib/certificates";

interface Offer {
  kind: CertificateKind;
  phase: number | null;
}

const offerLabel = (o: Offer) =>
  o.kind === "phase"
    ? `Fáze ${o.phase}: ${GATE_NAMES[o.phase ?? 0]}`
    : o.kind === "zamer"
      ? "Podnikatelský záměr (fáze 1–4)"
      : "VISIBLE7 Gold – spuštěný projekt";

/** Osvědčení: co si uživatel může vystavit a co už má ke stažení. */
export const CertificatesPanel = ({ completed }: { completed: number[] }) => {
  const { currentProject } = useProject();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [dialog, setDialog] = useState<Offer | null>(null);

  const reload = () => listMyCertificates().then(setCerts);

  useEffect(() => {
    reload();
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

  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="px-6 pb-4 pt-6 sm:px-8">
        <h2 className="text-xl font-bold">Osvědčení</h2>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Za každou dokončenou fázi si vystavíte osvědčení s ověřovacím kódem. Stáhnete ho jako PDF a můžete ho přidat na
          LinkedIn nebo do životopisu.
        </p>
      </div>

      {certs.length === 0 && offers.length === 0 && (
        <p className="border-t border-border px-6 py-4 text-sm text-muted-foreground sm:px-8">
          Zatím tu nic není. První osvědčení získáte po dokončení brány 1 – Modrý oceán.
        </p>
      )}

      {offers.length > 0 && (
        <ul className="border-t border-border">
          {offers.map((o) => (
            <li
              key={`${o.kind}-${o.phase ?? 0}`}
              className="flex flex-col gap-3 border-b border-border px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-8"
            >
              <div className="flex items-start gap-3">
                <Award className={`mt-0.5 h-5 w-5 shrink-0 ${o.kind === "gold" ? "text-gate-copper" : "text-primary"}`} />
                <div>
                  <p className="font-semibold">{offerLabel(o)}</p>
                  <p className="text-sm text-muted-foreground">Připraveno k vystavení pro projekt „{currentProject?.name}“</p>
                </div>
              </div>
              <Button className="btn-apple shrink-0 py-2" onClick={() => setDialog(o)}>
                Získat osvědčení
              </Button>
            </li>
          ))}
        </ul>
      )}

      {certs.length > 0 && (
        <>
          <h3 className="border-t border-border px-6 pb-1 pt-4 text-sm font-semibold text-muted-foreground sm:px-8">
            Vaše osvědčení
          </h3>
          <ul>
            {certs.map((c) => (
              <li
                key={c.code}
                className="flex flex-col gap-3 border-b border-border px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="min-w-0">
                  <Link to={`/osvedceni/${c.code}`} className="font-semibold hover:underline">
                    {certificateTitle(c.kind, c.phase)}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.project_name}, vystaveno {new Date(c.issued_at).toLocaleDateString("cs-CZ")}, kód {c.code}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="rounded-[10px]">
                    <Link to={`/osvedceni/${c.code}?stahnout`}>
                      <Download className="mr-1.5 h-4 w-4" />
                      Stáhnout PDF
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="rounded-[10px]">
                    <a href={linkedInAddUrl(c)} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="mr-1.5 h-4 w-4" />
                      Přidat na LinkedIn
                    </a>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {dialog && (
        <CertificateIssueDialog
          open={!!dialog}
          onOpenChange={(o) => {
            if (!o) {
              setDialog(null);
              reload();
            }
          }}
          kind={dialog.kind}
          phase={dialog.phase}
        />
      )}
    </section>
  );
};
