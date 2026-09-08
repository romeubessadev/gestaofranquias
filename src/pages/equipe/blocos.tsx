/**
 * Blocos visuais da aba Equipe. A página só monta; nada calcula aqui.
 * Reusa os componentes do tema: KpiTile, DataTable, Card, ProgressBar,
 * Badge, Avatar, EmptyState e o padrão EstadoBloco da Visão geral.
 */
import { Avatar, Badge, Card, CardHeader, CardTitle, DataTable, EmptyState, ProgressBar, type DataTableColumn } from "@/components/ui";
import { KpiTile } from "@/pages/dashboards/KpiTile";
import { ICONS, TINT } from "@/pages/dashboards/icons";
import { brl, num } from "@/lib/formato";
import type { EstadoBloco as EstadoBlocoTipo } from "@/data/gestao/dashboard";
import { EstadoBloco } from "@/pages/dashboard/blocos";
import type { DesafioView, EquipeView, LojaEquipeResumo, VendedoraLinha } from "@/data/gestao/equipeVisoes";

/* ------------------------- KPIs do topo ------------------------- */

export function BlocoKpisEquipe({
  faturamento,
  atendimentos,
  ticket,
  pa,
  premiacao,
  desafios,
  metaAtiva,
}: {
  faturamento: EquipeView["kpiFaturamento"];
  atendimentos: EquipeView["kpiAtendimentos"];
  ticket: EquipeView["kpiTicket"];
  pa: EquipeView["kpiPA"];
  premiacao: EquipeView["kpiPremiacao"];
  desafios: EquipeView["desafios"];
  metaAtiva: boolean;
}) {
  // Verba única (decisão do usuário): a escada de metas é paga como
  // premiação, junto com os prêmios dos desafios — um KPI só.
  const foraDoRitmo = desafios?.filter((d) => !d.fechaNoRitmo && !d.semEngajamento).length ?? 0;
  return (
    // Sempre 2 por linha (decisão do usuário): 4 KPIs sem meta (2×2) e 6 com
    // meta ativa (3 linhas × 2). 3+ na mesma linha ficou feio no celular.
    <div className="grid grid-cols-2 gap-4">
      <KpiTile label="Faturamento" value={faturamento.valor} icon="dollar" tint="acc" delta={faturamento.delta} />
      <KpiTile label="Atendimentos" value={atendimentos.valor} icon="users" tint="info" delta={atendimentos.delta} />
      <KpiTile label="Ticket médio" value={ticket.valor} icon="card" tint="ok" delta={ticket.delta} />
      <KpiTile label="P.A." value={pa.valor} icon="layers" tint="warn" delta={pa.delta} />
      {metaAtiva && premiacao && (
        <KpiTile label="Premiação projetada" value={premiacao.valor} icon="award" tint="acc" sub="metas + desafios" />
      )}
      {metaAtiva && desafios && (
        <KpiTile
          label="Desafios fora do ritmo"
          value={num(foraDoRitmo, 0)}
          icon="target"
          tint={foraDoRitmo > 0 ? "bad" : "ok"}
          sub={`${desafios.length} ativos`}
        />
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
          <Avatar name={l.nome} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-t0">{l.nome}</p>
            <p className="text-[11px] text-t2">
              {l.diasTrabalhados} {l.diasTrabalhados === 1 ? "dia" : "dias"}
              {metaAtiva && !l.semMeta && l.metaProporcional && <span> · meta proporcional · {l.diasElegiveis} dias</span>}
            </p>
            <p className="mt-0.5">
              <Badge variant={ROTULO_TENDENCIA[l.tendencia].variant}>{ROTULO_TENDENCIA[l.tendencia].texto}</Badge>
            </p>
          </div>
        </div>
      ),
    },
    // Faturamento/ticket/P.A. só entram SEM meta ativa — com meta a tabela
    // segue o mockup: realizado aparece na linha da barra de avanço.
    ...(metaAtiva
      ? []
      : ([
          { key: "faturamento", header: "Faturamento", align: "right", render: (l: VendedoraLinha) => <span className="font-mono text-[12.5px] font-bold text-t0">{l.faturamento}</span> },
          { key: "ticket", header: "Ticket", align: "right", hideBelow: "sm", render: (l: VendedoraLinha) => <span className="font-mono text-[12.5px] text-t1">{l.ticket}</span> },
          {
            key: "pa",
            header: "P.A.",
            align: "right",
            hideBelow: "sm",
            render: (l: VendedoraLinha) => <span className="font-mono text-[12.5px] text-t1">{l.pa}</span>,
          },
        ] as DataTableColumn<VendedoraLinha>[])),
    ...(metaAtiva
      ? [
          {
            key: "escada",
            header: "Avanço na escada",
            width: "230px",
            render: (l: VendedoraLinha) =>
              l.semMeta ? (
                <span className="text-t2">—</span>
              ) : (
                <div className="w-[210px]">
                  <BarraEscada linha={l} />
                  <p className="mt-1.5 text-[11px] text-t2">
                    <span className="font-semibold text-t1">{num(l.atingimentoPct, 1)}%</span> · {l.faturamento} de {brl(l.metaIndividualValor)}
                  </p>
                  {l.degrauAtual && <p className="text-[11px] font-semibold text-ok">{l.degrauAtual}</p>}
                </div>
              ),
          } as DataTableColumn<VendedoraLinha>,
          {
            key: "atencao",
            header: "Ponto de atenção",
            hideBelow: "lg",
            render: (l: VendedoraLinha) =>
              l.atencao ? (
                <div>
                  <p className={`text-[12.5px] font-bold ${l.atencao.tipo === "ritmo" ? "text-warn" : "text-bad"}`}>{l.atencao.texto}</p>
                  <p className="text-[11px] text-t2">{l.atencao.detalhe}</p>
                </div>
              ) : (
                <span className="text-t2">—</span>
              ),
          } as DataTableColumn<VendedoraLinha>,
          {
            key: "premiacao",
            header: "Premiação",
            align: "right",
            render: (l: VendedoraLinha) => <PremiacaoCelula linha={l} />,
          } as DataTableColumn<VendedoraLinha>,
        ]
      : []),
  ];

  return <DataTable columns={colunas} data={lista} rowKey={(l) => l.colaboradorId} emptyMessage="Sem vendedoras elegíveis no período." />;
}

