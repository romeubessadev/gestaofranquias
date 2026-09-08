import { Badge, Button, Card, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { attendanceKpis, attendanceRows, type AttendanceRow } from "@/data/hr";
import { Icon, ICONS } from "./icons";

const kpiIcons = [ICONS.userCheck, ICONS.userPlus, ICONS.clock, ICONS.calendarX];

const columns: DataTableColumn<AttendanceRow>[] = [
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
          <p className="truncate text-[11px] text-t2">{r.dept}</p>
        </div>
      </div>
    ),
  },
  {
    key: "in",
    header: "Clock in",
    align: "center",
    render: (r) => <span className={r.lateIn ? "font-semibold text-warn" : "font-semibold text-t1"}>{r.in}</span>,
  },
  { key: "out", header: "Clock out", align: "center", render: (r) => <span className="font-semibold text-t1">{r.out}</span>, hideBelow: "sm" },
  { key: "hours", header: "Hours", align: "center", render: (r) => <span className="font-mono font-bold text-t0">{r.hours}</span>, hideBelow: "md" },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge status={r.status}>{r.status}</Badge>,
  },
];

export function Attendance() {
  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Today · July 5, 2026 · 128 present"
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Icon path="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" size={14} />}>
              July 2026
            </Button>
            <Button variant="secondary" size="sm" icon={<Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={14} />}>
              Export
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {attendanceKpis.map((k, i) => (
          <Card key={k.label} className="flex items-center gap-3.5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
              style={{ background: k.tintBg, color: k.color }}
            >
              <Icon path={kpiIcons[i]} />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-t0" style={{ color: k.color }}>
                {k.value}
              </p>
              <p className="mt-0.5 text-[11.5px] text-t2">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <DataTable columns={columns} data={attendanceRows} rowKey={(r) => r.name} />
    </div>
  );
}
