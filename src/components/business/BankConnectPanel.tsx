import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileUp, Landmark, Loader2, RefreshCw, Trash2, Unplug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  type BankConnection,
  type BankMonth,
  type BankProviderInfo,
  bankSync,
  fileToBase64,
  STATUS_LABEL,
  TAG_LABEL,
} from "@/lib/bank";
import { czk } from "@/lib/cashflow";

/**
 * Napojení účtu přes Goodveri Finspector – pilot, zobrazuje se jen správci.
 * Přihlášení probíhá na stránce banky; po návratu (?clientId=…) se připojení dokončí samo.
 */
export function BankConnectPanel({
  connections,
  months,
  onChange,
}: {
  connections: BankConnection[];
  months: BankMonth[];
  onChange: () => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState<string | null>(null);
  const [providers, setProviders] = useState<BankProviderInfo[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const isTest = testMode || connections.some((c) => c.bank_name.endsWith("(test)"));
  const [pdfPassword, setPdfPassword] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const handled = useRef(false);

  const fail = (r: { error?: string; code?: string; detail?: string }) => {
    if (r.code === "not_configured") setNotice(r.error ?? null);
    toast({ title: "Nepovedlo se", description: [r.error, r.detail].filter(Boolean).join(" · "), variant: "destructive" });
  };

  // Návrat z banky
  useEffect(() => {
    const clientId = params.get("clientId");
    if (!clientId || handled.current) return;
    handled.current = true;
    (async () => {
      setBusy("callback");
      const r = await bankSync("callback", { clientId });
      setBusy(null);
      params.delete("clientId");
      setParams(params, { replace: true });
      if (r.error) return fail(r);
      toast({ title: "Účet je připojený", description: `Načteno ${r.months ?? 0} měsíců.` });
      await onChange();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const loadProviders = async () => {
    setBusy("providers");
    const r = await bankSync("providers");
    setBusy(null);
    if (r.error) return fail(r);
    setTestMode(r.test === true);
    setProviders((r.providers as BankProviderInfo[]) ?? []);
  };

  const connect = async (p: BankProviderInfo) => {
    setBusy(`connect:${p.code}`);
    const r = await bankSync("connect", { providerCode: p.code, bankName: p.name, userAgent: navigator.userAgent });
    if (r.error) {
      setBusy(null);
      return fail(r);
    }
    if (typeof r.url === "string") {
      window.location.href = r.url; // přihlášení v bance
      return;
    }
    setBusy(null);
    toast({ title: "Účet je připojený", description: `Načteno ${r.months ?? 0} měsíců.` });
    setProviders(null);
    await onChange();
  };

  const sync = async (c: BankConnection) => {
    setBusy(`sync:${c.id}`);
    const r = await bankSync("sync", { connectionId: c.id });
    setBusy(null);
    if (r.error) fail(r);
    else toast({ title: "Aktualizováno", description: `Načteno ${r.months ?? 0} měsíců.` });
    await onChange();
  };

  const disconnect = async (c: BankConnection) => {
    if (!window.confirm(`Odpojit ${c.bank_name || "účet"} a smazat jeho data z VISIBLE7?`)) return;
    setBusy(`disconnect:${c.id}`);
    const r = await bankSync("disconnect", { connectionId: c.id });
    setBusy(null);
    if (r.error) return fail(r);
    toast({ title: "Odpojeno", description: "Souhlas je odvolaný a data smazaná." });
    await onChange();
  };

  const uploadPdf = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files].filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!list.length) return toast({ title: "Vyberte PDF výpisy", variant: "destructive" });
    if (list.reduce((s, f) => s + f.size, 0) > 15 * 1024 * 1024)
      return toast({ title: "Výpisy jsou moc velké", description: "Najednou nejvýš 15 MB.", variant: "destructive" });
    setBusy("pdf");
    const payload = await Promise.all(
      list.map(async (f) => ({ name: f.name, content: await fileToBase64(f), password: pdfPassword || undefined })),
    );
    const r = await bankSync("statement", { files: payload });
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    if (r.error) return fail(r);
    toast({ title: "Výpisy zpracované", description: `Načteno ${r.months ?? 0} měsíců.` });
    await onChange();
  };

  // Součty štítků Goodveri za poslední 3 měsíce s daty – pro kontrolu mapování na kategorie
  const tagRows = useMemo(() => {
    const last = [...new Set(months.map((m) => m.month))].sort().slice(-3);
    const acc: Record<string, number> = {};
    for (const m of months) if (last.includes(m.month)) for (const [k, v] of Object.entries(m.tags ?? {})) acc[k] = (acc[k] ?? 0) + Number(v);
    return Object.entries(acc)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 20);
  }, [months]);

  return (
    <section className="rounded-3xl border-2 border-dashed border-leaf-300 bg-leaf-50/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-leaf-800">Pilot · vidí jen správce</p>
          <h2 className="mt-1 text-xl font-bold">Napojení účtu přes Goodveri</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Přihlásíte se přímo u banky. Ukládáme jen měsíční souhrny, jednotlivé platby ani protistrany ne.
          </p>
        </div>
        <Landmark className="hidden h-7 w-7 text-leaf-700 sm:block" aria-hidden="true" />
      </div>

      {busy === "callback" && (
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" /> Dokončuji připojení a stahuji pohyby z banky…
        </p>
      )}

      {isTest && (
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">
          <strong>Testovací režim.</strong> Přístupy od Goodveri zatím nejsou nastavené, proto banky, přihlášení i data
          jsou cvičné. Až vložíte přístupy do Supabase, režim se vypne sám. Testovací připojení pak odpojte.
        </p>
      )}

      {notice && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">{notice}</p>}

      {/* Připojené účty */}
      {connections.length > 0 && (
        <ul className="mt-5 space-y-2">
          {connections.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
              <div className="min-w-0 flex-1 basis-full sm:basis-0">
                <p className="font-semibold">
                  {c.bank_name || c.bank_code || "Účet"} {c.account_mask && <span className="text-muted-foreground">{c.account_mask}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {c.provider === "goodveri_pdf" ? "PDF výpisy" : "PSD2"} · {STATUS_LABEL[c.status]}
                  {c.last_sync_at && ` · aktualizováno ${new Date(c.last_sync_at).toLocaleString("cs-CZ")}`}
                  {c.consent_expires_at && c.provider === "goodveri" &&
                    ` · souhlas do ${new Date(c.consent_expires_at).toLocaleDateString("cs-CZ")}`}
                </p>
                {c.last_error && <p className="mt-1 text-xs text-red-700">{c.last_error}</p>}
              </div>
              {c.provider === "goodveri" && c.status !== "pending" && (
                <Button size="sm" variant="outline" className="rounded-full" disabled={!!busy} onClick={() => sync(c)}>
                  {busy === `sync:${c.id}` ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1.5 h-4 w-4" />}
                  Aktualizovat
                </Button>
              )}
              <Button size="sm" variant="ghost" className="rounded-full text-red-700" disabled={!!busy} onClick={() => disconnect(c)}>
                {c.status === "pending" ? <Trash2 className="mr-1.5 h-4 w-4" /> : <Unplug className="mr-1.5 h-4 w-4" />}
                {c.status === "pending" ? "Zrušit" : "Odpojit"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Připojit banku / nahrát výpisy */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="font-semibold">Připojit banku (PSD2)</p>
          {!providers ? (
            <Button className="mt-3 rounded-full" disabled={!!busy} onClick={loadProviders}>
              {busy === "providers" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vybrat banku
            </Button>
          ) : providers.length ? (
            <ul className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
              {providers.map((p) => (
                <li key={p.code}>
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => connect(p)}
                    className="flex w-full items-center gap-2 rounded-xl border border-border p-2 text-left text-sm hover:bg-muted disabled:opacity-60"
                  >
                    {p.logo ? (
                      <img src={p.logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
                    ) : (
                      <Landmark className="h-5 w-5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate">{p.name}</span>
                    {busy === `connect:${p.code}` && <Loader2 className="ml-auto h-4 w-4 animate-spin" />}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Goodveri nevrátilo žádnou banku.</p>
          )}
        </div>

        <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
          <p className="font-semibold">Nebo nahrát PDF výpisy</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ideálně 3 po sobě jdoucí měsíční výpisy. Bez přihlášení do banky, data se jednou zpracují.
          </p>
          <input
            type="password"
            autoComplete="off"
            value={pdfPassword}
            onChange={(e) => setPdfPassword(e.target.value)}
            placeholder="Heslo k PDF (jen když ho mají)"
            className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => uploadPdf(e.target.files)}
          />
          <Button variant="outline" className="mt-3 rounded-full" disabled={!!busy} onClick={() => fileRef.current?.click()}>
            {busy === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Vybrat výpisy
          </Button>
        </div>
      </div>

      {/* Ladění: jak Goodveri platby označilo */}
      {tagRows.length > 0 && (
        <details className="mt-5 rounded-2xl bg-card p-4 ring-1 ring-border">
          <summary className="cursor-pointer font-semibold">Štítky Goodveri za poslední 3 měsíce (pro kontrolu kategorií)</summary>
          <table className="mt-3 w-full text-sm tabular-nums">
            <tbody>
              {tagRows.map(([k, v]) => (
                <tr key={k} className="border-b border-border/60">
                  <td className="py-1.5">{TAG_LABEL[k] ?? k}</td>
                  <td className="py-1.5 text-xs text-muted-foreground">{TAG_LABEL[k] ? k : ""}</td>
                  <td className={`py-1.5 text-right font-semibold ${v < 0 ? "text-foreground" : "text-leaf-700"}`}>{czk(v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  );
}
