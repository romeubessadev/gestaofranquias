import { Badge, Card, Input, PageHeader, Select, Timeline, type TimelineEvent } from "@/components/ui";
import { activityLogs } from "@/data/users";

const events: TimelineEvent[] = activityLogs.map((l) => ({
  id: l.id,
  title: (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span>
        <strong className="font-bold">{l.user}</strong> <span className="font-normal text-t1">{l.action}</span>
      </span>
      <Badge variant={l.type === "Login" ? "success" : l.type === "Deletions" ? "danger" : "info"}>{l.type}</Badge>
    </span>
  ),
  time: `${l.time} · IP ${l.ip}`,
  color: l.tint,
  icon: <span className="text-[13px]">{l.icon}</span>,
}));

export function ActivityLogs() {
  return (
    <div>
      <PageHeader
        title="Activity Logs"
        subtitle="Audit trail across your workspace"
        actions={
          <>
            <Input placeholder="Search logs…" className="h-[38px] w-[160px]" />
            <Select className="h-[38px] w-auto">
              <option>All events</option>
              <option>Logins</option>
              <option>Changes</option>
              <option>Deletions</option>
            </Select>
          </>
        }
      />
      <Card padding="lg">
        <Timeline events={events} />
      </Card>
    </div>
  );
}
