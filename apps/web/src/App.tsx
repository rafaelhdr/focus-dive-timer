import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";
import SentryErrorBoundary from "./components/SentryErrorBoundary";
import Index from "./pages/Index";
import Settings from "./pages/Settings/SettingsPage";
import Integrations from "./pages/Integrations";
import SlackConnect from "./pages/SlackConnect";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Subscriptions from "./pages/Subscriptions";
import StripeFallback from "./pages/StripeFallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import SubProcessors from "./pages/SubProcessors";
import AboutPomodoro from "./pages/AboutPomodoro";

import { useTimerEngine, useTimerFinished, useTimerRealtime } from "@focusdive/timer";

function TimerEffects() {
  useTimerRealtime();
  useTimerEngine();
  useTimerFinished();
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <SentryErrorBoundary>
    <ThemeProvider defaultTheme="system" storageKey="focus-dive-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <TimerEffects />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/about-pomodoro" element={<AboutPomodoro />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/integrations/slack" element={<Integrations />} />
              <Route path="/slack/connect" element={<SlackConnect />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/subscriptions/stripe-fallback" element={<StripeFallback />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/sub-processors" element={<SubProcessors />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </SentryErrorBoundary>
);

export default App;
