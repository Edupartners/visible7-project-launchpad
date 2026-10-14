import { useEffect, useState } from "react";
import { BadgeCheck, Building2, Check, ClipboardCopy, ExternalLink, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProject } from "@/contexts/ProjectContext";
import { useSupabaseProgress } from "@/hooks/useSupabaseProgress";
import { track } from "@/lib/track";
import {
  BusinessVerification,
  EMPTY_TRADE,
  PORTAL_URL,
  RZP_URL,
  TRADE_FEE_ONLINE,
  TRADE_FEE_PAPER,
  TradeIdentity,
  TradeLicenseState,
  TradeMode,
  legalFormLabel,
  loadVerification,
  tradeFieldsFor,
  validIco,
  verifyIco,
} from "@/lib/tradeLicense";
import { celebrate } from "@/lib/celebrate";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("cs-CZ", { day: "numeric", month: "long", year: "numeric" });

const MODES: { id: TradeMode; title: string; text: string }[] = [
  {
    id: "side",
    title: "Vedlejší činnost",
    text: "Vedle zaměstnání, studia nebo rodičovské. Nejbezpečnější start.",
  },
  { id: "main", title: "Hlavní činnost", text: "Podnikání bude váš hlavní příjem. Platíte minimální zálohy." },
];

const IDENTITIES: { id: TradeIdentity; title: string }[] = [
  { id: "bank", title: "Bankovní identita" },
  { id: "eid", title: "Občanka s čipem (eObčanka)" },
  { id: "databox", title: "Datová schránka" },
  { id: "none", title: "Nic z toho nemám" },
];

const STEPS = ["Připravit", "Vyplnit", "Čeká na zápis", "Ověřeno"];

interface TradeLicenseCardProps {
  /** gate5 = „Než začnete prodávat“, gate6 = připomínka pro ty, kdo kartu přeskočili */
  placement: "gate5" | "gate6";
  launchDate?: string;
}

