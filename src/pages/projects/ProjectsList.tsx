import { useNavigate } from "react-router-dom";
import { AvatarGroup, Badge, Button, Card, Input, PageHeader, ProgressBar } from "@/components/ui";
import { paths } from "@/router/paths";
import { projects } from "@/data/projects";
import { Icon, icons } from "./Icons";

const dueToneColor = { ok: "text-ok", warn: "text-warn", bad: "text-bad" } as const;
const statusColor: Record<string, string> = {
  "On track": "var(--ok)",
  "At risk": "var(--bad)",
  Planning: "var(--info)",
  Completed: "var(--acc)",
};

export function ProjectsList() {
  const navigate = useNavigate();
  const active = projects.filter((p) => p.status !== "Completed").length;

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${active} active · 142 completed`}
        actions={
          <>
            <Input placeholder="Search projects…" className="h-[38px] w-[170px]" />
            <Button icon={<Icon d={icons.plus} size={14} />} onClick={() => navigate(paths.projects.new)}>
              New project
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((p) => {
          const color = statusColor[p.status] ?? "var(--acc)";
          return (
            <Card key={p.id} className="cursor-pointer transition-colors hover:border-line-2" onClick={() => navigate(paths.projects.detail(p.id))}>
              <div className="mb-3.5 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-acc-soft text-xl">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] font-bold text-t0">{p.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-t2">{p.client}</p>
                </div>
                <Badge status={p.status === "On track" ? "Active" : p.status === "At risk" ? "Urgent" : p.status}>{p.status}</Badge>
              </div>
              <p className="mb-3.5 line-clamp-2 text-[12.5px] leading-relaxed text-t1">{p.desc}</p>
              <div className="mb-2 flex items-center gap-2.5">
                <div className="flex-1">
                  <ProgressBar value={p.pct} color={color} height={7} />
                </div>
                <span className="font-mono text-xs font-bold" style={{ color }}>
                  {p.pct}%
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <AvatarGroup names={p.team} max={3} />
                <div className="flex items-center gap-3">
                  <span className="text-[11.5px] text-t2">{p.tasksCount} tasks</span>
                  <span className={`text-[11.5px] font-bold ${dueToneColor[p.dueTone]}`}>{p.due}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
