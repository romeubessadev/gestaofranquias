import { AvatarGroup, Badge, Button, Card, CardTitle, PageHeader, Timeline } from "@/components/ui";
import { paths } from "@/router/paths";
import {
  projectActivity,
  projectDeadlines,
  projectKpis,
  projectProgress,
  projectStatusSummary,
  projectVelocity,
  projectWorkload,
} from "@/data/dashboards";
import { DownloadIcon, FilterIcon, ICONS, PlusIcon, TINT } from "./icons";
import { KpiTile } from "./KpiTile";

export function ProjectDashboardPage() {
  const maxVelocity = Math.max(...projectVelocity.flatMap((v) => [v.planned, v.done]), 1);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.projects }, { label: "Projects" }]}
        title="Projects overview"
        subtitle="Progress, workload and upcoming deadlines across all teams."
        actions={
          <>
            <Button variant="secondary" icon={<FilterIcon size={15} />}>
              Filter
            </Button>
            <Button variant="secondary" icon={<DownloadIcon size={15} />}>
              Export
            </Button>
            <Button variant="primary" icon={<PlusIcon size={15} />}>
              New project
            </Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projectKpis.map((k) => (
          <KpiTile key={k.id} label={k.label} value={k.value} icon={k.icon} tint={k.tint} delta={k.delta} sub={k.sub} />
        ))}
      </div>

      {/* Status summary strip */}
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projectStatusSummary.map((s) => (
          <Card key={s.label} padding="sm" className="flex items-center gap-3.5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] font-mono text-lg font-extrabold"
              style={{ background: TINT[s.tint].bg, color: TINT[s.tint].fg }}
            >
              {s.count}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-t0">{s.label}</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: TINT[s.tint].fg }} />
                </div>
                <span className="text-[11px] font-semibold text-t2">{s.pct}%</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Project progress + Workload/Deadlines */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Project progress</CardTitle>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="flex flex-col divide-y divide-line">
            {projectProgress.map((p) => (
              <div key={p.id} className="py-3.5 first:pt-0 last:pb-0">
                <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-bold text-t0">{p.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">
                      {p.tasks} tasks · {p.pct}% done
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <AvatarGroup names={p.team} max={3} />
                    <span className="whitespace-nowrap text-xs font-semibold text-t2">{p.due}</span>
                    <Badge status={p.status}>{p.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-inset">
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                  <span className="w-9 text-right font-mono text-xs font-bold" style={{ color: p.color }}>
                    {p.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <CardTitle>Team workload</CardTitle>
              <Badge variant="danger">1 overloaded</Badge>
            </div>
            <div className="flex flex-col gap-3.5">
              {projectWorkload.map((w) => (
                <div key={w.name} className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                    style={{ background: w.avBg }}
                  >
                    {w.av}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-[12.5px] font-bold text-t0">{w.name}</span>
                      <span className="text-[11.5px] text-t2">{w.tasks}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-inset">
                      <div className="h-full rounded-full" style={{ width: `${w.pct}%`, background: w.color }} />
                    </div>
                    <span className="text-[10.5px] font-semibold text-t2">{w.pct}% capacity</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <CardTitle>Upcoming deadlines</CardTitle>
              <Badge variant="warning">2 this week</Badge>
            </div>
            <div className="flex flex-col gap-3">
              {projectDeadlines.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl bg-bg-inset p-2.5">
                  <span className="h-9 w-1 shrink-0 rounded-[3px]" style={{ background: d.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-t0">{d.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">{d.proj}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`text-[12.5px] font-bold ${d.urgent ? "text-bad" : "text-t1"}`}>{d.date}</p>
                    <p className="mt-0.5 text-[10.5px] text-t2">{d.remaining}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Sprint velocity + Activity */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Sprint velocity</CardTitle>
              <p className="mt-1.5 text-[12.5px] text-t2">Story points completed per sprint</p>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-t1">
                <span className="h-3 w-3 rounded-[4px] bg-acc" />
                Done
              </span>
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-t1">
                <span className="h-3 w-3 rounded-[4px] border border-line bg-bg-3" />
                Planned
              </span>
            </div>
          </div>
          <div className="relative flex h-[180px] items-end justify-between gap-2">
            {projectVelocity.map((v) => (
              <div key={v.sprint} className="flex h-full flex-1 flex-col items-center justify-end gap-0">
                <div className="flex w-full flex-1 items-end justify-center gap-1 pb-6">
                  <div
                    className="w-[42%] rounded-t-[5px] border border-line bg-bg-3"
                    style={{ height: `${(v.planned / maxVelocity) * 100}%` }}
                  />
                  <div
                    className="w-[42%] rounded-t-[5px] bg-gradient-to-b from-acc to-acc/50"
                    style={{ height: `${(v.done / maxVelocity) * 100}%` }}
                  />
                </div>
                <span className="absolute bottom-0 text-[10px] font-semibold text-t2">{v.sprint}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Recent activity</CardTitle>
            <Button variant="ghost" size="sm">
              All
            </Button>
          </div>
          <Timeline
            events={projectActivity.map((a) => {
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
      </div>
    </div>
  );
}