/** Karta „Založte živnost online“: tahák k formuláři a ověření IČO v registru ARES. */
export const TradeLicenseCard = ({ placement, launchDate }: TradeLicenseCardProps) => {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [state, setState, { loading }] = useSupabaseProgress<TradeLicenseState>("trade_license", EMPTY_TRADE);
  const [verified, setVerified] = useState<BusinessVerification | null | undefined>(undefined);
  const [ico, setIco] = useState("");
  const [busy, setBusy] = useState(false);
  const [icoError, setIcoError] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    if (!currentProject) return;
    let active = true;
    loadVerification(currentProject.id).then((v) => active && setVerified(v));
    return () => {
      active = false;
    };
  }, [currentProject]);

  if (loading || verified === undefined) {
    return (
      <div className="flex justify-center rounded-3xl border border-border bg-card py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const s = { ...EMPTY_TRADE, ...state };
  const set = (patch: Partial<TradeLicenseState>) => setState((prev) => ({ ...EMPTY_TRADE, ...prev, ...patch }));
  const fields = tradeFieldsFor(currentProject?.business_type);
  const step =
    verified && !changing ? 3 : changing || s.status === "submitted" || s.existing ? 2 : s.status === "fill" ? 1 : 0;

  const submitIco = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    if (!validIco(ico)) {
      setIcoError("Tohle nevypadá jako platné IČO. Má 8 číslic – zkontrolujte ho.");
      return;
    }
    setBusy(true);
    setIcoError("");
    const { result, error } = await verifyIco(currentProject.id, ico);
    setBusy(false);
    if (error || !result) {
      setIcoError(error ?? "Ověření se nepodařilo.");
      return;
    }
    setVerified(result);
    celebrate("big");
    setChanging(false);
    track("business_verified_ui", { legal_form: result.legal_form, placement }, currentProject.id);
    toast({ title: "IČO je ověřené", description: `${result.name} je v registru ARES.` });
  };

  const cheatSheet = [
    "Ohlášení živnosti – tahák z VISIBLE7",
    "Živnost: volná – Výroba, obchod a služby neuvedené v přílohách 1 až 3 živnostenského zákona",
    `Obory: ${fields.join("; ")}`,
    `Činnost: ${s.mode === "main" ? "hlavní" : "vedlejší"}`,
    `Zahájení: ${launchDate ? fmt(launchDate) : "den, kdy chcete začít prodávat"}`,
    "Ve stejném formuláři zaškrtněte přihlášku na ČSSZ a ke zdravotní pojišťovně.",
    `Poplatek: ${TRADE_FEE_ONLINE} Kč při podání online`,
  ].join("\n");

  // Kompaktní stav po ověření
  if (verified && !changing) {
    return (
      <section
        aria-labelledby="zivnost-ok"
        className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
          <div>
            <h2 id="zivnost-ok" className="text-lg font-bold">
              Podnikáte. IČO {verified.ico} je ověřené.
            </h2>
            <p className="text-sm text-emerald-900/80">
              {verified.name}
              {verified.legal_form ? ` · ${legalFormLabel(verified.legal_form)}` : ""}
              {verified.established ? ` · od ${fmt(verified.established)}` : ""}
            </p>
            <p className="mt-1 text-xs text-emerald-900/70">
              Ověřeno v registru ARES {fmt(verified.verified_at)}. Splňuje podmínku pro osvědčení Gold.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="shrink-0 rounded-[10px]" onClick={() => setChanging(true)}>
          Změnit IČO
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="zivnost" className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <p className="text-sm font-semibold text-orange-700">
        {placement === "gate5" ? "Než začnete prodávat" : "Ještě nemáte ověřenou živnost?"}
      </p>
      <h2 id="zivnost" className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight">
        <Building2 className="h-6 w-6 text-primary" /> Založte živnost online
      </h2>
      <p className="mt-1 max-w-2xl text-muted-foreground">
        Za 15 minut z domova, za {TRADE_FEE_ONLINE} Kč místo {TRADE_FEE_PAPER.toLocaleString("cs-CZ")} Kč na úřadě.
        Připravíme vám tahák a po zápisu IČO ověříme v registru ARES – je to podmínka pro osvědčení Gold.
      </p>

      <ol className="mt-5 flex flex-wrap gap-2 text-xs font-semibold" aria-label="Postup">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
              i < step
                ? "bg-emerald-100 text-emerald-800"
                : i === step
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span>{i + 1}</span>}
            {label}
          </li>
        ))}
      </ol>

      {/* 1 Připravit */}
      {step === 0 && (
        <div className="mt-6 space-y-6">
          <fieldset>
            <legend className="mb-2 font-semibold">Budete podnikat jako hlavní, nebo vedlejší činnost?</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODES.map((m) => (
                <label
                  key={m.id}
                  className={`cursor-pointer rounded-2xl border p-4 ${
                    s.mode === m.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="trade-mode"
                    className="sr-only"
                    checked={s.mode === m.id}
                    onChange={() => set({ mode: m.id })}
                  />
                  <span className="block font-bold">{m.title}</span>
                  <span className="block text-sm text-muted-foreground">{m.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 font-semibold">Čím se na úřadě přihlásíte?</legend>
            <div className="flex flex-wrap gap-2">
              {IDENTITIES.map((it) => (
                <label
                  key={it.id}
                  className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium ${
                    s.identity === it.id ? "border-primary bg-primary text-white" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="trade-identity"
                    className="sr-only"
                    checked={s.identity === it.id}
                    onChange={() => set({ identity: it.id })}
                  />
                  {it.title}
                </label>
              ))}
            </div>
            {s.identity === "none" && (
              <p className="mt-3 rounded-xl bg-orange-50 p-3 text-sm ring-1 ring-orange-200">
                Nejrychlejší je bankovní identita: většina bank ji má zdarma přímo v internetovém bankovnictví. Bez ní
                můžete podat ohlášení i osobně na živnostenském úřadě nebo na Czech POINTu (
                {TRADE_FEE_PAPER.toLocaleString("cs-CZ")} Kč) – tahák vám poslouží stejně.
              </p>
            )}
          </fieldset>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-left text-sm font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => set({ existing: true })}
            >
              Už podnikám – mám IČO nebo s.r.o.
            </button>
            <Button
              className="rounded-[10px]"
              disabled={!s.mode || !s.identity}
              onClick={() => {
                set({ status: "fill" });
                track("trade_license_fill", { mode: s.mode, identity: s.identity, placement }, currentProject?.id);
              }}
            >
              Pokračovat na tahák
            </Button>
          </div>
        </div>
      )}

      {/* 2 Vyplnit */}
      {step === 1 && (
        <div className="mt-6 space-y-5">
          <dl className="divide-y divide-border rounded-2xl border border-border">
            {[
              ["Kde", "Formulář ohlášení živnosti (JRF) na rzp.cz, nebo na Portálu občana"],
              ["Živnost", "Volná – Výroba, obchod a služby neuvedené v přílohách 1 až 3 živnostenského zákona"],
              ["Obory", fields.join(" · ")],
              ["Činnost", s.mode === "main" ? "Hlavní" : "Vedlejší"],
              ["Zahájení", launchDate ? fmt(launchDate) : "Den, kdy chcete začít prodávat"],
              ["Pojištění", "Ve stejném formuláři zaškrtněte přihlášku na ČSSZ a ke zdravotní pojišťovně"],
              ["Daň z příjmů", "Registrace se od roku 2024 nepodává – přiznání podáte až za první rok"],
              ["Poplatek", `${TRADE_FEE_ONLINE} Kč online (platební údaje vám úřad pošle po podání)`],
            ].map(([k, v]) => (
              <div key={k} className="grid gap-1 p-3 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="text-sm font-semibold text-muted-foreground">{k}</dt>
                <dd className="text-sm">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            Obory jsou návrh podle typu vašeho byznysu – ověřte si je v seznamu na rzp.cz. Za všechny obory volné
            živnosti platíte jeden poplatek. Některé činnosti potřebují řemeslnou nebo vázanou živnost s praxí či
            vzděláním.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="rounded-[10px]">
              <a href={RZP_URL} target="_blank" rel="noopener noreferrer">
                Otevřít formulář na rzp.cz <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-[10px]">
              <a href={PORTAL_URL} target="_blank" rel="noopener noreferrer">
                Portál občana <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="outline"
              className="rounded-[10px]"
              onClick={() => {
                void navigator.clipboard?.writeText(cheatSheet);
                toast({ title: "Tahák je zkopírovaný" });
              }}
            >
              <ClipboardCopy className="mr-2 h-4 w-4" /> Kopírovat tahák
            </Button>
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-left text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => set({ status: "prepare" })}
            >
              Zpět
            </button>
            <Button
              className="rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => {
                set({ status: "submitted", submittedAt: new Date().toISOString() });
                track("trade_license_submitted", { mode: s.mode, placement }, currentProject?.id);
              }}
            >
              <Send className="mr-2 h-4 w-4" /> Mám odesláno
            </Button>
          </div>
        </div>
      )}

      {/* 3 Čeká na zápis + ověření IČO */}
      {step === 2 && (
        <form onSubmit={submitIco} className="mt-6 space-y-4">
          {s.existing || changing ? (
            <p className="text-muted-foreground">
              Zadejte IČO, pod kterým projekt provozujete. Ověříme ho ve veřejném registru ARES.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Odesláno {s.submittedAt ? fmt(s.submittedAt) : ""}. Úřad vás zapíše do 5 pracovních dnů, u ohlašovací
              živnosti ale můžete podnikat už ode dne ohlášení. Jakmile vám přijde IČO, zadejte ho sem.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="w-full sm:max-w-xs">
              <label htmlFor="trade-ico" className="mb-1.5 block text-sm font-semibold">
                IČO
              </label>
              <Input
                id="trade-ico"
                inputMode="numeric"
                autoComplete="off"
                value={ico}
                onChange={(e) => {
                  setIco(e.target.value.replace(/[^\d\s]/g, "").slice(0, 10));
                  setIcoError("");
                }}
                placeholder="12345678"
                className="h-11 rounded-[10px] text-lg tracking-wider"
                aria-invalid={!!icoError}
                aria-describedby={icoError ? "trade-ico-error" : undefined}
              />
            </div>
            <Button type="submit" className="h-11 rounded-[10px] sm:mt-7" disabled={busy || ico.trim().length < 8}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}
              Ověřit v registru ARES
            </Button>
          </div>
          {icoError && (
            <p id="trade-ico-error" role="alert" className="text-sm font-medium text-red-700">
              {icoError}
            </p>
          )}
          <button
            type="button"
            className="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => {
              if (changing) setChanging(false);
              else set({ status: s.existing ? "prepare" : "fill", existing: false });
            }}
          >
            Zpět
          </button>
        </form>
      )}
    </section>
  );
};
