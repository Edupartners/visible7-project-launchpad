import { useEffect, useState } from "react";
import { Check, CreditCard, ExternalLink, Loader2, Wrench, Hammer, PartyPopper } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/AuthGate";
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/visible7/client";
import { INSTALL_STATUS, InstallRequest, WEB_TYPES, WEDOS_PRICES_URL, myLatestInstall } from "@/lib/install";
import { kc, useShop } from "@/lib/shop";
import { track } from "@/lib/track";

const INCLUDED = [
  "Instalace WordPressu na váš hosting",
  "Aktivace Elementor Pro na 1 rok",
  "Základní pluginy",
  "Certifikát SSL a propojení domény s hostingem",
  "Přístup odkazem na nastavení hesla. Hesla po vás nechceme.",
];

/** Brána 4: dvě cesty ke spuštění webu. Sám podle návodů, nebo instalace s podporou (ručně, tým Edu Partners). */
export const InstallSupport = () => {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const shop = useShop();
  const price = shop.install_price ?? 990;
  const elementor = shop.install_elementor_price ? kc(shop.install_elementor_price) : "56 USD";
  const [req, setReq] = useState<InstallRequest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    myLatestInstall(user.id).then((r) => {
      setReq(r);
      setLoaded(true);
    });
  }, [user]);

  const active = req && req.status !== "zruseno";

  return (
    <section aria-labelledby="install-heading">
      <h2 id="install-heading" className="text-2xl font-bold tracking-tight">
        Jak chcete web spustit?
      </h2>
      <p className="mt-1 text-muted-foreground">
        Technika vás nemusí zdržet. Nainstalujte si web sami podle návodů, nebo ho nainstalujeme za vás.
      </p>

      {loaded && active ? (
        <InstallStatusCard req={req} price={price} checkoutUrl={shop.install_checkout_url} />
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2 md:items-start">
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-foreground">
              <Hammer className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold">Nainstaluji si sám</h3>
            <p className="mt-1 flex-1 text-muted-foreground">
              Krok za krokem podle videonávodů níže: hosting, doména, WordPress a Elementor. Platíte jen hosting a
              doménu.
            </p>
            <a href="#plan" className="mt-4 font-semibold text-primary underline-offset-4 hover:underline">
              Pokračovat podle návodů
            </a>
          </div>

          <div className="flex flex-col rounded-2xl border-[3px] border-signal bg-leaf-50 p-6">
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-500 text-white">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="v7-para-sm bg-signal px-2.5 py-0.5 text-xs font-bold text-signal-foreground">
                Bez starostí
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold">Instalace s podporou</h3>
            <p className="mt-1 text-muted-foreground">
              Vyplníte krátký formulář a web vám připravíme. Vy se pak věnujete obsahu, ne technice.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {INCLUDED.map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" strokeWidth={3} aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
            <dl className="mt-4 divide-y divide-leaf-200 rounded-xl bg-white text-sm">
              <div className="flex justify-between gap-3 px-4 py-2.5">
                <dt>Instalace a nastavení</dt>
                <dd className="font-bold">{kc(price)}</dd>
              </div>
              <div className="flex justify-between gap-3 px-4 py-2.5">
                <dt>Licence Elementor Pro na 1 rok</dt>
                <dd className="font-bold">{elementor}</dd>
              </div>
              <div className="flex justify-between gap-3 px-4 py-2.5">
                <dt>
                  Hosting a doména{" "}
                  <span className="block text-xs text-muted-foreground">platíte přímo WEDOSu, na své jméno</span>
                </dt>
                <dd className="text-right">
                  <a
                    href={WEDOS_PRICES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    podle ceníku <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                track("install_open", {});
                setOpen(true);
              }}
              className="v7-trap-btn mt-5 inline-flex h-12 items-center justify-center gap-2 pl-6 pr-11 font-bold text-signal-foreground"
            >
              Chci web nainstalovat
            </button>
            <p className="mt-2 text-xs text-muted-foreground">Ceny vč. DPH. Ozveme se do 2 pracovních dnů.</p>
          </div>
        </div>
      )}

      <InstallForm
        open={open}
        onOpenChange={setOpen}
        projectId={currentProject?.id ?? null}
        price={price}
        onDone={(r) => {
          setReq(r);
          setOpen(false);
        }}
      />
    </section>
  );
};

