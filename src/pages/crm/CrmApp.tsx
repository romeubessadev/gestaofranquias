import { useState } from "react";
import { Avatar, Badge, Button, Card, CardTitle, DataTable, Input, PageHeader, ProgressBar, type DataTableColumn } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Icon, crmIcons } from "./Icons";
import { PipelineBoard, PipelineStageStrip } from "./PipelineBoard";
import { crmActivities, crmContacts, crmPipelineCols, crmReps, type CrmDeal } from "@/data/crm";

interface FlatDeal extends CrmDeal { stage: string; stageColor: string }
const allDeals: FlatDeal[] = crmPipelineCols.flatMap((c) => c.deals.map((d) => ({ ...d, stage: c.stage, stageColor: c.color })));

const listColumns: DataTableColumn<FlatDeal>[] = [
  {
    key: "name",
    header: "Deal",
    render: (d) => (
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold text-t0">{d.name}</p>
        <p className="truncate text-[11px] text-t2">{d.company}</p>
      </div>
    ),
  },
  { key: "stage", header: "Stage", align: "center", render: (d) => <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: d.stageColor, background: `color-mix(in srgb, ${d.stageColor} 16%, transparent)` }}>{d.stage}</span>, hideBelow: "sm" },
  { key: "priority", header: "Priority", align: "center", render: (d) => <Badge status={d.priority}>{d.priority}</Badge>, hideBelow: "md" },
  { key: "prob", header: "Win %", align: "center", render: (d) => <span className="font-bold text-t0">{d.prob}%</span>, hideBelow: "lg" },
  { key: "value", header: "Value", align: "right", render: (d) => <span className="font-mono font-extrabold text-t0">{d.value}</span> },
];

export function CrmApp() {
  const [view, setView] = useState<"board" | "list">("board");

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Apps" }, { label: "CRM" }]}
        title="Pipeline"
        subtitle="182 deals · $1.24M · Q3 2026"
        actions={
          <>
            <div className="w-40"><Input placeholder="Search deals…" /></div>
            <div className="flex gap-0.5 rounded-[10px] border border-line bg-bg-2 p-0.5">
              <button onClick={() => setView("board")} className={cn("flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-bold", view === "board" ? "bg-acc text-white" : "text-t1 hover:text-t0")}>
                <Icon d="M5 3v18M12 3v12M19 3v8" size={12} />Board
              </button>
              <button onClick={() => setView("list")} className={cn("flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-xs font-bold", view === "list" ? "bg-acc text-white" : "text-t1 hover:text-t0")}>
                <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={12} />List
              </button>
            </div>
            <Button icon={<Icon d={crmIcons.plus} size={14} />}>New deal</Button>
          </>
        }
      />

      <div className="mb-4">
        <PipelineStageStrip />
      </div>

      <div className="mb-5">
        {view === "board" ? <PipelineBoard showProb /> : <DataTable columns={listColumns} data={allDeals} rowKey={(d) => d.name} />}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr]">
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Recent contacts</CardTitle>
            <span className="text-[12.5px] font-bold text-acc">View all</span>
          </div>
          {crmContacts.map((c) => (
            <div key={c.name} className="flex items-center gap-3 border-b border-line py-2.5 last:border-b-0">
              <Avatar name={c.name} size="md" status={c.online ? "online" : undefined} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-t0">{c.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{c.role} · {c.company}</p>
              </div>
              <div className="flex gap-1.5">
                <button className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-line text-t2 hover:border-acc hover:text-acc" aria-label="Email"><Icon d={crmIcons.mail} size={13} /></button>
                <button className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-line text-t2 hover:border-acc hover:text-acc" aria-label="Call"><Icon d={crmIcons.phone} size={13} /></button>
              </div>
            </div>
          ))}
        </Card>

        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Today's activities</CardTitle>
            <Button variant="outline" size="sm">+ Add</Button>
          </div>
          <div className="flex flex-col gap-2.5">
            {crmActivities.map((a) => (
              <div key={a.title} className={cn("flex gap-3 rounded-[13px] border bg-bg-inset p-3", a.done ? "border-ok-soft" : "border-line")}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${a.tint} 16%, transparent)`, color: a.tint }}>
                  <Icon d={crmIcons[a.icon as keyof typeof crmIcons]} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[12.5px] font-bold", a.done ? "text-t2 line-through" : "text-t0")}>{a.title}</p>
                  <p className="mt-0.5 text-[11px] text-t2">{a.sub} · {a.time}</p>
                </div>
                {a.done && <span className="text-ok"><Icon d={crmIcons.check} size={15} /></span>}
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="md:col-span-2 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Top reps · Q3</CardTitle>
            <Badge variant="accent">Live</Badge>
          </div>
          <div className="flex flex-col gap-4">
            {crmReps.map((r) => (
              <div key={r.name} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-extrabold" style={{ color: r.medal }}>{r.rank}</span>
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
