
# VISIBLE7 - Kompletní Mega-Prompt pro Business Strategy Aplikaci

## 🎯 Přehled aplikace

VISIBLE7 je pokročilá React aplikace pro tvorbu business strategie s 7 fázemi rozvoje podnikání. Aplikace kombinuje moderní design inspirovaný Apple s pokročilými business nástroji a má freemium model - fáze 1-4 zdarma po registraci, fáze 5-7 za jednorázovou platbu 990 Kč.

### Klíčové vlastnosti
- 7 strukturovaných fází business development
- Freemium model s premium upgradem
- Apple-inspirovaný design systém
- Pokročilé business nástroje a kalkulačky
- Real-time data persistence
- Excel export funkcionalita
- Responzivní design pro všechna zařízení

## 🔧 Technický stack

### Core technologie
```json
{
  "frontend": "React 18 + TypeScript + Vite",
  "styling": "Tailwind CSS + Radix UI",
  "routing": "React Router v6",
  "state": "Context API + localStorage",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "exports": "XLSX",
  "notifications": "Sonner"
}
```

### Závislosti
```bash
npm install react@^18.3.1 react-dom@^18.3.1 typescript
npm install @radix-ui/react-* # všechny UI komponenty
npm install react-router-dom@^6.26.2
npm install react-hook-form@^7.53.0 @hookform/resolvers@^3.9.0
npm install zod@^3.23.8
npm install recharts@^2.15.4
npm install xlsx@^0.18.5
npm install sonner@^1.5.0
npm install lucide-react@^0.462.0
npm install tailwind-merge@^2.5.2
npm install clsx@^2.1.1
```

## 🏗️ Architektura aplikace

### Struktura složek
```
src/
├── components/           # UI komponenty
│   ├── ui/              # Základní UI komponenty (shadcn/ui)
│   ├── layout/          # Layout komponenty
│   ├── Dashboard.tsx    # Hlavní dashboard
│   ├── *Phase.tsx       # Komponenty pro jednotlivé fáze
│   └── *.tsx           # Ostatní komponenty
├── contexts/            # React Context
│   └── AuthContext.tsx  # Autentizace
├── hooks/              # Custom hooks
│   ├── usePersistedState.ts
│   └── useTrial.ts
├── lib/                # Utility funkce
│   ├── utils.ts
│   ├── promoCodes.ts
│   └── excelExport.ts
├── pages/              # Stránky
├── types/              # TypeScript definice
└── App.tsx             # Root komponenta
```

### Routing struktura
```typescript
const routes = [
  { path: "/", element: <LauncherPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/home", element: <HomePage /> },
  { path: "/vision", element: <VisionPage /> },           // Fáze 1 (zdarma)
  { path: "/ideation", element: <IdeationPage /> },       // Fáze 2 (zdarma)
  { path: "/strategy", element: <StrategyPage /> },       // Fáze 3 (zdarma)
  { path: "/implementation", element: <ImplementationPage /> }, // Fáze 4 (zdarma)
  { path: "/benchmarking-phase", element: <BenchmarkingPage /> }, // Fáze 5 (premium)
  { path: "/launch", element: <LaunchPage /> },           // Fáze 6 (premium)
  { path: "/expansion", element: <ExpansionPage /> },     // Fáze 7 (premium)
  { path: "/investor-pitch", element: <InvestorPitchPage /> },
  // Preview stránky pro premium fáze
  { path: "/benchmarking-phase/preview", element: <BenchmarkingPreviewPage /> },
  { path: "/launch/preview", element: <LaunchPreviewPage /> },
  { path: "/expansion/preview", element: <ExpansionPreviewPage /> }
];
```

## 🎨 Design systém (Apple-inspirovaný)

### Barevná paleta
```css
:root {
  --primary: 221 83% 53%;        /* #007AFF Apple blue */
  --background: 0 0% 100%;       /* Pure white */
  --card: 0 0% 100%;             /* White cards */
  --border: 214 32% 91%;         /* Light gray borders */
  --muted: 210 40% 96%;          /* Very light gray */
  --accent: 210 40% 96%;         /* Accent color */
  --foreground: 222 47% 11%;     /* Dark text */
  --muted-foreground: 215 16% 47%; /* Gray text */
}
```

