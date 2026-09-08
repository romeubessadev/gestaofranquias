import { Avatar, KanbanBoard, KanbanCard, KanbanColumn, ProgressBar } from "@/components/ui";
import { crmPipelineCols, type CrmDeal } from "@/data/crm";

function DealCard({ deal, color, showProb }: { deal: CrmDeal; color: string; showProb?: boolean }) {
  return (
    <KanbanCard>
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-[13px] font-bold leading-snug text-t0">{deal.name}</p>
        <span
          className="mt-0.5 shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-bold"
          style={{
            color: deal.priority === "High" ? "var(--bad)" : deal.priority === "Medium" ? "var(--warn)" : "var(--t1)",
            background: deal.priority === "High" ? "var(--bad-soft)" : deal.priority === "Medium" ? "var(--warn-soft)" : "var(--bg-3)",
          }}
        >
          {deal.priority}
        </span>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Avatar name={deal.company} size="xs" />
        <span className="min-w-0 flex-1 truncate text-xs text-t2">{deal.company}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
        <span className="font-mono text-[15px] font-extrabold text-t0">{deal.value}</span>
        <span className="text-[11.5px] font-semibold" style={{ color: deal.dueColor }}>{deal.due}</span>
      </div>
      {showProb && (
        <div className="mt-2.5">
          <div className="mb-1 flex justify-between">
            <span className="text-[10.5px] font-semibold text-t2">Win probability</span>
            <span className="text-[10.5px] font-bold" style={{ color }}>{deal.prob}%</span>
          </div>
          <ProgressBar value={deal.prob} color={color} height={4} />
        </div>
      )}
    </KanbanCard>
  );
}

export function PipelineBoard({ showProb }: { showProb?: boolean }) {
  return (
    <KanbanBoard>
      {crmPipelineCols.map((col) => (
        <KanbanColumn key={col.stage} title={col.stage} count={col.deals.length} color={col.color}>
          {col.deals.map((d) => (
            <DealCard key={d.name} deal={d} color={col.color} showProb={showProb} />
          ))}
        </KanbanColumn>
      ))}
    </KanbanBoard>
  );
}

export function PipelineStageStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {crmPipelineCols.map((s) => (
        <div key={s.stage} className="relative overflow-hidden rounded-[14px] border border-line bg-bg-2 p-4 shadow-[var(--shadow-vela)]">
          <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: s.color }} />
          <p className="text-[11px] font-bold uppercase tracking-wide text-t2">{s.stage}</p>
          <p className="mt-1 font-mono text-xl font-extrabold" style={{ color: s.color }}>{s.total}</p>
          <p className="mt-0.5 text-[11.5px] text-t2">{s.deals.length} deals</p>
        </div>
      ))}
    </div>
  );
}
