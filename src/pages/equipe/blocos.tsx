/**
 * Blocos visuais da aba Equipe. A página só monta; nada calcula aqui.
 * Reusa os componentes do tema: StatCard, DataTable, Card, ProgressBar,
 * Badge, Avatar, EmptyState e o padrão EstadoBloco da Visão geral.
 */
import { useState } from "react";
import { Avatar, Badge, Card, CardHeader, CardTitle, DataTable, EmptyState, ProgressBar, StatCard, type DataTableColumn } from "@/components/ui";
import { Sparkline } from "@/components/charts";
import { brl, brlCent, num } from "@/lib/formato";
import type { EstadoBloco as EstadoBlocoTipo } from "@/data/gestao/dashboard";
import { EstadoBloco } from "@/pages/dashboard/blocos";
import type { DesafioView, EquipeView, LojaEquipeResumo, RedeMetaGlobal, VendedoraLinha } from "@/data/gestao/equipeVisoes";
import { cn } from "@/lib/cn";
import { ICONS } from "@/pages/dashboards/icons";

/* ------------------------- KPIs do topo ------------------------- */

const IconFat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const IconVendas = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const IconPA = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 2 7l10 5 10-5-10-5Z" />
    <path d="m2 17 10 5 10-5" />
    <path d="m2 12 10 5 10-5" />
  </svg>
);

/** Heroes alinhados à Visão Geral: Fat=acc, Vendas=ok, Ticket=info, PA=warn. */
const KPI_COLORS = [
  { iconColor: "var(--acc)", iconBg: "var(--acc-soft)" },
  { iconColor: "var(--ok)", iconBg: "var(--ok-soft)" },
  { iconColor: "var(--info)", iconBg: "rgba(59,130,246,0.12)" },
  { iconColor: "var(--warn)", iconBg: "rgba(245,158,11,0.12)" },
];

export function BlocoKpisEquipe({
  faturamento,
  atendimentos,
  ticket,
  pa,
}: {
  faturamento: EquipeView["kpiFaturamento"];
  atendimentos: EquipeView["kpiAtendimentos"];
  ticket: EquipeView["kpiTicket"];
  pa: EquipeView["kpiPA"];
}) {
  const kpis = [
    {
      label: "Faturamento",
      valor: faturamento.valor,
      delta: faturamento.delta,
      serie: faturamento.serie,
      tooltip: "Receita bruta total da equipe no período.",
      Icon: IconFat,
    },
    {
      label: "Atendimentos",
      valor: atendimentos.valor,
      delta: atendimentos.delta,
      serie: atendimentos.serie,
      tooltip: "Total de vendas realizadas no período.",
      Icon: IconVendas,
    },
    {
      label: "Ticket médio",
      valor: ticket.valor,
      delta: ticket.delta,
      serie: ticket.serie,
      tooltip: "Valor médio por venda (Faturamento ÷ Nº de vendas).",
      Icon: IconTicket,
    },
    {
      label: "P.A.",
      valor: pa.valor,
      delta: pa.delta,
      serie: pa.serie,
      tooltip: "Itens por venda (Itens ÷ Nº de vendas).",
      Icon: IconPA,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => {
        const c = KPI_COLORS[i];
        const Icon = kpi.Icon;
        return (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.valor}
            icon={<Icon />}
            iconColor={c.iconColor}
            iconBg={c.iconBg}
            delta={kpi.delta}
            tooltip={kpi.tooltip}
            sparkline={kpi.serie && kpi.serie.length > 1 ? <Sparkline data={kpi.serie} /> : undefined}
          />
        );
      })}
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

function lojaCurta(fantasia: string): string {
  return fantasia.replace(/^Shopping\s+/i, "");
}

function fmtMinimo(v: number, unidade: DesafioView["unidade"], tipo: DesafioView["tipo"]): string {
  if (tipo === "ticket" || unidade === "R$") return brlCent(v);
  if (tipo === "pa" || unidade === "x") return num(v, v % 1 !== 0 ? 2 : 0);
  if (tipo === "faturamento") return brl(v);
  return `${num(v, 0)} un`;
}

function IconRelogio() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function BlocoDesafios({ desafios }: { desafios: DesafioView[] }) {
  return (
    <Card padding="lg">
      <div className="mb-4">
        <CardTitle>Desafios</CardTitle>
        <p className="mt-1 text-[12.5px] text-t2">
          {desafios.length === 0
            ? "Nenhum desafio nesta competência."
            : `${desafios.length} desafio${desafios.length === 1 ? "" : "s"} da competência.`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {desafios.map((d) => (
          <div key={d.id} className="flex flex-col rounded-[var(--radius-vela-lg)] border border-line bg-bg-inset p-5">
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-acc-soft text-xl" aria-hidden>
                {d.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[14.5px] font-bold leading-snug text-t0">{d.nome}</p>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant={d.statusVariant}>{d.statusLabel}</Badge>
                    <Badge variant={d.statusVariant} className="gap-1">
                      <IconRelogio />
                      {d.prazoRotulo}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1 text-[12px] leading-snug text-t2">{d.objetivo}</p>
              </div>
            </div>

            <div className="mb-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-t2">
              <span>
                Meta: <span className="font-bold text-t0">{d.metaRotulo}</span>
              </span>
              {d.temMinimo && d.minimo != null && (
                <span>
                  Mínimo: <span className="font-bold text-t0">{fmtMinimo(d.minimo, d.unidade, d.tipo)}</span>
                </span>
              )}
              <span>
                Prêmio: <span className="font-bold text-ok">{brl(d.premio)}</span>
              </span>
            </div>

            <div className="max-h-[260px] space-y-2.5 overflow-y-auto border-t border-line pt-3">
              {d.ranking.map((p, idx) => (
                <div key={p.colaboradorId} className="flex items-center gap-2">
                  <span className="w-6 shrink-0 text-[12px] font-extrabold text-t2">{idx + 1}º</span>
                  <Avatar name={p.nome} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-semibold text-t0">{p.nome.split(" ")[0]}</p>
                    <p className="truncate text-[10.5px] text-t2">
                      {p.turno} · {lojaCurta(p.loja)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] font-semibold tabular-nums text-t1">{p.progressoRotulo}</span>
                  <div className="w-[56px] shrink-0 sm:w-[72px]">
                    <ProgressBar
                      value={Math.min(100, p.progressoPct)}
                      height={5}
                      color={p.status === "atingiu" ? "var(--ok)" : "var(--acc)"}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-[11px] font-semibold text-t2">{num(p.progressoPct, 0)}%</span>
                </div>
              ))}
              {d.ranking.length === 0 && (
                <p className="py-3 text-center text-[12.5px] text-t2">Sem participantes no escopo.</p>
              )}
            </div>
          </div>
        ))}
      </div>
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

export function AvisoCompetencia({ texto, onVerMes }: { texto: string; onVerMes?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-[var(--radius-vela-lg)] border border-line bg-info-soft px-4 py-3 text-[13px] text-t0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-info text-white">
        <ICONS.calendar size={14} />
      </span>
      <span className="min-w-0 flex-1">{texto}</span>
      {onVerMes && (
        <button type="button" onClick={onVerMes} className="shrink-0 text-[12.5px] font-bold text-acc hover:underline">
          Ver este mês
        </button>
      )}
    </div>
  );
}