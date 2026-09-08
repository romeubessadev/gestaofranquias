import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { leaveKpis, leaveRequests, leaveTypeColors } from "@/data/hr";
import { Icon } from "./icons";

export function LeaveRequests() {
  return (
    <div>
      <PageHeader
        title="Leave Requests"
        subtitle="8 pending approval · 24 this month"
        actions={
          <Button icon={<Icon path="M12 5v14M5 12h14" size={14} />}>Request leave</Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {leaveKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-2xl font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {leaveRequests.map((l) => (
          <Card key={l.name + l.dates} className="flex flex-wrap items-center gap-4">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
              style={{ background: l.avatarBg }}
            >
              {l.avatar}
            </span>
            <div className="min-w-[150px] flex-[2]">
              <p className="text-sm font-bold text-t0">{l.name}</p>
              <p className="mt-0.5 text-xs text-t2">{l.dept}</p>
            </div>
            <div className="min-w-[110px] flex-1">
              <p className="text-[11px] font-semibold text-t2">Type</p>
              <div className="mt-1">
                <Badge variant={leaveTypeColors[l.type] ?? "neutral"}>{l.type}</Badge>
              </div>
            </div>
            <div className="min-w-[150px] flex-[1.4]">
              <p className="text-[11px] font-semibold text-t2">Duration</p>
              <p className="mt-1 text-[13px] font-bold text-t0">
                {l.dates} · {l.days}
              </p>
            </div>
            {l.pending ? (
              <div className="flex shrink-0 gap-2">
                <button className="h-[34px] cursor-pointer rounded-[9px] border-0 bg-ok px-3.5 text-[12.5px] font-bold text-white hover:opacity-90">
                  Approve
                </button>
                <button className="h-[34px] cursor-pointer rounded-[9px] border border-bad-soft bg-transparent px-3.5 text-[12.5px] font-semibold text-bad hover:bg-bad-soft">
                  Reject
                </button>
              </div>
            ) : (
              <span className="shrink-0">
                <Badge status={l.status}>{l.status}</Badge>
              </span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
