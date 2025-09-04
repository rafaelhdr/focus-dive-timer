import { ThemeProvider } from "@shared/components";
import { Toaster } from "@shared/components";
import Index from "./pages/Index";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Index />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;