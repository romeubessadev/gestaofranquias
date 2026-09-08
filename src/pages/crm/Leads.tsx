import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Card, DataTable, Input, PageHeader, Select, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { Icon, crmIcons } from "./Icons";
import { crmLeadKpis, crmLeads, type CrmLead } from "@/data/crm";

function scoreColor(score: number) {
  return score >= 80 ? "var(--ok)" : score >= 60 ? "var(--warn)" : "var(--bad)";
}

const columns: DataTableColumn<CrmLead>[] = [
  {
    key: "name",
    header: "Lead",
    render: (l) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={l.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{l.name}</p>
          <p className="truncate text-[11px] text-t2">{l.email}</p>
        </div>
      </div>
    ),
  },
  { key: "company", header: "Company", render: (l) => <span className="text-t1">{l.company}</span>, hideBelow: "md" },
  { key: "source", header: "Source", render: (l) => <Badge status={l.source === "Website" ? "info" : "neutral"}>{l.source}</Badge>, hideBelow: "lg" },
  {
    key: "score",
    header: "Score",
    align: "center",
    render: (l) => (
      <div className="flex items-center justify-center gap-2">
        <span className="h-1.5 w-9 overflow-hidden rounded-full bg-bg-inset">
          <span className="block h-full rounded-full" style={{ width: `${l.score}%`, background: scoreColor(l.score) }} />
        </span>
        <span className="text-[11.5px] font-bold" style={{ color: scoreColor(l.score) }}>{l.score}</span>
      </div>
    ),
    hideBelow: "sm",
  },
  { key: "status", header: "Status", align: "center", render: (l) => <Badge status={l.status}>{l.status}</Badge> },
  { key: "value", header: "Value", align: "right", render: (l) => <span className="font-mono font-extrabold text-ok">{l.value}</span> },
];

export function Leads() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="428 leads · 62 new this week"
        actions={
          <>
            <div className="w-40"><Input placeholder="Search leads…" /></div>
            <div className="w-36">
              <Select>
                <option>All sources</option>
                <option>Website</option>
                <option>Referral</option>
                <option>Cold outreach</option>
              </Select>
            </div>
            <Button icon={<Icon d={crmIcons.plus} size={14} />}>New lead</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {crmLeadKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 font-mono text-[22px] font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={crmLeads} rowKey={(l) => l.id} onRowClick={(l) => navigate(paths.crm.leadDetail(l.id))} />
      </div>
    </div>
  );
}
