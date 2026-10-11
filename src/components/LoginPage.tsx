import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Mail, User } from "lucide-react";
import { supabase } from "@/integrations/visible7/client";
import { ConsentFields, ConsentValues } from "@/components/ConsentFields";
import { LEGAL_VERSION } from "@/lib/legal";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  // onLogin se volá až po reálném ověření v Supabase (přes onAuthStateChange ve vyšší komponentě)
  onLogin: () => void;
  // Kam se má uživatel vrátit po sociálním/e-mailovém přihlášení (např. OAuth consent URL).
  redirectTo?: string;
}

export const LoginPage = ({ onLogin, redirectTo }: LoginPageProps) => {
  const returnUrl = redirectTo ?? window.location.origin;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [consents, setConsents] = useState<ConsentValues>({ terms: false, klub: false, marketing: false });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Z výzev „Otestovat nápad“ přichází nový uživatel (?novy) – rovnou registrace.
  const [isLogin, setIsLogin] = useState(() => !new URLSearchParams(window.location.search).has("novy"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (isLogin && !password) || (!isLogin && (!firstName || !lastName || !consents.terms))) return;

    setIsSubmitting(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "Přihlášení se nezdařilo",
          description: error.message === "Invalid login credentials" ? "Nesprávný e-mail nebo heslo." : error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      onLogin();
    } else {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: returnUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone.trim() || undefined,
            // Souhlasy se při založení účtu zapíší do evidence souhlasů (trigger v databázi).
            consents: {
              version: LEGAL_VERSION,
              podminky: consents.terms,
              zasady: consents.terms,
              klub: consents.klub,
              marketing: consents.marketing,
            },
          },
        },
      });
      if (error) {
        toast({
          title: "Registrace se nezdařila",
          description:
            error.message === "User already registered"
              ? "Tento e-mail už je zaregistrovaný. Zkuste se přihlásit."
              : error.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      if (!signUpData.session) {
        // Supabase vyžaduje potvrzení e-mailu – uživatel se přihlásí po kliknutí na odkaz.
        toast({
          title: "Zkontrolujte svůj e-mail",
          description: "Poslali jsme vám odkaz pro potvrzení registrace. Po potvrzení se můžete přihlásit.",
        });
        setIsLogin(true);
        setIsSubmitting(false);
        return;
      }
      toast({
        title: "Registrace úspěšná!",
        description: "Vítejte ve VISIBLE7.",
      });
      onLogin();
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Zadejte e-mail",
        description: "Vyplňte e-mailovou adresu a pak klikněte znovu na „Zapomněli jste heslo?“.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/home`,
    });
    toast(
      error
        ? { title: "Odeslání se nezdařilo", description: error.message, variant: "destructive" }
        : { title: "E-mail odeslán", description: "Pokud účet existuje, přijde vám odkaz pro nastavení nového hesla." },
    );
  };

  const tab = (login: boolean, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={isLogin === login}
      onClick={() => setIsLogin(login)}
      className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
        isLogin === login ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Levý panel: proč se registrovat (na mobilu skrytý, formulář je hned nahoře) */}
      <aside className="hidden flex-col justify-between bg-primary p-10 text-white lg:flex xl:p-14">
        <Link to="/" className="flex items-center gap-2.5 self-start font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm text-primary">V7</span>
          VISIBLE7 <span className="font-normal text-white/70">MICEK™</span>
        </Link>
        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            {isLogin ? "Vítejte zpátky." : "Otestujte svůj nápad za 10 minut."}
          </h1>
          <p className="mt-4 text-lg text-white/75">
            {isLogin
              ? "Pokračujte tam, kde jste skončili. Váš projekt i všechna čísla na vás čekají."
              : "Po registraci vás čeká Rentgen nápadu: 4 otázky, upřímný verdikt AI a mapa cesty k prvním zákazníkům."}
          </p>
          {!isLogin && (
            <ul className="mt-8 space-y-3">
              {[
                "Rentgen nápadu a brány 1 a 2 zdarma",
                "Bez platební karty",
                "Data uložená v EU",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="text-sm text-white/50">Metodika VISIBLE7 MICEK™ · Edu Partners s.r.o.</p>
      </aside>

      {/* Formulář */}
      <main className="flex flex-col px-5 py-6 sm:px-8 lg:justify-center lg:px-12">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs text-white">
              V7
            </span>
            VISIBLE7
          </Link>
        </div>
        <div className="mx-auto w-full max-w-md py-8 lg:py-0">
          <Link
            to="/"
            className="mb-8 hidden items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" /> Zpět na úvodní stránku
          </Link>
          <div role="tablist" aria-label="Přihlášení nebo registrace" className="flex gap-1 rounded-xl bg-muted p-1">
            {tab(false, "Jsem tu poprvé")}
            {tab(true, "Mám účet")}
          </div>
          <h2 className="mt-8 text-2xl font-extrabold tracking-tight">
            {isLogin ? "Přihlaste se" : "Vytvořte si účet zdarma"}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {isLogin
              ? "E-mail a heslo, které jste zadali při registraci."
              : "Zabere to minutu. Pak hned začnete rentgen nápadu."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Křestní jméno</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jan"
                      className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Příjmení</label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Novák"
                    className="h-12 rounded-xl border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">E-mailová adresa</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vas-email@example.com"
                  className="pl-10 h-12 rounded-xl border-border/50 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Heslo</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isLogin ? "Zadejte heslo" : "Minimálně 6 znaků"}
                  className="h-12 rounded-xl border-border/50 focus:border-primary pr-10"
                  required
                  minLength={isLogin ? undefined : 6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="reg-phone">
                  Telefon <span className="font-normal text-muted-foreground">(nepovinné)</span>
                </label>
                <Input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+420 777 123 456"
                  className="h-12 rounded-xl border-border/50 focus:border-primary"
                />
              </div>
            )}

            {!isLogin && <ConsentFields value={consents} onChange={setConsents} />}

            {isLogin && (
              <div className="text-right -mt-3">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Zapomněli jste heslo?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="btn-apple w-full h-12 text-base"
              disabled={
                isSubmitting ||
                !email ||
                (isLogin && !password) ||
                (!isLogin && (!firstName || !lastName || !consents.terms))
              }
            >
              {isSubmitting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <>
                  {isLogin ? "Přihlásit se" : "Vytvořit účet zdarma"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/podminky" className="hover:text-foreground hover:underline">
              Podmínky užívání
            </Link>
            {" · "}
            <Link to="/ochrana-osobnich-udaju" className="hover:text-foreground hover:underline">
              Ochrana osobních údajů
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};
