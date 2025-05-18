import "./App.css";
import MainContainer from "./components/main-container";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster duration={2000} richColors />
        <MainContainer />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
