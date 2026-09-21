import { useEffect, useState } from "react";
import { Badge, Button, Card, Checkbox, Select, Skeleton, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { listarFiliaisErp, type FilialErp } from "@/data/gestao/erp";
import type { TipoPonto } from "@/data/gestao/filiais";

interface Linha {
  filial: FilialErp;
  selecionada: boolean;
  tipoPonto: TipoPonto | "";
}

export function Etapa3Filiais({ onConcluir, onVoltar }: { onConcluir: () => void; onVoltar: () => void }) {
  const { show } = useToast();
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [salvando, setSalvando] = useState(false);
  // O tipo de ponto só fica em destaque depois da primeira tentativa de confirmar.
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarFiliaisErp().then((fs) => ativo && setLinhas(fs.map((f) => ({ filial: f, selecionada: true, tipoPonto: "" }))));
    return () => {
      ativo = false;
    };
  }, []);

  const selecionadas = linhas?.filter((l) => l.selecionada) ?? [];
  const faltandoTipo = selecionadas.filter((l) => !l.tipoPonto).length;
  const pode = linhas !== null && selecionadas.length > 0 && faltandoTipo === 0 && !salvando;

  function atualizar(i: number, patch: Partial<Linha>) {
    setLinhas((ls) => ls!.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  async function concluir() {
    setTentou(true);
    if (!pode) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 700));
    show("Filiais confirmadas. Saímos do Millenium e agendamos o primeiro sync.", "success");
    onConcluir();
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-t0">Suas lojas</h2>
      <p className="mb-6 mt-1 text-[13.5px] text-t2">Estas são as filiais que o seu usuário enxerga no Millenium. Para cada uma, diga se é loja de rua ou de shopping: isso define o modelo de aluguel.</p>

      {linhas === null ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-[var(--radius-vela-md)] border border-line p-4">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-10 w-36 rounded-[var(--radius-vela-md)]" />
            </div>
          ))}
          <p className="text-center text-[12px] text-t2">Consultando filiais no Millenium…</p>
        </div>
      ) : linhas.length === 0 ? (
        <div className="rounded-[var(--radius-vela-md)] border border-warn/30 bg-warn-soft p-4 text-[13px] text-t0">Este usuário do Millenium não tem lojas vinculadas. Verifique no ERP e volte para tentar de novo.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {linhas.map((l, i) => (
            <div key={l.filial.filial} className={cn("flex flex-col gap-3 rounded-[var(--radius-vela-md)] border p-4 transition-colors sm:flex-row sm:items-center", l.selecionada ? "border-line bg-bg-2" : "border-line bg-bg-inset opacity-60")}>
              <Checkbox checked={l.selecionada} onChange={(e) => atualizar(i, { selecionada: e.target.checked })} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11.5px] font-bold text-acc">{l.filial.codFilial}</span>
                  <p className="text-[13.5px] font-bold text-t0">{l.filial.fantasia}</p>
                  {l.filial.wpink && <Badge variant="accent">WPINK</Badge>}
                  <Badge variant="neutral">{l.filial.tipo === "M" ? "Matriz" : "Filial"}</Badge>
                </div>
                <p className="mt-0.5 truncate text-[12px] text-t2">
                  {l.filial.nome} · {l.filial.franquia} · {l.filial.cidade}/{l.filial.estado} · CNPJ {l.filial.cgc}
                </p>
              </div>
              <div className="w-full sm:w-44">
                <Select value={l.tipoPonto} onChange={(e) => atualizar(i, { tipoPonto: e.target.value as TipoPonto | "" })} disabled={!l.selecionada} className={cn(tentou && l.selecionada && !l.tipoPonto && "border-warn")}>
                  <option value="">Tipo de ponto…</option>
                  <option value="RUA">Loja de rua</option>
                  <option value="SHOPPING">Shopping</option>
                </Select>
              </div>
            </div>
          ))}
          {faltandoTipo > 0 && <p className={cn("text-[12px]", tentou ? "font-medium text-warn" : "text-t2")}>Falta informar o tipo de ponto em {faltandoTipo === 1 ? "uma loja" : `${faltandoTipo} lojas`}.</p>}
          <p className="text-[11.5px] text-t2">Desmarcar uma loja só a deixa de fora do app. Nada muda no Millenium. Lojas novas que aparecerem depois pedem confirmação, não entram sozinhas.</p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={onVoltar} disabled={salvando}>
          Voltar
        </Button>
        <Button onClick={concluir} disabled={linhas === null || selecionadas.length === 0 || salvando} size="lg">
          {salvando ? "Salvando…" : `Confirmar ${selecionadas.length === 1 ? "1 loja" : `${selecionadas.length} lojas`}`}
        </Button>
      </div>
    </Card>
  );
}
