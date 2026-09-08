import { Button, Card, PageHeader, ProgressBar } from "@/components/ui";
import { Icon, financeIcons } from "./Icons";
import { budgetCards } from "@/data/finance";

export function Budget() {
  return (
    <div>
      <PageHeader
        title="Budget Management"
        subtitle="$164k allocated · $126k spent · 77% used"
        actions={<Button icon={<Icon d={financeIcons.plus} size={14} />}>New budget</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {budgetCards.map((b) => (
          <Card key={b.name}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px]" style={{ background: `color-mix(in srgb, ${b.color} 16%, transparent)`, color: b.color }}>
                <Icon d={financeIcons[b.icon as keyof typeof financeIcons]} size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-t0">{b.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{b.period}</p>
              </div>
              {b.alert && <span className="text-warn"><Icon d={financeIcons.alertTriangle} size={16} /></span>}
            </div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-mono text-xl font-extrabold text-t0">{b.spent}</span>
              <span className="text-[12.5px] text-t2">of {b.total}</span>
            </div>
            <ProgressBar value={b.pct} color={b.color} height={9} />
            <div className="mt-2 flex justify-between">
              <span className="text-[11.5px] font-bold" style={{ color: b.color }}>{b.pct}% used</span>
              <span className="text-[11.5px] text-t2">{b.remaining} left</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
