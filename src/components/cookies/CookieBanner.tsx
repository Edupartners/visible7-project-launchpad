import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { OPEN_COOKIES_EVENT, readConsent, saveConsent } from "@/lib/cookieConsent";

/** Lišta souhlasu s cookies. Zobrazí se, dokud uživatel nevybere; znovu ji otevře odkaz „Nastavení cookies“. */
export function CookieBanner() {
  const [open, setOpen] = useState(() => !readConsent());
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false);
  const [marketing, setMarketing] = useState(() => readConsent()?.marketing ?? false);

  useEffect(() => {
    const show = () => {
      const c = readConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_COOKIES_EVENT, show);
    return () => window.removeEventListener(OPEN_COOKIES_EVENT, show);
  }, []);

  if (!open) return null;

  const choose = (a: boolean, m: boolean) => {
    saveConsent(a, m);
    setOpen(false);
    setDetails(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="print:hidden fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-2xl sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1 space-y-2">
            <h2 id="cookie-title" className="font-bold">
              Cookies
            </h2>
            <p className="text-sm text-muted-foreground">
              Nezbytné cookies drží přihlášení a bez nich aplikace nefunguje. S vaším svolením použijeme i analytické
              (Google Analytics – co v aplikaci funguje a co ne) a marketingové (měření reklam). Volbu můžete kdykoli
              změnit v patičce.{" "}
              <Link to="/ochrana-osobnich-udaju" className="text-primary underline">
                Více o zpracování údajů
              </Link>
            </p>

            {details && (
              <div className="space-y-3 rounded-xl bg-muted/50 p-3 text-sm">
                <Row title="Nezbytné" text="Přihlášení, bezpečnost, uložení této volby." checked disabled />
                <Row
                  title="Analytické"
                  text="Google Analytics: návštěvnost a používání aplikace, bez jména a e-mailu."
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <Row
                  title="Marketingové"
                  text="Měření účinnosti reklam (Google, případně další přes Tag Manager)."
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap">
              <Button className="rounded-[10px]" onClick={() => choose(true, true)}>
                Přijmout vše
              </Button>
              <Button className="rounded-[10px]" onClick={() => choose(false, false)}>
                Jen nezbytné
              </Button>
              {details ? (
                <Button variant="ghost" className="rounded-[10px]" onClick={() => choose(analytics, marketing)}>
                  Uložit výběr
                </Button>
              ) : (
                <Button variant="ghost" className="rounded-[10px]" onClick={() => setDetails(true)}>
                  Nastavení
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  title,
  text,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  text: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  const id = `cookie-${title}`;
  return (
    <div className="flex items-start justify-between gap-3">
      <label htmlFor={id} className="min-w-0">
        <span className="font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{text}</span>
      </label>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}
