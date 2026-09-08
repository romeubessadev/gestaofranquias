import { Card, CardHeader, CardTitle, PageHeader, ProgressBar, StatCard } from "@/components/ui";
import { DollarSignIcon, UsersIcon, CartIcon, TrendingUpIcon } from "./icons";

const statCards = [
  {
    label: "Total revenue",
    value: "$284,920",
    icon: <DollarSignIcon size={20} />,
    iconColor: "var(--acc)",
    iconBg: "var(--acc-soft)",
    delta: { value: "12.8%", positive: true },
    spark: [12, 15, 13, 18, 16, 21, 24, 22, 27, 30, 28, 34],
  },
  {
    label: "Active users",
    value: "48,204",
    icon: <UsersIcon size={20} />,
    iconColor: "var(--ok)",
    iconBg: "var(--ok-soft)",
    delta: { value: "6.4%", positive: true },
    spark: [30, 28, 32, 29, 34, 31, 36, 38, 35, 40, 42, 44],
  },
  {
    label: "Total orders",
    value: "12,847",
    icon: <CartIcon size={20} />,
    iconColor: "var(--warn)",
    iconBg: "var(--warn-soft)",
    delta: { value: "2.1%", positive: false },
    spark: [40, 38, 41, 37, 35, 36, 33, 34, 31, 30, 29, 28],
  },
  {
    label: "Conversion rate",
    value: "4.62%",
    icon: <TrendingUpIcon size={20} />,
    iconColor: "var(--info)",
    iconBg: "var(--info-soft)",
    delta: { value: "0.8%", positive: true },
    spark: [10, 12, 11, 14, 13, 16, 15, 18, 17, 19, 21, 23],
  },
];

const statBars = [
  { name: "Customer satisfaction", value: "92%", pct: 92, color: "var(--acc)" },
  { name: "On-time delivery", value: "87%", pct: 87, color: "var(--ok)" },
  { name: "Support response time", value: "74%", pct: 74, color: "var(--warn)" },
  { name: "Feature adoption", value: "63%", pct: 63, color: "var(--info)" },
  { name: "Churn recovery", value: "41%", pct: 41, color: "var(--bad)" },
];

function sparklinePoints(data: number[]) {
  const width = 120;
  const height = 30;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function StatisticsPage() {
  return (
    <div>
      <PageHeader title="Statistics" subtitle="Key metrics at a glance" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statCards.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconColor={s.iconColor}
            iconBg={s.iconBg}
            delta={s.delta}
            sparkline={
              <svg viewBox="0 0 120 30" preserveAspectRatio="none" className="h-full w-full">
                <polyline points={sparklinePoints(s.spark)} fill="none" stroke={s.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance breakdown</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          {statBars.map((b) => (
            <ProgressBar key={b.name} label={b.name} value={b.pct} color={b.color} />
          ))}
        </div>
      </Card>
    </div>
  );
}
