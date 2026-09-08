import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Badge, Breadcrumbs, Button, Card, CardTitle, Input, ProgressBar } from "@/components/ui";
import { paths } from "@/router/paths";
import { tasks } from "@/data/projects";
import { Icon, icons } from "./Icons";

const labelTone: Record<string, "accent" | "info" | "warning" | "success"> = {
  backend: "accent",
  billing: "info",
  "sprint-24": "warning",
  design: "warning",
  mobile: "info",
  support: "success",
};

export function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = tasks.find((t) => t.id === id) ?? tasks[0];
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;
  const pct = Math.round((doneSubtasks / task.subtasks.length) * 100);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={<Icon d={icons.arrowLeft} size={14} />} onClick={() => navigate(paths.projects.detail(task.projectId))}>
          Back
        </Button>
        <Breadcrumbs items={[{ label: task.projectName, to: paths.projects.detail(task.projectId) }, { label: task.id }]} />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card padding="lg">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <Badge variant="accent">{task.status}</Badge>
              <Badge variant="danger">{task.priority}</Badge>
            </div>
            <h1 className="mb-3 text-xl font-extrabold text-t0 sm:text-[21px]">{task.title}</h1>
            <p className="text-[13.5px] leading-[1.7] text-t1">{task.desc}</p>

            <div className="mt-5 border-t border-line pt-4.5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-t0">
                  Subtasks · {doneSubtasks} of {task.subtasks.length}
                </h3>
                <div className="w-[120px] shrink-0">
                  <ProgressBar value={pct} height={6} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {task.subtasks.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 rounded-[11px] bg-bg-inset px-3 py-2.5">
                    <span
                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-md border-2 text-white"
                      style={{ borderColor: s.done ? "var(--ok)" : "var(--line-2)", background: s.done ? "var(--ok)" : "transparent" }}
                    >
                      {s.done && <Icon d={icons.check} size={10} />}
                    </span>
                    <span className={`text-[13px] font-semibold ${s.done ? "text-t2 line-through" : "text-t0"}`}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Comments</CardTitle>
            <div className="mb-4 flex flex-col gap-4">
              {task.comments.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <Avatar name={c.name} size="sm" />
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-baseline gap-2">
                      <span className="text-[13px] font-bold text-t0">{c.name}</span>
                      <span className="text-[11px] text-t2">{c.time}</span>
                    </div>
                    <div className="rounded-xl bg-bg-inset px-3.5 py-3 text-[13px] leading-relaxed text-t1">{c.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              <Input placeholder="Write a comment…" className="flex-1" />
              <Button>Send</Button>
            </div>
          </Card>
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[300px] lg:shrink-0">
          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Details</p>
            <div className="flex flex-col gap-3 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span className="text-t2">Assignee</span>
                <div className="flex items-center gap-2">
                  <Avatar name={task.assignee} size="xs" />
                  <span className="font-bold text-t0">{task.assignee}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Sprint</span>
                <span className="font-bold text-t0">{task.sprint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Story points</span>
                <span className="font-bold text-acc">{task.storyPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Due date</span>
                <span className="font-bold text-warn">{task.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-t2">Created</span>
                <span className="font-bold text-t0">{task.created}</span>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Labels</p>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map((l) => (
                <Badge key={l} variant={labelTone[l] ?? "neutral"}>
                  {l}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