### Typography
```css
.text-apple-title {
  @apply text-2xl font-bold tracking-tight text-foreground;
}

.text-apple-subtitle {
  @apply text-lg font-medium text-muted-foreground;
}

.text-apple-body {
  @apply text-sm text-muted-foreground leading-relaxed;
}
```

### Komponenty
```css
.card-apple {
  @apply bg-card border border-border rounded-xl shadow-sm;
}

.card-apple-hover {
  @apply card-apple hover:shadow-md hover:scale-[1.02] transition-all duration-200;
}

.btn-apple {
  @apply bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium 
         hover:bg-primary/90 active:scale-95 transition-all duration-200;
}
```

## 🔐 Autentizace a přístup

### AuthContext implementace
```typescript
interface AuthContextType {
  currentUser: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPromoAccess: boolean;
  userName: string | null;
  login: (email: string, hasPromoAccess?: boolean, name?: string) => void;
  logout: () => void;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [hasPromoAccess, setHasPromoAccess] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // localStorage persistence logic
  useEffect(() => {
    const storedEmail = localStorage.getItem('currentUser');
    const storedPromoAccess = localStorage.getItem('hasPromoAccess') === 'true';
    const storedUserName = localStorage.getItem('userName');
    
    if (storedEmail) {
      setCurrentUser(storedEmail);
      setHasPromoAccess(storedPromoAccess);
      setUserName(storedUserName);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, hasPromoAccess?: boolean, name?: string) => {
    setCurrentUser(email);
    localStorage.setItem('currentUser', email);
    
    if (hasPromoAccess) {
      setHasPromoAccess(true);
      localStorage.setItem('hasPromoAccess', 'true');
    }
    
    if (name) {
      setUserName(name);
      localStorage.setItem('userName', name);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setHasPromoAccess(false);
    setUserName(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hasPromoAccess');
    localStorage.removeItem('userName');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      hasPromoAccess,
      userName,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Promo kódy systém
```typescript
const PROMO_CODES = {
  'ONLINE2024': { 
    type: 'beta_access', 
    description: 'Online kurz 2024',
    expiryDate: '2024-12-31'
  },
  'PREZENCNI2024': { 
    type: 'beta_access', 
    description: 'Prezenční kurz 2024',
    expiryDate: '2024-12-31'
  },
  'VISIBLE7FREE': { 
    type: 'beta_access', 
    description: 'Free access code',
    expiryDate: '2025-12-31'
  }
};

