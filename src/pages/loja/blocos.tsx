import { useState, type ReactNode } from "react";
import { Accordion, Badge, Card, CardHeader, CardTitle, DataTable, EmptyState, Modal, ProgressBar, Skeleton, Switch, type AccordionItemData, type DataTableColumn } from "@/components/ui";
import { AreaLineChart, BarChart, DonutChart, Gauge, StackedBarChart } from "@/components/charts";
import { ICONS, TINT, type IconKey, type TintKey } from "@/pages/dashboards/icons";
import { KpiSubtitulo, KpiTile } from "@/pages/dashboards/KpiTile";
import { cn } from "@/lib/cn";
import { brl } from "@/lib/formato";
import { brlK, type AlertaSistema, type CategoriaLinha, type ChecklistDia, type ComparacaoView, type EstadoBloco as EstadoBlocoTipo, type GraficoEvolucao, type GraficoHora, type GraficoHoraRede, type ItemLucro, type KpiValor, type LacunaView, type LinhaRegua, type MixView, type PontoAtencao, type ProjecaoView, type RitmoCard, type TileMetaProjecao, type TrilhoView, type TurnoLinha, type VendaNecessariaView } from "@/data/gestao/loja";
import { produtosDaCategoria, type ProdutoResumo } from "@/data/gestao/produtos";

/* ---------- Estados de leitura (LOJA-07): carregando → Skeleton; sem dados → EmptyState ---------- */

const ROTULO_ESTADO: Record<Exclude<EstadoBlocoTipo, "disponivel">, string> = {
  carregando: "Carregando dados…",
  sem_dados: "Sem dados para o período selecionado",
  indisponivel: "Bloco indisponível no momento",
};

