import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeProvider";
import SentryErrorBoundary from "./components/SentryErrorBoundary";
import MiniSpotifyPlayer from "./components/MiniSpotifyPlayer";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import SlackConnect from "./pages/SlackConnect";
import SpotifyConnect from "./pages/SpotifyConnect";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Subscriptions from "./pages/Subscriptions";
import StripeFallback from "./pages/StripeFallback";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import SubProcessors from "./pages/SubProcessors";
import AboutPomodoro from "./pages/AboutPomodoro";

import { useTimerRealtime } from "@focusdive/timer";

function TimerRealtimeBridge() {
  useTimerRealtime();
  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <SentryErrorBoundary>
    <ThemeProvider defaultTheme="system" storageKey="focus-dive-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <TimerRealtimeBridge />
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
              <Route path="/integrations/spotify" element={<Integrations />} />
              <Route path="/slack/connect" element={<SlackConnect />} />
              <Route path="/spotify/connect" element={<SpotifyConnect />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/subscriptions/stripe-fallback" element={<StripeFallback />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/sub-processors" element={<SubProcessors />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <MiniSpotifyPlayer />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </SentryErrorBoundary>
);

export default App;
