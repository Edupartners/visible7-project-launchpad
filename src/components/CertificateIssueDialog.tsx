import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { CertificateKind, certificateTitle, issueCertificate } from "@/lib/certificates";
import { useToast } from "@/hooks/use-toast";
import { useAccess } from "@/lib/access";
import { PremiumLock } from "@/components/access/Locks";
import { BusinessVerification, loadVerification } from "@/lib/tradeLicense";
import { GateQuiz } from "@/components/GateQuiz";
import { quizGatesFor, quizStatus } from "@/lib/gateQuiz";

interface CertificateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: CertificateKind;
  phase?: number | null;
}

/** Potvrzení jména (a u Gold odkazu na spuštěný projekt) a vydání osvědčení. */
export const CertificateIssueDialog = ({ open, onOpenChange, kind, phase = null }: CertificateIssueDialogProps) => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const { toast } = useToast();
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const [name, setName] = useState([meta.first_name, meta.last_name].filter(Boolean).join(" "));
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const access = useAccess();
  const locked = !access.premium && (kind !== "phase" || (phase ?? 0) >= 3);
  const [business, setBusiness] = useState<BusinessVerification | null | undefined>(undefined);

  useEffect(() => {
    if (!open || kind !== "gold" || !currentProject) return;
    let active = true;
    loadVerification(currentProject.id).then((v) => active && setBusiness(v));
    return () => {
      active = false;
    };
  }, [open, kind, currentProject]);
  const needsIco = kind === "gold" && business === null;

  // Kontrolní otázky: osvědčení za brány 1–5 (a za záměr) až po jejich splnění.
  const quizGates = quizGatesFor(kind, phase);
  const [passed, setPassed] = useState<number[] | null>(null);
  useEffect(() => {
    if (!open || !currentProject || quizGates.length === 0) return;
    let active = true;
    setPassed(null);
    quizStatus(currentProject.id).then((g) => active && setPassed(g));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentProject, kind, phase]);
  const missingQuiz = quizGates.filter((g) => !(passed ?? []).includes(g));
  const quizLoading = quizGates.length > 0 && passed === null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    setBusy(true);
    const { code, error } = await issueCertificate({
      projectId: currentProject.id,
      kind,
      phase,
      holderName: name,
      launchUrl: kind === "gold" ? url : null,
    });
    setBusy(false);
    if (error || !code) {
      toast({ title: "Osvědčení se nepodařilo vydat", description: error, variant: "destructive" });
      return;
    }
    onOpenChange(false);
    navigate(`/osvedceni/${code}`, { state: { fresh: true } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto ${!locked && missingQuiz.length > 0 ? "sm:max-w-2xl" : "sm:max-w-md"}`}
      >
        {locked ? (
          <div>
            <DialogHeader>
              <DialogTitle>{certificateTitle(kind, phase)}</DialogTitle>
              <DialogDescription>Bránu máte hotovou. Osvědčení vás čeká.</DialogDescription>
            </DialogHeader>
            <div className="mt-5">
              <PremiumLock feature="certificate" compact />
            </div>
          </div>
        ) : quizLoading ? (
          <div className="py-10 text-center text-muted-foreground">
            <DialogTitle className="sr-only">{certificateTitle(kind, phase)}</DialogTitle>
            Načítám…
          </div>
        ) : missingQuiz.length > 0 && currentProject ? (
          <div>
            <DialogTitle className="sr-only">Kontrolní otázky</DialogTitle>
            {quizGates.length > 1 && (
              <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-sm">
                Osvědčení {certificateTitle(kind, phase)} vyžaduje kontrolní otázky ke všem branám 1–5. Zbývá:{" "}
                {missingQuiz.map((g) => `brána ${g}`).join(", ")}.
              </p>
            )}
            <GateQuiz
              key={missingQuiz[0]}
              projectId={currentProject.id}
              gate={missingQuiz[0]}
              onPassed={() => setPassed((p) => [...(p ?? []), missingQuiz[0]])}
              onClose={() => onOpenChange(false)}
            />
          </div>
        ) : needsIco ? (
          <div>
            <DialogHeader>
              <DialogTitle>{certificateTitle(kind, phase)}</DialogTitle>
              <DialogDescription>
                Gold dokládá, že projekt opravdu podniká. Proto potřebuje IČO ověřené v registru ARES.
              </DialogDescription>
            </DialogHeader>
            <p className="my-5 text-sm text-muted-foreground">
              Na kartě „Založte živnost online“ v bráně 5 nebo 6 zadáte IČO – nové i to, pod kterým už podnikáte.
              Ověření trvá pár vteřin.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-[10px]" onClick={() => onOpenChange(false)}>
                Zavřít
              </Button>
              <Button
                type="button"
                className="rounded-[10px]"
                onClick={() => {
                  onOpenChange(false);
                  navigate("/launch");
                }}
              >
                Ověřit IČO
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>{certificateTitle(kind, phase)}</DialogTitle>
              <DialogDescription>
                Zkontrolujte jméno – na osvědčení bude přesně takhle a později ho už nepůjde změnit.
                {currentProject && ` Projekt: ${currentProject.name}.`}
              </DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="cert-name">
                  Jméno a příjmení
                </label>
                <Input
                  id="cert-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-[10px]"
                  autoFocus
                />
              </div>
              {kind === "gold" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="cert-url">
                    Odkaz na spuštěný projekt
                  </label>
                  <Input
                    id="cert-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                    className="h-11 rounded-[10px]"
                  />
                  <p className="text-xs text-muted-foreground">Bude uvedený na osvědčení jako důkaz spuštění.</p>
                </div>
              )}
              {kind === "gold" && business && (
                <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
                  Na osvědčení bude i ověřené IČO {business.ico} ({business.name}).
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-[10px]" onClick={() => onOpenChange(false)}>
                Zrušit
              </Button>
              <Button
                type="submit"
                className="rounded-[10px]"
                disabled={
                  busy ||
                  name.trim().length < 3 ||
                  (kind === "gold" && !business) ||
                  (kind === "gold" && !/^https?:\/\/\S+\.\S+/.test(url.trim()))
                }
              >
                {busy ? "Vystavuji…" : "Získat osvědčení"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
