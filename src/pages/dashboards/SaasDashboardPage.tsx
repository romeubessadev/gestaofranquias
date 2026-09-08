import { Badge, Button, Card, CardTitle, PageHeader } from "@/components/ui";
import { AreaLineChart, DonutChart } from "@/components/charts";
import { paths } from "@/router/paths";
import {
  saasChart,
  saasCohortMonths,
  saasCohortRows,
  saasHealth,
  saasKpis,
  saasMrrDelta,
  saasPlans,
  saasSignups,
} from "@/data/dashboards";
import { CalendarIcon, DownloadIcon, TINT } from "./icons";
import { KpiTile } from "./KpiTile";

function cohortTone(val: number): { bg: string; fg: string } {
  if (val === 0) return { bg: "transparent", fg: "var(--t2)" };
  if (val >= 85) return { bg: "var(--ok-soft)", fg: "var(--ok)" };
  if (val >= 70) return { bg: "var(--acc-soft)", fg: "var(--acc)" };
  return { bg: "var(--warn-soft)", fg: "var(--warn)" };
}

export function SaasDashboardPage() {
  const totalMrr = saasPlans.reduce((sum, p) => sum + Number(p.revenue.replace(/[^0-9.]/g, "")), 0);
  const totalSubs = saasPlans.reduce((sum, p) => sum + p.subs, 0);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.saas }, { label: "SaaS" }]}
        title="SaaS metrics"
        subtitle="MRR, churn, retention and cohort health — Jun 2026."
        actions={
          <>
            <Button variant="secondary" icon={<CalendarIcon size={15} />}>
              Jun 2026
            </Button>
            <Button variant="primary" icon={<DownloadIcon size={15} />}>
              Export
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {saasKpis.map((k) => (
          <KpiTile key={k.id} label={k.label} value={k.value} icon={k.icon} tint={k.tint} delta={k.delta} sub={k.sub} />
        ))}
      </div>

      {/* Churn health strip */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {saasHealth.map((h) => (
          <Card key={h.label} padding="sm" className="flex items-center gap-3.5">
            <div className="relative h-11 w-11 shrink-0">
              <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-inset)" strokeWidth="5" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke={TINT[h.tint].fg}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 18}
                  strokeDashoffset={2 * Math.PI * 18 * (1 - h.pct / 100)}
                />
              </svg>
              <span
                className="absolute inset-0 flex items-center justify-center text-[11px] font-extrabold"
                style={{ color: TINT[h.tint].fg }}
              >
                {h.pct}%
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-t2">{h.label}</p>
              <p className="mt-0.5 truncate font-mono text-base font-extrabold text-t0">{h.value}</p>
              <p className="text-[11px] text-t2">{h.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* MRR chart + Plan mix */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>MRR trend</CardTitle>
              <div className="mt-1.5 flex items-baseline gap-2.5">
                <span className="text-[26px] font-extrabold tracking-tight text-t0">${(totalMrr).toLocaleString()}</span>
                <span className="flex items-center gap-1 text-[13px] font-bold text-ok">↗ +12% MoM</span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="rounded-xl border border-ok/20 bg-ok-soft px-3.5 py-2.5 text-center">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-ok">New MRR</p>
                <p className="mt-1 font-mono text-base font-extrabold text-ok">{saasMrrDelta.newMrr}</p>
              </div>
              <div className="rounded-xl border border-bad/20 bg-bad-soft px-3.5 py-2.5 text-center">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-bad">Churned</p>
                <p className="mt-1 font-mono text-base font-extrabold text-bad">{saasMrrDelta.churnedMrr}</p>
              </div>
            </div>
          </div>
          <AreaLineChart data={saasChart.data} labels={saasChart.labels} height={200} formatValue={(v) => `$${v.toLocaleString()}`} />
          <div className="mt-2 flex justify-between px-1">
            {saasChart.labels.map((m) => (
              <span key={m} className="text-[10.5px] font-semibold text-t2">
                {m}
              </span>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="mb-1 flex items-center justify-between">
            <CardTitle>Plan mix</CardTitle>
            <Badge variant="accent">{totalSubs.toLocaleString()} total</Badge>
          </div>
          <p className="mb-2 text-[12.5px] text-t2">Revenue contribution by tier</p>
          <div className="flex flex-1 flex-col items-center justify-center">
            <DonutChart
              segments={saasPlans.map((p) => ({ label: p.name, value: Number(p.revenue.replace(/[^0-9.]/g, "")), color: p.color }))}
              size={148}
              thickness={20}
              centerLabel="total MRR"
              centerValue={`$${(totalMrr / 1000).toFixed(1)}k`}
            />
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {saasPlans.map((p) => (
              <div key={p.name} className="rounded-xl bg-bg-inset p-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-bold text-t0">
                    <span className="h-2.5 w-2.5 rounded-[4px]" style={{ background: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-mono text-[13px] font-extrabold text-t0">{p.revenue}</span>
                </div>
                <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
                  <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
                <span className="text-[11px] font-semibold text-t2">
                  {p.subs.toLocaleString()} subscribers · {p.pct}% of MRR
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Cohort retention + Recent signups */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-x-auto">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <CardTitle>Cohort retention</CardTitle>
              <p className="mt-1 text-[12.5px] text-t2">% of users still active by month</p>
            </div>
            <Badge variant="success">Healthy 📈</Badge>
          </div>
          <table className="w-full min-w-[480px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-b border-line px-2.5 py-2 text-left text-[10.5px] font-bold uppercase tracking-wide text-t2">Cohort</th>
                {saasCohortMonths.map((m) => (
                  <th key={m} className="border-b border-line px-2 py-2 text-center text-[10.5px] font-bold uppercase tracking-wide text-t2">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {saasCohortRows.map((r) => (
                <tr key={r.cohort} className="hover:bg-bg-3">
                  <td className="whitespace-nowrap border-b border-line px-2.5 py-2.5 text-[12.5px] font-bold text-t0">{r.cohort}</td>
                  {r.vals.map((v, i) => {
                    const tone = cohortTone(v);
                    return (
                      <td key={i} className="border-b border-line px-2 py-2.5 text-center">
                        {v > 0 ? (
                          <span
                            className="inline-block rounded-[8px] px-2.5 py-1 font-mono text-xs font-bold"
                            style={{ background: tone.bg, color: tone.fg }}
                          >
                            {v}
                          </span>
                        ) : (
                          <span className="text-t2">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Recent signups</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {saasSignups.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-bg-inset">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: s.avBg }}
                >
                  {s.av}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-t0">{s.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-t2">
                    {s.company} · {s.time}
                  </p>
                </div>
                <Badge variant="accent" className="whitespace-nowrap">
                  {s.plan}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
