import { Avatar, Badge, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { departments, type DepartmentRecord } from "@/data/users";
import { Icon, icons } from "./Icons";

const columns: DataTableColumn<DepartmentRecord>[] = [
  {
    key: "department",
    header: "Department",
    render: (d) => (
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] text-[19px]" style={{ background: d.tintBg, color: d.tint }}>
          {d.emoji}
        </span>
        <div>
          <p className="text-[13.5px] font-bold text-t0">{d.name}</p>
          <p className="mt-0.5 text-[11.5px] text-t2">{d.teams} teams</p>
        </div>
      </div>
    ),
  },
  {
    key: "head",
    header: "Head",
    render: (d) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={d.head} size="sm" />
        <span className="text-[12.5px] font-semibold text-t0">{d.head}</span>
      </div>
    ),
    hideBelow: "sm",
  },
  {
    key: "members",
    header: "Members",
    align: "right",
    render: (d) => <span className="font-mono text-[13.5px] font-extrabold text-t0">{d.members}</span>,
    hideBelow: "md",
  },
  {
    key: "budget",
    header: "Budget",
    align: "right",
    render: (d) => <span className="font-mono text-[13px] font-bold text-ok">{d.budget}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (d) => <Badge status={d.status}>{d.status}</Badge>,
    hideBelow: "sm",
  },
];

export function Departments() {
  const totalEmployees = departments.reduce((sum, d) => sum + d.members, 0);

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle={`${departments.length} departments · ${totalEmployees} employees`}
        actions={<Button icon={<Icon d={icons.plus} size={14} />}>Add department</Button>}
      />
      <DataTable columns={columns} data={departments} rowKey={(d) => d.id} />
    </div>
  );
}
