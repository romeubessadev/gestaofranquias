/**
 * Blocos visuais da aba Equipe. A página só monta; nada calcula aqui.
 * Reusa os componentes do tema: StatCard, DataTable, Card, ProgressBar,
 * Badge, Avatar, EmptyState e o padrão EstadoBloco da Visão geral.
 */
import { Avatar, Badge, Card, CardTitle, DataTable, EmptyState, ProgressBar, progressColor, progressTextClass, StatCard, type DataTableColumn } from "@/components/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { brl, brlK, num } from "@/lib/formato";
import type { EstadoBloco as EstadoBlocoTipo } from "@/data/gestao/dashboard";
import { EstadoBloco } from "@/pages/dashboard/blocos";
import type { DesafioView, EquipeView, RedeMetaGlobal, VendedoraLinha } from "@/data/gestao/equipeVisoes";
import { degrausPadrao } from "@/data/gestao/metas";
import { cn } from "@/lib/cn";
import { ICONS, FlameIcon } from "@/pages/dashboards/icons";

const TipHelp = ({ label }: { label: string }) => (
  <Tooltip label={label}>
    <span className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-t2 transition-colors hover:text-t1">
      ?
    </span>
  </Tooltip>
);

function lojaCurta(fantasia: string): string {
  return fantasia.replace(/^Shopping\s+/i, "");
}

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

/** Mesmo padrão visual das demais telas (VG/Fin/Prod): ícone + valor + delta + sub + tooltip — sem sparkline. */
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
      sub: faturamento.sub,
      Icon: IconFat,
    },
    {
      label: "Nº de vendas",
      valor: atendimentos.valor,
      delta: atendimentos.delta,
      sub: atendimentos.sub,
      Icon: IconVendas,
    },
    {
      label: "Ticket médio",
      valor: ticket.valor,
      delta: ticket.delta,
      sub: ticket.sub,
      Icon: IconTicket,
    },
    {
      label: "P.A.",
      valor: pa.valor,
      delta: pa.delta,
      sub: pa.sub,
      tooltip: "Quantidade média de itens vendidos por venda.",
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
            sub={kpi.sub}
            tooltip={"tooltip" in kpi ? kpi.tooltip : undefined}
          />
        );
      })}
    </div>
  );
}

/* ------------------------- Tabela de vendedoras ------------------------- */

type LinhaRank = VendedoraLinha & { posicao: number };

function CelulaVendedora({ l, mostrarShopping }: { l: LinhaRank; mostrarShopping: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar name={l.nome} size="sm" />
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-t0">{l.nome}</p>
        <p className="truncate text-[11px] text-t2">
          {l.grupo}
          {mostrarShopping ? ` · ${lojaCurta(l.filialNome)}` : ""}
        </p>
      </div>
    </div>
  );
}

function CelulaFaturamento({ l }: { l: LinhaRank }) {
  return (
    <div>
      <p className="font-mono text-[12.5px] font-bold text-t0">{l.faturamento}</p>
      <p className="text-[11px] text-t2">
        {num(l.atendimentos, 0)} {l.atendimentos === 1 ? "venda" : "vendas"}
      </p>
    </div>
  );
}

function CelulaPctIndividual({ l }: { l: LinhaRank }) {
  if (l.semMeta) return <span className="text-t2">—</span>;
  return (
    <div className="w-[88px]">
      <p className="font-mono text-[12.5px] font-bold text-t0">{num(l.atingimentoPct, 0)}%</p>
      <div className="mt-1">
        <ProgressBar value={Math.min(100, l.atingimentoPct)} height={5} />
      </div>
    </div>
  );
}

function CelulaNivel({ l }: { l: LinhaRank }) {
  if (l.semMeta || !l.degrauAtual || l.nivelAtual == null) return <span className="text-t2">—</span>;
  return (
    <Badge variant={l.atingimentoPct >= 100 ? "success" : "warning"}>
      Nível {l.nivelAtual} · {l.degrauAtual}
    </Badge>
  );
}

