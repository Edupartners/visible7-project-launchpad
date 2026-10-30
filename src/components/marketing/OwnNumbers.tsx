import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/track";
import { compare, czkShort, demoActual, demoPlan, lastMonths } from "@/lib/cashflow";

type State = "idle" | "open" | "sending" | "done" | "error";

/**
 * „Učíte se na vlastních číslech“: plán z brány 3 proti skutečnosti z účtu. Pilot pro prvních 10 podnikatelů.
 * Poskytovatele napojení nejmenujeme. Graf je z ukázkových dat (stejná funkce jako Cash flow v aplikaci).
 */
export const OwnNumbers = () => {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const rows = useMemo(() => {
    const months = lastMonths(6, new Date(2026, 9, 15));
    const plan = demoPlan(months);
    return compare(plan, demoActual(plan));
  }, []);
  const max = Math.max(...rows.flatMap((r) => [r.planIncome, r.actualIncome]));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const { error } = await supabase
      .from("waitlist_bank" as never)
      .insert({ email: email.trim(), source: "bank_connect" } as never);
    if (error && error.code !== "23505") {
      setState("error");
      return;
    }
    track("bank_pilot_signup", {});
    setState("done");
  };

  return (
    <section id="realna-data" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 md:grid-cols-[1.1fr_1fr] md:py-20 lg:px-12">
          <div>
            <p className="v7-para-sm inline-block bg-signal px-3 py-1 text-sm font-bold text-signal-foreground">
              Pilot pro prvních 10 podnikatelů
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Učíte se na vlastních číslech, ne na vymyšlených příkladech.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Plán z brány 3 porovnáme se skutečností z vašeho bankovního účtu. Hned vidíte, kde tržby zaostávají za
              plánem, kam odcházejí peníze a kolik hotovosti budete mít za tři měsíce. Napojení probíhá bezpečně přes
              licencovanou bankovní infrastrukturu (PSD2), přihlašovací údaje do banky nevidíme.
            </p>

            <div className="mt-8 max-w-md">
              {state === "done" ? (
                <p className="flex items-start gap-3 text-lg font-semibold" role="status">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                  Díky, ozveme se s podrobnostmi k pilotu.
                </p>
              ) : state === "idle" ? (
                <button
                  type="button"
                  onClick={() => setState("open")}
                  className="v7-trap-btn inline-flex h-14 items-center justify-center gap-2 pl-7 pr-12 text-base font-bold text-signal-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
                >
                  Chci do pilotu
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              ) : (
                <form onSubmit={submit}>
                  <label htmlFor="pilot-email" className="font-semibold">
                    Váš e-mail
                  </label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="pilot-email"
                      type="email"
                      required
                      autoFocus
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jmeno@firma.cz"
                      className="h-12 flex-1 rounded-xl border border-border bg-background px-4 text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
                    />
                    <button
                      type="submit"
                      disabled={state === "sending"}
                      className="v7-trap-btn inline-flex h-12 items-center justify-center pl-6 pr-10 font-bold text-signal-foreground disabled:opacity-60"
                    >
                      {state === "sending" ? "Odesílám…" : "Odeslat"}
                    </button>
                  </div>
                  {state === "error" && (
                    <p className="mt-2 text-sm text-red-700" role="alert">
                      E-mail se nepodařilo uložit. Zkuste to prosím znovu.
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    E-mail použijeme jen ke kontaktu ohledně pilotu. Správcem je Edu Partners s.r.o. Více v{" "}
                    <Link to="/ochrana-osobnich-udaju" className="underline underline-offset-2 hover:text-foreground">
                      Ochraně osobních údajů
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>

          <figure className="rounded-2xl border border-border bg-background p-5 shadow-[0_24px_50px_-30px_hsl(160_61%_15%/0.5)] sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-bold">Tržby: plán a skutečnost</p>
              <p className="flex gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm border-2 border-leaf-400" aria-hidden="true" /> plán
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" /> skutečnost
                </span>
              </p>
            </div>
            <ul className="mt-5 flex h-44 items-end gap-3" aria-label="Tržby po měsících, ukázková data">
              {rows.map((r) => (
                <li key={r.month} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="relative flex w-full flex-1 items-end justify-center">
                    <span
                      className="absolute bottom-0 w-full rounded-t-md border-2 border-dashed border-leaf-400"
                      style={{ height: `${(r.planIncome / max) * 100}%` }}
                      aria-hidden="true"
                    />
                    <span
                      className="relative w-3/5 rounded-t-md bg-primary"
                      style={{ height: `${(r.actualIncome / max) * 100}%` }}
                      title={`${r.label}: plán ${czkShort(r.planIncome)} Kč, skutečnost ${czkShort(r.actualIncome)} Kč`}
                    />
                  </span>
                  <span className="text-[11px] text-muted-foreground">{r.label}</span>
                </li>
              ))}
            </ul>
            <figcaption className="mt-3 text-center text-xs text-muted-foreground">
              Ukázka obrazovky Cash flow s ukázkovými daty
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};
