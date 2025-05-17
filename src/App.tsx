import "./App.css";
import MainContainer from "./components/main-container";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";

function App() {
  return (
    <TooltipProvider>
      <Toaster duration={2000} richColors />
      <MainContainer />
    </TooltipProvider>
  );
}

export default App;
