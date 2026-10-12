import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MailX } from "lucide-react";
import { supabase } from "@/integrations/visible7/client";

/** Odhlášení připomínek odkazem z e-mailu – bez přihlášení. */
const UnsubscribePage = () => {
  const [params] = useSearchParams();
  const token = params.get("t") ?? "";
  const [state, setState] = useState<"loading" | "ok" | "error" | "demo">("loading");

  useEffect(() => {
    if (token === "ukazka") {
      setState("demo");
      return;
    }
    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      setState("error");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .rpc("unsubscribe_reminders", { p_token: token })
      .then(({ data, error }: { data: boolean | null; error: unknown }) => setState(!error && data ? "ok" : "error"));
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <MailX className="h-7 w-7 text-primary" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
          {state === "loading" && "Odhlašuji…"}
          {state === "ok" && "Připomínky jsou vypnuté"}
          {state === "demo" && "Tohle je ukázkový odkaz"}
          {state === "error" && "Odkaz nefunguje"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {state === "ok" && "Už vám nebudeme posílat připomínky k projektu. Zapnout je můžete kdykoli v Nastavení."}
          {state === "demo" && "Ve skutečné připomínce tento odkaz uživatele odhlásí."}
          {state === "error" && "Odkaz je neplatný nebo starý. Připomínky vypnete i v aplikaci: Nastavení → Souhlasy."}
        </p>
        <Link to="/home" className="mt-6 inline-block font-semibold text-primary hover:underline">
          Zpět do VISIBLE7
        </Link>
      </div>
    </main>
  );
};

export default UnsubscribePage;