function CelulaProximo({ l }: { l: LinhaRank }) {
  if (l.semMeta) return <span className="text-t2">—</span>;
  if (!l.proximoDegrau) {
    return <p className="text-[12.5px] font-bold text-ok">Máximo</p>;
  }
  return (
    <div>
      <p className="font-mono text-[12.5px] font-bold text-t0">{brl(l.proximoDegrau.faltaValor)}</p>
      <p className="text-[11px] text-t2">p/ {l.proximoDegrau.nome}</p>
    </div>
  );
}

function CelulaPremiacao({ l }: { l: LinhaRank }) {
  if (l.semMeta) return <span className="text-t2">—</span>;
  const valor = l.premiacaoAcumulada + l.bonusAlcancado;
  if (valor <= 0 && l.comissaoPct <= 0) return <span className="text-t2">—</span>;
  return (
    <div className="text-right">
      <p className="font-mono text-[12.5px] font-bold text-ok">{brl(valor)}</p>
      {l.comissaoPct > 0 ? (
        <p className="text-[11px] text-t2">
          {num(l.comissaoPct, 1)}%
          {l.bonusAlcancado > 0 ? ` · +${brl(l.bonusAlcancado)}` : ""}
        </p>
      ) : null}
    </div>
  );
}

function CardMobileVendedora({ l, metaAtiva, mostrarShopping }: { l: LinhaRank; metaAtiva: boolean; mostrarShopping: boolean }) {
  return (
    <div className="rounded-xl border border-line bg-bg-inset p-3.5">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="w-7 shrink-0 text-[12.5px] font-extrabold text-t2">{l.posicao}º</span>
        <Avatar name={l.nome} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-bold text-t0">{l.nome}</p>
          <p className="truncate text-[11.5px] text-t2">
            {l.grupo}
            {mostrarShopping ? ` · ${lojaCurta(l.filialNome)}` : ""}
          </p>
        </div>
      </div>
      {metaAtiva ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-line pt-2.5 text-[12px]">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">Faturamento</p>
            <CelulaFaturamento l={l} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">% da meta</p>
            <CelulaPctIndividual l={l} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">Nível</p>
            <CelulaNivel l={l} />
          </div>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">Faltam</p>
            <CelulaProximo l={l} />
          </div>
          <div className="col-span-2 text-right">
            <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">Premiação</p>
            <CelulaPremiacao l={l} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-line pt-2.5">
          <span className="text-xs text-t2">
            {num(l.atendimentos, 0)} vendas · Ticket {l.ticket}
          </span>
          <span className="font-mono text-[13px] font-extrabold text-t0">{l.faturamento}</span>
        </div>
      )}
    </div>
  );
}

