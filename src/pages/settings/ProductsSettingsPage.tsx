import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardSubtitle,
  CardTitle,
  DataTable,
  type DataTableColumn,
  EmptyState,
  Input,
  Segmented,
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

type Tab = "todos" | "sem-custo";
type Row = CatalogProductRow & { cost: number | null };

function fmtRefreshed(iso: string): string {
  const d = new Date(iso);
  const dia = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `atualizado em ${dia} às ${hora}`;
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/**
 * Configurações > Produtos (só Gestor) — cadastro de produtos do Millennium com o custo da tabela de custo.
 * Atualizar busca catálogo + tabelas + preços agora (fora da fila do worker).
 */
export function ProductsSettingsPage() {
  const session = useActiveSession();
  const { show } = useToast();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("filtro") === "sem-custo" ? "sem-custo" : "todos";

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
  const semCusto = useMemo(() => rows.filter((r) => r.cost == null), [rows]);
  const filtrados = useMemo(() => {
    const base = tab === "sem-custo" ? semCusto : rows;
    const q = normalize(busca.trim());
    if (!q) return base;
    return base.filter((r) => normalize(`${r.description} ${r.code} ${r.category}`).includes(q));
  }, [rows, semCusto, tab, busca]);

  const setTab = (v: Tab) => {
    const next = new URLSearchParams(params);
    if (v === "sem-custo") next.set("filtro", "sem-custo");
    else next.delete("filtro");
    setParams(next, { replace: true });
  };

  const columns = useMemo<DataTableColumn<Row>[]>(
    () => [
      {
        key: "product",
        header: "Produto",
        sortable: true,
        sortValue: (r) => r.description,
        render: (r) => (
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-t0">{r.description || r.code}</div>
            <div className="font-mono text-[11.5px] text-t2">{r.code}</div>
          </div>
        ),
      },
      {
        key: "category",
        header: "Categoria",
        hideBelow: "md",
        sortable: true,
        sortValue: (r) => r.category,
        render: (r) => <span className="text-t1">{r.category || "—"}</span>,
      },
      {
        key: "brand",
        header: "Marca",
        hideBelow: "sm",
        render: (r) => <Badge variant={r.brand === "WPINK" ? "info" : "neutral"}>{r.brand}</Badge>,
      },
      {
        key: "cost",
        header: "Custo",
        align: "right",
        sortable: true,
        sortValue: (r) => r.cost ?? -1,
        render: (r) =>
          r.cost == null ? (
            <Badge variant="warning">Sem custo</Badge>
          ) : (
            <span className="tabular-nums text-t0">{brlCent(r.cost)}</span>
          ),
      },
    ],
    [],
  );

  const subtitulo = refreshedAt ? `Cadastro do Millennium · ${fmtRefreshed(refreshedAt)}` : "Cadastro do Millennium";

  return (
    <Card padding="none">
      <CardHeader className="mb-0 px-5 pt-5 pb-4">
        <div>
          <CardTitle>Produtos</CardTitle>
          <CardSubtitle>{subtitulo}</CardSubtitle>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void atualizar()}
          disabled={syncing}
          title="Busca o cadastro de produtos e as tabelas de custo no Millennium"
          icon={syncing ? undefined : <RefreshIcon />}
        >
          {syncing ? "Atualizando…" : "Atualizar"}
        </Button>
      </CardHeader>
      <div className="flex flex-col gap-2.5 px-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: "todos", label: `Todos (${rows.length})` },
            { value: "sem-custo", label: `Sem custo (${semCusto.length})` },
          ]}
          value={tab}
          onChange={(v) => v && setTab(v as Tab)}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {tables.length > 0 && (
            <Select
              value={tableId == null ? "" : String(tableId)}
              onChange={(e) => setTableId(e.target.value ? Number(e.target.value) : null)}
              title="Tabela de custo usada na coluna Custo"
              className="sm:h-[38px]! sm:w-56"
            >
              {tables.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  Tabela {t.code} · {t.description}
                </option>
              ))}
            </Select>
          )}
          <Input
            placeholder="Buscar produto ou código…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="sm:h-[38px]! sm:w-60"
          />
        </div>
      </div>
      {!loaded ? (
        <ProductsTableSkeleton />
      ) : products.length === 0 ? (
        <EmptyState
          framed={false}
          className="pt-4!"
          icon="📦"
          title="Nenhum produto ainda"
          description="O cadastro vem do Millennium. Use Atualizar para buscar os produtos e as tabelas de custo."
        />
      ) : filtrados.length === 0 ? (
        busca.trim() ? (
          <EmptyState
            framed={false}
            className="pt-4!"
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
            className="pt-4!"
            icon="✅"
            title="Todos os produtos têm custo"
            description="Nenhum produto sem preço nesta tabela de custo."
          />
        )
      ) : (
        <DataTable
          className="rounded-none! border-x-0! border-b-0! bg-transparent!"
          columns={columns}
          data={filtrados}
          rowKey={(r) => r.code}
        />
      )}
    </Card>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}
