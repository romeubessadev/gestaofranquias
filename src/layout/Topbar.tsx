import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { padTopo } from "@/lib/safeArea";
import { useTheme } from "@/theme/ThemeProvider";
import { Avatar, Dropdown } from "@/components/ui";
import { paths } from "@/router/paths";
import { roleLabel, useSession, useActiveSession } from "@/session/SessionProvider";
import {
  stores as filiaisFixture,
  storesForSession,
  hydrateSessionStores,
  type Store,
} from "@/data/wedash/stores";
import { StorePicker } from "@/pages/dashboard/StorePicker";
import { useScope } from "@/pages/dashboard/useScope";

const notificacoesGestor = [
  { id: 1, titulo: "Três Lagoas fora do ritmo: projeta 86% da meta", tempo: "há 2 h" },
  { id: 2, titulo: "3 mensagens esperando envio", tempo: "hoje, 09:00" },
  { id: 3, titulo: "Sync leve concluído às 14:30", tempo: "há 2 min" },
];

const notificacoesVendedora = [
  { id: 1, titulo: "Você cruzou a Meta! Próximo degrau: Super Meta", tempo: "ontem, 19:40" },
  { id: 2, titulo: "Desafio Body Splash termina em 5 dias", tempo: "hoje, 08:00" },
];

export function Topbar({ onOpenMobileNav, onToggleCollapse, onOpenPalette }: { onOpenMobileNav: () => void; onToggleCollapse: () => void; onOpenPalette: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const session = useActiveSession();
  const { signOut } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const { escopo, mudar } = useScope();
  const notificacoes = session.role === "SELLER" ? notificacoesVendedora : notificacoesGestor;

  const [listaLojas, setListaLojas] = useState<Store[]>(() => {
    const hit = storesForSession(session.stores);
    return hit.length > 0 ? hit : filiaisFixture;
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const hit = storesForSession(session.stores);
      if (hit.length === session.stores.length && session.stores.length > 0) {
        if (!cancelled) setListaLojas(hit);
        return;
      }
      const loaded = await hydrateSessionStores(session.tenantId, session.stores);
      if (cancelled) return;
      if (loaded.length > 0) setListaLojas(loaded);
      else if (hit.length > 0) setListaLojas(hit);
      // Não cai no mock f1/f2 se a sessão tem UUIDs — isso quebrava o seletor.
    })();
    return () => {
      cancelled = true;
    };
  }, [session.tenantId, session.stores]);

  // Loja é filtro global: Topbar nas telas do produto (não só Dashboard).
  const mostraStorePicker =
    location.pathname === paths.dashboard ||
    location.pathname.startsWith(paths.dashboard + "/") ||
    location.pathname === paths.live.root ||
    location.pathname.startsWith(paths.live.root + "/") ||
    location.pathname === paths.goals ||
    location.pathname.startsWith(paths.settings.root);

  return (
    <header className="pad-topo sticky top-0 z-30 flex flex-none items-center gap-2.5 border-b border-line bg-bg-1/80 px-3.5 pb-3 backdrop-blur-md sm:gap-3.5 sm:px-6" style={padTopo("0.75rem")}>
      <button onClick={onOpenMobileNav} aria-label="Abrir menu" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 lg:hidden">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <button onClick={onToggleCollapse} aria-label="Recolher menu" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 lg:flex">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {mostraStorePicker ? (
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <StorePicker escopo={escopo} onChange={mudar} minhas={listaLojas} />
        </div>
      ) : (
        <button onClick={onOpenPalette} className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[11px] border border-line bg-bg-inset px-3 text-t1 sm:max-w-xs">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <span className="hidden truncate text-[12.5px] sm:inline">Buscar telas...</span>
          <span className="ml-auto hidden shrink-0 rounded-md border border-line-2 px-1.5 py-0.5 text-[10px] font-bold text-t2 sm:inline">Ctrl K</span>
        </button>
      )}

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        <button onClick={toggleTheme} aria-label="Alternar tema" className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3">
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
          )}
        </button>

        <Dropdown
          align="right"
          trigger={
            <button className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3" aria-label="Notificações">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-bad" />
            </button>
          }
          items={notificacoes.map((n) => ({ label: `${n.titulo} · ${n.tempo}` }))}
        />

        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-[10px] pl-0.5 pr-1 hover:bg-bg-3">
              <Avatar name={session.companyName} size="sm" />
              <span className="hidden text-left leading-tight md:block">
                <span className="block max-w-[160px] truncate text-[12.5px] font-bold text-t0">{session.companyName}</span>
                <span className="block text-[10.5px] text-t2">{roleLabel[session.role]}{session.isOwner ? " · proprietária" : ""}</span>
              </span>
            </button>
          }
          items={[
            { label: "Meu perfil", onClick: () => navigate(paths.profile) },
            { label: "Instalar o app", onClick: () => navigate(paths.access.install) },
            { divider: true, label: "" },
            {
              label: "Sair",
              danger: true,
              onClick: () => {
                signOut();
                navigate(paths.access.login);
              },
            },
          ]}
        />
      </div>
    </header>
  );
}
