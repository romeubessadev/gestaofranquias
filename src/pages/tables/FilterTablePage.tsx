import { useMemo, useState } from "react";
import { Avatar, Badge, Card, DataTable, PageHeader, Select, type DataTableColumn } from "@/components/ui";
import { employees, type EmployeeRow } from "./data";

const departments = ["All departments", ...Array.from(new Set(employees.map((e) => e.dept)))];
const statuses = ["All status", ...Array.from(new Set(employees.map((e) => e.status)))];

const columns: DataTableColumn<EmployeeRow>[] = [
  {
    key: "name",
    header: "Name",
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} size="sm" />
        <span className="font-bold text-t0">{r.name}</span>
      </div>
    ),
  },
  { key: "dept", header: "Department", render: (r) => <span className="text-t1">{r.dept}</span> },
  { key: "role", header: "Role", render: (r) => <span className="text-t2">{r.role}</span>, hideBelow: "sm" },
  { key: "status", header: "Status", align: "center", render: (r) => <Badge status={r.status}>{r.status}</Badge> },
  { key: "joined", header: "Joined", align: "right", render: (r) => <span className="text-t2">{r.joined}</span>, hideBelow: "md" },
];

export function FilterTablePage() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState(departments[0]);
  const [status, setStatus] = useState(statuses[0]);

  const filtered = useMemo(
    () =>
      employees.filter((e) => {
        if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (dept !== departments[0] && e.dept !== dept) return false;
        if (status !== statuses[0] && e.status !== status) return false;
        return true;
      }),
    [search, dept, status],
  );

  const activeChips: { label: string; onClear: () => void }[] = [
    ...(dept !== departments[0] ? [{ label: dept, onClear: () => setDept(departments[0]) }] : []),
    ...(status !== statuses[0] ? [{ label: status, onClear: () => setStatus(statuses[0]) }] : []),
  ];

  return (
    <div>
      <PageHeader title="Filter Tables" subtitle="Multi-facet filtering with active filter chips" />
      <Card padding="none">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-4">
          <div className="flex h-9 items-center gap-2 rounded-[10px] border border-line bg-bg-inset px-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-[110px] bg-transparent text-[12.5px] text-t0 outline-none placeholder:text-t2"
            />
          </div>
          <Select value={dept} onChange={(e) => setDept(e.target.value)} className="!h-9 w-auto">
            {departments.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!h-9 w-auto">
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
          <div className="flex-1" />
          <div className="flex flex-wrap gap-1.5">
            {activeChips.map((c) => (
              <button
                key={c.label}
                onClick={c.onClear}
                className="flex items-center gap-1.5 rounded-full bg-acc-soft px-2.5 py-1 text-[11.5px] font-bold text-acc"
              >
                {c.label}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} emptyMessage="No employees match these filters." />
        </div>
      </Card>
    </div>
  );
}
