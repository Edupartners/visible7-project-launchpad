
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LauncherPage from "./pages/LauncherPage";
import UserProfilePage from "./pages/UserProfilePage";
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
import BenchmarkingPreviewPage from "./pages/BenchmarkingPreviewPage";
import LaunchPreviewPage from "./pages/LaunchPreviewPage";
import ExpansionPreviewPage from "./pages/ExpansionPreviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LauncherPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/vision" element={<VisionPage />} />
          <Route path="/ideation" element={<IdeationPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/implementation" element={<ImplementationPage />} />
          <Route path="/benchmarking-phase" element={<BenchmarkingPage />} />
          <Route path="/launch" element={<LaunchPage />} />
          <Route path="/expansion" element={<ExpansionPage />} />
          <Route path="/business-type/:businessTypeId" element={<BusinessTypeDetailPage />} />
          <Route path="/marketing-channel/:channelId" element={<MarketingChannelDetailPage />} />
          <Route path="/investor-pitch" element={<InvestorPitchPage />} />
          <Route path="/benchmarking-phase/preview" element={<BenchmarkingPreviewPage />} />
          <Route path="/launch/preview" element={<LaunchPreviewPage />} />
          <Route path="/expansion/preview" element={<ExpansionPreviewPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
