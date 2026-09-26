import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ThSort, type SortDir } from "./ThSort";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Hide this column below the given breakpoint to keep mobile tables scannable. */
  hideBelow?: "sm" | "md" | "lg";
  align?: "left" | "right" | "center";
  width?: string;
  /** Clique no título ordena pela coluna. */
  sortable?: boolean;
  /** Valor usado na comparação; obrigatório quando `sortable`. */
  sortValue?: (row: T) => string | number | null | undefined;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  emptyMessage?: string;
  /** Substitui o `emptyMessage` (ex.: `EmptyState` com ação). */
  empty?: ReactNode;
  className?: string;
  /** Coluna inicial ativa (precisa ser `sortable`). */
  defaultSortKey?: string;
  defaultSortDir?: SortDir;
}

const hideBelowClasses: Record<NonNullable<DataTableColumn<unknown>["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

const alignClasses = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

function compareSortValues(a: string | number | null | undefined, b: string | number | null | undefined, dir: SortDir): number {
  const mul = dir === "asc" ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "string" || typeof b === "string") {
    return String(a).localeCompare(String(b), "pt-BR", { sensitivity: "base", numeric: true }) * mul;
  }
  return (a - b) * mul;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = "No records found.",
  empty,
  className,
  defaultSortKey,
  defaultSortDir = "desc",
}: DataTableProps<T>) {
  const sortableCols = columns.filter((c) => c.sortable && c.sortValue);
  const [sortKey, setSortKey] = useState<string | undefined>(() =>
    defaultSortKey && sortableCols.some((c) => c.key === defaultSortKey) ? defaultSortKey : undefined,
  );
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);

  // Se a coluna ativa sumiu (ex.: troca meta on/off), limpa o sort e volta à ordem original.
  const sortKeyAtivo = sortKey && sortableCols.some((c) => c.key === sortKey) ? sortKey : undefined;

  const sorted = useMemo(() => {
    if (!sortKeyAtivo) return data;
    const col = columns.find((c) => c.key === sortKeyAtivo);
    if (!col?.sortValue) return data;
    return [...data].sort((a, b) => compareSortValues(col.sortValue!(a), col.sortValue!(b), sortDir));
  }, [columns, data, sortKeyAtivo, sortDir]);

  function toggleSort(key: string) {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable || !col.sortValue) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // Texto → asc; número → desc (padrão do Desempenho por produto).
      const sample = data.length > 0 ? col.sortValue(data[0]) : null;
      setSortDir(typeof sample === "string" ? "asc" : "desc");
    }
  }

  if (data.length === 0) {
    if (empty) return <>{empty}</>;
    return <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-10 text-center text-sm text-t1">{emptyMessage}</div>;
  }

  return (
    <div className={cn("overflow-x-auto rounded-[var(--radius-vela-lg)] border border-line bg-bg-2", className)}>
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            {columns.map((col) =>
              col.sortable && col.sortValue ? (
                <ThSort
                  key={col.key}
                  label={col.header}
                  active={sortKeyAtivo === col.key}
                  dir={sortDir}
                  onClick={() => toggleSort(col.key)}
                  align={col.align ?? "left"}
                  className={cn(
                    "px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide",
                    col.hideBelow && hideBelowClasses[col.hideBelow],
                  )}
                />
              ) : (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    "px-4 py-3 text-[10.5px] font-bold uppercase tracking-wide text-t2",
                    alignClasses[col.align ?? "left"],
                    col.hideBelow && hideBelowClasses[col.hideBelow],
                  )}
                >
                  {col.header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn("border-b border-line last:border-b-0 transition-colors", onRowClick && "cursor-pointer hover:bg-bg-3")}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3.5 text-t0 align-middle", alignClasses[col.align ?? "left"], col.hideBelow && hideBelowClasses[col.hideBelow])}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
