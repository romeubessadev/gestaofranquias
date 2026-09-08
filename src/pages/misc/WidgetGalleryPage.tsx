import { Card, PageHeader } from "@/components/ui";
import { BarChartIcon, DollarIcon, UsersIcon, LayoutIcon, ClockIcon } from "@/pages/utility/icons";

type Widget =
  | { kind: "kpi"; category: string; icon: typeof DollarIcon; tint: string; tintBg: string; label: string; value: string; delta: string }
  | { kind: "progress"; category: string; icon: typeof BarChartIcon; tint: string; tintBg: string; label: string; pct: number }
  | { kind: "list"; category: string; icon: typeof UsersIcon; tint: string; tintBg: string; label: string; items: Array<{ n: string; v: string }> }
  | { kind: "donut"; category: string; icon: typeof LayoutIcon; tint: string; tintBg: string; label: string; pct: number; desc: string };

const WIDGETS: Widget[] = [
  { kind: "kpi", category: "Metric", icon: DollarIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", label: "Total Revenue", value: "$284K", delta: "+18.4%" },
  { kind: "kpi", category: "Metric", icon: UsersIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", label: "Active Users", value: "38,620", delta: "+11.8%" },
  { kind: "progress", category: "Progress", icon: BarChartIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", label: "Quarterly goal", pct: 74 },
  { kind: "progress", category: "Progress", icon: BarChartIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", label: "Storage used", pct: 42 },
  { kind: "list", category: "List", icon: UsersIcon, tint: "var(--info)", tintBg: "var(--info-soft)", label: "Top products", items: [{ n: "Analytics Suite", v: "$1.1M" }, { n: "API Platform", v: "$684K" }, { n: "Integrations", v: "$512K" }] },
  { kind: "list", category: "List", icon: ClockIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", label: "Recent activity", items: [{ n: "New signup", v: "2m" }, { n: "Deal closed", v: "14m" }, { n: "Ticket resolved", v: "1h" }] },
  { kind: "donut", category: "Chart", icon: LayoutIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", label: "Conversion rate", pct: 68, desc: "Visitors who completed checkout this month." },
  { kind: "donut", category: "Chart", icon: LayoutIcon, tint: "#9d86ff", tintBg: "#9d86ff22", label: "Task completion", pct: 84, desc: "Sprint tasks completed vs planned." },
  { kind: "kpi", category: "Metric", icon: BarChartIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", label: "Avg. ROAS", value: "4.6x", delta: "+0.4x" },
];

const DONUT_CIRC = 163;

export function WidgetGalleryPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "Widget Gallery" }]}
        title="Widget Gallery"
        subtitle="15+ reusable dashboard widgets ready to drag into any layout."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WIDGETS.map((w, i) => (
          <Card key={i}>
            <div className="mb-3.5 flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-[12.5px] font-bold text-t2">
                <span className="flex h-6.5 w-6.5 items-center justify-center rounded-lg" style={{ background: w.tintBg, color: w.tint }}>
                  <w.icon size={13} />
                </span>
                {w.category}
              </span>
            </div>
            {w.kind === "kpi" && (
              <>
                <p className="text-xs font-semibold text-t2">{w.label}</p>
                <p className="my-1 text-2xl font-extrabold text-t0">{w.value}</p>
                <Badge>{w.delta}</Badge>
              </>
            )}
            {w.kind === "progress" && (
              <>
                <p className="mb-2.5 text-xs font-semibold text-t2">{w.label}</p>
                <div className="mb-2 h-2 overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full" style={{ width: `${w.pct}%`, background: w.tint }} />
                </div>
                <span className="text-[12.5px] font-bold text-t0">{w.pct}% complete</span>
              </>
            )}
            {w.kind === "list" && (
              <>
                <p className="mb-2.5 text-xs font-semibold text-t2">{w.label}</p>
                <div className="flex flex-col gap-2">
                  {w.items.map((it) => (
                    <div key={it.n} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: w.tint }} />
                      <span className="flex-1 text-xs text-t1">{it.n}</span>
                      <span className="text-[11.5px] font-bold text-t2">{it.v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {w.kind === "donut" && (
              <>
                <p className="mb-2.5 text-xs font-semibold text-t2">{w.label}</p>
                <div className="flex items-center gap-3.5">
                  <div className="relative h-16 w-16 shrink-0">
                    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--bg-inset)" strokeWidth="8" />
                      <circle
                        cx="32"
                        cy="32"
                        r="26"
                        fill="none"
                        stroke={w.tint}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={DONUT_CIRC}
                        strokeDashoffset={DONUT_CIRC * (1 - w.pct / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] font-extrabold text-t0">{w.pct}%</div>
                  </div>
                  <p className="text-xs leading-normal text-t1">{w.desc}</p>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-bold text-ok">{children}</span>;
}
