import { Button, Dropdown } from "@/components/ui";
import { cn } from "@/lib/cn";
import { filiais, type Divisao } from "@/data/gestao/filiais";
import { rotulosPeriodo, type Escopo, type PeriodoTipo } from "@/data/gestao/loja";
import { HOJE_ISO } from "@/data/gestao/relogio";
import { somarDias } from "@/lib/formato";
import { ICONS } from "@/pages/dashboards/icons";
import { useSessaoAtiva } from "@/session/SessionProvider";

const PERIODOS: PeriodoTipo[] = ["hoje", "ontem", "7dias", "esteMes", "mesPassado", "personalizado"];

const ROTULOS_DIVISAO: Record<Divisao, string> = { WEPINK: "Wepink", WPINK: "Wpink" };

/** Seta para baixo, indicando lista suspensa. */
function SetaBaixo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-70">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** Abas em pílula, no formato dos filtros de status da demo (Contacts): trilho com borda, quebra linha quando não cabe (sem scroll lateral). */
function Segmentado({ children }: { children: React.ReactNode }) {
  return <div className="flex w-fit flex-wrap gap-1 rounded-[13px] border border-line bg-bg-2 p-1">{children}</div>;
}

function Aba({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn("rounded-[10px] px-4 py-1.5 text-[12.5px] font-bold transition-colors", ativo ? "bg-acc text-white" : "text-t1 hover:text-t0")}
    >
      {children}
    </button>
  );
}

/** Período e Divisão direto na tela, cada um com o próprio rótulo — Loja já mora no topo. */
export function SeletorEscopo({ escopo, onChange }: { escopo: Escopo; onChange: (e: Escopo) => void }) {
  const sessao = useSessaoAtiva();
  const minhas = filiais.filter((f) => sessao.filiais.includes(f.id));
  const filialAtual = escopo.filialId === "todas" ? null : filiais.find((f) => f.id === escopo.filialId);
  const mostraDivisao = escopo.filialId === "todas" ? minhas.some((f) => f.temWpink) : Boolean(filialAtual?.temWpink);

  function trocarPeriodo(p: PeriodoTipo) {
    onChange({ ...escopo, periodo: p === "personalizado" ? { tipo: p, inicio: somarDias(HOJE_ISO, -13), fim: HOJE_ISO } : { tipo: p } });
  }

  return (
    <div className="flex flex-col gap-3.5">
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-t2">Período</p>
        <Dropdown
          align="left"
          trigger={
            <Button variant="secondary" icon={<ICONS.calendar size={16} />} iconRight={<SetaBaixo />}>
              {rotulosPeriodo[escopo.periodo.tipo]}
            </Button>
          }
          items={PERIODOS.map((p) => ({ label: rotulosPeriodo[p], icon: escopo.periodo.tipo === p ? <Check /> : undefined, onClick: () => trocarPeriodo(p) }))}
        />
      </div>

      {/* Personalizado: mesmo campo do "Date range" da demo, um por ponta.
          Uma caixa só, com os dois inputs lado a lado, quebra no celular:
          o formato de data por extenso ("15 de set. de 2026") não cabe
          num campo estreito com altura fixa. Fica logo abaixo do Período,
          de quem é uma extensão. */}
      {escopo.periodo.tipo === "personalizado" && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-t1">De</label>
              <div className="flex h-[42px] items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3.5 focus-within:border-acc">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <input
                  type="date"
                  value={escopo.periodo.inicio ?? ""}
                  max={escopo.periodo.fim ?? HOJE_ISO}
                  onChange={(e) => onChange({ ...escopo, periodo: { ...escopo.periodo, inicio: e.target.value } })}
                  className="campo-data w-[140px] bg-transparent text-[13.5px] font-semibold text-t0 outline-none [color-scheme:dark]"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-t1">Até</label>
              <div className="flex h-[42px] items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3.5 focus-within:border-acc">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <input
                  type="date"
                  value={escopo.periodo.fim ?? ""}
                  min={escopo.periodo.inicio}
                  max={HOJE_ISO}
                  onChange={(e) => onChange({ ...escopo, periodo: { ...escopo.periodo, fim: e.target.value } })}
                  className="campo-data w-[140px] bg-transparent text-[13.5px] font-semibold text-t0 outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
          <span className="text-[12px] text-t2">Um período que cruza meses desliga meta e lucro bruto.</span>
        </div>
      )}

      {mostraDivisao && (
        <div>
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-t2">Marca</p>
          <Segmentado>
            {([null, "WEPINK", "WPINK"] as (Divisao | null)[]).map((d) => (
              <Aba key={d ?? "todas"} ativo={escopo.divisao === d} onClick={() => onChange({ ...escopo, divisao: d })}>
                {d ? ROTULOS_DIVISAO[d] : "Ambas"}
              </Aba>
            ))}
          </Segmentado>
        </div>
      )}
    </div>
  );
}
