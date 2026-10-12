import { useEffect, useState } from "react";
import { MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/visible7/client";

const KIND_LABELS: Record<string, string> = {
  rentgen: "Nezačatý Rentgen (1 den po registraci)",
  gate: "Rozdělaná cesta (3 dny bez aktivity)",
  trial_end: "Konec zkušebního přístupu (den předem)",
  inactive14: "14 dní bez aktivity (poslední)",
};

interface Stats {
  days: number;
  unsubscribed: number;
  kinds: { kind: string; sent: number; returned: number }[];
}

/** Připomínky e-mailem: co odešlo, kolik lidí se vrátilo, ukázky pro správce. */
export function RemindersAdmin() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .rpc("admin_reminder_stats", { p_days: 30 })
      .then(({ data }: { data: Stats | null }) => setStats(data));
  }, []);

  const sendTest = async () => {
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.functions.invoke("reminders", { body: { test: true } });
    setBusy(false);
    setMsg(
      error
        ? "Ukázky se nepodařilo odeslat."
        : `Ukázky (${(data as { sent: number }).sent}) odeslány na ${(data as { to: string }).to}.`,
    );
  };

  const byKind = Object.fromEntries((stats?.kinds ?? []).map((k) => [k.kind, k]));

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MailCheck className="h-5 w-5" /> Připomínky e-mailem
          </h2>
          <p className="text-sm text-muted-foreground">
            Odcházejí automaticky každé ráno, nejvýš jedna za 3 dny na člověka. „Vrátili se“ = přišli do aplikace do 3
            dnů od e-mailu.
          </p>
        </div>
        <Button variant="outline" className="rounded-[10px]" onClick={sendTest} disabled={busy}>
          <Send className="mr-2 h-4 w-4" /> Poslat ukázky sobě
        </Button>
      </div>
      {msg && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {msg}
        </p>
      )}
      <table className="mt-4 w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="py-2 font-semibold">Připomínka (posledních 30 dní)</th>
            <th className="py-2 text-right font-semibold">Odesláno</th>
            <th className="py-2 text-right font-semibold">Vrátili se</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(KIND_LABELS).map(([k, label]) => (
            <tr key={k} className="border-t border-border">
              <td className="py-2">{label}</td>
              <td className="py-2 text-right tabular-nums">{byKind[k]?.sent ?? 0}</td>
              <td className="py-2 text-right font-semibold tabular-nums">{byKind[k]?.returned ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {stats && <p className="mt-3 text-xs text-muted-foreground">Připomínky si vypnulo: {stats.unsubscribed}</p>}
    </section>
  );
}
