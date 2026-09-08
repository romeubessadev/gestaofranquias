import { Card, PageHeader } from "@/components/ui";
import { GanttChart, type GanttRow } from "@/components/charts";
import { ganttRows } from "@/data/projects";

const rows: GanttRow[] = ganttRows.map((r) => ({
  label: r.label,
  start: r.start,
  duration: r.duration,
  color: r.color,
}));

const legend = [
  { label: "In progress", color: "var(--acc)" },
  { label: "Done", color: "var(--ok)" },
  { label: "Planned", color: "var(--bg-3)" },
];

export function GanttView() {
  return (
    <div>
      <PageHeader
        title="Gantt View"
        subtitle="Billing Platform v2 · 8-week plan"
        actions={
          <div className="flex flex-wrap gap-3.5">
            {legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5 text-xs font-semibold text-t1">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        }
      />
      <Card padding="lg">
        <GanttChart rows={rows} columns={8} />
      </Card>
    </div>
  );
}
