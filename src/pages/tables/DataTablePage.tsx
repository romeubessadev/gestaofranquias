import { useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  DataTable,
  PageHeader,
  Pagination,
  Rating,
  Select,
  type DataTableColumn,
} from "@/components/ui";
import { employees, type EmployeeRow } from "./data";

type SortKey = "name" | "dept";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 6;

export function DataTablePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const statuses = ["All status", ...Array.from(new Set(employees.map((e) => e.status)))];

  const filtered = useMemo(() => {
    let rows = employees.filter((e) => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "All status" && e.status !== statusFilter) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const cmp = a[sortKey].localeCompare(b[sortKey]);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  const columns: DataTableColumn<EmployeeRow>[] = [
    {
      key: "select",
      header: "",
      width: "36px",
      render: (r) => <Checkbox checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} />,
    },
    {
      key: "name",
      header: "Employee",
      render: (r) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={r.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold text-t0">{r.name}</p>
            <p className="truncate text-[11.5px] text-t2">{r.email}</p>
          </div>
        </div>
      ),
    },
    { key: "dept", header: "Department", render: (r) => r.dept, hideBelow: "md" },
    { key: "status", header: "Status", render: (r) => <Badge status={r.status}>{r.status}</Badge> },
    { key: "salary", header: "Salary", align: "right", render: (r) => <span className="font-extrabold text-ok">{r.salary}</span> },
    { key: "rating", header: "Rating", align: "center", render: (r) => <Rating value={r.rating} size={12} />, hideBelow: "lg" },
  ];

  return (
    <div>
      <PageHeader
        title="Data Tables"
        subtitle="Search, sort, filter and paginate"
        actions={
          <>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="h-[38px] w-[150px] rounded-[10px] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none placeholder:text-t2"
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="!h-[38px] w-auto"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Button variant="secondary" size="md">Export CSV</Button>
          </>
        }
      />

      <div className="mb-3 flex items-center gap-4 text-[12px] font-semibold text-t1">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={allOnPageSelected} onChange={toggleAllOnPage} />
          Select all on page
        </label>
        <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-t0">
          Sort by name {sortKey === "name" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        <button onClick={() => toggleSort("dept")} className="flex items-center gap-1 hover:text-t0">
          Sort by department {sortKey === "dept" && (sortDir === "asc" ? "↑" : "↓")}
        </button>
        {selected.size > 0 && <span className="ml-auto text-acc">{selected.size} selected</span>}
      </div>

      <DataTable columns={columns} data={pageRows} rowKey={(r) => r.id} emptyMessage="No employees match this search." />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-[12.5px] text-t2">
          Showing {pageRows.length} of {filtered.length} employees
        </span>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}
