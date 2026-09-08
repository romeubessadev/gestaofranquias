import { paths } from "@/router/paths";
import type { Papel } from "@/data/gestao/equipe";
import type { NavEntry } from "./nav-config";

const ICONE = {
  dashboard: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  loja: "M3 9.5 5 4h14l2 5.5M3 9.5h18M3 9.5v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-10M9 20.5v-6h6v6",
  equipe: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  analise: "M3 3v18h18M18 9l-5 5-4-4-4 4",
  config: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9",
  meta: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  tarefas: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  ranking: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a2 2 0 0 0 0 4h3M17 6h3a2 2 0 0 1 0 4h-3",
  perfil: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
};

const navGestor: NavEntry[] = [
  { label: "Dashboard", icon: ICONE.dashboard, to: paths.loja, activePaths: [paths.equipe] },
  {
    label: "Configurações",
    icon: ICONE.config,
    items: [
      { label: "Metas", to: paths.configuracoes.metas },
      { label: "Desafios", to: paths.configuracoes.desafios },
      { label: "Colaboradores", to: paths.configuracoes.colaboradores },
      { label: "Turnos e tarefas", to: paths.configuracoes.turnos },
      { label: "Mensagens", to: paths.configuracoes.mensagens },
      { label: "Documentos", to: paths.configuracoes.documentos },
      { label: "Custos", to: paths.configuracoes.custos },
      { label: "Marca", to: paths.configuracoes.marca },
      { label: "Integração ERP", to: paths.configuracoes.erp },
      { label: "Usuários", to: paths.configuracoes.usuarios },
    ],
  },
];

const navGerente: NavEntry[] = [
  { label: "Dashboard", icon: ICONE.dashboard, to: paths.loja, activePaths: [paths.equipe] },
  {
    label: "Configurações",
    icon: ICONE.config,
    items: [
      { label: "Colaboradores", to: paths.configuracoes.colaboradores },
      { label: "Turnos e tarefas", to: paths.configuracoes.turnos },
      { label: "Mensagens", to: paths.configuracoes.mensagens },
    ],
  },
];

const navVendedora: NavEntry[] = [
  { label: "Minha meta", icon: ICONE.meta, to: paths.vendedora.minhaMeta },
  { label: "Tarefas", icon: ICONE.tarefas, to: paths.vendedora.tarefas },
  { label: "Ranking", icon: ICONE.ranking, to: paths.vendedora.ranking },
  { label: "Perfil", icon: ICONE.perfil, to: paths.perfil },
];

export function navDoPapel(papel: Papel): NavEntry[] {
  switch (papel) {
    case "VENDEDOR":
      return navVendedora;
    case "GERENTE":
      return navGerente;
    default:
      return navGestor;
  }
}
