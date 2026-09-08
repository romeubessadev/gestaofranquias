import { useMemo, useState } from "react";
import { Avatar, Badge, Button, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { taskLabels, tasks, type Task } from "@/data/apps";
import { CheckIcon, PlusIcon, SearchIcon } from "./icons";

const FILTERS = ["All", "Open", "Done"] as const;

function TaskRow({ task, onToggle, accentClass }: { task: Task; onToggle: () => void; accentClass?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-line bg-bg-2 px-4 py-3.5 shadow-[var(--shadow-vela)] hover:border-line-2",
        accentClass,
        task.done && "opacity-55",
      )}
    >
      <button
        onClick={onToggle}
        aria-label={task.done ? "Mark as open" : "Mark as done"}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[7px] border-2",
          task.done ? "border-ok bg-ok" : task.group === "overdue" ? "border-bad" : "border-line-2",
        )}
      >
        {task.done && <CheckIcon size={11} className="text-white" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13.5px] font-semibold", task.done ? "text-t2 line-through" : "text-t0")}>{task.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <span className="text-[11.5px] text-t2">{task.project}</span>
          <span
            className={cn(
              "text-[11px] font-bold",
              task.group === "overdue" || task.urgent ? "text-bad" : task.group === "today" ? "text-warn" : "text-t2",
            )}
          >
            {task.due}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Avatar name={task.assignee} size="xs" className="hidden sm:inline-flex" />
        <Badge status={task.priority}>{task.priority}</Badge>
      </div>
    </div>
  );
}

