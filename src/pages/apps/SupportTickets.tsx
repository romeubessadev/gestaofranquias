import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, DataTable, PageHeader, Select, type DataTableColumn } from "@/components/ui";
import { cn } from "@/lib/cn";
import { paths } from "@/router/paths";
import { hdStatusTabs, tickets, type Ticket } from "@/data/apps";
import { DownloadIcon, FilterIcon, PlusIcon, SearchIcon } from "./icons";

const columns: DataTableColumn<Ticket>[] = [
  {
    key: "ticket",
    header: "Ticket",
    render: (t) => (
      <div className="min-w-0 max-w-[320px]">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-t2">{t.id}</span>
          <span className="rounded-md bg-bg-3 px-1.5 py-px text-[11px] font-semibold text-t2">{t.category}</span>
        </div>
        <p className="truncate text-[13.5px] font-bold text-t0">{t.title}</p>
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
  {
    key: "assigned",
    header: "Assigned to",
    hideBelow: "lg",
    render: (t) => (
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={t.assigned} size="xs" />
        <span className="truncate text-[12.5px] text-t1">{t.assigned}</span>
      </div>
    ),
  },
  {
    key: "sla",
    header: "SLA",
    align: "right",
    render: (t) => (
      <div className="text-right">
        <span className={cn("text-[13px] font-bold", t.breached || t.slaUrgent ? "text-bad" : t.status === "Resolved" || t.status === "Closed" ? "text-ok" : "text-t1")}>
          {t.sla}
        </span>
        {t.breached && <div className="text-[10px] font-bold text-bad">SLA BREACHED</div>}
      </div>
    ),
  },
];

export function SupportTickets() {
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Newest first");

  const filtered = useMemo(() => {
    let list = tickets.filter(
      (t) =>
        (statusTab === "All" || t.status === statusTab) &&
        (query.trim() === "" || t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase())),
    );
    if (sort === "Priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      list = [...list].sort((a, b) => order[a.priority] - order[b.priority]);
    } else if (sort === "Assignee") {
      list = [...list].sort((a, b) => a.assigned.localeCompare(b.assigned));
    }
    return list;
  }, [statusTab, query, sort]);

  return (
    <div>
      <PageHeader
        title="Support Tickets"
        subtitle="42 open · 3 SLA breached · updated 2 min ago"
        actions={
          <>
            <div className="flex h-10 items-center gap-2 rounded-[11px] border border-line bg-bg-2 px-3">
              <SearchIcon size={14} className="text-t2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tickets…"
                className="w-32 bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2 sm:w-40"
              />
            </div>
            <Button variant="secondary" icon={<FilterIcon size={14} />}>
              Filter
            </Button>
            <Button variant="secondary" icon={<DownloadIcon size={14} />}>
              Export
            </Button>
            <Button icon={<PlusIcon size={14} />}>New ticket</Button>
          </>
        }
      />

      {/* Filter tabs + sort */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-bg-2 p-[3px]">
          {hdStatusTabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatusTab(t)}
              className={cn(
                "shrink-0 rounded-[9px] px-4 py-1.5 text-[12.5px] font-bold transition-colors",
                statusTab === t ? "bg-acc text-white" : "text-t1 hover:text-t0",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden text-[12.5px] text-t2 sm:inline">Sort by:</span>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="h-9 w-40">
            <option>Newest first</option>
            <option>Priority</option>
            <option>SLA remaining</option>
            <option>Assignee</option>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(t) => t.id}
        onRowClick={(t) => navigate(paths.apps.ticketDetail(t.id))}
        emptyMessage="No tickets match your filters."
      />

      <p className="mt-3 text-[12.5px] text-t2">
        Showing {filtered.length} of {tickets.length} tickets
      </p>
    </div>
  );
}
