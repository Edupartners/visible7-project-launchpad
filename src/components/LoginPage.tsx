import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Mail, Eye, EyeOff, User, Users, Star, TrendingUp, Shield, Clock, Award } from "lucide-react";
import { supabase } from "@/integrations/visible7/client";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (isLogin && !password) || (!isLogin && (!firstName || !lastName))) return;

    setIsSubmitting(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: "Přihlášení se nezdařilo",
          description: error.message === "Invalid login credentials"
            ? "Nesprávný e-mail nebo heslo."
            : error.message,
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
          data: { first_name: firstName, last_name: lastName },
        },
      });
      if (error) {
        toast({
          title: "Registrace se nezdařila",
          description: error.message === "User already registered"
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
        : { title: "E-mail odeslán", description: "Pokud účet existuje, přijde vám odkaz pro nastavení nového hesla." }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-6">
                <span className="text-3xl font-bold text-primary-foreground">V7</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                7 kroků k úspěšnému <br />
                <span className="text-primary">online podnikání</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Projděte si ověřenou metodiku VISIBLE7 a vybudujte prosperující online byznys
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-apple px-8 py-3 text-base relative z-50"
                >
                  Začít zdarma
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Strukturovaný postup</h3>
                    <p className="text-xs text-muted-foreground">7 kroků od vize k expanzi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Úspora času</h3>
                    <p className="text-xs text-muted-foreground">Vše na jednom místě</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Ověřená metodika</h3>
                    <p className="text-xs text-muted-foreground">VISIBLE7 MICEK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration / Login Form */}
      <div className="flex items-center justify-center p-4" id="register">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="card-apple p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? "Přihlaste se" : "Začněte svou cestu"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? "Vstupte do své VISIBLE7 aplikace" : "Zaregistrujte se a získejte plný přístup zdarma"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? "Nemáte účet? Zaregistrujte se" : "Už máte účet? Přihlaste se"}
                </button>
              </div>

              <Button
                type="submit"
                className="btn-apple w-full h-12 text-base"
                disabled={isSubmitting || !email || (isLogin && !password) || (!isLogin && (!firstName || !lastName))}
              >
                {isSubmitting ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    {isLogin ? "Přihlásit se" : "Pokračovat"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>

            </form>
          </Card>

          {isLogin && (
            <div className="mt-8">
              <Card className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    "VISIBLE7 mi pomohla strukturovat celé podnikání od nuly."
                  </p>
                </div>
              </Card>
            </div>
          )}

          <div className="text-center mt-8 text-apple-body">
            <div className="flex items-center justify-center gap-6 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Komunita podnikatelů</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Ověřená metoda</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>100% bezpečné</span>
              </div>
            </div>
            <p className="text-xs">
              Pokračováním souhlasíte s našimi{" "}
              <a href="#" className="text-primary hover:text-primary/80">Obchodními podmínkami</a>{" "}
              a{" "}
              <a href="#" className="text-primary hover:text-primary/80">Zásadami ochrany osobních údajů</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
