import { Select } from "@/components/ui";
import type { Filial } from "@/data/gestao/filiais";
import type { Escopo } from "@/data/gestao/dashboard";

/**
 * Select de loja, isolado do resto do filtro (Período/Divisão) porque mora
 * na barra do topo agora, no lugar do "Buscar telas" quando o Dashboard está
 * aberto — é o filtro mais importante da tela, merece o lugar mais visível.
 */
export function SeletorLoja({ escopo, onChange, minhas }: { escopo: Escopo; onChange: (e: Escopo) => void; minhas: Filial[] }) {
  return (
    <Select value={escopo.filialId} onChange={(e) => onChange({ ...escopo, filialId: e.target.value, divisao: null })} className="min-w-0">
      <option value="todas">Todas as lojas</option>
      {minhas.map((f) => (
        <option key={f.id} value={f.id}>
          {f.fantasia}
        </option>
      ))}
    </Select>
  );
}
