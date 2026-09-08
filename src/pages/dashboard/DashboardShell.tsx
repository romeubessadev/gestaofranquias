import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, TabNav } from "@/components/ui";
import { paths } from "@/router/paths";
import type { Escopo } from "@/data/gestao/dashboard";
import { SeletorEscopo } from "./SeletorEscopo";

/** Subtítulo por aba: o que ela mostra, não repete "Dashboard" nem status de sync. */
const SUBTITULO: Record<"loja" | "equipe", string> = {
  loja: "Visão geral do desempenho das suas lojas.",
  equipe: "Quem precisa de atenção, por quê, e quanto vai custar.",
};

/**
 * Casca comum do Dashboard: cabeçalho, filtro (Período/Marca) e abas, igual
 * à ordem da página Marketing da demo (header → filtro → tabs → conteúdo).
 * Título fixo "Dashboard", sem crumb (seria "Dashboard / Loja" logo abaixo de
 * um título que já diz "Dashboard") — a aba ativa no TabNav já diz qual seção
 * é; o subtítulo é livre pra dizer o que ela mostra.
 */
export function DashboardShell({
  tab,
  escopo,
  onChange,
  children,
}: {
  tab: "loja" | "equipe";
  escopo: Escopo;
  onChange: (e: Escopo) => void;
  children: ReactNode;
}) {
  const [params] = useSearchParams();
  const suffix = params.toString() ? `?${params.toString()}` : "";

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={SUBTITULO[tab]} />

      <div className="mb-5">
        <SeletorEscopo escopo={escopo} onChange={onChange} />
      </div>

      <TabNav
        items={[
          { label: "Visão geral", to: `${paths.dashboard}${suffix}`, end: true },
          { label: "Equipe", to: `${paths.equipe}${suffix}` },
        ]}
      />

      <div className="mt-6">{children}</div>
    </div>
  );
}
