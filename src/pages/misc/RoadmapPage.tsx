import { PageHeader, Badge } from "@/components/ui";
import type { StatusVariant } from "@/lib/status";

interface Item {
  title: string;
  category: string;
  categoryVariant: StatusVariant;
  votes: number;
}
interface Column {
  name: string;
  color: string;
  items: Item[];
}

const COLUMNS: Column[] = [
  {
    name: "Under consideration",
    color: "var(--t2)",
    items: [
      { title: "Native mobile apps for iOS & Android", category: "Platform", categoryVariant: "info", votes: 342 },
      { title: "Custom SQL query builder", category: "Analytics", categoryVariant: "neutral", votes: 218 },
      { title: "Slack & Teams alert integrations", category: "Integrations", categoryVariant: "success", votes: 176 },
    ],
  },
  {
    name: "In progress",
    color: "var(--acc)",
    items: [
      { title: "AI insight summaries on every widget", category: "AI", categoryVariant: "info", votes: 489 },
      { title: "Multi-workspace switching", category: "Platform", categoryVariant: "neutral", votes: 254 },
      { title: "Scheduled report exports", category: "Reports", categoryVariant: "warning", votes: 201 },
    ],
  },
  {
    name: "Shipped",
    color: "var(--ok)",
    items: [
      { title: "Dark & light theme system", category: "Design", categoryVariant: "success", votes: 612 },
      { title: "Real-time collaborative dashboards", category: "Platform", categoryVariant: "info", votes: 398 },
      { title: "12 new prebuilt dashboard modules", category: "Analytics", categoryVariant: "neutral", votes: 305 },
    ],
  },
];

/** Product roadmap kanban with vote counts. */
export function RoadmapPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "Roadmap" }]}
        title="Product Roadmap"
        subtitle="What we're building next — vote and follow along."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.name}
            className="rounded-2xl border border-line bg-bg-1 p-4"
            style={{ borderTop: `3px solid ${col.color}` }}
          >
            <div className="mb-3.5 flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-t0">{col.name}</span>
              <span
                className="rounded-lg bg-bg-2 px-2.5 py-0.5 text-[11px] font-bold"
                style={{ color: col.color }}
              >
                {col.items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {col.items.map((i) => (
                <div key={i.title} className="rounded-xl border border-line bg-bg-2 p-[13px]">
                  <p className="mb-2 text-[13px] font-bold leading-snug text-t0">{i.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={i.categoryVariant}>{i.category}</Badge>
                    <span className="flex items-center gap-1.5 text-[11.5px] text-t2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>
                      {i.votes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
