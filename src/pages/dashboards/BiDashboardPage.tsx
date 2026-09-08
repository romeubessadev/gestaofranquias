import { Badge, Button, Card, CardHeader, CardTitle, DataTable, PageHeader } from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { biInsights, biKpis, biMetrics, biRegions, biReports, biSources, type BiMetricRow, type BiReportRow } from "@/data/dashboards";
import { DownloadIcon, ICONS, PlusIcon, TINT } from "./icons";
import { KpiTile } from "./KpiTile";

const metricColumns: DataTableColumn<BiMetricRow>[] = [
  { key: "metric", header: "Metric", render: (m) => <span className="text-[13px] font-bold text-t0">{m.metric}</span> },
  { key: "current", header: "Current", render: (m) => <span className="font-mono font-bold">{m.current}</span>, align: "right" },
  { key: "target", header: "Target", render: (m) => <span className="font-mono text-t1">{m.target}</span>, align: "right", hideBelow: "sm" },
  {
    key: "attainment",
    header: "Attainment",
    width: "30%",
    render: (m) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 min-w-16 flex-1 overflow-hidden rounded-full bg-bg-inset">
          <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.barColor }} />
        </div>
        <span className="w-9 text-right font-mono text-[11.5px] font-bold" style={{ color: m.barColor }}>
          {m.pct}%
        </span>
      </div>
    ),
  },
  {
    key: "trend",
    header: "Trend",
    align: "right",
    hideBelow: "md",
    render: (m) => (
      <span className={`font-mono text-xs font-bold ${m.trendPositive ? "text-ok" : "text-bad"}`}>
        {m.trendPositive ? "↗" : "↘"} {m.trend}
      </span>
    ),
  },
];

const reportColumns: DataTableColumn<BiReportRow>[] = [
  {
    key: "name",
    header: "Report",
    render: (r) => {
      const Icon = ICONS[r.icon];
      return (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: TINT[r.tint].bg, color: TINT[r.tint].fg }}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-t0">{r.name}</p>
            <p className="text-[11px] text-t2">{r.type}</p>
          </div>
        </div>
      );
    },
  },
  { key: "owner", header: "Owner", render: (r) => <span className="font-semibold text-t1">{r.owner}</span>, hideBelow: "sm" },
  { key: "updated", header: "Updated", render: (r) => <span className="text-t2">{r.updated}</span>, align: "center", hideBelow: "md" },
  { key: "views", header: "Views", render: (r) => <span className="font-mono font-bold">{r.views}</span>, align: "center" },
];

export function BiDashboardPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.bi }, { label: "Business Intelligence" }]}
        title="Business intelligence"
        subtitle="KPIs vs targets, data sources, report library and AI insights."
        actions={
          <>
            <Button variant="secondary" icon={<PlusIcon size={15} />}>
              New report
            </Button>
            <Button variant="primary" icon={<DownloadIcon size={15} />}>
              Export PDF
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {biKpis.map((k) => (
          <KpiTile key={k.id} label={k.label} value={k.value} icon={k.icon} tint={k.tint} delta={k.delta} sub={k.sub} />
        ))}
      </div>

      {/* AI insight cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {biInsights.map((i) => {
          const Icon = ICONS[i.icon];
          return (
            <Card key={i.id} padding="sm" className="relative overflow-hidden bg-gradient-to-br from-bg-3 to-bg-2">
              <div
                className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full"
                style={{ background: `radial-gradient(circle, ${TINT[i.tint].bg}, transparent 70%)` }}
              />
              <div className="mb-2.5 flex items-center gap-2.5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
                  style={{ background: TINT[i.tint].bg, color: TINT[i.tint].fg }}
                >
                  <Icon size={15} />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: TINT[i.tint].fg }}>
                  AI insight
                </span>
              </div>
              <p className="text-[13.5px] font-semibold leading-relaxed text-t0">{i.text}</p>
              <p className="mt-2 text-[11.5px] text-t2">{i.time}</p>
            </Card>
          );
        })}
      </div>

      {/* KPIs vs targets + Data sources */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>KPIs vs targets</CardTitle>
            <span className="text-[11.5px] font-semibold text-t2">Q2 2026</span>
          </CardHeader>
          <DataTable columns={metricColumns} data={biMetrics} rowKey={(m) => m.id} />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Data sources</CardTitle>
            <Badge variant="success">4 active</Badge>
          </div>
          <div className="flex flex-col gap-3.5">
            {biSources.map((s) => {
              const Icon = ICONS[s.icon];
              return (
                <div key={s.name} className="flex items-center gap-3 rounded-xl bg-bg-inset p-2.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]"
                    style={{ background: TINT[s.tint].bg, color: TINT[s.tint].fg }}
                  >
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-t0">{s.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">
                      {s.records} · synced {s.time}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1.5 text-[11.5px] font-semibold text-t1">
                    <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                    {s.status}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Report library + Regional reach */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Report library</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <DataTable columns={reportColumns} data={biReports} rowKey={(r) => r.id} />
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Regional reach</CardTitle>
            <span className="text-[11.5px] font-semibold text-t2">6 regions</span>
          </div>
          <div className="flex flex-col gap-4">
            {biRegions.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-t1">{r.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-t0">{r.value}</span>
                    <span className="text-[11.5px] text-t2">{r.pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
