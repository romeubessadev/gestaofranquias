import { useState } from "react";
import { Badge, Button, Card, CardHeader, CardTitle, DataTable, PageHeader, StatCard, Timeline } from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import { AreaLineChart, DonutChart, FunnelChart, Sparkline } from "@/components/charts";
import { paths } from "@/router/paths";
import {
  analyticsActivity,
  analyticsChartMonths,
  analyticsChartTabs,
  analyticsDevices,
  analyticsFunnel,
  analyticsGoal,
  analyticsKpis,
  analyticsProducts,
  analyticsTraffic,
  type ProductRow,
} from "@/data/dashboards";
import { CalendarIcon, DownloadIcon, ICONS, PlusIcon, TINT } from "./icons";

const productColumns: DataTableColumn<ProductRow>[] = [
  {
    key: "name",
    header: "Product",
    render: (p) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-extrabold"
          style={{ background: TINT[p.tint].bg, color: TINT[p.tint].fg }}
        >
          {p.mono}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold text-t0">{p.name}</p>
          <p className="text-[11.5px] text-t2">{p.sku}</p>
        </div>
      </div>
    ),
  },
  { key: "channel", header: "Channel", render: (p) => <span className="text-t1">{p.channel}</span>, hideBelow: "md" },
  { key: "sales", header: "Sales", render: (p) => <span className="font-mono font-semibold">{p.sales}</span>, align: "right" },
  { key: "revenue", header: "Revenue", render: (p) => <span className="font-mono font-semibold">{p.revenue}</span>, align: "right", hideBelow: "sm" },
  { key: "status", header: "Status", render: (p) => <Badge status={p.status}>{p.status}</Badge>, align: "right" },
];

export function AnalyticsDashboardPage() {
  const [activeTab, setActiveTab] = useState(analyticsChartTabs[0].key);
  const series = analyticsChartTabs.find((t) => t.key === activeTab) ?? analyticsChartTabs[0];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.analytics }, { label: "Analytics" }]}
        title="Welcome back, Dana 👋"
        subtitle="Here's what's happening across your workspace today."
        actions={
          <>
            <Button variant="secondary" icon={<CalendarIcon size={16} />}>
              Last 30 days
            </Button>
            <Button variant="secondary" icon={<DownloadIcon size={16} />}>
              Export
            </Button>
            <Button variant="primary" icon={<PlusIcon size={16} />}>
              Add widget
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsKpis.map((k) => {
          const Icon = ICONS[k.icon];
          return (
            <StatCard
              key={k.id}
              label={k.label}
              value={k.value}
              icon={<Icon size={20} />}
              iconColor={TINT[k.tint].fg}
              iconBg={TINT[k.tint].bg}
              delta={k.delta}
              sparkline={k.sparkline && <Sparkline data={k.sparkline} color={TINT[k.tint].fg} />}
            />
          );
        })}
      </div>

      {/* Revenue chart + Traffic donut */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Revenue overview</CardTitle>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold tracking-tight text-t0">{series.total}</span>
                <span className="flex items-center gap-1 text-[12.5px] font-bold text-ok">↗ {series.delta} vs last year</span>
              </div>
            </div>
            <div className="flex gap-1 rounded-xl border border-line bg-bg-inset p-1">
              {analyticsChartTabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={
                    t.key === activeTab
                      ? "rounded-[10px] bg-bg-1 px-3.5 py-1.5 text-[12.5px] font-bold text-t0 shadow-[var(--shadow-vela)]"
                      : "rounded-[10px] px-3.5 py-1.5 text-[12.5px] font-semibold text-t1 hover:text-t0"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <AreaLineChart data={series.data} labels={analyticsChartMonths} height={240} formatValue={(v) => v.toLocaleString()} />
          <div className="mt-2 flex justify-between px-1">
            {analyticsChartMonths.map((m) => (
              <span key={m} className="text-[11px] font-semibold text-t2">
                {m}
              </span>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
          </CardHeader>
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <DonutChart segments={analyticsTraffic} size={168} thickness={20} centerLabel="Total visits" centerValue="84.2k" />
          </div>
        </Card>
      </div>

      {/* Funnel + Top products */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardTitle>Conversion funnel</CardTitle>
          <p className="mt-1 mb-5 text-[12.5px] text-t2">Last 30 days journey</p>
          <FunnelChart stages={analyticsFunnel} />
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Top performing products</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <DataTable columns={productColumns} data={analyticsProducts} rowKey={(p) => p.id} />
        </Card>
      </div>

      {/* Activity + Devices + Goal */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Button variant="ghost" size="sm">
              All
            </Button>
          </div>
          <Timeline
            events={analyticsActivity.map((a) => {
              const Icon = ICONS[a.icon];
              return {
                id: a.id,
                title: (
                  <>
                    <strong className="font-bold">{a.who}</strong> {a.text}
                  </>
                ),
                time: a.time,
                color: TINT[a.tint].fg,
                icon: <Icon size={14} />,
              };
            })}
          />
        </Card>

        <Card>
          <CardTitle>Sessions by device</CardTitle>
          <p className="mt-1 mb-5 text-[12.5px] text-t2">Where your traffic comes from</p>
          <div className="flex flex-col gap-5">
            {analyticsDevices.map((d) => {
              const Icon = ICONS[d.icon];
              return (
                <div key={d.name}>
                  <div className="mb-2 flex items-center gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: TINT[d.tint].bg, color: TINT[d.tint].fg }}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="flex-1 text-[13.5px] font-semibold text-t1">{d.name}</span>
                    <span className="font-mono text-sm font-extrabold text-t0">{d.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-inset">
                    <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: TINT[d.tint].fg }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-bg-3 to-bg-2">
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
            style={{ background: "radial-gradient(circle,var(--acc-soft),transparent 70%)" }}
          />
          <div className="relative">
            <CardTitle>Monthly target</CardTitle>
            <p className="mt-1 text-[12.5px] text-t2">You're ahead of schedule 🎯</p>
            <div className="relative mx-auto mt-4 h-[108px] w-[190px]">
              <svg viewBox="0 0 200 110" className="h-full w-full">
                <path d="M16 100 A 84 84 0 0 1 184 100" fill="none" stroke="var(--bg-inset)" strokeWidth="16" strokeLinecap="round" />
                <path
                  d="M16 100 A 84 84 0 0 1 184 100"
                  fill="none"
                  stroke="var(--acc)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={264 * (1 - analyticsGoal.pct / 100)}
                />
              </svg>
              <div className="absolute inset-x-0 bottom-1.5 text-center">
                <span className="block text-[28px] font-extrabold tracking-tight text-t0">{analyticsGoal.pct}%</span>
                <span className="text-[11.5px] font-semibold text-t2">
                  {analyticsGoal.current} of {analyticsGoal.target}
                </span>
              </div>
            </div>
            <div className="mt-3.5 flex gap-2.5">
              <div className="flex-1 rounded-xl border border-line bg-bg-2 px-3.5 py-2.5">
                <p className="text-[11px] font-semibold text-t2">Target</p>
                <p className="mt-1 text-[15px] font-extrabold text-t0">{analyticsGoal.target}</p>
              </div>
              <div className="flex-1 rounded-xl border border-line bg-bg-2 px-3.5 py-2.5">
                <p className="text-[11px] font-semibold text-t2">This month</p>
                <p className="mt-1 text-[15px] font-extrabold text-ok">{analyticsGoal.current}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