export function EstadoBloco({ estado, children }: { estado: EstadoBlocoTipo; children: ReactNode }) {
  if (estado === "disponivel") return <>{children}</>;
  if (estado === "carregando") {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  return (
    <EmptyState
      icon="📭"
      title={ROTULO_ESTADO[estado]}
      description={estado === "sem_dados" ? "Não existem vendas para o período selecionado." : "Tente outro período ou consulte a equipe de TI."}
    />
  );
}

/* ---------- Mix por categoria (LOJA-04 AC 10): DonutChart + margem na legenda ---------- */

const CORES_MIX: TintKey[] = ["acc", "bad", "info", "ok", "warn"];

export function BlocoMix({ mix }: { mix: MixView }) {
  const segments = mix.itens.map((it, i) => ({
    label: it.categoria,
    value: it.receita,
    color: TINT[CORES_MIX[i % CORES_MIX.length]].fg,
  }));
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Mix por categoria</CardTitle>
        <p className="mt-1 text-[12.5px] text-t2">{mix.periodo}</p>
      </CardHeader>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <DonutChart segments={segments} size={150} centerLabel="Mix" centerValue={`${mix.itens.length} cat.`} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {mix.itens.map((it) => (
            <div key={it.categoria} className="flex items-center justify-between gap-2 rounded-lg bg-bg-inset px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: TINT[CORES_MIX[mix.itens.indexOf(it) % CORES_MIX.length]].fg }} />
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-bold text-t0">{it.categoria}</p>
                  <p className="text-[11px] text-t2">{it.divisao}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-bold text-t0">{Math.round(it.pct)}%</p>
                <p className="text-[11px] text-t2">margem {brl(it.margem)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ---------- Blocos operacionais novos (T9): trilho, venda, projeção, diagnóstico ---------- */

const STATUS_TRILHA_META: Record<TrilhoView["status"], { rotulo: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }> = {
  no_trilho: { rotulo: "No trilho", variant: "success" },
  atencao: { rotulo: "Atenção", variant: "warning" },
  abaixo: { rotulo: "Abaixo do trilho", variant: "danger" },
  meta_batida: { rotulo: "Meta batida", variant: "success" },
  meta_nao_batida: { rotulo: "Meta não batida", variant: "danger" },
};

export function BlocoTrilho({ trilho }: { trilho: TrilhoView }) {
  const m = STATUS_TRILHA_META[trilho.status];
  const pct = trilho.pctTrilho ?? 0;
  return (
    <Card className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-[11px] font-bold uppercase tracking-widest text-t2">Status do mês</p>
      <Gauge value={pct} max={100} size={150} color={m.variant === "danger" ? "var(--bad)" : m.variant === "warning" ? "var(--warn)" : "var(--ok)"} label={trilho.competencia} />
      <Badge variant={m.variant} dot>
        {m.rotulo}
      </Badge>
      {trilho.pctTrilho !== null && <p className="text-[13px] font-bold text-t0">{Math.round(trilho.pctTrilho)}% da meta acumulada</p>}
    </Card>
  );
}

export function BlocoVendaNecessaria({ venda }: { venda: VendaNecessariaView }) {
  if (venda.semMeta) return <EmptyState icon="🎯" title="Sem meta para a competência" description="Defina a meta do mês para ver a venda necessária." />;
  const feitoHojePct = venda.realizadoHoje > 0 && venda.valor !== null ? Math.min(100, Math.round((venda.realizadoHoje / (venda.realizadoHoje + venda.valor)) * 100)) : 0;
  return (
    <Card className="flex h-full flex-col gap-3">
      <CardTitle>Venda necessária hoje</CardTitle>
      <p className="text-3xl font-extrabold text-t0">{venda.valor !== null ? brl(venda.valor) : "—"}</p>
      <p className="text-[12.5px] text-t2">
        {venda.valor !== null && venda.valor <= 0 ? "Cumprida ✓" : `Faltam ${brl(venda.faltaRestante)} em ${venda.diasRestantes} dias abertos`}
      </p>
      {venda.realizadoHoje > 0 && (
        <ProgressBar value={feitoHojePct} color="var(--acc)" label="Realizado hoje" />
      )}
      {venda.metaMesAtingida && <Badge variant="success">Meta do mês atingida</Badge>}
    </Card>
  );
}

export function BlocoProjecao({ projecao, metaValor }: { projecao: ProjecaoView; metaValor: number }) {
  if (projecao.encerrada) {
    return (
      <Card className="flex h-full flex-col gap-2">
        <CardTitle>Competência encerrada</CardTitle>
        <p className="text-2xl font-extrabold text-t0">{projecao.valor !== null ? brl(projecao.valor) : "—"}</p>
        <p className="text-[12.5px] text-t2">Realizado fechado do período.</p>
      </Card>
    );
  }
  if (!projecao.disponivel) {
    return (
      <Card className="flex h-full flex-col gap-2">
        <CardTitle>Projeção de fechamento</CardTitle>
        <p className="text-[13px] text-t2">Projeção disponível a partir do dia 7.</p>
      </Card>
    );
  }
  const pct = metaValor > 0 ? ((projecao.valor ?? 0) / metaValor) * 100 : 0;
  return (
    <Card className="flex h-full flex-col gap-2">
      <CardTitle>Projeção de fechamento</CardTitle>
      <p className="text-2xl font-extrabold text-t0">{projecao.valor !== null ? brl(projecao.valor) : "—"}</p>
      <ProgressBar value={pct} color={pct >= 100 ? "var(--ok)" : "var(--warn)"} label={`vs meta ${metaValor > 0 ? brl(metaValor) : ""}`} />
      {projecao.indice !== null && <p className="text-[12px] text-t2">Índice {projecao.indice.toFixed(3)} na curva restante</p>}
    </Card>
  );
}

export function BlocoDiagnostico({ diagnostico }: { diagnostico: LacunaView }) {
  if (diagnostico.semMeta) return null;
  if (!diagnostico.exibir) return null;
  const maior = Math.max(diagnostico.efeitoFluxo, diagnostico.efeitoTicket, 0);
  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>Onde agir: fluxo ou ticket?</CardTitle>
      <div className="flex flex-col gap-2">
        <div>
          <div className="mb-1 flex items-center justify-between text-[12.5px]">
            <span className="text-t1">Fluxo (atendimentos)</span>
            <span className="font-bold text-t0">{diagnostico.efeitoFluxo > 0 ? `−${brl(Math.abs(diagnostico.efeitoFluxo))}` : brl(diagnostico.efeitoFluxo)}</span>
          </div>
          <ProgressBar value={maior > 0 ? Math.max(0, (diagnostico.efeitoFluxo / maior) * 100) : 0} color="var(--info)" />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[12.5px]">
            <span className="text-t1">Ticket médio</span>
            <span className="font-bold text-t0">{diagnostico.efeitoTicket > 0 ? `+${brl(Math.abs(diagnostico.efeitoTicket))}` : brl(diagnostico.efeitoTicket)}</span>
          </div>
          <ProgressBar value={maior > 0 ? Math.max(0, (diagnostico.efeitoTicket / maior) * 100) : 0} color="var(--warn)" />
        </div>
        {diagnostico.alavancaDominante && (
          <Badge variant="info" dot>
            Alavanca dominante: {diagnostico.alavancaDominante === "fluxo" ? "fluxo" : "ticket"}
          </Badge>
        )}
      </div>
    </Card>
  );
}

/* ---------- Comparação: datas exatas, não um rótulo vago ---------- */

export function BlocoComparacao({ comparacao }: { comparacao: ComparacaoView }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">Período atual</p>
        <p className="text-[12.5px] font-semibold text-t1">{comparacao.rotuloAtual}</p>
      </div>
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-t2">Comparado a</p>
        <p className="text-[12.5px] font-semibold text-t1">{comparacao.rotuloAnterior}</p>
      </div>
    </div>
  );
}

/* ---------- Alerta de sistema: mesmo cartão tintado dos Avisos, não uma linha solta ---------- */

const TOM_ALERTA: Record<AlertaSistema["tom"], { borda: string; fundo: string; cor: string }> = {
  danger: { borda: "border-bad/30", fundo: "bg-bad-soft", cor: "var(--bad)" },
  warning: { borda: "border-warn/30", fundo: "bg-warn-soft", cor: "var(--warn)" },
  info: { borda: "border-info/30", fundo: "bg-info-soft", cor: "var(--info)" },
};

export function BlocoAlertas({ alertas }: { alertas: AlertaSistema[] }) {
  if (alertas.length === 0) return null;
  return (
    <div className="mb-5 flex flex-col gap-2">
      {alertas.map((a) => {
        const tom = TOM_ALERTA[a.tom];
        return (
          <div key={a.id} className={cn("flex items-start gap-2.5 rounded-[var(--radius-vela-md)] border px-3.5 py-2.5 text-[12.5px] leading-relaxed text-t0", tom.borda, tom.fundo)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={tom.cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{a.texto}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Leitura ---------- */

export function BlocoLeitura({ texto }: { texto: string }) {
  return (
    <Card padding="sm" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 0% 0%, var(--acc-soft), transparent 55%)" }} />
      <div className="relative flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-acc text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.94 15.5a2 2 0 0 0-1.44-1.44L2.36 12.48a.5.5 0 0 1 0-.96l6.14-1.58a2 2 0 0 0 1.44-1.44l1.58-6.14a.5.5 0 0 1 .96 0l1.58 6.14a2 2 0 0 0 1.44 1.44l6.14 1.58a.5.5 0 0 1 0 .96l-6.14 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.14a.5.5 0 0 1-.96 0Z" />
            <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
          </svg>
        </span>
        <p className="text-[13.5px] leading-relaxed text-t0">{texto}</p>
      </div>
    </Card>
  );
}

/* ---------- Indicadores do topo, um KpiTile por métrica ---------- */

const ICONE_KPI: Record<"ticket" | "pa" | "atendimentos", IconKey> = { ticket: "card", pa: "layers", atendimentos: "users" };
const TINT_KPI: Record<"ticket" | "pa" | "atendimentos", TintKey> = { ticket: "info", pa: "ok", atendimentos: "warn" };
const SUB_KPI: Record<"ticket" | "pa", string> = { ticket: "por atendimento", pa: "itens por atendimento" };

/** Segundo tile: Meta do mês, Projeção ou Participação da marca — mesmo lugar da fileira, papel que muda por contexto. Não é um KpiTile puro porque leva uma barra de progresso embutida, que o componente não suporta. */
export function KpiMetaTile({ tile }: { tile: TileMetaProjecao }) {
  const Icon = ICONS.target;
  return (
    <Card className="min-w-0">
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl" style={{ background: TINT.acc.bg, color: TINT.acc.fg }}>
          <Icon size={20} />
        </span>
      </div>
      <p className="truncate text-xs font-semibold uppercase tracking-wide text-t1">{tile.rotulo}</p>
      <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight text-t0">{tile.valorPrincipal}</p>
      <div className="mt-2.5">
        <ProgressBar value={tile.barraPct} height={6} />
      </div>
      <KpiSubtitulo texto={tile.detalhe} />
    </Card>
  );
}

export function BlocoKpis({ faturamento, ticket, pa, atendimentos }: { faturamento: KpiValor; ticket: KpiValor; pa: KpiValor; atendimentos: KpiValor }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiTile label={faturamento.rotulo ?? "Faturamento"} value={faturamento.valor} icon="dollar" tint="acc" delta={faturamento.delta} sub={faturamento.sub} subDuasLinhas />
      <KpiTile label="Atendimentos" value={atendimentos.valor} icon={ICONE_KPI.atendimentos} tint={TINT_KPI.atendimentos} delta={atendimentos.delta} subDuasLinhas />
      <KpiTile label="Ticket médio" value={ticket.valor} icon={ICONE_KPI.ticket} tint={TINT_KPI.ticket} delta={ticket.delta} sub={SUB_KPI.ticket} subDuasLinhas />
      <KpiTile label="P.A." value={pa.valor} icon={ICONE_KPI.pa} tint={TINT_KPI.pa} delta={pa.delta} sub={SUB_KPI.pa} subDuasLinhas />
    </div>
  );
}

/* ---------- Ritmo da meta: card lateral da rede, três linhas, sem barra (a barra já está no tile) ---------- */

export function BlocoRitmo({ ritmo }: { ritmo: RitmoCard }) {
  return (
    <Card className="flex h-full flex-col gap-3.5">
      <CardTitle>Ritmo da meta</CardTitle>
      <div className="relative mx-auto h-[108px] w-[190px]">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          <path d="M16 100 A 84 84 0 0 1 184 100" fill="none" stroke="var(--bg-inset)" strokeWidth="16" strokeLinecap="round" />
          <path d="M16 100 A 84 84 0 0 1 184 100" fill="none" stroke="var(--acc)" strokeWidth="16" strokeLinecap="round" strokeDasharray={264} strokeDashoffset={264 * (1 - ritmo.barraPct / 100)} />
        </svg>
        <div className="absolute inset-x-0 bottom-1.5 text-center">
          <span className="block text-[28px] font-extrabold tracking-tight text-t0">{Math.round(ritmo.barraPct)}%</span>
          <span className="text-[11.5px] font-semibold text-t2">{ritmo.projecaoLinha}</span>
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 rounded-xl border border-line bg-bg-2 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold text-t2">Realizado por dia</p>
          <p className="mt-1 text-[15px] font-extrabold text-t0">{ritmo.realizadoDia}</p>
        </div>
        <div className="flex-1 rounded-xl border border-line bg-bg-2 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold text-t2">Necessário por dia</p>
          <p className="mt-1 text-[15px] font-extrabold text-ok">{ritmo.necessarioDia}</p>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Régua de lojas: no padrão "Sessions by device" do Vela — hero com ícone e cor da loja, % à direita, barra, clique abre a loja ---------- */

export function BlocoRegua({ regua, modoMarca, onEscolher }: { regua: LinhaRegua[]; modoMarca: boolean; onEscolher: (filialId: string) => void }) {
  const IconeLoja = ICONS.cart;
  return (
    <Card className="flex flex-col">
      <CardTitle>Desempenho das lojas</CardTitle>
      <p className="mt-1 mb-5 text-[12.5px] text-t2">
        {modoMarca ? "Participação de cada loja no faturamento da marca." : "Progresso da meta do mês, da loja que mais precisa de atenção para a que menos precisa."}
      </p>

      <div className="flex flex-col gap-5">
        {regua.map((l) => (
          <button key={l.filialId} onClick={() => onEscolher(l.filialId)} className="text-left">
            <div className="mb-2 flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                style={{ background: TINT[l.tint].bg, color: TINT[l.tint].fg }}
              >
                <IconeLoja size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-t1">{l.nome}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[13px] font-bold text-t0">{l.faturamento}</span>
                {l.variacaoDia && l.variacaoDia.value !== "=" && (
                  <Badge variant={l.variacaoDia.positive ? "success" : "danger"}>
                    {l.variacaoDia.positive ? "↗" : "↘"} {l.variacaoDia.value}
                  </Badge>
                )}
              </span>
            </div>
            <ProgressBar value={l.barraPct} color={TINT[l.tint].fg} height={7} />
            <p className="mt-1 text-[11.5px] text-t2">{l.atingimentoTexto}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Pontos de atenção: fora do ritmo da própria meta, não quem vendeu menos ---------- */

export function BlocoAtencao({ pontos, onEscolher }: { pontos: PontoAtencao[]; onEscolher: (filialId: string) => void }) {
  return (
    <Card>
      <CardTitle>Pontos de atenção</CardTitle>
      <p className="mt-1 mb-5 text-[12.5px] text-t2">Lojas fora do ritmo da própria meta, ordenadas da pior pra melhor</p>
      {pontos.length === 0 ? (
        <div className="flex items-center gap-2.5 text-[13px] text-t1">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          Todas as lojas estão no ritmo da meta.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {pontos.map((p) => (
            <button key={p.filialId} onClick={() => onEscolher(p.filialId)} className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-left hover:border-line-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-t0">{p.nome}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">
                  {p.atingimentoTexto} da meta{p.faltaPorDia !== "Meta batida" && ` · falta ${p.faltaPorDia}/dia`}
                </p>
              </div>
              <Badge variant={p.veredito === "nao_atinge" ? "danger" : "warning"}>{p.status}</Badge>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ---------- Faturamento por hora ---------- */

export function BlocoPorHora({ g }: { g: GraficoHora }) {
  const dados = g.horas.map((h, i) => ({
    label: `${h}h`,
    value: g.valores[i],
    color: g.horaAtual === null || h <= g.horaAtual ? "var(--acc)" : "var(--bg-3)",
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento por hora</CardTitle>
      </CardHeader>
      {g.comparacaoTexto && <p className="mb-3 text-[12px] text-t2">{g.comparacaoTexto}</p>}
      <div className="-mx-1 overflow-x-auto px-1">
        <div style={{ minWidth: Math.max(0, dados.length * 58) }}>
          <BarChart data={dados} height={220} formatValue={(v) => (v === 0 ? "" : brlK(v))} />
        </div>
      </div>
    </Card>
  );
}

/* ---------- Faturamento por hora, empilhado por loja: rede, um dia só ---------- */

export function BlocoPorHoraRede({ g }: { g: GraficoHoraRede }) {
  if (g.colapsado) {
    const dados = g.horas.map((h, i) => ({
      label: `${h}h`,
      value: g.series.reduce((s, serie) => s + serie.valores[i], 0),
      color: g.horaAtual === null || h <= g.horaAtual ? "var(--acc)" : "var(--bg-3)",
    }));
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faturamento por hora</CardTitle>
        </CardHeader>
        <p className="mb-3 text-[12px] text-t2">Soma das lojas — {g.series.length} lojas, uma cor por loja passaria do que dá pra ler.</p>
        <div className="-mx-1 overflow-x-auto px-1">
          <div style={{ minWidth: Math.max(0, dados.length * 58) }}>
            <BarChart data={dados} height={220} formatValue={(v) => (v === 0 ? "" : brlK(v))} />
          </div>
        </div>
      </Card>
    );
  }
  const dados = g.horas.map((h, i) => {
    const linha: Record<string, number | string> = { label: `${h}h` };
    for (const serie of g.series) linha[serie.filialId] = serie.valores[i];
    return linha;
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Faturamento por hora</CardTitle>
      </CardHeader>
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {g.series.map((s) => (
          <span key={s.filialId} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-t1">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: TINT[s.tint].fg }} />
            {s.nome}
          </span>
        ))}
      </div>
      <div className="-mx-1 overflow-x-auto px-1">
        <div style={{ minWidth: Math.max(0, dados.length * 58) }}>
          <StackedBarChart data={dados} keys={g.series.map((s) => s.filialId)} colors={g.series.map((s) => TINT[s.tint].fg)} height={220} formatValue={brlK} />
        </div>
      </div>
    </Card>
  );
}

/* ---------- Evolução diária ---------- */

export function BlocoEvolucao({ g }: { g: GraficoEvolucao }) {
  const [comparar, setComparar] = useState(false);
  const serie = comparar && g.anterior ? g.anterior : g.valores;
  const total = g.valores.reduce((s, v) => s + v, 0);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Evolução diária</CardTitle>
          <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-t0">{brl(total)}</p>
        </div>
        {g.anterior && <Switch checked={comparar} onChange={setComparar} label={<span className="text-[12px] text-t1">Comparar com {g.rotuloAnterior}</span>} />}
      </CardHeader>
      <AreaLineChart data={serie} labels={g.rotulos} height={220} color={comparar ? "var(--t2)" : "var(--acc)"} formatValue={brl} />
      <div className="mt-2 flex justify-between px-1">
        {g.rotulos.map((r, i) => (
          <span key={i} className={cn("text-[10.5px] font-semibold text-t2", g.rotulos.length > 16 && i % 2 === 1 && "hidden sm:inline")}>
            {r}
          </span>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Checklist do dia: um turno por linha, toque expande as tarefas ---------- */

const ESTADO_TEXTO: Record<TurnoLinha["estado"], string> = { encerrado: "concluído", andamento: "em andamento", naoComecou: "não começou" };

export function BlocoChecklist({ c }: { c: ChecklistDia }) {
  const itens: AccordionItemData[] = c.turnos.map((t) => {
    const pctFeito = t.total ? (t.feitas / t.total) * 100 : 0;
    const pendentes = t.total - t.feitas;
    const estadoTexto = t.estado === "encerrado" && pendentes > 0 ? `${pendentes} pendentes` : ESTADO_TEXTO[t.estado];
    return {
      key: t.id,
      title: (
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span>
              {t.nome} · {t.horario}
              {t.estado === "andamento" && (
                <Badge variant="info" dot className="ml-2 align-middle">
                  agora
                </Badge>
              )}
            </span>
            <span className="text-[12px] font-semibold text-t2">
              {t.feitas} de {t.total}
            </span>
          </div>
          <ProgressBar value={pctFeito} height={7} color={t.estado === "andamento" ? "var(--acc)" : "var(--ok)"} />
          <p className="mt-1 text-[11.5px] font-normal text-t2">{estadoTexto}</p>
        </div>
      ),
      content: (
        <div className="flex flex-col gap-2.5">
          {t.tarefas.map((x) => (
            <div key={x.titulo} className="flex items-center gap-2.5 text-[13px]">
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold", x.feita ? "bg-ok-soft text-ok" : "border border-line text-t2")}>{x.feita ? "✓" : ""}</span>
              <span className={x.feita ? "text-t1" : "text-t0"}>{x.titulo}</span>
            </div>
          ))}
        </div>
      ),
    };
  });

  return (
    <Card>
      <CardTitle>Checklist do dia · {c.dataTexto}</CardTitle>
      <div className="mt-3">
        <Accordion items={itens} />
      </div>
    </Card>
  );
}

/* ---------- Lucro bruto: três linhas alinhadas, card lateral da loja em período de mês ---------- */

export function BlocoLucroBruto({ itens, aviso, divisaoLinha }: { itens: ItemLucro[]; aviso: string; divisaoLinha: string | null }) {
  return (
    <Card className="flex h-full flex-col gap-3">
      <CardTitle>Lucro bruto</CardTitle>
      <div className="flex flex-col gap-2">
        {itens.map((i) => (
          <div key={i.rotulo} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-t1">{i.rotulo}</span>
            <span className="flex items-center gap-3">
              <span className="font-mono font-bold text-t0">{i.valor}</span>
              <span className="w-10 text-right text-t2">{i.pct}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-[11.5px] text-t2">{aviso}</p>
      {divisaoLinha && <p className="text-[12px] text-t2">{divisaoLinha}</p>}
    </Card>
  );
}

/* ---------- Margem por categoria ---------- */

const colunasProduto: DataTableColumn<ProdutoResumo>[] = [
  {
    key: "nome",
    header: "Produto",
    render: (p) => (
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-t0">{p.nome}</p>
        <p className="font-mono text-[11px] text-t2">{p.codProduto}</p>
      </div>
    ),
  },
  { key: "receita", header: "Receita", align: "right", render: (p) => <span className="font-mono font-semibold">{brl(p.receita)}</span> },
  { key: "margem", header: "Margem", align: "right", render: (p) => <span className="font-mono font-semibold text-ok">{brl(p.margem)}</span>, hideBelow: "sm" },
  { key: "cobertura", header: "Cobertura", align: "right", hideBelow: "md", render: (p) => (p.coberturaDias === null ? <Badge variant="danger">ruptura</Badge> : <span className={cn("text-[12.5px]", p.coberturaDias < 15 ? "font-bold text-bad" : p.coberturaDias > 90 ? "font-bold text-warn" : "text-t1")}>{p.coberturaDias}d</span>) },
];

export function BlocoCategorias({ categorias, escopoId }: { categorias: CategoriaLinha[]; escopoId: string }) {
  const [aberta, setAberta] = useState<CategoriaLinha | null>(null);
  const numeros = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
  const produtos = aberta ? produtosDaCategoria(aberta.categoriaId, escopoId, numeros(aberta.receita), numeros(aberta.margem), 0) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margem por categoria</CardTitle>
        <span className="text-[12px] text-t2">as quatro maiores</span>
      </CardHeader>
      {categorias.length === 0 ? (
        <p className="text-[13px] text-t2">Sem vendas no período.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {categorias.map((c) => (
            <button key={c.categoriaId} onClick={() => setAberta(c)} className="rounded-xl bg-bg-inset p-3.5 text-left hover:bg-bg-3">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <span className="truncate text-[13px] font-bold text-t0">{c.nome}</span>
                <span className="shrink-0 text-[12px] text-t2">
                  <span className="font-mono font-bold text-t0">{c.receita}</span> · margem <span className="font-mono font-bold text-ok">{c.margem}</span> · {c.margemPct}
                </span>
              </div>
              <ProgressBar value={c.barraPct} color="var(--acc)" height={7} />
            </button>
          ))}
        </div>
      )}
      <Modal open={aberta !== null} onClose={() => setAberta(null)} title={aberta ? aberta.nome : ""} size="lg">
        {aberta && (
          <div>
            <p className="mb-4 text-[12.5px] text-t2">
              Receita <span className="font-bold text-t0">{aberta.receita}</span> · margem <span className="font-bold text-ok">{aberta.margem}</span> ({aberta.margemPct})
            </p>
            <DataTable columns={colunasProduto} data={produtos} rowKey={(p) => p.codProduto} />
          </div>
        )}
      </Modal>
    </Card>
  );
}
