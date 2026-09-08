import { Badge, Card, CardTitle, PageHeader } from "@/components/ui";
import { Gauge } from "@/components/charts";

const kpiCards = [
  { name: "Quarterly revenue", value: "$1.86M", target: "$2.2M", pct: 84, status: "On track", trend: "↑ 4.2% WoW", trendPositive: true, color: "var(--acc)" },
  { name: "New customers", value: "1,248", target: "1,500", pct: 83, status: "On track", trend: "↑ 8.6% WoW", trendPositive: true, color: "var(--ok)" },
  { name: "Support CSAT", value: "91%", target: "95%", pct: 96, status: "On track", trend: "↑ 1.1% WoW", trendPositive: true, color: "var(--info)" },
  { name: "Churn rate", value: "3.8%", target: "3.0%", pct: 78, status: "At risk", trend: "↑ 0.6% WoW", trendPositive: false, color: "var(--warn)" },
  { name: "Avg deal size", value: "$14,200", target: "$18,000", pct: 79, status: "On track", trend: "↓ 2.0% WoW", trendPositive: false, color: "var(--acc-2)" },
  { name: "Team utilization", value: "68%", target: "85%", pct: 80, status: "Behind", trend: "↓ 3.4% WoW", trendPositive: false, color: "var(--bad)" },
];

export function KpiAnalyticsPage() {
  return (
    <div>
      <PageHeader title="KPI Analytics" subtitle="Targets, attainment and trends" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((k) => (
          <Card key={k.name}>
            <div className="mb-3 flex items-start justify-between gap-2">
              <CardTitle>{k.name}</CardTitle>
              <Badge status={k.status}>{k.status}</Badge>
            </div>
            <div className="flex flex-col items-center gap-2 py-1">
              <Gauge value={k.pct} label={`${k.value} / ${k.target}`} color={k.color} />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11.5px]">
              <span className="text-t2">{k.pct}% of target</span>
              <span className={k.trendPositive ? "font-bold text-ok" : "font-bold text-bad"}>{k.trend}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
