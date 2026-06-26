import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Mail, Eye, EyeOff, User, Users, Star, TrendingUp, Shield, Clock, Award, Gift, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";

interface LoginPageProps {
  // onLogin se volá až po reálném ověření v Supabase (přes onAuthStateChange ve vyšší komponentě)
  onLogin: () => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { first_name: firstName, last_name: lastName } },
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
      toast({
        title: "Registrace úspěšná!",
        description: "Vítejte ve VISIBLE7 - spouštíme váš 14denní zkušební přístup.",
      });
      onLogin();
    }

    setIsSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({
        title: "Přihlášení přes Google se nezdařilo",
        description: result.error instanceof Error ? result.error.message : String(result.error),
        variant: "destructive",
      });
    }
    if (result.redirected) {
      // Browser redirects to Google - just return
      return;
    }
    // Tokens received - user is authenticated, onAuthStateChange listener
    // in AuthGate will update the session and render protected content.
  };

  const handleAppleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({
        title: "Přihlášení přes Apple se nezdařilo",
        description: result.error instanceof Error ? result.error.message : String(result.error),
        variant: "destructive",
      });
    }
    if (result.redirected) {
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
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

      {/* Pricing - zjednodušený jeden plán */}
      <div className="container mx-auto px-4 py-16" id="pricing">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-6 bg-primary/5 rounded-xl border border-primary/20 mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-primary">14denní zkušební přístup zdarma</span>
            </div>
            <p className="text-muted-foreground">
              Vyzkoušejte celou metodiku VISIBLE7 zdarma. Po skončení zkušebního období pokračujete za 290 Kč/měsíc.
            </p>
          </div>

          <Card className="p-8">
            <h3 className="text-xl font-semibold mb-2">VISIBLE7</h3>
            <div className="text-4xl font-bold text-primary mb-1">290 Kč<span className="text-base font-normal text-muted-foreground"> / měsíc</span></div>
            <p className="text-sm text-muted-foreground mb-6">Zrušitelné kdykoliv</p>
            <ul className="text-sm space-y-3 mb-2 text-left max-w-xs mx-auto">
              <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Všech 7 fází VISIBLE7</li>
              <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />Uložený postup vašeho projektu</li>
              <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />AI validace a doporučení</li>
              <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />PDF a Excel exporty</li>
            </ul>
          </Card>
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
                {isLogin ? "Vstupte do své VISIBLE7 aplikace" : "Zaregistrujte se a získejte 14 dní zdarma"}
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">nebo</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-apple-secondary w-full h-12 text-base"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Pokračovat s Google
              </Button>

              <Button
                type="button"
                onClick={handleAppleLogin}
                className="btn-apple-secondary w-full h-12 text-base bg-black hover:bg-black/90 text-white"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-1.05 3.95-.84 1.65.16 2.77.97 3.42 2.16-2.95 1.71-2.32 5.98.22 7.13-.57 1.5-1.31 2.99-2.54 4.09l.22-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Pokračovat s Apple
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
