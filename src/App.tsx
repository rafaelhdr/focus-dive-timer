
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import BlockDistractions from "./pages/BlockDistractions";
import SlackConnect from "./pages/SlackConnect";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Subscriptions from "./pages/Subscriptions";
import StripeFallback from "./pages/StripeFallback";
import { ThemeProvider } from "./contexts/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="focus-dive-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/block-distractions" element={<BlockDistractions />} />
              <Route path="/slack/connect" element={<SlackConnect />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/subscriptions/stripe-fallback" element={<StripeFallback />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