/** Barra segmentada da escada: preenchida até o realizado, marcos nos degraus. */
function BarraEscada({ linha }: { linha: VendedoraLinha }) {
  const toMax = Math.max(100, ...linha.marcosEscada.map((m) => m.pct));
  const fillPct = Math.min(100, (linha.atingimentoPct / toMax) * 100);
  const cor = linha.atingimentoPct >= 100 ? "var(--ok)" : linha.atingimentoProjetadoPct !== null && linha.atingimentoProjetadoPct >= 100 ? "var(--acc)" : "var(--bad)";
  return (
    <div className="relative h-2 w-full rounded-full" style={{ background: "var(--bg-3)" }}>
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${fillPct}%`, background: cor }} />
      {linha.marcosEscada.map((m) => (
        <div
          key={m.nome}
          title={`${m.nome} · ${m.pct}% · paga ${num(m.pctPremiacao, 1)}% + ${brl(m.bonus)}`}
          className="absolute top-[-2px] bottom-[-2px] w-0.5 rounded-full"
          style={{ left: `${(m.pct / toMax) * 100}%`, background: linha.atingimentoPct >= m.pct ? "var(--t0)" : "var(--t2)", opacity: 0.55 }}
        />
      ))}
    </div>
  );
}

/**
 * Célula de premiação do mockup: valor garantido em cima, "+R$ X" do gancho
 * do próximo degrau embaixo e veredito ("cruza no ritmo" / "precisa acelerar"
 * / "Faixa máxima" no topo da escada).
 */
function PremiacaoCelula({ linha }: { linha: VendedoraLinha }) {
  if (linha.semMeta) return <span className="text-t2">—</span>;
  const proximo = linha.proximoDegrau;
  // Premiação projetada pelo ritmo (fonte do número de cima quando > garantido).
  const projetada = linha.premiacaoProjetadaIndividual ?? linha.premiacaoAcumulada;
  const garantida = linha.premiacaoAcumulada + linha.bonusAlcancado;
  // Gancho: o que passa a receber se fechar no próximo degrau (mockup "+R$ X").
  const gancho = proximo
    ? ((proximo.atingMinPct / 100) * linha.metaIndividualValor * proximo.pctPremiacao) / 100 + proximo.bonus - garantida
    : 0;

  // Veredito: topo da escada → "Faixa máxima"; projeção alcança o próximo →
  // "cruza no ritmo"; projeta algum degrau mas não o próximo → "precisa
  // acelerar"; abaixo da meta → "fecha sem premiação".
  let veredito: string;
  let corVeredito: string;
  if (!proximo) {
    veredito = "Faixa máxima";
    corVeredito = "text-ok";
  } else if (linha.atingimentoProjetadoPct !== null && linha.atingimentoProjetadoPct >= proximo.atingMinPct) {
    veredito = "cruza no ritmo";
    corVeredito = "text-ok";
  } else if (linha.atingimentoProjetadoPct !== null && linha.atingimentoProjetadoPct >= 100) {
    veredito = "precisa acelerar";
    corVeredito = "text-warn";
  } else {
    veredito = "fecha sem premiação";
    corVeredito = "text-bad";
  }

  return (
    <div className="text-right">
      <p className="font-mono text-[13px] font-bold text-t0">{brl(Math.max(projetada, garantida))}</p>
      {proximo && gancho > 0 ? (
        <p className="text-[12px] font-bold text-ok">+ {brl(gancho)}</p>
      ) : !proximo ? (
        <p className="text-[11.5px] font-bold text-ok">Faixa máxima</p>
      ) : null}
      <p className={`text-[11px] ${corVeredito}`}>{veredito}</p>
    </div>
  );
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
              : "Desempenho do período filtrado; metas e premiação são do mês e não entram aqui."}
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
                premiação <span className="font-mono font-semibold text-ok">{l.premiacaoProjetada}</span>
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