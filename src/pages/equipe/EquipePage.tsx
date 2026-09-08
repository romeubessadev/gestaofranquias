import { Card, EmptyState } from "@/components/ui";
import { DashboardShell } from "@/pages/loja/DashboardShell";
import { useEscopo } from "@/pages/loja/useEscopo";

const ITENS = [
  "Quatro indicadores: faturamento, ticket, PA e comissão projetada, com variação contra o mês anterior",
  "Leitura da IA reconciliando meta, ritmo e mix",
  "Por vendedora, ordenado por atingimento: dias trabalhados, tendência, posição na escada, ponto de atenção, comissão até agora e próximo degrau",
  "Lacuna de meta sem responsável quando alguém está em período parcial",
  "Desafios ativos com engajamento e veredito",
  "Fila de mensagens com badge e botão de WhatsApp",
];

/** Aba "Equipe" do Dashboard, ainda não construída. Usa o mesmo filtro da Loja (Fase 2). */
export function EquipePage() {
  const { escopo, mudar } = useEscopo();

  return (
    <DashboardShell tab="equipe" escopo={escopo} onChange={mudar}>
      <div className="max-w-2xl">
        <EmptyState icon="🚧" title="Tela ainda não construída" description="Uma loja mostra a equipe; todas as lojas mostram uma linha por loja. Fase 2 do produto." />
        <Card className="mt-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-t2">O que ela vai mostrar</p>
          <ul className="flex flex-col gap-2">
            {ITENS.map((i) => (
              <li key={i} className="flex items-start gap-2.5 text-[13px] text-t0">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-acc" />
                {i}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </DashboardShell>
  );
}