const InstallStatusCard = ({
  req,
  price,
  checkoutUrl,
}: {
  req: InstallRequest;
  price: number;
  checkoutUrl?: string;
}) => {
  if (req.status === "hotovo")
    return (
      <div className="mt-5 rounded-2xl border-[3px] border-signal bg-leaf-50 p-6">
        <p className="flex items-center gap-2 text-lg font-bold">
          <PartyPopper className="h-5 w-5 text-leaf-600" aria-hidden="true" /> Váš web je připravený
        </p>
        {req.site_url && (
          <a
            href={req.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-4"
          >
            {req.site_url.replace(/^https?:\/\//, "")} <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
        <p className="mt-2 text-muted-foreground">
          Přístup jsme vám poslali e-mailem jako odkaz na nastavení hesla. Teď pokračujte podle plánu níže a naplňte web
          obsahem.
        </p>
      </div>
    );
  return (
    <div className="mt-5 rounded-2xl border border-border bg-card p-6">
      <p className="text-sm font-semibold text-leaf-700">Instalace s podporou · {INSTALL_STATUS[req.status]}</p>
      <p className="mt-1 text-lg font-bold">
        {req.status === "nova" ? "Žádost jsme přijali." : "Na vašem webu pracujeme."}
      </p>
      <p className="mt-1 text-muted-foreground">
        {req.status === "nova"
          ? "Ozveme se do 2 pracovních dnů na " + req.email + " a domluvíme další postup."
          : "Jakmile bude web hotový, pošleme vám přístup a uvidíte ho i tady."}
        {req.hosting === "nemam" && req.status === "nova" && (
          <>
            {" "}
            Hosting a doménu si můžete objednat u WEDOSu na své jméno už teď,{" "}
            <a
              href={WEDOS_PRICES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-4"
            >
              ceník najdete zde
            </a>
            . Pokud si nevíte rady, pomůžeme.
          </>
        )}
      </p>
      {req.status === "nova" && checkoutUrl && (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("install_checkout_click", {})}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-bold text-white hover:bg-primary/90"
        >
          <CreditCard className="h-4 w-4" aria-hidden="true" /> Zaplatit instalaci {kc(price)}
        </a>
      )}
    </div>
  );
};

const InstallForm = ({
  open,
  onOpenChange,
  projectId,
  price,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string | null;
  price: number;
  onDone: (r: InstallRequest) => void;
}) => {
  const { user } = useAuth();
  const meta = (user?.user_metadata ?? {}) as { first_name?: string; last_name?: string };
  const [f, setF] = useState({
    name: [meta.first_name, meta.last_name].filter(Boolean).join(" "),
    email: user?.email ?? "",
    phone: "",
    hosting: "nemam" as "mam" | "nemam",
    domain: "",
    web_type: WEB_TYPES[0],
    billing: "",
    note: "",
    consent: false,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (f.name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(f.email.trim())) {
      setErr("Vyplňte prosím jméno a platný e-mail.");
      return;
    }
    if (!f.consent) {
      setErr("Pro odeslání potvrďte souhlas s podmínkami instalace.");
      return;
    }
    setBusy(true);
    setErr(null);
    const { data, error } = await supabase
      .from("install_requests")
      .insert({
        user_id: user.id,
        project_id: projectId,
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim() || null,
        hosting: f.hosting,
        domain: f.domain.trim() || null,
        web_type: f.web_type,
        billing: f.billing.trim() || null,
        note: f.note.trim() || null,
      })
      .select("*")
      .single();
    setBusy(false);
    if (error || !data) {
      setErr("Odeslání se nepodařilo. Zkuste to prosím znovu, nebo nám napište.");
      return;
    }
    track("install_request", { hosting: f.hosting, type: f.web_type });
    onDone(data as InstallRequest);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogTitle>Instalace webu s podporou</DialogTitle>
        <DialogDescription>
          Vyplňte, co potřebujeme k instalaci. Hesla sem nepište, přístup si domluvíme bezpečně.
        </DialogDescription>
        <form onSubmit={submit} className="mt-2 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Jméno a příjmení</span>
              <Input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={120} required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Telefon</span>
              <Input value={f.phone} onChange={(e) => set("phone", e.target.value)} maxLength={40} />
            </label>
          </div>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">E-mail</span>
            <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required />
          </label>
          <fieldset className="space-y-2 text-sm">
            <legend className="font-semibold">Hosting a doména</legend>
            {(
              [
                ["mam", "Už mám hosting a doménu"],
                ["nemam", "Ještě nemám, potřebuji poradit"],
              ] as const
            ).map(([v, l]) => (
              <label key={v} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="hosting"
                  checked={f.hosting === v}
                  onChange={() => set("hosting", v)}
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                {l}
              </label>
            ))}
            <p className="text-xs text-muted-foreground">
              Hosting a doména budou vždy na vaše jméno, platíte je přímo WEDOSu podle{" "}
              <a href={WEDOS_PRICES_URL} target="_blank" rel="noopener noreferrer" className="underline">
                jejich ceníku
              </a>
              .
            </p>
          </fieldset>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Doména</span>
            <Input
              value={f.domain}
              onChange={(e) => set("domain", e.target.value)}
              placeholder="např. mojefirma.cz, nebo napište „ještě nevím“"
              maxLength={200}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Typ webu</span>
            <select
              value={f.web_type}
              onChange={(e) => set("web_type", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3"
            >
              {WEB_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Fakturační údaje</span>
            <Textarea
              value={f.billing}
              onChange={(e) => set("billing", e.target.value)}
              placeholder="IČO, nebo jméno a adresa"
              maxLength={400}
              className="min-h-[70px]"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Poznámka</span>
            <Textarea
              value={f.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Cokoli, co bychom měli vědět"
              maxLength={1000}
              className="min-h-[70px]"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.consent}
              onChange={(e) => set("consent", e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <span>
              Objednávám instalaci za {kc(price)} a licenci Elementor Pro na 1 rok. Beru na vědomí, že hosting a doména
              jsou na mé jméno, obsah webu si tvořím sám a údaje z formuláře použije Edu Partners s.r.o. k instalaci a
              fakturaci.
            </span>
          </label>
          {err && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{err}</p>}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />} Odeslat žádost o instalaci
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
