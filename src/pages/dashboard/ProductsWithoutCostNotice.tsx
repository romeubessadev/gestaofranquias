import { useState } from "react";
import type { ProductWithoutCost } from "@/data/wedash/dashboard";
import { brlCent, num } from "@/lib/format";

/** Aviso (warn) quando produtos vendidos no período vêm com custo R$ 0 do Millennium — CMV e margem ficam otimistas. */
export function ProductsWithoutCostNotice({ produtos }: { produtos?: ProductWithoutCost[] }) {
  const [aberto, setAberto] = useState(false);
  if (!produtos || produtos.length === 0) return null;
  const total = produtos.reduce((s, p) => s + p.faturamento, 0);
  const n = produtos.length;
  return (
    <div className="mt-4 rounded-[var(--radius-vela-md)] border border-warn/30 bg-warn-soft px-3.5 py-3 text-[12.5px] leading-relaxed text-t0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">
            {n === 1 ? "1 produto sem custo" : `${n} produtos sem custo`} no Millennium ·{" "}
            <span className="tabular-nums">{brlCent(total)}</span> de faturamento
          </p>
          <p className="text-t1">
            O custo {n === 1 ? "dele entra" : "deles entra"} como R$ 0, então CMV, lucro bruto e margem ficam acima do real.
            Cadastre o custo no Millennium para corrigir.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="shrink-0 text-[12px] font-semibold text-t0 underline-offset-2 hover:underline"
        >
          {aberto ? "Ocultar produtos" : "Ver produtos"}
        </button>
      </div>
      {aberto && (
        <ul className="mt-2.5 divide-y divide-warn/20 border-t border-warn/20">
          {produtos.map((p) => (
            <li key={p.codigo} className="flex items-center justify-between gap-3 py-1.5">
              <span className="min-w-0 truncate">
                <span className="font-mono text-t2">{p.codigo}</span>
                {p.nome ? <span className="ml-2">{p.nome}</span> : null}
              </span>
              <span className="shrink-0 tabular-nums text-t1">
                {num(p.itens)} {p.itens === 1 ? "item" : "itens"} · {brlCent(p.faturamento)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
