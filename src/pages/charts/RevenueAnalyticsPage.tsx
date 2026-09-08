import { Card, CardHeader, CardTitle, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { DollarSignIcon, RepeatIcon, TrendingUpIcon, UsersIcon } from "./icons";

const kpis = [
  { label: "Total revenue", value: "$1.86M", icon: <DollarSignIcon size={19} />, iconColor: "var(--acc)", iconBg: "var(--acc-soft)", delta: { value: "18.2%", positive: true } },
  { label: "MRR", value: "$284,900", icon: <RepeatIcon size={19} />, iconColor: "var(--ok)", iconBg: "var(--ok-soft)", delta: { value: "6.1%", positive: true } },
  { label: "ARPU", value: "$142", icon: <UsersIcon size={19} />, iconColor: "var(--info)", iconBg: "var(--info-soft)", delta: { value: "2.4%", positive: true } },
  { label: "Churn rate", value: "3.1%", icon: <TrendingUpIcon size={19} />, iconColor: "var(--warn)", iconBg: "var(--warn-soft)", delta: { value: "0.4%", positive: false } },
];

const revenueGrowth = [180, 205, 198, 230, 246, 268, 291, 275, 312, 340, 358, 392];
const revMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const topProducts = [
  { emoji: "📊", name: "Analytics Pro", revenue: "$412,800", pct: 92 },
  { emoji: "🔐", name: "Security Suite", revenue: "$298,140", pct: 74 },
  { emoji: "⚡", name: "Automation Hub", revenue: "$186,520", pct: 56 },
  { emoji: "📱", name: "Mobile Add-on", revenue: "$94,760", pct: 34 },
];

export function RevenueAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Revenue Analytics" subtitle="Growth, breakdown and top products" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} iconColor={k.iconColor} iconBg={k.iconBg} delta={k.delta} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Revenue growth</CardTitle>
          </CardHeader>
          <AreaLineChart data={revenueGrowth} labels={revMonths} height={240} formatValue={(v) => `$${v}k`} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top products</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-4">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-acc-soft text-[17px]">{p.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-[12.5px] font-bold text-t0">{p.name}</span>
                    <span className="shrink-0 text-[12.5px] font-extrabold text-ok">{p.revenue}</span>
                  </div>
                  <ProgressBar value={p.pct} height={5} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
