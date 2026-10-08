import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { CertificateKind, certificateTitle, issueCertificate } from "@/lib/certificates";
import { useToast } from "@/hooks/use-toast";

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
    navigate(`/osvedceni/${code}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit}>
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
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
              <Input id="cert-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" autoFocus />
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
                  className="h-11 rounded-xl"
                />
                <p className="text-xs text-muted-foreground">Bude uvedený na osvědčení jako důkaz spuštění.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Zrušit
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={busy || name.trim().length < 3 || (kind === "gold" && !/^https?:\/\/\S+\.\S+/.test(url.trim()))}
            >
              {busy ? "Vydávám…" : "Vydat osvědčení"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