export const validatePromoCode = (code: string): boolean => {
  const promoCode = PROMO_CODES[code];
  if (!promoCode) return false;
  
  const today = new Date();
  const expiryDate = new Date(promoCode.expiryDate);
  
  return today <= expiryDate;
};
```

## 📊 7 Fází aplikace (detailní specifikace)

### Fáze 1: Vision (Zdarma)
**Komponenta**: `VisionPhase.tsx`
**Nástroj**: Blue Ocean Strategy + ERRC Matrix

**Funkce**:
- Formulář pro základní informace o projektu
- Interaktivní ERRC matice (Eliminate, Reduce, Raise, Create)
- Value Curve visualization s konkurenčním porovnáním
- AI analýza s Blue Ocean Score kalkulací
- Real-time validace vstupů
- LocalStorage persistence

**Data struktura**:
```typescript
interface VisionData {
  projectName: string;
  industry: string;
  targetMarket: string;
  errc: {
    eliminate: string[];
    reduce: string[];
    raise: string[];
    create: string[];
  };
  valueCurve: {
    factors: string[];
    ourProduct: number[];
    competitor1: number[];
    competitor2: number[];
  };
  blueOceanScore: number;
  aiRecommendations: string[];
}
```

**UI komponenty**:
- ERRCMatrix komponenta s drag & drop
- ValueCurveChart s Recharts
- AIAnalysis panel s doporučeními
- ProgressTracker pro completion status

### Fáze 2: Ideation (Zdarma)
**Komponenta**: `IdeationPhase.tsx`
**Nástroj**: Lean Canvas

**Funkce**:
- 9-blokový Lean Canvas v grid layoutu
- Interaktivní formulář pro každý blok
- Real-time validace Business Model Fit
- AI doporučení na základě vyplněných dat
- Export do různých formátů

**Data struktura**:
```typescript
interface LeanCanvasData {
  problem: string;
  solution: string;
  keyMetrics: string;
  uniqueValueProposition: string;
  unfairAdvantage: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
  validationScore: number;
  aiInsights: string[];
}
```

**UI komponenty**:
- LeanCanvasGrid s responzivním layoutem
- BlockEditor pro každý canvas blok
- ValidationIndicator pro business model fit
- ExportOptions panel

### Fáze 3: Strategy & Business (Zdarma)
**Komponenta**: `StrategyBusinessPhase.tsx`
**Nástroj**: ROI kalkulačka + Business Model Canvas

**Funkce**:
- Komplexní ROI kalkulačka s projekcemi
- Finanční plánování na 12 měsíců
- Break-even analýza
- Investiční náklady vs. očekávané výnosy
- Interaktivní grafy a vizualizace
- Scenario planning (optimistický, realistický, pesimistický)

**Data struktura**:
```typescript
interface StrategyData {
  initialInvestment: number;
  monthlyRevenue: number[];
  monthlyCosts: number[];
  breakEvenMonth: number;
  roi12Months: number;
  scenarios: {
    optimistic: FinancialProjection;
    realistic: FinancialProjection;
    pessimistic: FinancialProjection;
  };
  businessModel: BusinessModelCanvas;
}
```

**UI komponenty**:
- ROICalculator s live calculations
- FinancialProjectionChart (Recharts)
- ScenarioComparison table
- BusinessModelCanvas grid

### Fáze 4: Implementation (Zdarma - browsing)
**Komponenta**: `ImplementationPhase.tsx`
**Funkce**: Přehled 15+ business typů s roadmapami

**Business typy**:
1. E-commerce (Shopify, WooCommerce)
2. SaaS aplikace (B2B, B2C)
3. Digitální kurzy
4. Consulting services
5. Drop-shipping
6. Affiliate marketing
7. Mobilní aplikace
8. Fyzické produkty
9. Franchise business
10. Lokální služby
11. B2B služby
12. Subscription model
13. Marketplace
14. Digitální produkty
15. Hybrid model

**Pro každý typ**:
- Detailní popis a charakteristiky
- Krok-za-krokem roadmapa
- Potřebné nástroje a technologie
- Časové odhady realizace
- Investiční požadavky
- Příklady úspěšných implementací

**Data struktura**:
```typescript
interface BusinessType {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToLaunch: string;
  initialInvestment: string;
  roadmap: RoadmapStep[];
  tools: Tool[];
  examples: Example[];
  templates: Template[];
}
```

### Fáze 5: Benchmarking & Testing (Premium - 990 Kč)
**Komponenta**: `BenchmarkingTestingPhase.tsx`
**Nástroj**: 9 marketingových kanálů s detailními checklists

**Marketingové kanály**:

1. **Srovnávače zboží** (Heureka, Zbozi.cz)
   - Registrace na platformách
   - XML feed setup
   - PPC kampaně nastavení
   - Optimization tips

2. **Katalogy a marketplace** (Favi, Glami, Mall)
   - Profilové stránky
   - Produktové katalogy
   - Partner programy
   - Sync automatizace

3. **PPC kampaně** (Google Ads, Sklik)
   - Keyword research
   - Kampaň struktura
   - Landing page optimization
   - Bid management

4. **SEO optimalizace**
   - Technical SEO audit
   - Content strategy
   - Link building
   - Local SEO

5. **Sociální sítě** (Facebook, Instagram, TikTok)
   - Profil optimization
   - Content calendar
   - Advertising campaigns
   - Community management

6. **E-mail marketing**
   - Platform setup (Mailchimp, Ecomail)
   - Automation sequences
   - Segmentation strategy
   - Performance tracking

7. **SMS marketing**
   - SMS gateway setup
   - GDPR compliance
   - Automation triggers
   - Campaign optimization

8. **PR & influenceři**
   - Media outreach
   - Influencer partnerships
   - Press release distribution
   - Relationship building

9. **Copywriting**
   - Audience analysis
   - Message positioning
   - A/B testing
   - Conversion optimization

**Pro každý kanál**:
```typescript
interface MarketingChannel {
  id: string;
  name: string;
  description: string;
  difficulty: 'Nízká' | 'Střední' | 'Vyšší';
  setupTime: string;
  adType: 'Placená reklama' | 'Organická reklama';
  steps: MarketingStep[];
  estimatedCost: number;
  expectedROI: string;
  bestPractices: string[];
}

