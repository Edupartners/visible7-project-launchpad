import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MembershipPage from "./pages/MembershipPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import { PromoAutoRedeem } from "@/components/access/PromoRedeem";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthGate } from "@/components/AuthGate";
import LauncherPage from "./pages/LauncherPage";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";

import VisionPage from "./pages/VisionPage";
import IdeationPage from "./pages/IdeationPage";
import StrategyPage from "./pages/StrategyPage";
import ImplementationPage from "./pages/ImplementationPage";
import BenchmarkingPage from "./pages/BenchmarkingPage";
import LaunchPage from "./pages/LaunchPage";
import ExpansionPage from "./pages/ExpansionPage";
import BusinessTypeDetailPage from "./pages/BusinessTypeDetailPage";
import MarketingChannelDetailPage from "./pages/MarketingChannelDetailPage";
import InvestorPitchPage from "./pages/InvestorPitchPage";
import NotFound from "./pages/NotFound";
import OAuthConsentPage from "./pages/OAuthConsentPage";
import CertificatePage from "./pages/CertificatePage";
import AdvisorsPage from "./pages/AdvisorsPage";
import LegalPage from "./pages/LegalPage";
import PricingPage from "./pages/PricingPage";
import FinancialPlanPage from "./pages/features/FinancialPlanPage";
import IdeaTestPage from "./pages/features/IdeaTestPage";
import BusinessPlanPage from "./pages/features/BusinessPlanPage";
import MarketingChannelsPage from "./pages/features/MarketingChannelsPage";
import BankConnectPage from "./pages/features/BankConnectPage";
import StartBusinessPage from "./pages/features/StartBusinessPage";
import ExistingBusinessPage from "./pages/features/ExistingBusinessPage";
import WhyDifferentPage from "./pages/features/WhyDifferentPage";
import SecurityPage from "./pages/SecurityPage";
import CertificationPage from "./pages/CertificationPage";
import WorksheetsPage from "./pages/WorksheetsPage";
import MemberWorksheetsPage from "./pages/MemberWorksheetsPage";
import AdminPage from "./pages/AdminPage";
import RentgenPage from "./pages/RentgenPage";
import QuizPage from "./pages/QuizPage";
import SeminarsPage from "./pages/SeminarsPage";
import JourneyMapPage from "./pages/JourneyMapPage";
import MarketRentgenPage from "./pages/MarketRentgenPage";
import TestPageEditor from "./pages/TestPageEditor";
import TestPagePublic from "./pages/TestPagePublic";
import { GateLock, PremiumGate } from "@/components/access/Locks";
import { PRIVACY, TERMS } from "./lib/legal";

const queryClient = new QueryClient();

// Testovací stránky uživatelů (/t/…) mají vlastní lištu souhlasu pro svůj Pixel a GA4.
const AppCookieBanner = () => (useLocation().pathname.startsWith("/t/") ? null : <CookieBanner />);

// Vnitřní (chráněné) routy - přístupné jen po přihlášení, AuthGate je obaluje společně.
const ProtectedRoutes = () => (
  <AuthGate>
    <PromoAutoRedeem />
    <Routes>
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<Navigate to="/settings" replace />} />
      <Route path="/poradci" element={<AdvisorsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/rentgen" element={<RentgenPage />} />
      <Route path="/kviz" element={<QuizPage />} />
      <Route path="/seminare" element={<SeminarsPage />} />
      <Route path="/mapa-cesty" element={<JourneyMapPage />} />
      <Route path="/rentgen-trhu" element={<MarketRentgenPage />} />
      <Route path="/listy" element={<MemberWorksheetsPage />} />
      <Route
        path="/testovaci-stranka"
        element={
          <GateLock gate={3}>
            <TestPageEditor />
          </GateLock>
        }
      />
      <Route path="/vision" element={<VisionPage />} />
      <Route path="/ideation" element={<IdeationPage />} />
      <Route
        path="/strategy"
        element={
          <GateLock gate={3}>
            <StrategyPage />
          </GateLock>
        }
      />
      <Route
        path="/implementation"
        element={
          <GateLock gate={4}>
            <ImplementationPage />
          </GateLock>
        }
      />
      <Route
        path="/benchmarking-phase"
        element={
          <GateLock gate={5}>
            <BenchmarkingPage />
          </GateLock>
        }
      />
      <Route
        path="/launch"
        element={
          <GateLock gate={6}>
            <LaunchPage />
          </GateLock>
        }
      />
      <Route
        path="/expansion"
        element={
          <GateLock gate={7}>
            <ExpansionPage />
          </GateLock>
        }
      />
      <Route
        path="/business-type/:businessTypeId"
        element={
          <GateLock gate={4}>
            <BusinessTypeDetailPage />
          </GateLock>
        }
      />
      <Route
        path="/marketing-channel/:channelId"
        element={
          <GateLock gate={5}>
            <MarketingChannelDetailPage />
          </GateLock>
        }
      />
      <Route
        path="/investor-pitch"
        element={
          <PremiumGate feature="pitch">
            <InvestorPitchPage />
          </PremiumGate>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </AuthGate>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppCookieBanner />
        <Routes>
          {/* Veřejná marketingová landing page - bez přihlášení */}
          <Route path="/" element={<LauncherPage />} />
          {/* OAuth consent pro MCP klienty (vlastní přihlášení uvnitř stránky) */}
          <Route path="/.lovable/oauth/consent" element={<OAuthConsentPage />} />
          {/* Veřejné ověření osvědčení – bez přihlášení */}
          <Route path="/osvedceni/:code" element={<CertificatePage />} />
          <Route path="/cenik" element={<PricingPage />} />
          <Route path="/financni-plan" element={<FinancialPlanPage />} />
          <Route path="/test-napadu" element={<IdeaTestPage />} />
          <Route path="/podnikatelsky-plan" element={<BusinessPlanPage />} />
          <Route path="/marketingove-kanaly" element={<MarketingChannelsPage />} />
          <Route path="/napojeni-banky" element={<BankConnectPage />} />
          <Route path="/zacit-podnikat" element={<StartBusinessPage />} />
          <Route path="/uz-podnikam" element={<ExistingBusinessPage />} />
          <Route path="/cim-jsme-jini" element={<WhyDifferentPage />} />
          <Route path="/bezpecnost" element={<SecurityPage />} />
          <Route path="/certifikace" element={<CertificationPage />} />
          <Route path="/pracovni-listy" element={<WorksheetsPage />} />
          <Route path="/podminky" element={<LegalPage doc={TERMS} />} />
          <Route path="/ochrana-osobnich-udaju" element={<LegalPage doc={PRIVACY} />} />
          <Route path="/odhlasit" element={<UnsubscribePage />} />
          <Route path="/clenstvi" element={<MembershipPage />} />
          {/* Veřejná testovací stránka uživatele (smoke test) */}
          <Route path="/t/:slug" element={<TestPagePublic />} />
          {/* Vše ostatní vyžaduje přihlášení */}
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
