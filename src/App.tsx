import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui";
import { SessionProvider } from "@/session/SessionProvider";
import { AppRouter } from "@/router/router";

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <ToastProvider>
          <SessionProvider>
            <AppRouter />
          </SessionProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