interface MarketingStep {
  id: string;
  task: string;
  platform: string;
  note?: string;
  price: number;
  completed: boolean;
  estimatedTime: string;
}
```

### Fáze 6: Launch (Premium - 990 Kč)
**Komponenta**: `LaunchPhase.tsx`
**Nástroj**: Go-to-market strategie a launch management

**Funkce**:
- Pre-launch checklist (50+ bodů)
- Launch day timeline
- KPI tracking dashboard
- Performance monitoring
- Post-launch optimization
- Crisis management plan

**Data struktura**:
```typescript
interface LaunchData {
  prelaunchChecklist: ChecklistItem[];
  launchTimeline: TimelineEvent[];
  kpis: LaunchKPI;
  performanceMetrics: PerformanceMetric[];
  optimizationTasks: OptimizationTask[];
  crisisManagement: CrisisScenario[];
}

interface LaunchKPI {
  target: {
    orders: number;
    avgOrderValue: number;
    visitors: number;
    conversionRate: number;
    cpc: number;
    roas: number;
  };
  actual: {
    orders: number;
    avgOrderValue: number;
    visitors: number;
    conversionRate: number;
    cpc: number;
    roas: number;
  };
}
```

**UI komponenty**:
- LaunchChecklistManager
- KPITrackingDashboard
- PerformanceChart (real-time)
- OptimizationRecommendations

### Fáze 7: Expansion (Premium - 990 Kč)
**Komponenta**: `ExpansionPhase.tsx`
**Nástroj**: Škálování a růst s pokročilými kalkulačkami

**Funkce**:
1. **Work Value Calculator** - kdy najmout zaměstnance
2. **Growth Rule Analyzer** - 70/30 pravidlo (provoz vs. růst)
3. **Cashflow Forecasting** - predikce cashflow na 12 měsíců
4. **Growth Readiness Assessment** - hodnocení připravenosti na růst
5. **Scaling Recommendations** - AI doporučení pro škálování

**Data struktura**:
```typescript
interface ExpansionData {
  workValue: {
    monthlyProfit: number;
    hourlyRate: number;
    idealEmployeeRate: number;
    shouldHire: boolean;
    marketRate: number;
  };
  growthRule: {
    weeklyGrowthHours: number;
    weeklyOperationalHours: number;
    growthPercentage: number;
    isHealthy: boolean;
    totalWeeklyHours: number;
  };
  cashflow: {
    monthlyRevenue: number;
    fixedCosts: number;
    variableCosts: number;
    reservePercentage: number;
    recommendedReserve: number;
    netCashflow: number;
    forecastMonths: number;
  };
  growthParameters: {
    stableProfitMonths: number;
    pnoPercentage: number;
    hasKPIs: boolean;
    hasAnalytics: boolean;
    readyForGrowth: boolean;
    readinessScore: number;
  };
  reflection: {
    growthBarriers: string;
    delegationTasks: string;
    weeklyGrowthHours: number;
    supportSystem: string;
    scalingPlan: 'people' | 'systems' | 'combination' | '';
  };
  aiRecommendations: string[];
}
```

## 💰 Monetizace a platební systém

### Freemium model
```typescript
const PRICING_TIERS = {
  free: {
    name: 'Zdarma',
    phases: [1, 2, 3, 4], // Vision, Ideation, Strategy, Implementation browsing
    features: [
      'Blue Ocean Strategy nástroje',
      'Lean Canvas builder',
      'ROI kalkulačka',
      'Přehled business typů',
      'Základní export funkce'
    ]
  },
  premium: {
    name: 'Premium',
    price: 990,
    currency: 'CZK',
    phases: [5, 6, 7], // Benchmarking, Launch, Expansion
    features: [
      'Vše ze zdarma verze',
      '9 marketingových kanálů',
      'Go-to-market strategie',
      'Škálování a růst nástroje',
      'Pokročilý Excel export',
      'AI analýzy a doporučení'
    ]
  }
};
```

### Platební komponenty
```typescript
interface PricingModalProps {
  onClose: () => void;
  onSuccess: () => void;
  completedPhases: number;
  totalPhases: number;
}

