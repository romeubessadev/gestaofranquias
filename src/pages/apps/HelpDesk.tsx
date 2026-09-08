import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { cn } from "@/lib/cn";
import { paths } from "@/router/paths";
import { hdKpis, hdStatusTabs, tickets, type Ticket } from "@/data/apps";
import { AlarmIcon, AlertIcon, CheckIcon, FilterIcon, PlusIcon, TicketIcon } from "./icons";

const kpiIcons = [
  { icon: <TicketIcon size={20} />, text: "text-acc", bg: "bg-acc-soft" },
  { icon: <AlarmIcon size={20} />, text: "text-info", bg: "bg-info-soft" },
  { icon: <AlertIcon size={20} />, text: "text-bad", bg: "bg-bad-soft" },
  { icon: <CheckIcon size={20} />, text: "text-ok", bg: "bg-ok-soft" },
];

const columns: DataTableColumn<Ticket>[] = [
  {
    key: "ticket",
    header: "Ticket",
    render: (t) => (
      <div className="min-w-0 max-w-[320px]">
        <p className="truncate text-[13px] font-bold text-t0">{t.title}</p>
        <p className="mt-px text-[11px] text-t2">
          <span className="font-mono">{t.id}</span> · {t.category}
        </p>
      </div>
    ),
  },
  {
    key: "requester",
    header: "Requester",
    hideBelow: "md",
    render: (t) => (
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={t.requester} size="xs" />
        <span className="truncate text-[12.5px] text-t1">{t.requester}</span>
      </div>
    ),
  },
  { key: "priority", header: "Priority", render: (t) => <Badge status={t.priority}>{t.priority}</Badge> },
  { key: "status", header: "Status", align: "center", render: (t) => <Badge status={t.status}>{t.status}</Badge> },
  { key: "assigned", header: "Assigned", hideBelow: "lg", render: (t) => <span className="text-[12.5px] text-t1">{t.assigned}</span> },
  {
    key: "sla",
    header: "SLA",
    align: "right",
    hideBelow: "sm",
    render: (t) => (
      <span className={cn("text-xs font-bold", t.breached || t.slaUrgent ? "text-bad" : t.status === "Resolved" || t.status === "Closed" ? "text-ok" : "text-t1")}>
        {t.sla}
      </span>
    ),
  },
];

export function HelpDesk() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState("All");

  const filtered = useMemo(
    () => tickets.filter((t) => statusTab === "All" || t.status === statusTab),
    [statusTab],
  );

  return (
    <div>
      <PageHeader
        title="Help Desk"
        subtitle="Support tickets, SLA tracking and team queue."
        actions={
          <>
            <Button variant="secondary" icon={<FilterIcon size={15} />}>
              Filter
            </Button>
            <Button icon={<PlusIcon size={15} />}>New ticket</Button>
          </>
        }
      />

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {hdKpis.map((k, i) => (
          <div key={k.label} className="flex items-center gap-3.5 rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <span className={cn("flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl", kpiIcons[i].bg, kpiIcons[i].text)}>
              {kpiIcons[i].icon}
            </span>
            <div>
              <p className="text-[11.5px] font-semibold text-t2">{k.label}</p>
              <p className="mt-0.5 font-mono text-[22px] font-extrabold tracking-tight text-t0">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-t0">All tickets</h3>
        <div className="flex gap-1 overflow-x-auto rounded-[10px] border border-line bg-bg-inset p-[3px]">
          {hdStatusTabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className={cn(
                "shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors",
                statusTab === t ? "bg-acc text-white" : "text-t1 hover:text-t0",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(t) => t.id}
        onRowClick={(t) => navigate(paths.apps.ticketDetail(t.id))}
        emptyMessage="No tickets in this view."
      />
    </div>
  );
}
