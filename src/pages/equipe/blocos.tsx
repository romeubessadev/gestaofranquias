/**
 * Blocos visuais da aba Equipe. A página só monta; nada calcula aqui.
 * Reusa os componentes do tema: KpiTile, DataTable, Card, ProgressBar,
 * Badge, Avatar, EmptyState e o padrão EstadoBloco da Visão geral.
 */
import { useState } from "react";
import { Avatar, Badge, Card, CardHeader, CardTitle, DataTable, EmptyState, ProgressBar, type DataTableColumn } from "@/components/ui";
import { KpiTile } from "@/pages/dashboards/KpiTile";
import { ICONS } from "@/pages/dashboards/icons";
import { brl, num } from "@/lib/formato";
import type { EstadoBloco as EstadoBlocoTipo } from "@/data/gestao/dashboard";
import { EstadoBloco } from "@/pages/dashboard/blocos";
import type { DesafioView, EquipeView, LojaEquipeResumo, RedeMetaGlobal, VendedoraLinha } from "@/data/gestao/equipeVisoes";
import { cn } from "@/lib/cn";

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

export function BlocoVendedoras({ lista, metaAtiva, mostrarShopping = false }: { lista: VendedoraLinha[]; metaAtiva: boolean; mostrarShopping?: boolean }) {
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
    ...(mostrarShopping
      ? ([
          {
            key: "shopping",
            header: "Shopping",
            hideBelow: "sm",
            render: (l: VendedoraLinha) => <span className="text-[12.5px] text-t1">{l.filialNome}</span>,
          },
        ] as DataTableColumn<VendedoraLinha>[])
      : []),
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

  return <DataTable columns={colunas} data={lista} rowKey={(l) => `${l.filialId}-${l.colaboradorId}`} emptyMessage="Sem vendedoras elegíveis no período." />;
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

/**
 * Faixa global da rede (REDE-06..11): META DE SETEMBRO · R$ X DE R$ Y · Z%
 * + barra + badges de projeção e dias restantes. Só renderiza com metaGlobal.
 */
export function FaixaMetaGlobal({ meta }: { meta: RedeMetaGlobal }) {
  const fecha = meta.projetadoPct >= 100;
  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-t2">Meta de {meta.competTexto}</p>
          <p className="mt-1 text-[15px] font-bold text-t0">
            <span className="font-mono">{brl(meta.realizado)}</span>
            <span className="mx-1.5 text-[13px] font-semibold text-t2">de</span>
            <span className="font-mono text-t1">{brl(meta.total)}</span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <p className={`font-mono text-[28px] font-bold leading-none ${meta.pct >= 100 ? "text-ok" : meta.projetadoPct >= 100 ? "text-acc" : "text-bad"}`}>
            {num(meta.pct, 1)}%
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={fecha ? "success" : "warning"}>{fecha ? "Meta será atingida" : "Projeção abaixo da meta"}</Badge>
            <Badge variant="neutral">
              <span className="inline-flex items-center gap-1">
                <ICONS.calendar size={12} />
                {meta.diasRestantes}d restantes
              </span>
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar value={Math.min(100, meta.pct)} height={8} color={meta.pct >= 100 ? "var(--ok)" : meta.projetadoPct >= 100 ? "var(--acc)" : "var(--bad)"} />
      </div>
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

/* ------------------------- Visão rede: tabela + abas ------------------------- */

/**
 * Card da rede: abas Vendedoras | Lojas com meta ativa; sem meta, só a tabela
 * flat com Shopping (REDE-04 / REDE-15). Substitui o antigo resumo por cards.
 */
export function BlocoVendedorasRede({
  estado,
  lista,
  lojas,
  metaAtiva,
  competenciaTexto,
}: {
  estado: EstadoBlocoTipo;
  lista: VendedoraLinha[] | null;
  lojas: LojaEquipeResumo[] | null;
  metaAtiva: boolean;
  competenciaTexto: string;
}) {
  const [aba, setAba] = useState<"vendedoras" | "lojas">("vendedoras");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Desempenho por vendedora</CardTitle>
            <p className="mt-1 text-[12.5px] text-t2">
              {metaAtiva
                ? `Rede · competência ${competenciaTexto}. Alterna entre todas as vendedoras e o agrupamento por loja.`
                : "Desempenho do período filtrado; metas e premiação são do mês e não entram aqui."}
            </p>
          </div>
          {metaAtiva && (
            <div className="flex w-fit gap-1 rounded-[13px] border border-line bg-bg-2 p-1">
              {(
                [
                  { id: "vendedoras" as const, label: "Vendedoras" },
                  { id: "lojas" as const, label: "Lojas" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAba(t.id)}
                  className={cn("rounded-[10px] px-3.5 py-1.5 text-[12.5px] font-bold transition-colors", aba === t.id ? "bg-acc text-white" : "text-t1 hover:text-t0")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <EstadoBloco estado={estado}>
        {!lista || lista.length === 0 ? (
          <EmptyState icon="👤" title="Sem vendedoras" description="Nenhuma vendedora elegível na rede para o período." />
        ) : !metaAtiva || aba === "vendedoras" ? (
          <BlocoVendedoras lista={lista} metaAtiva={metaAtiva} mostrarShopping />
        ) : (
          <div className="flex flex-col gap-5">
            {(lojas ?? []).map((loja) => {
              const daLoja = lista.filter((l) => l.filialId === loja.filialId);
              const pctLoja = loja.metaValor > 0 ? (loja.realizadoValor / loja.metaValor) * 100 : 0;
              return (
                <div key={loja.filialId} className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-4">
                  <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <p className="text-[14px] font-bold text-t0">{loja.nome}</p>
                      <p className="text-[12px] text-t2">{num(loja.pctMetaGlobal, 0)}% da meta global</p>
                    </div>
                    <p className="font-mono text-[12.5px] text-t1">
                      {brl(loja.realizadoValor)} / {brl(loja.metaValor)} · <span className="font-bold text-t0">{num(pctLoja, 1)}%</span>
                    </p>
                  </div>
                  <ProgressBar value={Math.min(100, pctLoja)} height={6} color={pctLoja >= 100 ? "var(--ok)" : "var(--acc)"} />
                  <div className="mt-3">
                    {daLoja.length > 0 ? (
                      <BlocoVendedoras lista={daLoja} metaAtiva={metaAtiva} />
                    ) : (
                      <p className="text-[12.5px] text-t2">Sem vendedoras elegíveis nesta loja.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </EstadoBloco>
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