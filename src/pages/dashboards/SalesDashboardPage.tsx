import { Badge, Button, Card, CardHeader, CardTitle, DataTable, PageHeader } from "@/components/ui";
import type { DataTableColumn } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { paths } from "@/router/paths";
import {
  type DealRow,
  salesKpis,
  salesLeaderboard,
  salesQuickStats,
  salesQuota,
  salesQuotaReps,
  salesRecentDeals,
  salesRegions,
  salesTrend,
} from "@/data/dashboards";
import { CalendarIcon, DownloadIcon, ICONS, PlusIcon, TINT } from "./icons";
import { KpiTile } from "./KpiTile";

const dealColumns: DataTableColumn<DealRow>[] = [
  {
    key: "name",
    header: "Customer",
    render: (d) => (
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[12px] font-bold text-white"
          style={{ background: d.avBg }}
        >
          {d.av}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{d.name}</p>
          <p className="text-[11px] text-t2">{d.industry}</p>
        </div>
      </div>
    ),
  },
  { key: "rep", header: "Rep", render: (d) => <span className="font-semibold text-t1">{d.rep}</span>, hideBelow: "md" },
  { key: "plan", header: "Plan", render: (d) => <span className="text-t1">{d.plan}</span>, hideBelow: "sm" },
  { key: "amount", header: "Amount", render: (d) => <span className="font-mono font-extrabold text-ok">{d.amount}</span>, align: "right" },
  { key: "status", header: "Status", render: (d) => <Badge status={d.status}>{d.status}</Badge>, align: "center" },
  { key: "date", header: "Date", render: (d) => <span className="text-t2">{d.date}</span>, align: "right", hideBelow: "lg" },
];

export function SalesDashboardPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.sales }, { label: "Sales" }]}
        title="Sales overview"
        subtitle="Team performance, pipeline and recent wins — Q3 2026."
        actions={
          <>
            <Button variant="secondary" icon={<CalendarIcon size={15} />}>
              This quarter
            </Button>
            <Button variant="secondary" icon={<DownloadIcon size={15} />}>
              Export
            </Button>
            <Button variant="primary" icon={<PlusIcon size={15} />}>
              New deal
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {salesKpis.map((k) => (
          <KpiTile key={k.id} label={k.label} value={k.value} icon={k.icon} tint={k.tint} delta={k.delta} />
        ))}
      </div>

      {/* Quick stats strip */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {salesQuickStats.map((s) => {
          const Icon = ICONS[s.icon];
          return (
            <Card key={s.id} padding="sm" className="flex items-center gap-3.5">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px]"
                style={{ background: TINT[s.tint].bg, color: TINT[s.tint].fg }}
              >
                <Icon size={19} />
              </span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-semibold text-t2">{s.label}</p>
                <p className="mt-1 truncate font-mono text-lg font-extrabold text-t0">{s.value}</p>
                <p className="text-[11px] text-t2">{s.sub}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Trend + Quota */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <CardTitle>Sales trend</CardTitle>
              <p className="mt-1.5 text-[12.5px] text-t2">Closed deals value · last 12 months</p>
            </div>
            <Badge variant="success">+16% YoY</Badge>
          </div>
          <AreaLineChart data={salesTrend.data} labels={salesTrend.labels} height={200} formatValue={(v) => `$${v.toLocaleString()}`} />
          <div className="mt-2 flex justify-between px-1">
            {salesTrend.labels.map((m) => (
              <span key={m} className="text-[11px] font-semibold text-t2">
                {m}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Quota attainment</CardTitle>
          </div>
          <p className="mb-2 text-center text-[11.5px] font-semibold text-t2">Q3 target: {salesQuota.target}</p>
          <div className="relative mx-auto h-[96px] w-[164px]">
            <svg viewBox="0 0 200 110" className="h-full w-full">
              <path d="M16 100 A 84 84 0 0 1 184 100" fill="none" stroke="var(--bg-inset)" strokeWidth="16" strokeLinecap="round" />
              <path
                d="M16 100 A 84 84 0 0 1 184 100"
                fill="none"
                stroke="var(--acc)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={264}
                strokeDashoffset={264 * (1 - salesQuota.pct / 100)}
              />
            </svg>
            <div className="absolute inset-x-0 bottom-1 text-center">
              <span className="text-[28px] font-extrabold tracking-tight text-t0">{salesQuota.pct}%</span>
              <span className="block text-[11px] font-semibold text-t2">
                {salesQuota.current} of {salesQuota.target}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3.5">
            {salesQuotaReps.map((r) => (
              <div key={r.name} className="flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
                  style={{ background: r.avBg }}
                >
                  {r.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-bold text-t0">{r.name}</span>
                    <span className="font-mono font-bold" style={{ color: r.color }}>
                      {r.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-bg-inset">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Regions + Leaderboard */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Sales by region</CardTitle>
            <span className="text-xs font-semibold text-t2">Q3 2026</span>
          </div>
          <div className="flex flex-col gap-4">
            {salesRegions.map((r) => (
              <div key={r.name}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-t1">{r.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11.5px] text-t2">{r.pct}%</span>
                    <span className="font-mono text-[13px] font-bold text-t0">{r.value}</span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Sales leaderboard</CardTitle>
            <Badge variant="accent">Top 5</Badge>
          </div>
          <div className="flex flex-col gap-3.5">
            {salesLeaderboard.map((r) => (
              <div key={r.rank} className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center text-[13px] font-extrabold" style={{ color: r.medal }}>
                  {r.rank}
                </span>
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: r.avBg }}
                >
                  {r.av}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="truncate text-[13px] font-bold text-t0">{r.name}</span>
                    <span className="font-mono text-[13px] font-bold text-ok">{r.value}</span>
                  </div>
                  <span className="text-[11.5px] text-t2">{r.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent deals table */}
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Recent deals closed</CardTitle>
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </CardHeader>
        <DataTable columns={dealColumns} data={salesRecentDeals} rowKey={(d) => d.id} />
      </Card>
    </div>
  );
}
