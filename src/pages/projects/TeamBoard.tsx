import { Avatar, Badge, Card, PageHeader, ProgressBar } from "@/components/ui";
import { teamBoardMembers } from "@/data/projects";

const loadColor = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" } as const;
const loadVariant = { ok: "success", warn: "warning", bad: "danger" } as const;
const dotColor: Record<string, string> = {
  accent: "var(--acc)",
  info: "var(--info)",
  ok: "var(--ok)",
  warn: "var(--warn)",
  bad: "var(--bad)",
};

export function TeamBoard() {
  const overloaded = teamBoardMembers.filter((m) => m.loadTone === "bad").length;

  return (
    <div>
      <PageHeader
        title="Team Board"
        subtitle={`Workload and focus across ${teamBoardMembers.length} members`}
        actions={<Badge variant="danger">{overloaded} member overloaded</Badge>}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teamBoardMembers.map((m) => (
          <Card key={m.name}>
            <div className="mb-3.5 flex items-center gap-3">
              <Avatar name={m.name} status={m.online ? "online" : undefined} />
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-t0">{m.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{m.role}</p>
              </div>
              <Badge variant={loadVariant[m.loadTone]}>{m.loadLabel}</Badge>
            </div>
            <div className="mb-3.5">
              <div className="mb-1.5 flex justify-between text-[11.5px] font-semibold">
                <span className="text-t2">Capacity</span>
                <span style={{ color: loadColor[m.loadTone] }}>{m.load}%</span>
              </div>
              <ProgressBar value={m.load} color={loadColor[m.loadTone]} height={7} />
            </div>
            <div className="flex flex-col gap-2">
              {m.current.map((t) => (
                <div key={t.name} className="flex items-center gap-2.5 rounded-[10px] bg-bg-inset px-3 py-2.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dotColor[t.tone] ?? "var(--acc)" }} />
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-t0">{t.name}</span>
                  <span className="shrink-0 text-[10.5px] text-t2">{t.eta}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
