import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import QRCode from "qrcode";
import { BadgeCheck, Linkedin, Printer, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Certificate,
  ISSUER_LINE,
  certificateDescription,
  certificateTitle,
  certificateUrl,
  linkedInAddUrl,
  verifyCertificate,
} from "@/lib/certificates";

/** Veřejná stránka osvědčení s ověřením pravosti. Přístupná bez přihlášení. */
const CertificatePage = () => {
  const { code = "" } = useParams();
  const [search] = useSearchParams();
  const autoDownload = search.has("stahnout");
  const [cert, setCert] = useState<Certificate | null | undefined>(undefined);
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    verifyCertificate(code).then(setCert);
    QRCode.toDataURL(certificateUrl(code.toUpperCase()), { margin: 0, width: 220 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [code]);

  // Odkaz „Stáhnout PDF“ z aplikace rovnou otevře okno pro uložení do PDF.
  useEffect(() => {
    if (!cert || !autoDownload) return;
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, [cert, autoDownload]);

  if (cert === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (cert === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-bold">Osvědčení nenalezeno</h1>
          <p className="mt-2 text-muted-foreground">
            Osvědčení s kódem <span className="font-mono">{code}</span> neexistuje. Zkontrolujte, zda je kód zadaný
            správně.
          </p>
        </div>
      </div>
    );
  }

  const gold = cert.kind === "gold";
  const issued = new Date(cert.issued_at).toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <style>{"@media print { @page { size: A4 landscape; margin: 0; } }"}</style>
      <div className="mx-auto mb-6 flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-700">
          <BadgeCheck className="h-5 w-5" />
          <span>
            <strong>Ověřené osvědčení.</strong> Vydáno {issued}, kód {cert.code}.
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-[10px]" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Stáhnout PDF
          </Button>
          <Button asChild className="rounded-[10px] bg-[#0a66c2] text-white hover:bg-[#0a66c2]/90">
            <a href={linkedInAddUrl(cert)} target="_blank" rel="noopener noreferrer">
              <Linkedin className="mr-2 h-4 w-4" />
              Přidat na LinkedIn
            </a>
          </Button>
        </div>
      </div>

      <div className="certificate-sheet mx-auto aspect-[297/210] w-full max-w-5xl bg-white text-slate-900 shadow-xl print:max-w-none print:shadow-none">
        <div className={`flex h-full flex-col p-[4%] ${gold ? "bg-[#FFFCF6]" : "bg-white"}`}>
          <div
            className={`flex h-full flex-col rounded-lg border-[3px] px-[6%] py-[4%] ${
              gold
                ? "border-[#9A5F29] ring-1 ring-[#9A5F29]/30 ring-offset-4"
                : "border-[#183A66] ring-1 ring-[#183A66]/20 ring-offset-4"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white ${
                    gold ? "bg-[#9A5F29]" : "bg-[#183A66]"
                  }`}
                >
                  V7
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold tracking-wide">VISIBLE7 MICEK™</p>
                  <p className="text-xs text-slate-500">Metodika rozjezdu online podnikání</p>
                </div>
              </div>
              <p className="font-mono text-xs text-slate-500">{cert.code}</p>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p
                className={`text-sm font-semibold uppercase tracking-[0.3em] ${gold ? "text-[#9A5F29]" : "text-[#183A66]"}`}
              >
                {gold ? "VISIBLE7 Gold" : "Osvědčení"}
              </p>
              <p className="mt-3 text-sm text-slate-500">Toto osvědčení získává</p>
              <h1 className="mt-1 font-serif text-[clamp(1.75rem,4.5vw,3rem)] font-semibold leading-tight">
                {cert.holder_name}
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-[clamp(0.85rem,1.6vw,1.05rem)] text-slate-600">
                {certificateDescription(cert.kind, cert.phase)}
              </p>
              <p className="mt-3 text-[clamp(1rem,2vw,1.35rem)] font-semibold">
                {certificateTitle(cert.kind, cert.phase)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Projekt: <span className="font-medium text-slate-700">{cert.project_name}</span>
                {cert.launch_url && (
                  <>
                    {" · "}
                    <span className="font-medium text-slate-700">{cert.launch_url.replace(/^https?:\/\//, "")}</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-end justify-between gap-6">
              <div className="text-xs text-slate-600">
                <p>Datum vydání: {issued}</p>
                <div className="mt-6 w-56 border-t border-slate-400 pt-1">
                  <p className="font-medium text-slate-800">Mgr. Michal Míček, LL.M.</p>
                  <p>autor metodiky VISIBLE7 MICEK™</p>
                </div>
              </div>
              <div className="flex items-end gap-3 text-right">
                <div className="text-[10px] leading-tight text-slate-500">
                  <p>Ověření pravosti:</p>
                  <p className="font-mono">{certificateUrl(cert.code).replace(/^https?:\/\//, "")}</p>
                </div>
                {qr && <img src={qr} alt={`QR kód pro ověření osvědčení ${cert.code}`} className="h-20 w-20" />}
              </div>
            </div>

            <p className="mt-4 border-t border-slate-200 pt-2 text-center text-[11px] text-slate-500">{ISSUER_LINE}</p>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-5xl text-center text-sm text-muted-foreground print:hidden">
        Tip: v okně tisku zvolte „Uložit jako PDF“. Osvědčení pak můžete přiložit k životopisu.
      </p>
      <p className="mx-auto mt-2 max-w-5xl text-center text-sm text-muted-foreground print:hidden">
        <Link to="/home" className="underline underline-offset-4">
          Přejít do aplikace VISIBLE7
        </Link>
      </p>
    </div>
  );
};

export default CertificatePage;
