import { AvatarGroup, Badge, Card, PageHeader, Select, Timeline, type TimelineEvent } from "@/components/ui";
import { pmTimeline } from "@/data/projects";

const statusToVariant = (status: string): "success" | "accent" | "danger" | "neutral" => {
  if (status === "Completed") return "success";
  if (status === "In progress") return "accent";
  if (status === "At risk") return "danger";
  return "neutral";
};

const events: TimelineEvent[] = pmTimeline.map((t, i) => ({
  id: i,
  color: t.tint,
  icon: <span className="text-sm">{t.icon}</span>,
  time: t.date,
  title: (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[14.5px] font-bold text-t0">{t.title}</span>
        <Badge variant={statusToVariant(t.status)}>{t.status}</Badge>
      </div>
      <p className="text-[12.5px] font-normal leading-relaxed text-t1">{t.desc}</p>
      <AvatarGroup names={t.team} max={3} />
    </div>
  ),
}));

export function ProjectTimeline() {
  return (
    <div>
      <PageHeader
        title="Timeline"
        subtitle="Billing Platform v2 · Apr → Sep 2026"
        actions={
          <Select className="h-[38px] w-auto">
            <option>All projects</option>
            <option>Billing Platform v2</option>
            <option>Mobile App Redesign</option>
          </Select>
        }
      />
      <Card padding="lg">
        <Timeline events={events} />
      </Card>
    </div>
  );
}