export function TaskManager() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [doneOverrides, setDoneOverrides] = useState<Record<string, boolean>>({});

  const allTasks = useMemo(
    () => tasks.map((t) => ({ ...t, done: doneOverrides[t.id] ?? t.done })),
    [doneOverrides],
  );

  const visible = useMemo(
    () =>
      allTasks.filter(
        (t) =>
          (filter === "All" || (filter === "Done" ? t.done : !t.done)) &&
          (query.trim() === "" || t.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [allTasks, filter, query],
  );

  const doneCount = allTasks.filter((t) => t.done).length;
  const openCount = allTasks.length - doneCount;
  const overdueCount = allTasks.filter((t) => t.group === "overdue" && !t.done).length;
  const donePct = Math.round((doneCount / allTasks.length) * 100);

  const groups: { key: Task["group"]; label: string; dotClass: string; labelClass: string; accentClass?: string }[] = [
    { key: "overdue", label: "Overdue", dotClass: "bg-bad", labelClass: "text-bad", accentClass: "border-l-[3px] border-l-bad" },
    { key: "today", label: "Today", dotClass: "bg-acc", labelClass: "text-t1" },
    { key: "upcoming", label: "Upcoming", dotClass: "bg-info", labelClass: "text-t1", accentClass: "border-l-[3px] border-l-info" },
  ];

  const progressStrip = [
    { name: "Overdue", count: overdueCount, colorText: "text-bad", colorBg: "bg-bad", dot: "bg-bad" },
    { name: "Open", count: openCount, colorText: "text-acc", colorBg: "bg-acc", dot: "bg-acc" },
    { name: "Done", count: doneCount, colorText: "text-ok", colorBg: "bg-ok", dot: "bg-ok" },
    { name: "Upcoming", count: allTasks.filter((t) => t.group === "upcoming").length, colorText: "text-info", colorBg: "bg-info", dot: "bg-info" },
  ];

  const assignees = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of allTasks) counts.set(t.assignee, (counts.get(t.assignee) ?? 0) + 1);
    const max = Math.max(...counts.values());
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
  }, [allTasks]);

  function toggle(id: string) {
    setDoneOverrides((prev) => {
      const current = prev[id] ?? tasks.find((t) => t.id === id)?.done ?? false;
      return { ...prev, [id]: !current };
    });
  }

  // SVG ring geometry for "today's progress"
  const ringC = 2 * Math.PI * 50;

  return (
    <div>
      <PageHeader
        title="My tasks"
        subtitle={`${openCount} open · ${doneCount} done today · ${overdueCount} overdue`}
        actions={
          <>
            <div className="flex h-10 items-center gap-2 rounded-[11px] border border-line bg-bg-2 px-3">
              <SearchIcon size={14} className="text-t2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks…"
                className="w-28 bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2 sm:w-36"
              />
            </div>
            <div className="flex gap-0.5 rounded-[11px] border border-line bg-bg-2 p-[3px]">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-[9px] px-3.5 py-1.5 text-[12.5px] font-bold transition-colors",
                    filter === f ? "bg-acc text-white" : "text-t1 hover:text-t0",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <Button icon={<PlusIcon size={15} />}>New task</Button>
          </>
        }
      />

      {/* Progress KPI strip */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {progressStrip.map((p) => {
          const pct = Math.round((p.count / allTasks.length) * 100);
          return (
            <div key={p.name} className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-t1">
                  <span className={cn("h-2.5 w-2.5 rounded-full", p.dot)} />
                  {p.name}
                </span>
                <span className={cn("font-mono text-xl font-extrabold", p.colorText)}>{p.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-bg-inset">
                <div className={cn("h-full rounded", p.colorBg)} style={{ width: `${pct}%` }} />
              </div>
              <span className="mt-1.5 block text-[11px] font-semibold text-t2">{pct}% of total</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1fr_300px]">
        {/* Task groups */}
        <div className="flex flex-col gap-5">
          {groups.map((g) => {
            const groupTasks = visible.filter((t) => t.group === g.key);
            if (groupTasks.length === 0) return null;
            return (
              <div key={g.key}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span className={cn("h-2 w-2 rounded-full", g.dotClass)} />
                  <span className={cn("text-xs font-bold uppercase tracking-wide", g.labelClass)}>
                    {g.label} · {groupTasks.length}
                  </span>
                  <span className="h-px flex-1 bg-line" />
                </div>
                <div className="flex flex-col gap-2">
                  {groupTasks.map((t) => (
                    <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} accentClass={g.accentClass} />
                  ))}
                </div>
              </div>
            );
          })}
          {visible.length === 0 && (
            <div className="rounded-[var(--radius-vela-lg)] border border-dashed border-line bg-bg-2 p-10 text-center text-sm text-t1">
              No tasks match your filters.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-0">
          <div className="rounded-[18px] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-3.5 text-[15px] font-bold text-t0">Today's progress</h3>
            <div className="relative mx-auto mb-3.5 h-[120px] w-[120px]">
              <svg viewBox="0 0 120 120" className="h-[120px] w-[120px] -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-inset)" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--acc)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={ringC}
                  strokeDashoffset={ringC * (1 - donePct / 100)}
                  style={{ transition: "stroke-dashoffset .5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-extrabold text-t0">{donePct}%</span>
                <span className="text-[11px] text-t2">done</span>
              </div>
            </div>
            <div className="flex justify-around">
              <div className="text-center">
                <p className="font-mono text-lg font-extrabold text-ok">{doneCount}</p>
                <p className="mt-0.5 text-[11px] text-t2">Done</p>
              </div>
              <div className="w-px bg-line" />
              <div className="text-center">
                <p className="font-mono text-lg font-extrabold text-t0">{openCount}</p>
                <p className="mt-0.5 text-[11px] text-t2">Open</p>
              </div>
              <div className="w-px bg-line" />
              <div className="text-center">
                <p className="font-mono text-lg font-extrabold text-bad">{overdueCount}</p>
                <p className="mt-0.5 text-[11px] text-t2">Late</p>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-3.5 text-[15px] font-bold text-t0">By assignee</h3>
            <div className="flex flex-col gap-3">
              {assignees.map((a) => (
                <div key={a.name} className="flex items-center gap-2.5">
                  <Avatar name={a.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="truncate text-[12.5px] font-bold text-t0">{a.name}</span>
                      <span className="text-[11.5px] text-t2">{a.count} tasks</span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded bg-bg-inset">
                      <div className="h-full rounded bg-acc" style={{ width: `${a.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-3.5 text-[15px] font-bold text-t0">Labels</h3>
            <div className="flex flex-wrap gap-1.5">
              {taskLabels.map((l) => (
                <Badge key={l.name} variant="accent" className="cursor-pointer hover:opacity-85">
                  {l.name} <span className="opacity-70">{l.count}</span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
