import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Download, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WORKSHEETS,
  type WorksheetLead,
  loadWorksheetLeads,
  sheetFromFileName,
  uploadMemberSheet,
  uploadedMemberSheets,
} from "@/lib/worksheets";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("cs-CZ", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

/** Administrace: nahrání listů pro členy a přehled e-mailů ze stažení listů zdarma. */
export function WorksheetsAdmin() {
  const [leads, setLeads] = useState<WorksheetLead[]>([]);
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const member = WORKSHEETS.filter((w) => !w.free);

  const load = useCallback(() => {
    loadWorksheetLeads()
      .then(setLeads)
      .catch(() => setMsg("Zájemce se nepodařilo načíst."));
    uploadedMemberSheets().then(setUploaded);
  }, []);
  useEffect(load, [load]);

  const stats = useMemo(() => {
    const emails = new Set(leads.map((l) => l.email));
    const tips = new Set(leads.filter((l) => l.marketing).map((l) => l.email));
    return { emails: emails.size, tips: tips.size, downloads: leads.length };
  }, [leads]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setMsg(null);
    const ok: string[] = [];
    const skipped: string[] = [];
    for (const f of Array.from(files)) {
      const w = sheetFromFileName(f.name);
      if (!w || w.free) {
        skipped.push(f.name);
        continue;
      }
      try {
        await uploadMemberSheet(w.slug, f);
        ok.push(w.code);
      } catch {
        skipped.push(f.name);
      }
    }
    setBusy(false);
    setMsg(`Nahráno: ${ok.join(", ") || "nic"}.` + (skipped.length ? ` Přeskočeno: ${skipped.join(", ")}.` : ""));
    load();
  };

  const csv = () => {
    const rows = [
      ["email", "list", "tipy", "zdroj", "datum"],
      ...leads.map((l) => [l.email, l.sheet, l.marketing ? "ano" : "ne", l.source, l.created_at]),
    ];
    const blob = new Blob(
      ["﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n")],
      {
        type: "text/csv;charset=utf-8",
      },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "visible7-zajemci-o-listy.csv";
    a.click();
  };

  return (
    <section className="rounded-2xl border border-border p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <FileText className="h-5 w-5 text-muted-foreground" /> Pracovní listy
      </h2>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          ["Lidí, kteří nechali e-mail", stats.emails],
          ["Z toho chce tipy", stats.tips],
          ["Stažení celkem", stats.downloads],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-xl bg-muted/50 p-3">
            <p className="text-2xl font-extrabold tabular-nums">{v}</p>
            <p className="text-xs text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <p className="font-semibold">Listy pro členy v úložišti</p>
        <p className="text-sm text-muted-foreground">
          Vyberte PDF ze složky „Nová sada 2026“ (třeba všechny najednou). Listy zdarma se přeskočí, ty už na webu jsou.
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {member.map((w) => (
            <li
              key={w.slug}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                uploaded.has(w.slug) ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"
              }`}
            >
              {uploaded.has(w.slug) && <Check className="h-3 w-3" />} {w.code} {w.title}
            </li>
          ))}
        </ul>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:border-primary">
          <Upload className="h-4 w-4" /> {busy ? "Nahrávám…" : "Nahrát PDF"}
          <input
            type="file"
            accept="application/pdf"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="font-semibold">Poslední zájemci</p>
        <Button variant="outline" size="sm" onClick={csv} disabled={!leads.length}>
          <Download className="mr-1.5 h-4 w-4" /> CSV
        </Button>
      </div>
      {leads.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Zatím nikdo.</p>
      ) : (
        <table className="mt-2 w-full text-sm">
          <tbody className="divide-y divide-border">
            {leads.slice(0, 20).map((l) => (
              <tr key={l.id}>
                <td className="py-2 pr-2">{l.email}</td>
                <td className="py-2 pr-2 text-muted-foreground">{l.sheet}</td>
                <td className="py-2 pr-2">{l.marketing ? "tipy ano" : ""}</td>
                <td className="whitespace-nowrap py-2 text-right text-muted-foreground">{fmt(l.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
