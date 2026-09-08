import { Button, Card, PageHeader } from "@/components/ui";
import { Icon, financeIcons } from "./Icons";
import { financialReports } from "@/data/finance";

export function FinancialReports() {
  return (
    <div>
      <PageHeader
        title="Financial Reports"
        subtitle="Generate and download financial statements"
        actions={<Button icon={<Icon d={financeIcons.plus} size={14} />}>Custom report</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {financialReports.map((r) => (
          <Card key={r.name} className="cursor-pointer transition-colors hover:border-line-2">
            <div className="mb-3.5 flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: `color-mix(in srgb, ${r.tint} 16%, transparent)`, color: r.tint }}>
                <Icon d={financeIcons[r.icon as keyof typeof financeIcons]} size={20} />
              </span>
              <span className="rounded-full bg-bg-inset px-2.5 py-1 text-[10.5px] font-bold text-t2">{r.format}</span>
            </div>
            <p className="text-[15px] font-bold text-t0">{r.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-t2">{r.desc}</p>
            <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
              <span className="text-[11.5px] text-t2">Updated {r.updated}</span>
              <Button variant="outline" size="sm" icon={<Icon d={financeIcons.download} size={12} />}>Download</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
