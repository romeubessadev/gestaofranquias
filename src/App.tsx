import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui";
import { SessionProvider } from "@/session/SessionProvider";
import { AppRouter } from "@/router/router";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <SessionProvider>
            <AppRouter />
          </SessionProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
