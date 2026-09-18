import { Button, Card, CardTitle, PageHeader } from "@/components/ui";
import { metas } from "@/data/gestao/metas";
import { filiais } from "@/data/gestao/filiais";
import { brl } from "@/lib/formato";

function nomeFilial(filialId: string) {
  return filiais.find((f) => f.id === filialId)?.fantasia ?? filialId;
}

/**
 * CRUD de Metas (fora do Dashboard).
 * Esqueleto para evolução — listagem a partir do fixture; formulário/plano do mês amanhã.
 */
export default function MetasPage() {
  const ordenadas = [...metas].sort((a, b) => {
    if (a.competencia !== b.competencia) return b.competencia.localeCompare(a.competencia);
    return nomeFilial(a.filialId).localeCompare(nomeFilial(b.filialId));
  });

  return (
    <div className="flex flex-col p-4 sm:p-6">
      <PageHeader
        title="Metas"
        subtitle="Meta mensal por loja, escada de degraus e distribuição individual."
        actions={
          <Button size="sm" disabled title="Em breve">
            Nova meta
          </Button>
        }
      />

      <Card className="mt-4" padding="lg">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <CardTitle>Metas cadastradas</CardTitle>
            <p className="mt-1 text-[12.5px] text-t2">
              Listagem a partir dos dados de demonstração. Edição e plano do mês entram na próxima etapa.
            </p>
          </div>
          <span className="text-[12px] font-semibold text-t2">{ordenadas.length} meta(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                <th className="px-1 pb-3 text-left font-bold">Competência</th>
                <th className="px-1 pb-3 text-left font-bold">Loja</th>
                <th className="px-1 pb-3 text-left font-bold">Nome</th>
                <th className="px-1 pb-3 text-right font-bold">Meta da loja</th>
                <th className="px-1 pb-3 text-right font-bold">Degraus</th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-1 py-8 text-center text-[13px] text-t2">
                    Nenhuma meta cadastrada.
                  </td>
                </tr>
              ) : (
                ordenadas.map((m) => (
                  <tr key={m.id} className="border-b border-line last:border-b-0">
                    <td className="px-1 py-3 font-mono text-[13px] font-semibold text-t1">{m.competencia}</td>
                    <td className="px-1 py-3 text-[13px] font-bold text-t0">{nomeFilial(m.filialId)}</td>
                    <td className="px-1 py-3 text-[13px] text-t1">{m.nome}</td>
                    <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{brl(m.valorLoja)}</td>
                    <td className="px-1 py-3 text-right text-[12.5px] text-t2">{m.degraus.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
