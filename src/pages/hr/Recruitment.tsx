import { Badge, Button, KanbanBoard, KanbanCard, KanbanColumn, PageHeader } from "@/components/ui";
import { recruitCols } from "@/data/hr";
import { Icon } from "./icons";

export function Recruitment() {
  return (
    <div>
      <PageHeader
        title="Recruitment"
        subtitle="12 open positions · 284 applicants"
        actions={<Button icon={<Icon path="M12 5v14M5 12h14" size={14} />}>Post job</Button>}
      />

      <KanbanBoard>
        {recruitCols.map((col) => (
          <KanbanColumn key={col.stage} title={col.stage} count={col.cards.length} color={col.color}>
            {col.cards.map((c) => (
              <KanbanCard key={c.name}>
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white"
                    style={{ background: c.avatarBg }}
                  >
                    {c.avatar}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-t0">{c.name}</p>
                    <p className="truncate text-[11px] text-t2">{c.role}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <Badge variant={c.rating === "New" ? "info" : "warning"}>{c.rating === "New" ? "New" : `★ ${c.rating}`}</Badge>
                  <span className="text-[11px] text-t2">{c.time}</span>
                </div>
              </KanbanCard>
            ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
}