export function BlocoVendedoras({ lista, metaAtiva, mostrarShopping = false }: { lista: VendedoraLinha[]; metaAtiva: boolean; mostrarShopping?: boolean }) {
  const ranked: LinhaRank[] = lista.map((l, i) => ({ ...l, posicao: i + 1 }));

  const colunas: DataTableColumn<LinhaRank>[] = [
    {
      key: "pos",
      header: "#",
      width: "48px",
      render: (l) => <span className="text-[12.5px] font-extrabold text-t2">{l.posicao}º</span>,
    },
    {
      key: "vendedora",
      header: "Vendedora",
      render: (l) => <CelulaVendedora l={l} mostrarShopping={mostrarShopping} />,
    },
    {
      key: "faturamento",
      header: "Faturamento",
      render: (l) => <CelulaFaturamento l={l} />,
    },
    ...(metaAtiva
      ? ([
          {
            key: "meta",
            header: "Meta",
            hideBelow: "md",
            render: (l: LinhaRank) =>
              l.semMeta ? <span className="text-t2">—</span> : <span className="font-mono text-[12.5px] font-bold text-t0">{brl(l.metaIndividualValor)}</span>,
          },
          {
            key: "pctIndiv",
            header: "% Meta individual",
            render: (l: LinhaRank) => <CelulaPctIndividual l={l} />,
          },
          {
            key: "pctGeral",
            header: "% Meta geral",
            hideBelow: "lg",
            render: (l: LinhaRank) =>
              l.semMeta ? <span className="text-t2">—</span> : <span className="font-mono text-[12.5px] font-bold text-t0">{num(l.pctMetaGeral, 1)}%</span>,
          },
          {
            key: "nivel",
            header: "Nível",
            hideBelow: "md",
            render: (l: LinhaRank) => <CelulaNivel l={l} />,
          },
          {
            key: "proximo",
            header: "Faltam p/ próximo nível",
            hideBelow: "lg",
            render: (l: LinhaRank) => <CelulaProximo l={l} />,
          },
          {
            key: "premiacao",
            header: "Premiação",
            align: "right",
            render: (l: LinhaRank) => <CelulaPremiacao l={l} />,
          },
        ] as DataTableColumn<LinhaRank>[])
      : ([
          {
            key: "ticket",
            header: "Ticket médio",
            hideBelow: "sm",
            align: "right",
            render: (l: LinhaRank) => <span className="font-mono text-[12.5px] text-t1">{l.ticket}</span>,
          },
          {
            key: "pa",
            header: "P.A.",
            hideBelow: "sm",
            align: "right",
            render: (l: LinhaRank) => <span className="font-mono text-[12.5px] text-t1">{l.pa}</span>,
          },
        ] as DataTableColumn<LinhaRank>[])),
  ];

  return (
    <>
      <div className="hidden p-4 md:block">
        <DataTable columns={colunas} data={ranked} rowKey={(l) => `${l.filialId}-${l.colaboradorId}`} emptyMessage="Nenhuma vendedora elegível para esta competência." />
      </div>
      <div className="flex flex-col gap-2.5 p-3.5 md:hidden">
        {ranked.map((l) => (
          <CardMobileVendedora key={`${l.filialId}-${l.colaboradorId}`} l={l} metaAtiva={metaAtiva} mostrarShopping={mostrarShopping} />
        ))}
      </div>
    </>
  );
}

/** Card inteiro da lista (título + estados + tabela). */
export function CardVendedoras({
  estado,
  lista,
  metaAtiva,
  mostrarShopping = false,
  embedded = false,
}: {
  estado: EstadoBlocoTipo;
  lista: VendedoraLinha[] | null;
  metaAtiva: boolean;
  mostrarShopping?: boolean;
  /** Sem Card externo (ex.: aba Metas do Ao vivo). */
  embedded?: boolean;
}) {
  const body = (
    <>
      <div className={cn("flex items-center gap-1.5", embedded ? "pb-3" : "px-5 py-4")}>
        <CardTitle>Escada de Premiação</CardTitle>
        <TipHelp label="Veja quem já atingiu cada nível, quanto falta para o próximo e a premiação correspondente." />
      </div>
      <EstadoBloco estado={estado}>
        {lista && lista.length > 0 ? (
          <BlocoVendedoras lista={lista} metaAtiva={metaAtiva} mostrarShopping={mostrarShopping} />
        ) : (
          <div className={embedded ? "py-2" : "p-5"}>
            <EmptyState icon="👤" title="Sem vendedoras elegíveis" description="Nenhuma vendedora elegível para esta competência." />
          </div>
        )}
      </EstadoBloco>
    </>
  );

  if (embedded) {
    return <div className="border-t border-line pt-4">{body}</div>;
  }

  return <Card padding="none">{body}</Card>;
}

/**
 * Faixa de progresso da meta (loja ou rede) — estilo Progresso Global:
 * R$ realizado/meta · % · barra com marcos da escada (Meta→Desafio).
 */
