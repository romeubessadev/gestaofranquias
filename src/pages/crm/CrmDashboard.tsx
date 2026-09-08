import { Link } from "react-router-dom";
import { Avatar, Badge, Button, Card, CardTitle, PageHeader, ProgressBar } from "@/components/ui";
import { DonutChart } from "@/components/charts";
import { paths } from "@/router/paths";
import { Icon, crmIcons } from "./Icons";
import { crmActivityStats, crmKpis, crmLeadSources, crmReps, crmStages, crmWinLoss } from "@/data/crm";

export function CrmDashboard() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.analytics }, { label: "CRM" }]}
        title="CRM overview"
        subtitle="Pipeline health, activities and win rate — Q3 2026."
        actions={
          <>
            <Button variant="secondary" icon={<Icon d={crmIcons.calendar} size={14} />}>This quarter</Button>
            <Link to={paths.crm.app}>
              <Button icon={<Icon d="M5 3v18M12 3v12M19 3v8" size={14} />}>Open pipeline</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {crmKpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]" style={{ background: `color-mix(in srgb, ${k.tint} 16%, transparent)`, color: k.tint }}>
                <Icon d={crmIcons[k.icon as keyof typeof crmIcons]} size={20} />
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${k.positive ? "text-ok bg-ok-soft" : "text-bad bg-bad-soft"}`}>
                {k.positive ? "↗" : "↘"} {k.delta}
              </span>
            </div>
            <p className="mt-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t1">{k.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-t0">{k.value}</p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <CardTitle>Pipeline by stage</CardTitle>
              <p className="mt-1 text-[12.5px] text-t2">$1.24M total · 182 deals</p>
            </div>
            <Badge variant="success">+14% QoQ</Badge>
          </div>
          <div className="flex flex-col gap-4">
            {crmStages.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                    <span className="text-[13px] font-semibold text-t1">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11.5px] text-t2">{s.deals} deals</span>
                    <span className="font-mono text-[13px] font-extrabold text-t0">{s.value}</span>
                  </div>
                </div>
                <ProgressBar value={s.pct} color={s.color} />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <CardTitle>Win / Loss rate</CardTitle>
          <p className="mt-1 text-[12.5px] text-t2">Closed deals this quarter</p>
          <div className="mx-auto my-4">
            <DonutChart
              segments={[
                { label: "Won", value: crmWinLoss.won.deals, color: "var(--ok)" },
                { label: "Lost", value: crmWinLoss.lost.deals, color: "var(--bad)" },
              ]}
              size={148}
              centerValue={`${crmWinLoss.winRate}%`}
              centerLabel="win rate"
            />
          </div>
          <div className="mt-auto flex flex-col gap-2.5">
            <div className="flex items-center justify-between rounded-[12px] bg-ok-soft px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-ok" />
                <span className="text-[12.5px] font-semibold text-t0">Won</span>
              </div>
              <span className="text-sm font-extrabold text-ok">{crmWinLoss.won.deals} deals · {crmWinLoss.won.value}</span>
            </div>
            <div className="flex items-center justify-between rounded-[12px] bg-bad-soft px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-bad" />
                <span className="text-[12.5px] font-semibold text-t0">Lost</span>
              </div>
              <span className="text-sm font-extrabold text-bad">{crmWinLoss.lost.deals} deals · {crmWinLoss.lost.value}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Lead sources</CardTitle>
            <span className="text-xs font-semibold text-t2">940 new leads</span>
          </div>
          <div className="flex flex-col gap-4">
            {crmLeadSources.map((l) => (
              <div key={l.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: l.color }} />
                    {l.name}
                  </span>
                  <span className="text-[12.5px] text-t2"><strong className="font-bold text-t0">{l.value}</strong> · {l.pct}%</span>
                </div>
                <ProgressBar value={l.pct} color={l.color} height={7} />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Activity</CardTitle>
            <Badge variant="success">This week</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {crmActivityStats.map((a) => (
              <div key={a.label} className="flex items-center gap-3 rounded-[13px] bg-bg-inset p-3">
                <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px]" style={{ background: `color-mix(in srgb, ${a.tint} 16%, transparent)`, color: a.tint }}>
                  <Icon d={crmIcons[a.icon as keyof typeof crmIcons]} size={18} />
                </span>
                <div className="flex-1">
                  <p className="font-mono text-xl font-extrabold text-t0">{a.value}</p>
                  <p className="text-[11.5px] font-semibold text-t2">{a.label}</p>
                </div>
                <span className={`text-xs font-bold ${a.up ? "text-ok" : "text-bad"}`}>{a.sub}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="md:col-span-2 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Top sales reps</CardTitle>
            <span className="text-[11.5px] text-t2">Q3 2026</span>
          </div>
          <div className="flex flex-col gap-4">
            {crmReps.map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-extrabold text-t1">{r.rank}</span>
                <Avatar name={r.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-[13px] font-bold text-t0">{r.name}</span>
                    <span className="font-mono text-[13px] font-extrabold text-ok">{r.value}</span>
                  </div>
                  <ProgressBar value={r.pct} height={5} />
                  <span className="text-[11px] text-t2">{r.deals} deals · {r.pct}% of target</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
