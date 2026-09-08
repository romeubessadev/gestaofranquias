import { Badge, Button, Card, CardTitle, DataTable, PageHeader, ProgressBar, type DataTableColumn } from "@/components/ui";
import { Icon, financeIcons } from "./Icons";
import { expenseCategories, expenseList, expenseSummary, type ExpenseEntry } from "@/data/finance";

const columns: DataTableColumn<ExpenseEntry>[] = [
  {
    key: "name",
    header: "Expense",
    render: (e) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${e.tint} 16%, transparent)`, color: e.tint }}>
          <Icon d={financeIcons[e.icon as keyof typeof financeIcons]} size={15} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{e.name}</p>
          <p className="truncate text-[11px] text-t2">{e.vendor}</p>
        </div>
      </div>
    ),
  },
  { key: "category", header: "Category", render: (e) => <span className="text-t1">{e.category}</span>, hideBelow: "sm" },
  { key: "date", header: "Date", render: (e) => <span className="text-t2">{e.date}</span>, hideBelow: "md" },
  { key: "status", header: "Status", align: "center", render: (e) => <Badge status={e.status}>{e.status}</Badge> },
  { key: "amount", header: "Amount", align: "right", render: (e) => <span className="font-mono font-extrabold text-t0">{e.amount}</span> },
];

export function Expenses() {
  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="$96,180 spent this year · across 5 categories"
        actions={<Button icon={<Icon d={financeIcons.plus} size={14} />}>Add expense</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card padding="lg">
          <CardTitle>Expenses by category</CardTitle>
          <div className="mt-4 flex flex-col gap-4">
            {expenseCategories.map((c) => (
              <div key={c.name}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-t1">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="text-[12.5px] text-t2"><strong className="font-bold text-t0">{c.value}</strong> · {c.pct}%</span>
                </div>
                <ProgressBar value={c.pct} color={c.color} />
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <p className="text-xs font-semibold text-t2">Total this month</p>
          <p className="mt-1.5 text-[28px] font-extrabold text-bad">{expenseSummary.monthTotal}</p>
          <p className="mt-1.5 text-xs text-ok">{expenseSummary.monthDelta}</p>
          <div className="mt-4 flex flex-col gap-2.5">
            <div className="flex justify-between"><span className="text-xs text-t2">Pending approval</span><span className="text-[12.5px] font-bold text-warn">{expenseSummary.pendingApproval}</span></div>
            <div className="flex justify-between"><span className="text-xs text-t2">Reimbursable</span><span className="text-[12.5px] font-bold text-t0">{expenseSummary.reimbursable}</span></div>
            <div className="flex justify-between"><span className="text-xs text-t2">Recurring</span><span className="text-[12.5px] font-bold text-t0">{expenseSummary.recurring}</span></div>
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={expenseList} rowKey={(e) => e.name + e.date} />
      </div>
    </div>
  );
}
