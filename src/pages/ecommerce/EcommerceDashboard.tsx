import { Link } from "react-router-dom";
import { Badge, Button, PageHeader, StatCard } from "@/components/ui";
import { BarChart } from "@/components/charts";
import { paths } from "@/router/paths";
import { orders, dashboardTopProducts, categories } from "@/data/ecommerce";
import { IconCart, IconDollar, IconPackage, IconUsers, IconPlus } from "./icons";

const weeklyBars = [
  { label: "Mon", value: 9200 },
  { label: "Tue", value: 11400 },
  { label: "Wed", value: 8600 },
  { label: "Thu", value: 13800 },
  { label: "Fri", value: 16200 },
  { label: "Sat", value: 12100 },
  { label: "Sun", value: 6500 },
];

const fulfilment = [
  { name: "Delivered", count: 512, pct: 64, color: "var(--ok)" },
  { name: "Shipped", count: 168, pct: 21, color: "var(--info)" },
  { name: "Processing", count: 88, pct: 11, color: "var(--acc)" },
  { name: "Pending", count: 36, pct: 4, color: "var(--warn)" },
];

const CATEGORY_COLORS = ["var(--acc)", "var(--info)", "var(--ok)", "var(--warn)"];

const miniStats = [
  { icon: <IconPackage />, tint: "var(--acc)", tintBg: "var(--acc-soft)", value: "248", label: "Products", sub: "12 low stock" },
  { icon: <IconUsers />, tint: "var(--info)", tintBg: "var(--info-soft)", value: "3,842", label: "Customers", sub: "+124 new" },
  { icon: <IconCart />, tint: "var(--ok)", tintBg: "var(--ok-soft)", value: "$305", label: "Avg order", sub: "+4.2%" },
  { icon: <IconDollar />, tint: "var(--warn)", tintBg: "var(--warn-soft)", value: "2.4%", label: "Cart abandon", sub: "-0.6%" },
];

export function EcommerceDashboard() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards" }, { label: "Ecommerce" }]}
        title="Ecommerce overview"
        subtitle="Sales, fulfilment and product performance this week."
        actions={
          <Link to={paths.ecommerce.productNew}>
            <Button icon={<IconPlus />}>Add product</Button>
          </Link>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue this week" value="$77,800" icon={<IconDollar />} delta={{ value: "+14%", positive: true }} />
        <StatCard label="Orders" value="804" icon={<IconCart />} iconColor="var(--info)" iconBg="var(--info-soft)" delta={{ value: "+9.2%", positive: true }} />
        <StatCard label="New customers" value="284" icon={<IconUsers />} iconColor="var(--ok)" iconBg="var(--ok-soft)" delta={{ value: "+6.1%", positive: true }} />
        <StatCard label="Products sold" value="1,940" icon={<IconPackage />} iconColor="var(--warn)" iconBg="var(--warn-soft)" delta={{ value: "-2.4%", positive: false }} />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-t0">Sales this week</h3>
              <p className="mt-1.5 text-2xl font-extrabold text-t0">$77,800</p>
            </div>
            <Badge variant="success">+14% vs last week</Badge>
          </div>
          <BarChart data={weeklyBars} height={200} formatValue={(v) => `$${(v / 1000).toFixed(1)}k`} />
        </div>

        <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
          <h3 className="text-base font-bold text-t0">Order fulfilment</h3>
          <p className="mt-1 text-[12.5px] text-t2">804 orders this week</p>
          <div className="my-5 flex h-3.5 overflow-hidden rounded-lg">
            {fulfilment.map((f) => (
              <div key={f.name} style={{ width: `${f.pct}%`, background: f.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-3.5">
            {fulfilment.map((f) => (
              <div key={f.name} className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: f.color }} />
                <span className="flex-1 text-[13px] font-semibold text-t1">{f.name}</span>
                <span className="text-[13px] font-bold text-t0">{f.count}</span>
                <span className="w-9 text-right text-xs text-t2">{f.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {miniStats.map((m) => (
          <div key={m.label} className="flex items-center gap-3.5 rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-4 shadow-[var(--shadow-vela)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: m.tintBg, color: m.tint }}>
              {m.icon}
            </span>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-t0">{m.value}</p>
              <p className="mt-0.5 truncate text-[11.5px] font-semibold text-t2">
                {m.label} · {m.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.7fr]">
        <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
          <h3 className="mb-5 text-base font-bold text-t0">Sales by category</h3>
          <div className="flex flex-col gap-4">
            {categories.slice(0, 4).map((c, i) => {
              const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
              return (
                <div key={c.id}>
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="flex items-center gap-2 text-[13.5px] font-semibold text-t1">
                      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
                      {c.name}
                    </span>
                    <span className="text-[13px] font-bold text-t0">{c.revenue}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-inset">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-t0">Top selling products</h3>
            <Link to={paths.ecommerce.productList} className="text-[12.5px] font-bold text-acc hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                  <th className="px-1 pb-3 text-left font-bold">#</th>
                  <th className="px-1 pb-3 text-left font-bold">Product</th>
                  <th className="px-1 pb-3 text-right font-bold">Sales</th>
                  <th className="px-1 pb-3 text-right font-bold">Revenue</th>
                  <th className="px-1 pb-3 text-right font-bold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {dashboardTopProducts.map((p) => (
                  <tr key={p.rank} className="border-b border-line last:border-b-0">
                    <td className="px-1 py-3 text-center text-[13px] font-extrabold text-t2">{p.rank}</td>
                    <td className="px-1 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-[13px] font-extrabold" style={{ background: p.tintBg, color: p.tint }}>
                          {p.mono}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-t0">{p.name}</p>
                          <p className="text-[11px] text-t2">{p.cat}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{p.sales}</td>
                    <td className="px-1 py-3 text-right font-mono text-[13px] font-bold text-t0">{p.revenue}</td>
                    <td className="px-1 py-3 text-right text-xs font-bold" style={{ color: p.trendColor }}>
                      {p.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-t0">Recent orders</h3>
          <Link to={paths.ecommerce.ordersList} className="text-[12.5px] font-bold text-acc hover:underline">
            View all orders
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-t2">
                <th className="px-1 pb-3 text-left font-bold">Order</th>
                <th className="px-1 pb-3 text-left font-bold">Customer</th>
                <th className="px-1 pb-3 text-left font-bold">Date</th>
                <th className="px-1 pb-3 text-left font-bold">Items</th>
                <th className="px-1 pb-3 text-right font-bold">Total</th>
                <th className="px-1 pb-3 text-right font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 4).map((o) => (
                <tr key={o.id} className="border-b border-line last:border-b-0">
                  <td className="px-1 py-3.5 font-mono text-[12.5px] font-bold text-t1">{o.id}</td>
                  <td className="px-1 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: o.avatarBg }}>
                        {o.customerName.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <span className="truncate text-[13.5px] font-bold text-t0">{o.customerName}</span>
                    </div>
                  </td>
                  <td className="px-1 py-3.5 text-[13px] text-t1">{o.date}</td>
                  <td className="px-1 py-3.5 text-[13px] font-semibold text-t1">{o.itemCount}</td>
                  <td className="px-1 py-3.5 text-right font-mono text-[13px] font-bold text-t0">${o.total.toFixed(2)}</td>
                  <td className="px-1 py-3.5 text-right">
                    <Badge status={o.status}>{o.status}</Badge>
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
