import { PageHeader } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { customers, initialsOf, segmentVariant, type EcomCustomer } from "@/data/ecommerce";
import { Badge } from "@/components/ui";

const kpis = [
  { label: "Total customers", value: "3,842", sub: "+124 this month", color: "var(--t0)" },
  { label: "New customers", value: "284", sub: "+18% vs last period", color: "var(--acc)" },
  { label: "Retention rate", value: "87.4%", sub: "+2.1% vs last period", color: "var(--ok)" },
  { label: "Avg. lifetime value", value: "$318", sub: "+$24 vs last quarter", color: "var(--info)" },
];

const segments = [
  { name: "VIP", count: 384, pct: 10, color: "var(--acc)" },
  { name: "Regular", count: 1920, pct: 50, color: "var(--info)" },
  { name: "New", count: 1152, pct: 30, color: "var(--ok)" },
  { name: "At Risk", count: 386, pct: 10, color: "var(--warn)" },
];

const newVsReturning = [120, 145, 138, 162, 158, 180, 195, 188, 210, 205, 228, 240];

export function CustomerAnalytics() {
  const topCustomers = [...customers].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Customer Analytics"
        subtitle="Acquisition, retention and lifetime value insights"
        actions={
          <select className="h-[38px] cursor-pointer rounded-[10px] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mb-0.5 text-2xl font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="text-[11.5px] text-ok">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-t0">New vs returning customers</h3>
            <span className="text-xs text-t2">Last 30 days</span>
          </div>
          <AreaLineChart data={newVsReturning} height={160} formatValue={(v) => `${v} customers`} />
          <div className="mt-2.5 flex gap-5">
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-t1">
              <span className="h-[3px] w-2.5 rounded-sm bg-acc" />
              New (284)
            </span>
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-t1">
              <span className="h-[3px] w-2.5 rounded-sm bg-ok" />
              Returning (1,840)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
          <h3 className="mb-4 text-[15px] font-bold text-t0">Customer segments</h3>
          <div className="flex flex-col gap-3">
            {segments.map((s) => (
              <div key={s.name}>
                <div className="mb-1.5 flex justify-between">
                  <span className="flex items-center gap-2 text-[13px] font-semibold text-t0">
                    <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="text-[12.5px] font-bold text-t0">
                    {s.count} · {s.pct}%
                  </span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-bg-inset">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
        <h3 className="mb-4 text-[15px] font-bold text-t0">Top customers by revenue</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-[10.5px] uppercase tracking-wide text-t2">
                <th className="pb-3 text-left font-bold">Customer</th>
                <th className="pb-3 text-right font-bold">Orders</th>
                <th className="pb-3 text-right font-bold">Total spent</th>
                <th className="pb-3 text-right font-bold">Avg. order</th>
                <th className="pb-3 text-center font-bold">Segment</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c: EcomCustomer) => (
                <tr key={c.id} className="border-b border-line last:border-b-0">
                  <td className="py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold text-white" style={{ background: c.avatarBg }}>
                        {initialsOf(c.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-t0">{c.name}</p>
                        <p className="truncate text-[11px] text-t2">{c.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-[13px] font-bold text-t0">{c.ordersCount}</td>
                  <td className="py-3 text-right font-mono text-[13.5px] font-extrabold text-ok">${c.totalSpent.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-[13px] font-bold text-t0">${c.avgOrder}</td>
                  <td className="py-3 text-center">
                    <Badge variant={segmentVariant(c.segment)}>{c.segment}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
