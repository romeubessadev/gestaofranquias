import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader, TabNav } from "@/components/ui";
import { paths } from "@/router/paths";
import type { Escopo } from "@/data/gestao/dashboard";
import { SeletorEscopo } from "./SeletorEscopo";

/** Subtítulo por aba: o que ela mostra, não repete "Dashboard" nem status de sync. */
const SUBTITULO: Record<string, string> = {
  visaoGeral: "Resumo executivo da operação — KPIs, metas e drill-down.",
  financeiro: "Faturamento, CMV, lucro bruto e formas de pagamento.",
  produtos: "Mix, categorias, top produtos e margem por linha.",
  equipe: "Quem precisa de atenção, por quê, e quanto vai custar.",
  grupos: "Desempenho por grupo, horário e intensidade da operação.",
  loja: "Visão geral do desempenho das suas lojas.",
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
  tab: string;
  escopo: Escopo;
  onChange: (e: Escopo) => void;
  children: ReactNode;
}) {
  const [params] = useSearchParams();
  const suffix = params.toString() ? `?${params.toString()}` : "";

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={SUBTITULO[tab] ?? ""} />

      <div className="mb-5">
        <SeletorEscopo escopo={escopo} onChange={onChange} />
      </div>

      <TabNav
        items={[
          { label: "Visão Geral", to: `${paths.visaoGeral}${suffix}` },
          { label: "Financeiro", to: `${paths.financeiro}${suffix}` },
          { label: "Produtos", to: `${paths.produtos}${suffix}` },
          { label: "Equipe", to: `${paths.equipe}${suffix}` },
          { label: "Grupos", to: `${paths.grupos}${suffix}` },
        ]}
      />

      <div className="mt-6">{children}</div>
    </div>
  );
}
