import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, KanbanBoard, KanbanCard, KanbanColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { sprintCols } from "@/data/projects";

const stats = [
  { value: "38", label: "Done", color: "var(--ok)" },
  { value: "16", label: "In flight", color: "var(--acc)" },
  { value: "8", label: "To do", color: "var(--t1)" },
];

export function SprintBoard() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-t0 sm:text-2xl">Sprint 24</h1>
          <p className="mt-1 text-[13px] text-t1">
            Jun 16 – Jun 30 · 62 points committed · <span className="font-bold text-warn">4 days left</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-extrabold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-[10.5px] text-t2">{s.label}</p>
              </div>
            ))}
          </div>
          <Button>Complete sprint</Button>
        </div>
      </div>

      <KanbanBoard>
        {sprintCols.map((col) => (
          <KanbanColumn key={col.name} title={col.name} count={col.cards.length} color={col.color}>
            {col.cards.map((c) => (
              <div key={c.id} onClick={() => navigate(paths.projects.task(c.id))}>
                <KanbanCard>
                  <span className="font-mono text-[10.5px] font-bold text-t2">{c.id}</span>
                  <p className="mb-2.5 mt-2 text-[12.5px] font-bold leading-snug text-t0">{c.title}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={c.tagTone}>{c.tag}</Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold" style={{ color: col.color }}>
                        {c.pts}
                      </span>
                      <Avatar name={c.av} size="xs" />
                    </div>
                  </div>
                </KanbanCard>
              </div>
            ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
}
