import { Badge, Card, CardHeader, CardTitle, CardSubtitle, DataTable, PageHeader, Select, type DataTableColumn } from "@/components/ui";
import { DonutChart, StackedBarChart } from "@/components/charts";
import { pmAnalyticsKpis, pmHealth, pmTaskDist, projVelocity } from "@/data/projects";

type HealthRow = (typeof pmHealth)[number];

const budgetColor = { ok: "text-ok", warn: "text-warn", bad: "text-bad" } as const;

const healthColumns: DataTableColumn<HealthRow>[] = [
  {
    key: "name",
    header: "Project",
    render: (h) => (
      <div className="flex items-center gap-3">
        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-bg-3 text-base">{h.emoji}</span>
        <span className="text-[13px] font-bold text-t0">{h.name}</span>
      </div>
    ),
  },
  { key: "pct", header: "Progress", align: "right", render: (h) => <span className="font-mono font-bold text-t0">{h.pct}%</span> },
  {
    key: "budget",
    header: "Budget used",
    align: "right",
    render: (h) => <span className={`font-mono font-bold ${budgetColor[h.budgetTone as keyof typeof budgetColor]}`}>{h.budget}</span>,
    hideBelow: "sm",
  },
  {
    key: "overdue",
    header: "Overdue",
    align: "right",
    render: (h) => <span className={`font-bold ${h.overdue === 0 ? "text-ok" : "text-bad"}`}>{h.overdue}</span>,
    hideBelow: "md",
  },
  { key: "velocity", header: "Velocity", align: "right", render: (h) => <span className="font-semibold text-t1">{h.velocity}</span>, hideBelow: "md" },
  {
    key: "health",
    header: "Health",
    align: "center",
    render: (h) => <Badge variant={h.healthTone as "success" | "danger" | "info"}>{h.health}</Badge>,
  },
];

const velocityData = projVelocity.map((v) => ({ label: v.sprint, done: v.done, remaining: Math.max(0, v.planned - v.done) }));

const donutSegments = pmTaskDist.map((d) => ({ label: d.name, value: d.count, color: d.color }));
const totalTasks = pmTaskDist.reduce((s, d) => s + d.count, 0);

export function ProjectAnalytics() {
  return (
    <div>
      <PageHeader
        title="Project Analytics"
        subtitle="Delivery health across all active projects"
        actions={
          <Select className="h-[38px] w-auto">
            <option>Last 8 sprints</option>
            <option>This quarter</option>
            <option>This year</option>
          </Select>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pmAnalyticsKpis.map((k) => (
          <Card key={k.label} padding="sm">
            <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="font-mono text-2xl font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-1 text-[11.5px] text-t1">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sprint velocity</CardTitle>
              <CardSubtitle>Story points per sprint</CardSubtitle>
            </div>
          </CardHeader>
          <StackedBarChart data={velocityData} keys={["done", "remaining"]} colors={["var(--acc)", "var(--bg-3)"]} height={180} />
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Task distribution</CardTitle>
              <CardSubtitle>All active projects</CardSubtitle>
            </div>
          </CardHeader>
          <DonutChart segments={donutSegments} centerValue={String(totalTasks)} centerLabel="tasks" />
        </Card>
      </div>

      <div>
        <h3 className="mb-4 text-[15px] font-bold text-t0">Project health</h3>
        <DataTable columns={healthColumns} data={pmHealth} rowKey={(h) => h.name} />
      </div>
    </div>
  );
}
