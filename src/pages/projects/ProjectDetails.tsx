import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Badge, Breadcrumbs, Button, Card, CardTitle } from "@/components/ui";
import { paths } from "@/router/paths";
import { projects } from "@/data/projects";
import { Icon, icons } from "./Icons";

export function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id) ?? projects[0];
  const doneMilestones = project.milestones.filter((m) => m.done).length;

  const heroStats = [
    { label: "Progress", value: `${project.pct}%`, color: "var(--acc)" },
    { label: "Tasks", value: String(project.tasksCount), color: "var(--info)" },
    { label: "Budget", value: project.budget, color: "var(--ok)" },
    { label: "Spent", value: project.spent, color: "var(--warn)" },
    { label: "Priority", value: project.priority, color: "var(--bad)" },
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={<Icon d={icons.arrowLeft} size={14} />} onClick={() => navigate(paths.projects.list)}>
          Back
        </Button>
        <Breadcrumbs items={[{ label: "Projects", to: paths.projects.list }, { label: project.name }]} />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm">
            Share
          </Button>
          <Button size="sm" onClick={() => navigate(paths.projects.edit(project.id))}>
            Edit project
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mb-5">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-acc-soft text-[26px]">{project.emoji}</span>
          <div className="min-w-[220px] flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-t0 sm:text-[22px]">{project.name}</h1>
              <Badge status={project.status === "On track" ? "Active" : project.status === "At risk" ? "Urgent" : project.status}>{project.status}</Badge>
            </div>
            <p className="max-w-[640px] text-[13.5px] leading-relaxed text-t1">{project.desc}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3.5 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-5">
          {heroStats.map((s) => (
            <div key={s.label}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-t2">{s.label}</p>
              <p className="mt-1 truncate text-[16px] font-extrabold" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <CardTitle>Milestones</CardTitle>
              <span className="text-xs text-t2">
                {doneMilestones} of {project.milestones.length} complete
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {project.milestones.map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-3 rounded-xl border bg-bg-inset px-3.5 py-3"
                  style={{ borderColor: m.done ? "var(--ok-soft)" : "var(--line)" }}
                >
                  <span
                    className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 text-white"
                    style={{ background: m.done ? "var(--ok)" : "var(--bg-3)", borderColor: m.done ? "var(--ok)" : "var(--line-2)" }}
                  >
                    {m.done && <Icon d={icons.check} size={12} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13.5px] font-bold ${m.done ? "text-t2" : "text-t0"}`}>{m.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">
                      {m.tasks} tasks · {m.date}
                    </p>
                  </div>
                  <span className={`font-mono text-xs font-bold ${m.done ? "text-ok" : "text-t1"}`}>{m.pct}%</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Recent activity</CardTitle>
            <div className="relative">
              <span className="absolute bottom-1.5 left-4 top-1.5 w-px bg-line" />
              <div className="flex flex-col gap-4">
                {project.activity.map((a, i) => (
                  <div key={i} className="relative flex gap-3">
                    <span
                      className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-[2.5px] border-bg-2 text-[13px]"
                      style={{ background: a.tintBg, color: a.tint }}
                    >
                      {a.icon}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[12.5px] leading-[1.45] text-t0">
                        <strong className="font-bold">{a.who}</strong> <span className="text-t1">{a.text}</span>
                      </p>
                      <span className="text-[11px] text-t2">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Team</p>
            <div className="flex flex-col gap-3">
              {project.workload.map((w) => (
                <div key={w.name} className="flex items-center gap-2.5">
                  <Avatar name={w.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-t0">{w.name}</p>
                    <p className="text-[11px] text-t2">{w.tasks}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Details</p>
            <div className="flex flex-col gap-2.5 text-[12.5px]">
              <div className="flex justify-between">
                <span className="text-t2">Start date</span>
                <span className="font-bold text-t0">{project.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Due date</span>
                <span className="font-bold text-warn">{project.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Budget</span>
                <span className="font-bold text-ok">{project.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Spent</span>
                <span className="font-bold text-t0">{project.spent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Priority</span>
                <span className={`font-bold ${project.priority === "High" ? "text-bad" : project.priority === "Medium" ? "text-warn" : "text-t0"}`}>
                  {project.priority}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
