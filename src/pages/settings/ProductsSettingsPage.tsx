import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
  EmptyState,
  Select,
  useToast,
} from "@/components/ui";
import { ProductsTableSkeleton } from "@/components/wedash/LoadingSkeletons";
import { useActiveSession } from "@/session/SessionProvider";
import { fetchCostTables, type CostTable } from "@/data/wedash/stores";
import {
  fetchCatalogProducts,
  fetchCostTablePrices,
  fetchMostUsedCostTable,
  fetchProductsRefreshedAt,
  syncProductsNow,
  type CatalogProductRow,
} from "@/data/wedash/productCatalog";
import { brlCent } from "@/lib/format";

type Filtro = "todos" | "sem-custo";
type Row = CatalogProductRow & { cost: number | null };

function fmtRefreshed(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `Atualizado em ${dia} às ${hora}`;
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Configurações > Produtos (só Gestor) — cadastro de produtos do Millennium com o custo da tabela de custo.
 * Layout = Data Tables do Vela (busca + filtros + ordenação + paginação).
 * Atualizar busca catálogo + tabelas + preços agora (fora da fila do worker).
 */
export function ProductsSettingsPage() {
  const session = useActiveSession();
  const { show } = useToast();
  const [params, setParams] = useSearchParams();
  const filtro: Filtro = params.get("filtro") === "sem-custo" ? "sem-custo" : "todos";

  const [products, setProducts] = useState<CatalogProductRow[]>([]);
  const [tables, setTables] = useState<CostTable[]>([]);
  const [tableId, setTableId] = useState<number | null>(null);
  const [prices, setPrices] = useState<Map<string, number>>(new Map());
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [busca, setBusca] = useState("");
  const carregar = useCallback(async () => {
    try {
      const [p, t, used, at] = await Promise.all([
        fetchCatalogProducts(),
        fetchCostTables(),
        fetchMostUsedCostTable(session.tenantId),
        fetchProductsRefreshedAt(),
      ]);
      setProducts(p);
      setTables(t);
      setRefreshedAt(at);
      setTableId((cur) => (cur != null && t.some((x) => x.id === cur) ? cur : used ?? t[0]?.id ?? null));
    } catch (e) {
      console.error("Produtos:", e);
      show("Não foi possível carregar os produtos.", "danger");
    } finally {
      setLoaded(true);
    }
  }, [session.tenantId, show]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  useEffect(() => {
    if (tableId == null) {
      setPrices(new Map());
      return;
    }
    let cancelled = false;
    void fetchCostTablePrices(tableId)
      .then((m) => {
        if (!cancelled) setPrices(m);
      })
      .catch((e) => console.error("Preços da tabela:", e));
    return () => {
      cancelled = true;
    };
  }, [tableId, refreshedAt]);

  async function atualizar() {
    setSyncing(true);
    const r = await syncProductsNow();
    setSyncing(false);
    if (!r.ok) {
      show(r.message, "danger");
      return;
    }
    show("Produtos atualizados.", "success");
    await carregar();
  }

  const rows = useMemo<Row[]>(
    () => products.map((p) => ({ ...p, cost: prices.get(p.code) ?? null })),
    [products, prices],
  );
  const semCusto = useMemo(() => rows.filter((r) => r.cost == null).length, [rows]);

  const filtrados = useMemo(() => {
    const q = normalize(busca.trim());
    return rows.filter((r) => {
      if (filtro === "sem-custo" && r.cost != null) return false;
      return !q || normalize(`${r.description} ${r.code} ${r.category}`).includes(q);
    });
  }, [rows, filtro, busca]);

  function setFiltro(v: Filtro) {
    const next = new URLSearchParams(params);
    if (v === "sem-custo") next.set("filtro", "sem-custo");
    else next.delete("filtro");
    setParams(next, { replace: true });
  }

  const columns: DataTableColumn<Row>[] = [
    {
      key: "product",
      header: "Produto",
      sortable: true,
      sortValue: (r) => r.description || r.code,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold text-t0">{r.description || r.code}</p>
          <p className="truncate font-mono text-[11.5px] text-t2">{r.code}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoria",
      hideBelow: "md",
      sortable: true,
      sortValue: (r) => r.category || null,
      render: (r) => r.category || "—",
    },
    {
      key: "brand",
      header: "Marca",
      sortable: true,
      sortValue: (r) => r.brand,
      render: (r) => <Badge variant={r.brand === "WPINK" ? "info" : "neutral"}>{r.brand}</Badge>,
    },
    {
      key: "cost",
      header: "Custo",
      align: "right",
      sortable: true,
      sortValue: (r) => r.cost,
      render: (r) =>
        r.cost == null ? (
          <Badge variant="warning">Sem custo</Badge>
        ) : (
          <span className="font-extrabold tabular-nums text-t0">{brlCent(r.cost)}</span>
        ),
    },
  ];

  const empty =
    products.length === 0 ? (
      <EmptyState
        framed={false}
        icon="📦"
        title="Nenhum produto ainda"
        description="O cadastro vem do Millennium. Use Atualizar para buscar os produtos e as tabelas de custo."
      />
    ) : busca.trim() ? (
      <EmptyState
        framed={false}
        icon="🔍"
        title="Nenhum resultado"
        description="Tente outra busca."
        action={
          <Button variant="outline" size="sm" onClick={() => setBusca("")}>
            Limpar busca
          </Button>
        }
      />
    ) : (
      <EmptyState
        framed={false}
        icon="✅"
        title="Todos os produtos têm custo"
        description="Nenhum produto sem preço nesta tabela de custo."
      />
    );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        {refreshedAt && (
          <span className="mr-auto text-[12px] font-medium text-t2">{fmtRefreshed(refreshedAt)}</span>
        )}
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar…"
          className="h-[38px] w-[180px] rounded-[10px] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none placeholder:text-t2"
        />
        <Select value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)} className="!h-[38px] w-auto">
          <option value="todos">Todos ({rows.length})</option>
          <option value="sem-custo">Sem custo ({semCusto})</option>
        </Select>
        {tables.length > 0 && (
          <Select
            value={tableId == null ? "" : String(tableId)}
            onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : null)}
            title="Tabela de custo usada na coluna Custo"
            className="!h-[38px] w-auto"
          >
            {tables.map((t) => (
              <option key={t.id} value={String(t.id)}>
                Tabela {t.code} · {t.description}
              </option>
            ))}
          </Select>
        )}
        <Button
          variant="secondary"
          size="md"
          onClick={() => void atualizar()}
          disabled={syncing}
          title="Busca o cadastro de produtos e as tabelas de custo no Millennium"
        >
          {syncing ? "Atualizando…" : "Atualizar"}
        </Button>
      </div>

      {!loaded ? (
        <ProductsTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filtrados}
          rowKey={(r) => r.code}
          empty={empty}
          paginate="produtos"
          defaultSortKey="product"
          defaultSortDir="asc"
        />
      )}
    </div>
  );
}
