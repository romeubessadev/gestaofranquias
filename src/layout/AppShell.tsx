import { Suspense, useEffect, useRef, useState } from "react";
import { padBase } from "@/lib/areaSegura";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileDrawer } from "./MobileDrawer";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { PageLoader } from "./PageLoader";
import { ChatIA } from "@/components/gestao/ChatIA";
import { useSessaoAtiva } from "@/session/SessionProvider";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const sessao = useSessaoAtiva();

  useEffect(() => {
    setMobileNavOpen(false);
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const temChat = sessao.papel === "GESTOR" || sessao.papel === "GERENTE";

  return (
    <div className="tela-cheia flex w-full bg-bg-0 text-t0">
      <Sidebar collapsed={collapsed} />
      <MobileDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={() => setMobileNavOpen(true)} onToggleCollapse={() => setCollapsed((c) => !c)} onOpenPalette={() => setPaletteOpen(true)} />
        <main ref={mainRef} className="pad-base flex-1 overflow-y-auto px-3.5 pt-5 sm:px-6 sm:pt-6" style={padBase("6rem")}>
          <Suspense fallback={<PageLoader />}>
            <div key={location.pathname} className="vela-page-enter">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {temChat && <ChatIA />}
    </div>
  );
}
