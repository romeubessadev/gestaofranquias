import { Avatar, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { Icon, crmIcons } from "./Icons";
import { crmOpportunities, type CrmOpportunity } from "@/data/crm";

const columns: DataTableColumn<CrmOpportunity>[] = [
  {
    key: "name",
    header: "Opportunity",
    render: (o) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-[15px]" style={{ background: `color-mix(in srgb, ${o.tint} 16%, transparent)` }}>
          {o.emoji}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{o.name}</p>
          <p className="truncate text-[11px] text-t2">{o.company}</p>
        </div>
      </div>
    ),
  },
  {
    key: "owner",
    header: "Owner",
    render: (o) => (
      <div className="flex items-center gap-2">
        <Avatar name={o.owner} size="xs" />
        <span className="text-[12.5px] text-t1">{o.owner}</span>
      </div>
    ),
    hideBelow: "md",
  },
  { key: "value", header: "Value", align: "right", render: (o) => <span className="font-mono font-extrabold text-t0">{o.value}</span> },
  { key: "stage", header: "Stage", align: "center", render: (o) => <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: o.probColor, background: `color-mix(in srgb, ${o.probColor} 16%, transparent)` }}>{o.stage}</span>, hideBelow: "sm" },
  { key: "closeDate", header: "Close date", align: "center", render: (o) => <span className="text-t2">{o.closeDate}</span>, hideBelow: "lg" },
  { key: "prob", header: "Prob.", align: "right", render: (o) => <span className="font-mono font-extrabold" style={{ color: o.probColor }}>{o.prob}%</span> },
];

export function Opportunities() {
  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="64 open · $1.24M weighted pipeline"
        actions={<Button icon={<Icon d={crmIcons.plus} size={14} />}>New opportunity</Button>}
      />
      <DataTable columns={columns} data={crmOpportunities} rowKey={(o) => o.name} />
    </div>
  );
}
