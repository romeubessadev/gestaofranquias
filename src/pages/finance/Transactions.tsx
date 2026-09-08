import { useState } from "react";
import { Badge, Button, Card, DataTable, Input, PageHeader, Pagination, Select, type DataTableColumn } from "@/components/ui";
import { Icon, financeIcons } from "./Icons";
import { transactions, transactionsKpis, type Transaction } from "@/data/finance";

const columns: DataTableColumn<Transaction>[] = [
  { key: "id", header: "ID", render: (t) => <span className="font-mono text-t2">{t.id}</span> },
  {
    key: "name",
    header: "Description",
    render: (t) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${t.tint} 16%, transparent)`, color: t.tint }}>
          <Icon d={financeIcons[t.icon as keyof typeof financeIcons]} size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{t.name}</p>
          <p className="truncate text-[11px] text-t2">{t.method}</p>
        </div>
      </div>
    ),
  },
  { key: "date", header: "Date", render: (t) => <span className="text-t2">{t.date}</span>, hideBelow: "md" },
  { key: "status", header: "Status", align: "center", render: (t) => <Badge status={t.status}>{t.status}</Badge>, hideBelow: "sm" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (t) => <span className={`font-mono font-extrabold ${t.type === "Income" ? "text-ok" : "text-bad"}`}>{t.amount}</span>,
  },
];

export function Transactions() {
  const [page, setPage] = useState(1);

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="8,428 transactions · $2.4M processed"
        actions={
          <>
            <div className="w-40"><Input placeholder="Search…" /></div>
            <div className="w-36">
              <Select>
                <option>All types</option>
                <option>Income</option>
                <option>Expense</option>
                <option>Refund</option>
              </Select>
            </div>
            <Button variant="secondary" icon={<Icon d={financeIcons.download} size={14} />}>Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {transactionsKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 font-mono text-[22px] font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={transactions} rowKey={(t) => t.id} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12.5px] text-t2">Showing {transactions.length} of 8,428</span>
        <Pagination page={page} totalPages={843} onChange={setPage} />
      </div>
    </div>
  );
}
