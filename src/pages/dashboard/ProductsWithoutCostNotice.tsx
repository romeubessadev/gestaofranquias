import { useState } from "react";
import { Link } from "react-router-dom";
import type { ProductWithoutCost } from "@/data/wedash/dashboard";
import { brlCent, num } from "@/lib/format";
import { isGestor } from "@/layout/nav-wedash";
import { paths } from "@/router/paths";
import { useActiveSession } from "@/session/SessionProvider";
import { AlertTriangleIcon } from "@/pages/dashboards/icons";

/**
 * Aviso (warn) quando produtos vendidos no período ficam sem custo: R$ 0 na margem do Millennium
 * e sem preço na tabela de custo da loja — CMV e margem ficam otimistas.
 */
export function ProductsWithoutCostNotice({ produtos }: { produtos?: ProductWithoutCost[] }) {
  const session = useActiveSession();
  const [aberto, setAberto] = useState(false);
  if (!produtos || produtos.length === 0) return null;
  const n = produtos.length;

  return (
    <div className="mt-4 rounded-[var(--radius-vela-md)] border border-warn/30 bg-warn-soft px-3.5 py-2.5 text-[12.5px] text-t0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className="flex min-w-0 items-center gap-2">
          <AlertTriangleIcon size={16} className="shrink-0 text-warn" />
          <span>
            <span className="font-semibold">{n === 1 ? "1 produto sem custo" : `${n} produtos sem custo`} no Millennium</span>
            <span className="text-t1"> · CMV e margem ficam acima do real</span>
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-3 text-[12px] font-semibold">
          <button type="button" onClick={() => setAberto((v) => !v)} className="text-t0 underline-offset-2 hover:underline">
            {aberto ? "Ocultar" : "Ver produtos"}
          </button>
          {isGestor(session.role) && (
            <Link
              to={`${paths.settings.products}?filtro=sem-custo`}
              title="Cadastro de produtos e custos das tabelas do Millennium"
              className="text-t0 underline-offset-2 hover:underline"
            >
              Abrir cadastro
            </Link>
          )}
        </div>
      </div>
      {aberto && (
        <ul className="mt-2 divide-y divide-warn/20 border-t border-warn/20">
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