// Simulovaná platba pro demo
const handlePayment = async (paymentData: PaymentData) => {
  // Simulace platební brány
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Grant premium access
  localStorage.setItem('hasAccess', 'true');
  
  return { success: true, transactionId: 'demo_' + Date.now() };
};
```

## 🔍 Pokročilé funkce

### Data persistence
```typescript
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to load ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn(`Failed to save ${key} to localStorage:`, error);
    }
  }, [key, state]);

  return [state, setState];
}
```

### Excel export systém
```typescript
export const generateExcelReport = (data: {
  vision: VisionData;
  ideation: LeanCanvasData;
  strategy: StrategyData;
  // ... další data
}) => {
  const workbook = XLSX.utils.book_new();
  
  // Vision worksheet
  const visionWS = XLSX.utils.json_to_sheet([
    { Kategorie: 'Eliminate', Hodnoty: data.vision.errc.eliminate.join(', ') },
    { Kategorie: 'Reduce', Hodnoty: data.vision.errc.reduce.join(', ') },
    { Kategorie: 'Raise', Hodnoty: data.vision.errc.raise.join(', ') },
    { Kategorie: 'Create', Hodnoty: data.vision.errc.create.join(', ') }
  ]);
  
  XLSX.utils.book_append_sheet(workbook, visionWS, 'Vision');
  
  // Ideation worksheet
  const ideationWS = XLSX.utils.json_to_sheet([
    { Blok: 'Problem', Obsah: data.ideation.problem },
    { Blok: 'Solution', Obsah: data.ideation.solution },
    // ... další bloky
  ]);
  
  XLSX.utils.book_append_sheet(workbook, ideationWS, 'Ideation');
  
  // Strategy worksheet s finančními daty
  const strategyWS = XLSX.utils.json_to_sheet([
    { Metrika: 'Počáteční investice', Hodnota: data.strategy.initialInvestment },
    { Metrika: 'ROI 12 měsíců', Hodnota: data.strategy.roi12Months + '%' },
    { Metrika: 'Break-even měsíc', Hodnota: data.strategy.breakEvenMonth }
  ]);
  
  XLSX.utils.book_append_sheet(workbook, strategyWS, 'Strategy');
  
  // Generate and download
  XLSX.writeFile(workbook, `VISIBLE7_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
```

### AI integrace (simulovaná)
```typescript
export const generateAIRecommendations = (data: any, phase: string): string[] => {
  // Simulace AI analýzy založené na vstupních datech
  const recommendations: Record<string, string[]> = {
    vision: [
      'Vaše Blue Ocean skóre naznačuje silnou diferenciaci',
      'Zvažte posílení Create faktoru pro větší inovaci',
      'Konkurenční analýza ukazuje příležitost v segmentu X'
    ],
    ideation: [
      'Lean Canvas vykazuje vysokou koherenci',
      'Revenue streams by měly být více diverzifikované',
      'Customer segments vyžadují hlubší validaci'
    ],
    strategy: [
      'ROI projekce je konzervativní a realistická',
      'Breakeven v měsíci X je v tržním průměru',
      'Doporučujeme navýšit marketing budget o 20%'
    ]
  };
  
  return recommendations[phase] || [];
};
```

## 🎨 UI/UX specifikace

### Responzivní design
```css
/* Mobile First approach */
.container {
  @apply px-4 mx-auto max-w-7xl;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    @apply px-6;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    @apply px-8;
  }
}
```

### Animace a přechody
```css
.fade-in {
  @apply opacity-0 translate-y-4 transition-all duration-500;
}

.fade-in.visible {
  @apply opacity-100 translate-y-0;
}

.scale-hover {
  @apply hover:scale-105 transition-transform duration-200;
}

.button-press {
  @apply active:scale-95 transition-transform duration-100;
}
```

### Loading states
```typescript
const LoadingSpinner = ({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary ${sizeClasses[size]}`} />
  );
};
```

## 🔧 Deployment a konfigurace

### Build konfigurace
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          charts: ['recharts'],
          utils: ['xlsx', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
```

