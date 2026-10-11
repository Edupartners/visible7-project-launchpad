import { useEffect, useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { redeemPromo, takePendingPromo } from "@/lib/promo";

/** Pole pro zadání promo kódu. */
export function PromoRedeem({ onDone, dark = false }: { onDone?: () => void; dark?: boolean }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await redeemPromo(code);
    setBusy(false);
    setMsg({ ok: r.ok, text: r.message });
    if (r.ok) {
      setCode("");
      onDone?.();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Promo kód"
          aria-label="Promo kód"
          autoCapitalize="characters"
          className={`h-11 sm:max-w-xs ${dark ? "border-white/30 bg-white/10 text-white placeholder:text-white/50" : ""}`}
        />
        <Button
          type="submit"
          disabled={busy || !code.trim()}
          className="h-11 rounded-[10px]"
          variant={dark ? "secondary" : "default"}
        >
          <Ticket className="mr-2 h-4 w-4" /> Uplatnit kód
        </Button>
      </div>
      {msg && (
        <p
          role="status"
          className={`text-sm ${msg.ok ? (dark ? "text-emerald-300" : "text-emerald-700") : dark ? "text-orange-200" : "text-destructive"}`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}

/** Po přihlášení uplatní kód z pozvánky (?kod=…) a ohlásí výsledek. */
export function PromoAutoRedeem() {
  const { toast } = useToast();
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const kod = takePendingPromo();
    if (!kod) return;
    redeemPromo(kod).then((r) => {
      toast({
        title: r.ok ? "Promo kód uplatněn" : "Promo kód nešel uplatnit",
        description: r.message,
        variant: r.ok ? "default" : "destructive",
      });
      if (r.ok) setTimeout(() => window.location.reload(), 1500);
    });
  }, [toast]);
  return null;
}
