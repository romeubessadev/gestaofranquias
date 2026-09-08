import { Avatar, Badge, Card, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { employees, type EmployeeRow } from "./data";

const columns: DataTableColumn<EmployeeRow>[] = [
  {
    key: "name",
    header: "Employee",
    render: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} size="sm" />
        <span className="font-bold text-t0">{r.name}</span>
      </div>
    ),
  },
  { key: "email", header: "Email", render: (r) => <span className="text-t2">{r.email}</span> },
  { key: "dept", header: "Department", render: (r) => r.dept, hideBelow: "md" },
  { key: "status", header: "Status", align: "center", render: (r) => <Badge status={r.status}>{r.status}</Badge> },
  { key: "salary", header: "Salary", align: "right", render: (r) => <span className="font-extrabold">{r.salary}</span> },
];

export function ResponsiveTablePage() {
  return (
    <div>
      <PageHeader title="Responsive Tables" subtitle="Card-collapse on mobile · horizontal scroll on tablet" />
      <div className="flex flex-col gap-4">
        <Card padding="none">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <h3 className="text-[15px] font-bold text-t0">Desktop / tablet view — scrolls horizontally</h3>
          </div>
          <div className="p-4">
            <DataTable columns={columns} data={employees} rowKey={(r) => r.id} />
          </div>
        </Card>

        <Card padding="none" className="max-w-md">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
            <h3 className="text-[15px] font-bold text-t0">Mobile view — stacks into cards</h3>
          </div>
          <div className="flex flex-col gap-2.5 p-3.5">
            {employees.slice(0, 4).map((r) => (
              <div key={r.id} className="rounded-xl border border-line bg-bg-inset p-3.5">
                <div className="mb-3 flex items-center gap-2.5">
                  <Avatar name={r.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-t0">{r.name}</p>
                    <p className="truncate text-[11.5px] text-t2">{r.email}</p>
                  </div>
                  <Badge status={r.status}>{r.status}</Badge>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-xs text-t2">{r.dept}</span>
                  <span className="text-[13px] font-extrabold text-t0">{r.salary}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
