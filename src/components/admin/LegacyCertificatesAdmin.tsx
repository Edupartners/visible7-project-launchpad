import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/visible7/client";

interface Row {
  lw_cert_id: string | null;
  holder_name: string;
  bonus_key: string;
  pdf_path: string | null;
  applied_at: string | null;
}

/**
 * Převedené certifikáty z LearnWorlds: správce nahraje původní PDF (může všechna najednou).
 * Soubor se páruje podle ID certifikátu v názvu (24 znaků 0–9 a–f), majitel si ho pak stáhne v profilu.
 */
export function LegacyCertificatesAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [waiting, setWaiting] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);

  const load = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("pending_certificates")
      .select("lw_cert_id, holder_name, bonus_key, pdf_path, applied_at")
      .order("holder_name");
    setRows((data as Row[]) ?? []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from("shop_purchases")
      .select("id", { count: "exact", head: true })
      .eq("id_product", "learnworlds-prevod")
      .is("applied_at", null);
    setWaiting(count ?? 0);
  };

  const migrate = async () => {
    setMigrating(true);
    const { data, error } = await supabase.functions.invoke("migrate-users", { body: {} });
    setMigrating(false);
    const res = (data ?? {}) as { created?: number; failed?: string[]; error?: string };
    setLog(
      error || res.error
        ? [`Chyba: ${res.error ?? error?.message}`]
        : [`✓ Založeno účtů: ${res.created ?? 0}`, ...(res.failed ?? [])],
    );
    load();
  };
  useEffect(() => {
    load();
  }, []);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const out: string[] = [];
    for (const f of Array.from(files)) {
      const id = f.name.match(/[0-9a-f]{24}/)?.[0];
      if (!id) {
        out.push(`${f.name}: v názvu chybí ID certifikátu`);
        continue;
      }
      const path = `${id}.pdf`;
      const { error } = await supabase.storage
        .from("legacy-certificates")
        .upload(path, f, { upsert: true, contentType: "application/pdf" });
      if (error) {
        out.push(`${f.name}: ${error.message}`);
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: who, error: e2 } = await (supabase as any).rpc("admin_attach_legacy_pdf", {
        p_lw_cert_id: id,
        p_path: path,
      });
      out.push(e2 ? `${f.name}: ${e2.message}` : who ? `✓ ${who}` : `${f.name}: certifikát s tímto ID v převodu není`);
    }
    setLog(out);
    setBusy(false);
    load();
  };

  const withPdf = rows.filter((r) => r.pdf_path).length;
  const issued = rows.filter((r) => r.applied_at).length;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-bold">Převedené certifikáty z LearnWorlds</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {rows.length} certifikátů · {withPdf} s původním PDF · {issued} už vystaveno (člověk se zaregistroval). Původní
        PDF si majitel stáhne v profilu v sekci Osvědčení.
      </p>
      <div className="mt-4 rounded-2xl bg-muted/50 p-4">
        <p className="text-sm">
          <span className="font-semibold">Účty převedených lidí:</span>{" "}
          {waiting === null ? "…" : waiting === 0 ? "všichni mají účet." : `${waiting} ještě nemá účet.`}
        </p>
        {waiting !== null && waiting > 0 && (
          <>
            <button
              type="button"
              onClick={migrate}
              disabled={migrating}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {migrating && <Loader2 className="h-4 w-4 animate-spin" />}
              Založit účty ({waiting})
            </button>
            <p className="mt-2 text-xs text-muted-foreground">
              Účty vzniknou bez hesla a nikomu se nepošle e-mail. Členství na 12 měsíců a převedená osvědčení se přidělí
              hned. Heslo si lidé nastaví přes „Zapomněli jste heslo?“ na přihlášení.
            </p>
          </>
        )}
      </div>
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Nahrát PDF (můžete vybrat všechny najednou)
        <input
          type="file"
          accept="application/pdf"
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </label>
      {log.length > 0 && (
        <ul className="mt-3 space-y-0.5 text-sm">
          {log.map((l, i) => (
            <li key={i} className={l.startsWith("✓") ? "text-emerald-700" : "text-destructive"}>
              {l}
            </li>
          ))}
        </ul>
      )}
      {rows.some((r) => r.lw_cert_id && !r.pdf_path) && (
        <p className="mt-3 text-sm text-muted-foreground">
          Chybí PDF:{" "}
          {rows
            .filter((r) => r.lw_cert_id && !r.pdf_path)
            .map((r) => r.holder_name)
            .join(", ")}
        </p>
      )}
    </section>
  );
}
