import { EmptyState } from "@/components/ui";

/** Vazio padrão dos cards do Dashboard (mesmo visual do EmptyState "No data yet" do Vela, sem ação).
 *  O card precisa ser `flex flex-col` para o bloco preencher a altura da linha da grade. */
export function EmptyBlock({
  icon = "📭",
  title = "Sem dados no período",
  description = "Nenhuma venda registrada no período selecionado.",
}: {
  icon?: string;
  title?: string;
  description?: string;
}) {
  return <EmptyState icon={icon} title={title} description={description} className="flex-1" />;
}
