import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/track";
import { ArrowRight, Check, Landmark, LineChart, RefreshCw, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    text: "Bezpečné napojení přes licencovanou bankovní infrastrukturu (PSD2), technologický partner Goodveri",
  },
  { icon: LineChart, text: "Predikce tržeb a cash flow z vašich skutečných pohybů" },
  { icon: RefreshCw, text: "Plán, který se aktualizuje s vaším byznysem" },
];

type State = "idle" | "open" | "sending" | "done" | "error";

/** Sekce „Plán postavený na reálných datech“ s čekací listinou na napojení bankovního účtu. */
export const BankWaitlist = () => {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    // Tabulka zatím není ve vygenerovaných typech, proto přetypování.
    const { error } = await supabase
      .from("waitlist_bank" as never)
      .insert({ email: email.trim(), source: "bank_connect" } as never);
    // 23505 = e-mail už v listině je, pro návštěvníka je to úspěch.
    if (error && error.code !== "23505") {
      setState("error");
      return;
    }
    track("bank_waitlist_signup", {});
    setState("done");
  };

  return (
    <section id="realna-data" className="scroll-mt-20 px-3 py-2 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] bg-muted/50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-8 md:grid-cols-[1.2fr_1fr] md:py-20 lg:px-12">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-leaf-300 bg-leaf-50 px-3 py-1 text-sm font-semibold text-leaf-800">
              <Landmark className="h-4 w-4" aria-hidden="true" />
              Připravujeme
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Plán postavený na reálných datech
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Žádné odhady podle průměrů. Připravujeme bezpečné napojení na váš bankovní účet, takže když už podnikáte,
              VISIBLE7 spočítá predikci přesně podle toho, jak vaše firma skutečně funguje.
            </p>
            <ul className="mt-6 space-y-3">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-leaf-600" aria-hidden="true" />
                  <span className="font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            {state === "done" ? (
              <p className="flex items-start gap-3 text-lg font-semibold" role="status">
                <Check className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                Díky, ozveme se, jakmile napojení spustíme.
              </p>
            ) : state === "idle" ? (
              <>
                <p className="text-lg font-semibold">Chcete to vyzkoušet mezi prvními?</p>
                <p className="mt-2 text-muted-foreground">Nechte nám e-mail a dáme vám vědět, až napojení spustíme.</p>
                <button
                  type="button"
                  onClick={() => setState("open")}
                  className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-leaf-500 px-7 text-base font-semibold text-white transition-colors hover:bg-leaf-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
                >
                  Chci to mezi prvními
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <form onSubmit={submit}>
                <label htmlFor="bank-waitlist-email" className="text-lg font-semibold">
                  Váš e-mail
                </label>
                <input
                  id="bank-waitlist-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jmeno@firma.cz"
                  className="mt-3 h-14 w-full rounded-xl border border-border bg-background px-4 text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-leaf-300"
                />
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-leaf-500 px-7 text-base font-semibold text-white transition-colors hover:bg-leaf-600 disabled:opacity-60"
                >
                  {state === "sending" ? "Odesílám…" : "Chci to mezi prvními"}
                </button>
                {state === "error" && (
                  <p className="mt-3 text-sm text-red-700" role="alert">
                    E-mail se nepodařilo uložit. Zkuste to prosím znovu.
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  E-mail použijeme jen k oznámení, že napojení banky spouštíme. Správcem je Edu Partners s.r.o. Více v{" "}
                  <Link to="/ochrana-osobnich-udaju" className="underline underline-offset-2 hover:text-foreground">
                    Ochraně osobních údajů
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
