import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ConsentFields, ConsentValues } from "@/components/ConsentFields";
import { hasCurrentTerms, loadConsents, recordConsents } from "@/lib/consents";

/**
 * Stávající uživatelé (registrovaní před zavedením podmínek) nebo po změně podmínek
 * je musí potvrdit, než budou pokračovat. Klub a novinky jsou dobrovolné.
 */
export const ConsentGate = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [state, setState] = useState<"loading" | "needed" | "ok">("loading");
  const [values, setValues] = useState<ConsentValues>({ terms: false, klub: false, marketing: false });
  const [showOptional, setShowOptional] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConsents()
      .then((c) => {
        if (hasCurrentTerms(c)) return setState("ok");
        // Kdo už o klubu nebo novinkách rozhodl, toho se znovu neptáme.
        setShowOptional(!c.klub && !c.marketing);
        setState("needed");
      })
      .catch(() => setState("ok"));
  }, []);

  if (state === "ok") return <>{children}</>;
  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  const accept = async () => {
    setSaving(true);
    const ok = await recordConsents({
      podminky: true,
      zasady: true,
      ...(showOptional ? { klub: values.klub, marketing: values.marketing } : {}),
    });
    setSaving(false);
    if (!ok) {
      toast({ title: "Souhlas se nepodařilo uložit", description: "Zkuste to prosím znovu.", variant: "destructive" });
      return;
    }
    setState("ok");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Než budete pokračovat</h1>
        <p className="mt-2 text-muted-foreground">
          Aplikace VISIBLE7 má nové podmínky užívání a zásady zpracování osobních údajů. Potvrďte je prosím, abyste
          mohli pokračovat ve svých projektech.
        </p>
        <div className="mt-6">
          <ConsentFields value={values} onChange={setValues} showOptional={showOptional} />
        </div>
        <Button className="btn-apple mt-6 w-full" disabled={!values.terms || saving} onClick={accept}>
          {saving ? "Ukládám…" : "Potvrdit a pokračovat"}
        </Button>
      </div>
    </div>
  );
};