### Environment variables
```bash
# .env
VITE_APP_NAME=VISIBLE7
VITE_APP_VERSION=1.0.0
VITE_PAYMENT_GATEWAY_URL=https://api.stripe.com/v1
VITE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## 🧪 Testing strategie

### Unit testy
```typescript
// __tests__/components/Dashboard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from '@/components/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';

describe('Dashboard', () => {
  it('renders phase cards correctly', () => {
    render(
      <AuthProvider>
        <Dashboard userEmail="test@example.com" onLogout={() => {}} />
      </AuthProvider>
    );
    
    expect(screen.getByText('Vision')).toBeInTheDocument();
    expect(screen.getByText('Ideation')).toBeInTheDocument();
    expect(screen.getByText('Strategy & Business')).toBeInTheDocument();
  });
  
  it('handles phase navigation', () => {
    const { getByText } = render(
      <AuthProvider>
        <Dashboard userEmail="test@example.com" onLogout={() => {}} />
      </AuthProvider>
    );
    
    fireEvent.click(getByText('Vision'));
    // Assert navigation occurred
  });
});
```

### Integration testy
```typescript
// __tests__/flows/AuthFlow.test.tsx
describe('Authentication Flow', () => {
  it('allows user to login and access free phases', async () => {
    // Test complete auth flow
  });
  
  it('restricts access to premium phases without payment', async () => {
    // Test premium access restrictions
  });
});
```

## 🚀 Implementační checklist

### 1. Základní setup
- [ ] Vytvořit React + TypeScript projekt
- [ ] Nainstalovat všechny dependencies
- [ ] Nastavit Tailwind CSS
- [ ] Implementovat základní routing

### 2. Autentizace
- [ ] Vytvořit AuthContext
- [ ] Implementovat login/logout logiku
- [ ] Přidat promo kódy systém
- [ ] Vytvořit ProtectedRoute komponentu

### 3. UI/UX
- [ ] Implementovat design systém
- [ ] Vytvořit základní UI komponenty
- [ ] Přidat responsivní layout
- [ ] Implementovat animace

### 4. Fáze 1-4 (Zdarma)
- [ ] VisionPhase s Blue Ocean Strategy
- [ ] IdeationPhase s Lean Canvas
- [ ] StrategyPhase s ROI kalkulačkou
- [ ] ImplementationPhase s business typy

### 5. Fáze 5-7 (Premium)
- [ ] BenchmarkingPhase s marketingovými kanály
- [ ] LaunchPhase s go-to-market strategií
- [ ] ExpansionPhase s škálováním

### 6. Monetizace
- [ ] Implementovat PricingModal
- [ ] Přidat platební simulaci
- [ ] Vytvořit access management

### 7. Pokročilé funkce
- [ ] Excel export systém
- [ ] Data persistence
- [ ] AI doporučení (simulovaná)
- [ ] Performance optimalizace

### 8. Testing a deployment
- [ ] Unit testy pro klíčové komponenty
- [ ] Integration testy
- [ ] Build optimalizace
- [ ] Deployment setup

## 📈 Budoucí rozšíření

### Plánované funkce
1. **Real AI integrace** - OpenAI API pro skutečné AI analýzy
2. **Collaboration features** - Multi-user workspace
3. **Advanced analytics** - Detailní metriky a reporting
4. **Mobile aplikace** - React Native verze
5. **API integrace** - Propojení s business nástroji
6. **White-label verze** - Customizovatelná verze pro partnery

### Technické vylepšení
1. **Performance optimalizace** - Code splitting, lazy loading
2. **Offline support** - Service worker implementace
3. **Real-time sync** - WebSocket pro live collaboration
4. **Advanced security** - OAuth2, JWT tokens
5. **Internationalization** - Multi-language support

---

Tento mega-prompt obsahuje kompletní specifikaci pro vytvoření VISIBLE7 aplikace včetně všech technických detailů, business logiky, UI/UX guidelines a implementačních kroků. Aplikace může být vytvořena step-by-step podle této dokumentace.
