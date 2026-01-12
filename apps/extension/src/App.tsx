import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { useSaveLoginStep } from "@/hooks/useSaveLoginStep";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const AuthEffects = () => {
  useSaveLoginStep();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="focusdive-ui-theme">
      <TooltipProvider>
        <AuthEffects />
        <Toaster />
        <Sonner />
        <Index />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
