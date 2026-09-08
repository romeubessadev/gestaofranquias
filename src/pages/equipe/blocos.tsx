/**
 * Blocos visuais da aba Equipe. A página só monta; nada calcula aqui.
 * Reusa os componentes do tema: KpiTile, DataTable, Card, ProgressBar,
 * Badge, Avatar, EmptyState e o padrão EstadoBloco da Visão geral.
 */
import { Avatar, Badge, Card, CardHeader, CardTitle, DataTable, EmptyState, ProgressBar, type DataTableColumn } from "@/components/ui";
import { KpiTile } from "@/pages/dashboards/KpiTile";
import { ICONS, TINT } from "@/pages/dashboards/icons";
import { cn } from "@/lib/cn";
import { brl, num } from "@/lib/formato";
import type { EstadoBloco as EstadoBlocoTipo } from "@/data/gestao/dashboard";
import { EstadoBloco } from "@/pages/dashboard/blocos";
import type { DesafioView, EquipeView, LojaEquipeResumo, VendedoraLinha } from "@/data/gestao/equipeVisoes";

/* ------------------------- KPIs do topo ------------------------- */

export function BlocoKpisEquipe({
  faturamento,
  ticket,
  pa,
  comissao,
  metaAtiva,
}: {
  faturamento: EquipeView["kpiFaturamento"];
  ticket: EquipeView["kpiTicket"];
  pa: EquipeView["kpiPA"];
  comissao: EquipeView["kpiComissao"];
  metaAtiva: boolean;
}) {
  return (
    <div className={cn("grid gap-4", metaAtiva ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3")}>
      <KpiTile label="Faturamento" value={faturamento.valor} icon="dollar" tint="acc" delta={faturamento.delta} />
      <KpiTile label="Ticket médio" value={ticket.valor} icon="card" tint="info" delta={ticket.delta} />
      <KpiTile label="P.A." value={pa.valor} icon="layers" tint="ok" delta={pa.delta} />
      {metaAtiva && comissao && (
        <KpiTile label="Comissão projetada" value={comissao.valor} icon="award" tint="warn" sub="do mês" />
      )}
    </div>
  );
}

/* ------------------------- Tabela de vendedoras ------------------------- */

const ROTULO_TENDENCIA: Record<VendedoraLinha["tendencia"], { texto: string; variant: "success" | "neutral" | "danger" }> = {
  subindo: { texto: "↗ subindo", variant: "success" },
  estavel: { texto: "→ estável", variant: "neutral" },
  caindo: { texto: "↘ caindo", variant: "danger" },
};

export function BlocoVendedoras({ lista, metaAtiva }: { lista: VendedoraLinha[]; metaAtiva: boolean }) {
  const colunas: DataTableColumn<VendedoraLinha>[] = [
    {
      key: "vendedora",
      header: "Vendedora",
      render: (l) => (
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={l.nome} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-t0">{l.nome}</p>
            <p className="text-[11px] text-t2">
              {l.diasTrabalhados} {l.diasTrabalhados === 1 ? "dia" : "dias"} · <Badge variant={ROTULO_TENDENCIA[l.tendencia].variant}>{ROTULO_TENDENCIA[l.tendencia].texto}</Badge>
            </p>
          </div>
        </div>
      ),
    },
    { key: "faturamento", header: "Faturamento", align: "right", render: (l) => <span className="font-mono text-[12.5px] font-bold text-t0">{l.faturamento}</span> },
    { key: "ticket", header: "Ticket", align: "right", hideBelow: "sm", render: (l) => <span className="font-mono text-[12.5px] text-t1">{l.ticket}</span> },
    {
      key: "pa",
      header: "P.A.",
      align: "right",
      hideBelow: "sm",
      render: (l) => (
        <span className="flex items-center justify-end gap-1.5 font-mono text-[12.5px] text-t1">
          {l.paAbaixoPct !== null && <span title={`P.A. ${num(Math.abs(l.paAbaixoPct), 0)}% abaixo da média da loja`}>⚠</span>}
          {l.pa}
        </span>
      ),
    },
    ...(metaAtiva
      ? [
          {
            key: "meta",
            header: "Meta individual",
            align: "right",
            hideBelow: "md",
            render: (l: VendedoraLinha) =>
              l.semMeta ? (
                <span className="text-t2">—</span>
              ) : (
                <div>
                  <span className="font-mono text-[12.5px] text-t1">{brl(l.metaIndividualValor)}</span>
                  {l.metaProporcional && <span className="block text-[10.5px] text-t2">proporcional · {l.diasElegiveis} dias</span>}
                </div>
              ),
          } as DataTableColumn<VendedoraLinha>,
          {
            key: "atingimento",
            header: "Escada",
            align: "right",
            hideBelow: "md",
            width: "140px",
            render: (l: VendedoraLinha) =>
              l.semMeta ? (
                <span className="text-t2">—</span>
              ) : (
                <div className="ml-auto w-[110px]">
                  <ProgressBar value={l.barraPct} height={6} color={l.atingimentoPct >= 100 ? "var(--ok)" : "var(--acc)"} />
                  <p className="mt-0.5 text-right text-[11px] font-semibold text-t2">{num(l.atingimentoPct, 0)}%</p>
                </div>
              ),
          } as DataTableColumn<VendedoraLinha>,
          {
            key: "comissao",
            header: "Comissão",
            align: "right",
            render: (l: VendedoraLinha) =>
              l.comissaoAcumulada > 0 ? (
                <span className="font-mono text-[12.5px] font-bold text-ok">{brl(l.comissaoAcumulada)}</span>
              ) : (
                <span className="text-[12px] text-t2">sem degrau</span>
              ),
          } as DataTableColumn<VendedoraLinha>,
          {
            key: "proximo",
            header: "Próximo degrau",
            align: "right",
            hideBelow: "md",
            render: (l: VendedoraLinha) =>
              l.proximoDegrau ? (
                <span className="text-[12px] text-t1">
                  {l.proximoDegrau.nome} · faltam <span className="font-mono font-semibold text-t0">{brl(l.proximoDegrau.faltaValor)}</span>
                </span>
              ) : (
                <span className="text-[12px] text-t2">topo da escada</span>
              ),
          } as DataTableColumn<VendedoraLinha>,
        ]
      : []),
  ];

  return <DataTable columns={colunas} data={lista} rowKey={(l) => l.colaboradorId} emptyMessage="Sem vendedoras elegíveis no período." />;
}

/** Card inteiro da lista (título + descrição + estados + tabela). */
export function CardVendedoras({ estado, lista, metaAtiva, competenciaTexto }: { estado: EstadoBlocoTipo; lista: VendedoraLinha[] | null; metaAtiva: boolean; competenciaTexto: string }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Desempenho por vendedora</CardTitle>
          <p className="mt-1 text-[12.5px] text-t2">
            {metaAtiva
              ? `Ordenado pelo atingimento da meta individual — competência ${competenciaTexto}.`
              : "Desempenho do período filtrado; metas e comissão são do mês e não entram aqui."}
          </p>
        </div>
      </CardHeader>
      <EstadoBloco estado={estado}>
        {lista && lista.length > 0 ? <BlocoVendedoras lista={lista} metaAtiva={metaAtiva} /> : <EmptyState icon="👤" title="Sem vendedoras" description="Nenhuma vendedora elegível nesta loja para o período." />}
      </EstadoBloco>
    </Card>
  );
}

/* ------------------------- Desafios ------------------------- */

const ROTULO_TIPO: Record<DesafioView["tipo"], { texto: string; variant: "accent" | "info" | "warning" }> = {
  produto: { texto: "Produto", variant: "accent" },
  quantidade: { texto: "Quantidade", variant: "info" },
  indice: { texto: "Índice", variant: "warning" },
};

export function BlocoDesafios({ desafios }: { desafios: DesafioView[] }) {
  const foraDoRitmo = desafios.filter((d) => !d.fechaNoRitmo && !d.semEngajamento).length;
  const colunas: DataTableColumn<DesafioView>[] = [
    {
      key: "desafio",
      header: "Desafio",
      render: (d) => (
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{d.nome}</p>
          <p className="mt-0.5 text-[11px] text-t2">
            alvo {num(d.alvoIndividual, d.alvoIndividual % 1 !== 0 ? 2 : 0)} {d.unidade} · prêmio {brl(d.premio)} · <Badge variant={ROTULO_TIPO[d.tipo].variant}>{ROTULO_TIPO[d.tipo].texto}</Badge>
          </p>
        </div>
      ),
    },
    {
      key: "progresso",
      header: "Progresso",
      width: "180px",
      render: (d) => (
        <div>
          <ProgressBar value={Math.min(100, d.progressoPct)} height={6} color={d.fechaNoRitmo || d.semEngajamento ? "var(--acc)" : "var(--warn)"} />
          <p className="mt-1 text-[11px] text-t2">
            {num(d.progressoAgregado, d.progressoAgregado % 1 !== 0 ? 1 : 0)} de {num(d.alvoAgregado, 0)} {d.unidade} · {num(d.progressoPct, 0)}%
          </p>
        </div>
      ),
    },
    {
      key: "engajadas",
      header: "Engajadas",
      align: "center",
      hideBelow: "sm",
      render: (d) =>
        d.semEngajamento ? (
          <Badge variant="neutral">sem engajamento</Badge>
        ) : (
          <span className="text-[12.5px] font-semibold text-t0">
            {d.engajadas} de {d.participantes}
          </span>
        ),
    },
    {
      key: "ritmo",
      header: "Ritmo",
      align: "right",
      render: (d) =>
        d.semEngajamento ? (
          <Badge variant="neutral">sem progresso</Badge>
        ) : d.fechaNoRitmo ? (
          <Badge variant="success">fecha no ritmo</Badge>
        ) : (
          <Badge variant="danger">não fecha</Badge>
        ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Desafios ativos</CardTitle>
          <p className="mt-1 text-[12.5px] text-t2">
            {foraDoRitmo > 0
              ? `${num(foraDoRitmo, 0)} desafio${foraDoRitmo > 1 ? "s" : ""} não fecham no ritmo atual.`
              : "Todos os desafios fecham no ritmo atual."}
          </p>
        </div>
      </CardHeader>
      <DataTable columns={colunas} data={desafios} rowKey={(d) => d.id} emptyMessage="Sem desafios ativos na competência." />
    </Card>
  );
}

/* ------------------------- Visão rede: resumo por loja ------------------------- */

const IconeLoja = ICONS.store;

export function BlocoResumoRede({ lojas, onEscolher }: { lojas: LojaEquipeResumo[]; onEscolher: (filialId: string) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipe por loja</CardTitle>
        <p className="mt-1 text-[12.5px] text-t2">Toque numa loja para ver as vendedoras.</p>
      </CardHeader>
      <div className="grid gap-4 md:grid-cols-2">
        {lojas.map((l) => (
          <button key={l.filialId} onClick={() => onEscolher(l.filialId)} className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-4 text-left transition-colors hover:bg-bg-3">
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]" style={{ background: TINT[l.tint].bg, color: TINT[l.tint].fg }}>
                <IconeLoja size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-t1">{l.nome}</span>
              <span className="font-mono text-[13px] font-bold text-t0">{l.faturamento}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-t2">
              <span>
                ticket <span className="font-mono font-semibold text-t0">{l.ticket}</span>
              </span>
              <span>
                P.A. <span className="font-mono font-semibold text-t0">{l.pa}</span>
              </span>
              <span>
                comissão <span className="font-mono font-semibold text-ok">{l.comissaoProjetada}</span>
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {l.melhor && <Badge variant="success">↗ {l.melhor.nome} · {num(l.melhor.atingimentoPct, 0)}%</Badge>}
              {l.pior && <Badge variant="danger">↘ {l.pior.nome} · {num(l.pior.atingimentoPct, 0)}%</Badge>}
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------- Aviso de competência ------------------------- */

export function AvisoCompetencia({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[var(--radius-vela-lg)] border border-line bg-info-soft px-4 py-3 text-[13px] text-t0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info text-white">
        <ICONS.calendar size={14} />
      </span>
      {texto}
    </div>
  );
}