import { AvatarGroup, Badge, Button, KanbanBoard, KanbanCard, KanbanColumn } from "@/components/ui";
import { kanban, kanbanTeamAvatars } from "@/data/projects";
import { Icon, icons } from "./Icons";

export function KanbanView() {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-t2">
            <span>Projects</span>
            <Icon d="m9 18 6-6-6-6" size={13} />
            <span className="font-semibold text-t1">Team board</span>
          </div>
          <h1 className="text-xl font-extrabold text-t0 sm:text-2xl">Product roadmap</h1>
          <p className="mt-1 text-[13px] text-t1">Sprint 24 · 9 tasks across 4 stages</p>
        </div>
        <div className="flex items-center gap-4">
          <AvatarGroup names={kanbanTeamAvatars} max={4} />
          <Button icon={<Icon d={icons.plus} size={14} />}>Add task</Button>
        </div>
      </div>

      <KanbanBoard>
        {kanban.map((col) => (
          <KanbanColumn key={col.title} title={col.title} count={col.cards.length} color={col.dot}>
            {col.cards.map((c, i) => (
              <KanbanCard key={i}>
                <Badge variant={c.tagTone} className="mb-2.5">
                  {c.tag}
                </Badge>
                <p className="mb-3 text-[13.5px] font-semibold leading-snug text-t0">{c.title}</p>
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-3 text-[11.5px] font-semibold text-t2">
                    <span className="flex items-center gap-1.5">
                      <Icon d={icons.calendar} size={13} />
                      {c.due}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icon d={icons.comment} size={13} />
                      {c.comments}
                    </span>
                  </div>
                  <AvatarGroup names={c.assignees} max={2} />
                </div>
              </KanbanCard>
            ))}
            <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-2 py-2.5 text-[12.5px] font-semibold text-t2 transition-colors hover:border-acc hover:text-t0">
              <Icon d={icons.plus} size={15} />
              Add a card
            </button>
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </div>
  );
}