export function FaixaMetaGlobal({ meta, embedded = false }: { meta: RedeMetaGlobal; embedded?: boolean }) {
  const fecha = meta.projetadoPct >= 100;
  const escalaMax = Math.max(...degrausPadrao.map((d) => d.atingimentoMinPct), 100);
  const fillPct = Math.min(100, (meta.pct / escalaMax) * 100);
  const corBarra = progressColor(meta.pct);
  const corPct = progressTextClass(meta.pct);

  const body = (
    <>
      <div className="mb-4 flex items-center gap-1.5">
        <CardTitle>Progresso da Meta</CardTitle>
        <TipHelp label="Acompanhe o avanço da equipe pelos níveis de premiação e a projeção para o fechamento da competência." />
      </div>

      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <p className="text-[18px] font-extrabold tracking-tight text-t0 sm:text-[20px]">
          <span className="font-mono">{brl(meta.realizado)}</span>
          <span className="mx-1.5 text-[14px] font-semibold text-t2">/</span>
          <span className="font-mono text-[14px] font-bold text-t2 sm:text-[15px]">{brl(meta.total)}</span>
        </p>
        <p className={`font-mono text-[26px] font-extrabold leading-none sm:text-[28px] ${corPct}`}>{num(meta.pct, 1)}%</p>
      </div>

      {/*
        Rótulos alinhados aos ticks (mesmo % da barra no mobile e no desktop).
        min-w garante espaço entre os nomes; overflow só no eixo X.
      */}
      <div className="mt-4 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x">
        <div className="min-w-[960px]">
          <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-3)" }}>
            <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${fillPct}%`, background: corBarra }} />
            {degrausPadrao.map((d) => {
              const left = (d.atingimentoMinPct / escalaMax) * 100;
              const atingido = meta.pct >= d.atingimentoMinPct;
              return (
                <span
                  key={`tick-${d.nome}`}
                  className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2"
                  style={{ left: `${left}%`, background: atingido ? "var(--t0)" : "var(--t2)", opacity: atingido ? 0.55 : 0.35 }}
                />
              );
            })}
          </div>

          <div className="relative mt-2 h-7">
            {degrausPadrao.map((d, i) => {
              const left = (d.atingimentoMinPct / escalaMax) * 100;
              const atingido = meta.pct >= d.atingimentoMinPct;
              const isLast = i === degrausPadrao.length - 1;
              const rotuloCurto = d.nome.replace(/^Meta\s+/i, "");
              return (
                <p
                  key={d.nome}
                  className={cn(
                    "absolute top-0 whitespace-nowrap text-[10px] font-bold leading-tight",
                    isLast ? "right-0 text-right" : "-translate-x-1/2 text-center",
                    atingido ? "text-acc" : "text-t2",
                  )}
                  style={isLast ? undefined : { left: `${left}%` }}
                  title={`Nível ${i + 1} · ${d.nome} · ${num(d.comissaoPct, 1)}%`}
                >
                  N{i + 1} · {rotuloCurto}
                  <span className="font-semibold opacity-75"> ({num(d.comissaoPct, 1)}%)</span>
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant={fecha ? "success" : "warning"}>{fecha ? "Projeção: meta atingida" : "Projeção abaixo da meta"}</Badge>
        <Badge variant="neutral">
          <span className="inline-flex items-center gap-1">
            <ICONS.calendar size={12} />
            {meta.diasRestantes}d restantes
          </span>
        </Badge>
      </div>
    </>
  );

  if (embedded) return <div>{body}</div>;
  return <Card>{body}</Card>;
}

/* ------------------------- Desafios ------------------------- */

function fmtMinimo(v: number, unidade: DesafioView["unidade"], tipo: DesafioView["tipo"]): string {
  if (tipo === "ticket" || tipo === "faturamento" || unidade === "R$") return brlK(v);
  if (tipo === "pa" || unidade === "x") return num(v, v % 1 !== 0 ? 2 : 0);
  return `${num(Math.round(v), 0)} un`;
}

function IconRelogio() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function BlocoDesafios({
  desafios,
  embedded = false,
}: {
  desafios: DesafioView[];
  /** Sem Card externo (ex.: aba dentro do Ao vivo). */
  embedded?: boolean;
}) {
  if (desafios.length === 0) {
    const empty = (
      <EmptyState
        icon="🎯"
        title="Nenhum desafio nesta competência"
        description="Não há desafios cadastrados para o período atual."
      />
    );
    return embedded ? empty : <Card>{empty}</Card>;
  }

  const cards = desafios.map((d) => (
    <div key={d.id} className="flex flex-col rounded-[var(--radius-vela-lg)] border border-line bg-bg-inset p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
          style={{
            color: d.corIcone,
            backgroundColor: `color-mix(in srgb, ${d.corIcone} 18%, transparent)`,
          }}
          aria-hidden
        >
          <FlameIcon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-bold leading-snug text-t0">{d.nome}</p>
          <p className="mt-1 text-[12px] leading-snug text-t2">{d.objetivo}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={d.statusVariant} className="gap-1">
              <IconRelogio />
              {d.prazoRotulo}
            </Badge>
            <span className="text-[11.5px] font-semibold tabular-nums text-t2">{d.janelaRotulo}</span>
          </div>
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
        <span>
          Gerente: <span className="font-bold text-ok">{brl(d.premioGerente)}</span>
        </span>
      </div>

      <div className="mb-3.5">
        <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="font-mono text-[12.5px] font-bold tabular-nums text-t0">
            {d.progressoAgregadoRotulo}
            <span className="ml-1.5 text-t2">· {num(d.progressoPct, 0)}%</span>
          </p>
          <p className="text-[11.5px] font-semibold text-t2">
            <span className="font-bold text-t0">{d.atingiram}</span>/{d.participantes} atingiram
            {d.minimoVendedorasAtingindo > 0 && d.minimoVendedorasAtingindo !== d.participantes && (
              <span className="text-t2"> · gerente {d.minimoVendedorasAtingindo}</span>
            )}
          </p>
        </div>
        <ProgressBar value={Math.min(100, d.progressoPct)} height={7} />
      </div>

      <div className={cn("border-t border-line pt-3", !embedded && "overflow-x-auto")}>
        <div
          className={cn(
            "min-w-[420px] space-y-2.5",
            embedded ? undefined : "max-h-[260px] overflow-y-auto",
          )}
        >
          {d.ranking.map((p, idx) => (
            <div key={p.colaboradorId} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-[12px] font-extrabold text-t2">{idx + 1}º</span>
              <Avatar name={p.nome} size="xs" />
              <div className="min-w-[110px] flex-1">
                <p className="truncate text-[12.5px] font-semibold text-t0">{p.nome.split(" ")[0]}</p>
                <p className="truncate text-[10.5px] text-t2">
                  {p.grupo} · {lojaCurta(p.loja)}
                </p>
              </div>
              <span className="w-[88px] shrink-0 text-right font-mono text-[11px] font-semibold tabular-nums text-t1">
                {p.progressoRotulo}
              </span>
              <div className="w-[72px] shrink-0">
                <ProgressBar value={Math.min(100, p.progressoPct)} height={5} />
              </div>
              <span className="w-8 shrink-0 text-right text-[11px] font-semibold text-t2">{num(p.progressoPct, 0)}%</span>
            </div>
          ))}
          {d.ranking.length === 0 && (
            <p className="py-3 text-center text-[12.5px] text-t2">Nenhuma participante no escopo atual.</p>
          )}
        </div>
      </div>
    </div>
  ));

  /** Ao vivo: 1 por linha + altura limitada com scroll. Equipe: grade 2 colunas. */
  const grade = embedded ? (
    <div className="max-h-[min(520px,70vh)] space-y-4 overflow-y-auto pr-1">{cards}</div>
  ) : (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{cards}</div>
  );

  if (embedded) return grade;

  return (
    <Card padding="lg">
      <div className="mb-4 flex items-center gap-1.5">
        <CardTitle>Desempenho nos Desafios</CardTitle>
        <TipHelp label="Acompanhe o progresso da equipe nos desafios, com prazo e premiação." />
      </div>
      {grade}
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