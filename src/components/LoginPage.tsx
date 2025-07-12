import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Mail, Eye, EyeOff, User, CheckCircle, Users, Star, TrendingUp, Shield, Clock, Award, Gift, Check, Zap, Briefcase } from "lucide-react";
import { PromoCodeInput } from "@/components/PromoCodeInput";
import { PricingModal } from "@/components/PricingModal";
import { getPromoCodeAccess } from "@/lib/promoCodes";

interface LoginPageProps {
  onLogin: (email: string, hasPromoAccess?: boolean, name?: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1 = registration, 2 = promo code
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && (!isLogin || password)) {
      if (!isLogin) {
        // For registration, go to step 2 (promo code)
        setStep(2);
      } else {
        // For login, proceed directly
        const hasPromoAccess = !!getPromoCodeAccess();
        onLogin(email, hasPromoAccess, `${firstName} ${lastName}`.trim());
      }
    }
  };

  const handleSkipPromo = () => {
    const fullName = `${firstName} ${lastName}`.trim();
    localStorage.setItem('userName', fullName);
    onLogin(email, false, fullName);
  };

  const handleGoogleLogin = () => {
    // Simulace Google přihlášení
    const hasPromoAccess = !!getPromoCodeAccess();
    onLogin("user@gmail.com", hasPromoAccess, "Google User");
  };

  const handlePromoSuccess = () => {
    setShowPromoInput(false);
    const fullName = `${firstName} ${lastName}`.trim();
    localStorage.setItem('userName', fullName);
    onLogin(email, true, fullName);
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="w-8 h-0.5 bg-primary"></div>
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">2</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-apple-title mb-2">Skvělé, {firstName}! 🎉</h1>
            <p className="text-apple-subtitle">
              Máte promokód? Získejte přístup zdarma!
            </p>
          </div>

          <Card className="card-apple p-8">
            {!showPromoInput ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Speciální nabídka</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    S promokódem získáte přístup ke všem 7 fázím VISIBLE7 zdarma
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowPromoInput(true)}
                    className="btn-apple w-full h-12"
                  >
                    <Gift className="mr-2 w-4 h-4" />
                    Mám promokód
                  </Button>
                  
                  <Button
                    onClick={handleSkipPromo}
                    variant="outline"
                    className="w-full h-12 border-border/50 hover:border-primary"
                  >
                    Pokračovat bez promokódu
                  </Button>
                </div>
              </div>
            ) : (
              <PromoCodeInput onSuccess={handlePromoSuccess} />
            )}
          </Card>
        </div>
      </div>
    );
  }

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
                Projděte si ověřenou metodiku VISIBLE7, kterou využilo už <strong>500+ podnikatelů</strong> k vybudování prosperujícího online byznysu
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  onClick={() => {
                    const registerSection = document.getElementById('register');
                    registerSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-apple px-8 py-3 text-base"
                >
                  Začít zdarma
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => setShowPricing(true)}
                  variant="outline"
                  className="px-8 py-3 text-base border-border/50 hover:border-primary"
                >
                  Zobrazit plány
                </Button>
              </div>
              
              {/* Benefits */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Růst tržeb</h3>
                    <p className="text-xs text-muted-foreground">Průměrně +150% za rok</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Úspora času</h3>
                    <p className="text-xs text-muted-foreground">Strukturovaný postup</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-background/50 rounded-xl border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">Ověřená metoda</h3>
                    <p className="text-xs text-muted-foreground">500+ úspěšných případů</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-4 py-16" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Vyberte si plán</h2>
            <p className="text-muted-foreground">Začněte zdarma nebo si vyberte plán pro kompletní metodiku</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Freemium Plan */}
            <Card className="p-6 relative">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Freemium</h3>
                <div className="text-3xl font-bold text-primary mb-4">0 Kč</div>
                <p className="text-sm text-muted-foreground mb-6">Pro začátečníky</p>
                
                <ul className="text-sm space-y-3 mb-6 text-left">
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Fáze 1: Vision</li>
                  <li className="flex items-center text-muted-foreground"><Shield className="w-4 h-4 mr-2" />Blue Ocean Strategy</li>
                  <li className="flex items-center text-muted-foreground"><Shield className="w-4 h-4 mr-2" />ERRC matice</li>
                </ul>
                
                <Button 
                  onClick={() => {
                    const registerSection = document.getElementById('register');
                    registerSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  variant="outline" 
                  className="w-full"
                >
                  Začít zdarma
                </Button>
              </div>
            </Card>

            {/* Basic Plan */}
            <Card className="p-6 relative">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Basic</h3>
                <div className="text-3xl font-bold text-primary mb-4">490 Kč</div>
                <p className="text-sm text-muted-foreground mb-6">Jednorázová platba</p>
                
                <ul className="text-sm space-y-3 mb-6 text-left">
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Fáze 1-3</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Vision + Ideation + Strategy</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />ROI kalkulačka</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />PDF exporty</li>
                </ul>
                
                <Button onClick={() => setShowPricing(true)} className="w-full">Vybrat Basic</Button>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="p-6 relative border-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Nejoblíbenější</span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Premium</h3>
                <div className="text-3xl font-bold text-primary mb-4">990 Kč</div>
                <p className="text-sm text-muted-foreground mb-6">Kompletní metodika</p>
                
                <ul className="text-sm space-y-3 mb-6 text-left">
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Všech 7 fází</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Implementation roadmap</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Launch strategie</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Expansion plány</li>
                  <li className="flex items-center"><Check className="w-4 h-4 text-green-500 mr-2" />Investor pitch</li>
                </ul>
                
                <Button onClick={() => setShowPricing(true)} className="w-full">Vybrat Premium</Button>
              </div>
            </Card>
          </div>

          {/* Future Plans Preview */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">🚀 Připravujeme pro vás</p>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <h4 className="font-semibold">Premium+ (99 Kč/měsíc)</h4>
                    <p className="text-xs text-muted-foreground">Měsíční updates + expertní konzultace</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-muted/30">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <h4 className="font-semibold">Business (199 Kč/měsíc)</h4>
                    <p className="text-xs text-muted-foreground">Team access + networking events</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="flex items-center justify-center p-4" id="register">
        <div className="w-full max-w-md animate-fade-in">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">1</span>
              </div>
              <div className="w-8 h-0.5 bg-border"></div>
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground">2</span>
              </div>
            </div>
          </div>

          {/* Hlavní karta */}
          <Card className="card-apple p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? "Přihlaste se" : "Začněte svou cestu"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin ? "Vstupte do své VISIBLE7 aplikace" : "Registrace je zdarma a trvá jen minutu"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Jméno - pouze pro registraci */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Křestní jméno
                    </label>
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
                    <label className="text-sm font-medium text-foreground">
                      Příjmení
                    </label>
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

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  E-mailová adresa
                </label>
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

              {/* Heslo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Heslo
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "Zadejte heslo" : "Minimálně 6 znaků"}
                    className="h-12 rounded-xl border-border/50 focus:border-primary pr-10"
                    required={isLogin}
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

              {/* Přihlášení / Registrace toggle */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  {isLogin ? "Nemáte účet? Zaregistrujte se" : "Už máte účet? Přihlaste se"}
                </button>
              </div>

              {/* Tlačítko pro odeslání */}
              <Button
                type="submit"
                className="btn-apple w-full h-12 text-base"
                disabled={!email || (isLogin && !password) || (!isLogin && (!firstName || !lastName))}
              >
                {isLogin ? "Přihlásit se" : "Pokračovat"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              {/* Děličku */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-4 text-muted-foreground">nebo</span>
                </div>
              </div>

              {/* Google přihlášení */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="btn-apple-secondary w-full h-12 text-base"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Pokračovat s Google
              </Button>
            </form>
          </Card>

          {/* Social Proof - pouze pro přihlášení */}
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
                    "VISIBLE7 mi pomohla zvýšit tržby o 200% za 6 měsíců!"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    - Marie K., e-shop majitelka
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-apple-body">
            <div className="flex items-center justify-center gap-6 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>500+ podnikatelů</span>
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
              <a href="#" className="text-primary hover:text-primary/80">
                Obchodními podmínkami
              </a>{" "}
              a{" "}
              <a href="#" className="text-primary hover:text-primary/80">
                Zásadami ochrany osobních údajů
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricing && (
        <PricingModal 
          onClose={() => setShowPricing(false)}
          onSuccess={() => {
            setShowPricing(false);
            onLogin(email || "user@example.com", true, `${firstName} ${lastName}`.trim());
          }}
          completedPhases={0}
          totalPhases={7}
        />
      )}
    </div>
  );
};