import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FlaskConical, Landmark, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const BANKS: Record<string, string> = {
  MOCK_A: "Cvičná banka",
  MOCK_B: "Cvičná spořitelna",
  MOCK_C: "Testovací fintech",
};

/**
 * Cvičná „banka“ pro testovací režim napojení přes Goodveri (funkce bank-sync bez přístupů).
 * Nahrazuje přihlášení a souhlas v bance; po souhlasu vrací na Cash flow s ?clientId=….
 */
const MockBankPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const bank = BANKS[params.get("bank") ?? ""] ?? "Cvičná banka";

  useEffect(() => {
    document.title = "Cvičná banka (test) | VISIBLE7 MICEK";
  }, []);

  // Vracíme jen na vlastní web (ochrana proti přesměrování jinam).
  const target = (() => {
    try {
      const u = new URL(params.get("return") ?? "/cash-flow", window.location.origin);
      return u.origin === window.location.origin ? `${u.pathname}${u.search}` : "/cash-flow";
    } catch {
      return "/cash-flow";
    }
  })();

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-amber-800 ring-1 ring-amber-200">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> Testovací režim
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Landmark className="h-8 w-8 text-leaf-700" aria-hidden="true" />
          <h1 className="text-2xl font-extrabold tracking-tight">{bank}</h1>
        </div>
        <p className="mt-3 text-muted-foreground">
          Tady by se zobrazilo přihlášení do vaší banky. Ve skutečném napojení zadáte údaje přímo bance, VISIBLE7 je
          nikdy neuvidí.
        </p>
        <div className="mt-5 rounded-2xl bg-muted/60 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4 text-leaf-600" aria-hidden="true" /> VISIBLE7 žádá o souhlas
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>číst zůstatek a pohyby na účtu za posledních 12 měsíců</li>
            <li>jen čtení, žádné platby</li>
            <li>souhlas můžete kdykoli odvolat</li>
          </ul>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="rounded-full" onClick={() => navigate(target, { replace: true })}>
            Udělit souhlas
          </Button>
          <Button variant="ghost" className="rounded-full" asChild>
            <Link to="/cash-flow">Zrušit</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Data po souhlasu jsou vymyšlená. Testovací režim se vypne sám, jakmile budou nastavené přístupy od Goodveri.
        </p>
      </div>
    </main>
  );
};

export default MockBankPage;
