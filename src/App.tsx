
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import LauncherPage from "./pages/LauncherPage";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/launcher" element={<LauncherPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<LoginPage />} />
            <Route path="/vision" element={
              <ProtectedRoute>
                <VisionPage />
              </ProtectedRoute>
            } />
            <Route path="/ideation" element={
              <ProtectedRoute>
                <IdeationPage />
              </ProtectedRoute>
            } />
            <Route path="/strategy" element={
              <ProtectedRoute>
                <StrategyPage />
              </ProtectedRoute>
            } />
            <Route path="/implementation" element={
              <ProtectedRoute>
                <ImplementationPage />
              </ProtectedRoute>
            } />
            <Route path="/benchmarking" element={
              <ProtectedRoute>
                <BenchmarkingPage />
              </ProtectedRoute>
            } />
            <Route path="/launch" element={
              <ProtectedRoute>
                <LaunchPage />
              </ProtectedRoute>
            } />
            <Route path="/expansion" element={
              <ProtectedRoute>
                <ExpansionPage />
              </ProtectedRoute>
            } />
            <Route path="/business-type/:businessTypeId" element={
              <ProtectedRoute>
                <BusinessTypeDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/marketing-channel/:channelId" element={
              <ProtectedRoute>
                <MarketingChannelDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/investor-pitch" element={
              <ProtectedRoute>
                <InvestorPitchPage />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
