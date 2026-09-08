import { Badge, Button, Card, CardTitle, DataTable, PageHeader, ProgressBar, type DataTableColumn } from "@/components/ui";
import { AreaLineChart, DonutChart } from "@/components/charts";
import { paths } from "@/router/paths";
import { Link } from "react-router-dom";
import { Icon, financeIcons } from "./Icons";
import {
  financeBudgets,
  financeCashFlow,
  financeChartMonths,
  financeExpenseBreakdown,
  financeExpenseMonthly,
  financeKpis,
  financeRevenueMonthly,
  transactions,
  type Transaction,
} from "@/data/finance";

const txColumns: DataTableColumn<Transaction>[] = [
  {
    key: "name",
    header: "Transaction",
    render: (t) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `color-mix(in srgb, ${t.tint} 16%, transparent)`, color: t.tint }}>
          <Icon d={financeIcons[t.icon as keyof typeof financeIcons]} size={15} />
        </span>
        <span className="truncate text-[13px] font-bold text-t0">{t.name}</span>
      </div>
    ),
  },
  { key: "category", header: "Category", render: (t) => <Badge status={t.category === "Client payment" ? "info" : "neutral"}>{t.category}</Badge>, hideBelow: "sm" },
  { key: "date", header: "Date", render: (t) => <span className="text-t2">{t.date}</span>, hideBelow: "md" },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (t) => (
      <span className={`font-mono font-extrabold ${t.type === "Income" ? "text-ok" : "text-bad"}`}>{t.amount}</span>
    ),
  },
];

export function FinanceDashboard() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards", to: paths.dashboards.analytics }, { label: "Finance" }]}
        title="Finance overview"
        subtitle="Revenue, expenses and cash position — Year to date 2026."
        actions={
          <>
            <Button variant="secondary" icon={<Icon d={financeIcons.calendar} size={15} />}>Jan – Jun 2026</Button>
            <Button variant="secondary" icon={<Icon d={financeIcons.download} size={15} />}>Export</Button>
            <Link to={paths.finance.invoiceNew}>
              <Button icon={<Icon d={financeIcons.file} size={15} />}>New Invoice</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {financeKpis.map((k) => (
          <Card key={k.label}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px]" style={{ background: `color-mix(in srgb, ${k.tint} 16%, transparent)`, color: k.tint }}>
                <Icon d={financeIcons[k.icon as keyof typeof financeIcons]} size={20} />
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${k.positive ? "text-ok bg-ok-soft" : "text-bad bg-bad-soft"}`}>
                {k.positive ? "↗" : "↘"} {k.delta}
              </span>
            </div>
            <p className="mt-3.5 text-xs font-bold uppercase tracking-wide text-t1">{k.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-t0">{k.value}</p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {financeCashFlow.map((c) => (
          <Card key={c.label} className="flex items-center gap-4">
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px]" style={{ background: `color-mix(in srgb, ${c.tint} 16%, transparent)`, color: c.tint }}>
              <Icon d={financeIcons[c.icon as keyof typeof financeIcons]} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-t2">{c.label}</p>
              <p className="mt-1 truncate text-xl font-extrabold" style={{ color: c.valueColor }}>{c.value}</p>
              <p className="text-[11.5px] text-t2">{c.sub}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.65fr_1fr]">
        <Card padding="lg">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Revenue vs expenses</CardTitle>
              <div className="mt-2.5 flex flex-wrap gap-5">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1"><span className="h-2.5 w-2.5 rounded-[3px] bg-acc" />Revenue</span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">$248.4k</p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1"><span className="h-2.5 w-2.5 rounded-[3px] bg-bad" />Expenses</span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-t0">$96.2k</p>
                </div>
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-t1"><span className="h-2.5 w-2.5 rounded-[3px] bg-ok" />Net profit</span>
                  <p className="mt-0.5 font-mono text-base font-extrabold text-ok">$152.2k</p>
                </div>
              </div>
            </div>
            <Badge variant="success">+18% vs last year</Badge>
          </div>
          <div className="relative">
            <AreaLineChart data={financeRevenueMonthly} labels={financeChartMonths} color="var(--acc)" formatValue={(v) => `$${v.toFixed(1)}k`} />
            <div className="pointer-events-none absolute inset-0">
              <AreaLineChart data={financeExpenseMonthly} labels={financeChartMonths} color="var(--bad)" showArea={false} formatValue={(v) => `$${v.toFixed(1)}k`} />
            </div>
          </div>
          <div className="mt-2 flex justify-between px-1">
            {financeChartMonths.map((m) => (
              <span key={m} className="text-[11px] font-semibold text-t2">{m}</span>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="flex flex-col">
          <div className="mb-1 flex items-center justify-between">
            <CardTitle>Expense breakdown</CardTitle>
            <span className="text-xs font-semibold text-t2">Jun 2026</span>
          </div>
          <p className="mb-2 text-[12.5px] text-t2">Where your money is going</p>
          <div className="mx-auto my-2">
            <DonutChart
              segments={financeExpenseBreakdown.map((d) => ({ label: d.name, value: d.pct, color: d.color }))}
              centerValue="$96k"
              centerLabel="Total"
            />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {financeExpenseBreakdown.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
                <span className="flex-1 text-[12.5px] font-semibold text-t1">{d.name}</span>
                <span className="font-mono text-[12.5px] font-bold text-t0">{d.value}</span>
                <span className="min-w-[32px] text-right text-[11.5px] font-semibold text-t2">{d.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.7fr]">
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Budget usage</CardTitle>
            <Badge variant="warning">2 over 80%</Badge>
          </div>
          <div className="flex flex-col gap-4">
            {financeBudgets.map((b) => (
              <div key={b.name}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-t1">{b.name}</span>
                  <div className="flex items-center gap-2">
                    {b.alert && <Icon d={financeIcons.alertTriangle} size={13} />}
                    <span className="text-xs text-t2"><strong className="font-bold text-t0">{b.spent}</strong> / {b.total}</span>
                  </div>
                </div>
                <ProgressBar value={b.pct} color={b.color} />
                <span className="mt-1 block text-[11px] font-semibold text-t2">{b.pct}% used · {b.remaining} remaining</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Recent transactions</CardTitle>
            <Link to={paths.finance.transactions} className="text-[12.5px] font-bold text-acc hover:underline">View all</Link>
          </div>
          <DataTable columns={txColumns} data={transactions.slice(0, 6)} rowKey={(t) => t.id} />
        </Card>
      </div>
    </div>
  );
}
