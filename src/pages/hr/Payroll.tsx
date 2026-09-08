import { Badge, Button, Card, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { payrollKpis, payrollRows, type PayrollRow } from "@/data/hr";
import { Icon } from "./icons";

const columns: DataTableColumn<PayrollRow>[] = [
  {
    key: "name",
    header: "Employee",
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: r.avatarBg }}
        >
          {r.avatar}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{r.name}</p>
          <p className="truncate text-[11px] text-t2">{r.role}</p>
        </div>
      </div>
    ),
  },
  { key: "base", header: "Base", align: "right", render: (r) => <span className="font-mono font-semibold text-t0">{r.base}</span> },
  { key: "bonus", header: "Bonus", align: "right", render: (r) => <span className="font-mono font-semibold text-ok">{r.bonus}</span>, hideBelow: "sm" },
  { key: "deductions", header: "Deductions", align: "right", render: (r) => <span className="font-mono font-semibold text-bad">{r.deductions}</span>, hideBelow: "md" },
  { key: "net", header: "Net pay", align: "right", render: (r) => <span className="font-mono text-[13.5px] font-extrabold text-t0">{r.net}</span> },
  { key: "status", header: "Status", align: "center", render: (r) => <Badge status={r.status}>{r.status}</Badge> },
];

export function Payroll() {
  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle="June 2026 run · $1.42M total"
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={14} />}>
              Download slips
            </Button>
            <Button size="sm">Run payroll</Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {payrollKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-2xl font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <DataTable columns={columns} data={payrollRows} rowKey={(r) => r.name} />
    </div>
  );
}
