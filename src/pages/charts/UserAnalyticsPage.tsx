import { Card, CardHeader, CardTitle, PageHeader, StatCard } from "@/components/ui";
import { DonutChart } from "@/components/charts";
import { ActivityIcon, ClockIcon, EyeIcon, PercentIcon } from "./icons";

const kpis = [
  { label: "Daily active users", value: "18,420", icon: <ActivityIcon size={19} />, iconColor: "var(--acc)", iconBg: "var(--acc-soft)", delta: { value: "9.3%", positive: true } },
  { label: "Avg. session length", value: "6m 42s", icon: <ClockIcon size={19} />, iconColor: "var(--ok)", iconBg: "var(--ok-soft)", delta: { value: "1.1%", positive: true } },
  { label: "Retention (30-day)", value: "64%", icon: <EyeIcon size={19} />, iconColor: "var(--info)", iconBg: "var(--info-soft)", delta: { value: "2.6%", positive: true } },
  { label: "Bounce rate", value: "28.4%", icon: <PercentIcon size={19} />, iconColor: "var(--bad)", iconBg: "var(--bad-soft)", delta: { value: "1.8%", positive: false } },
];

const deviceTraffic = [
  { label: "Desktop", value: 54, color: "var(--acc)" },
  { label: "Mobile", value: 37, color: "var(--ok)" },
  { label: "Tablet", value: 9, color: "var(--warn)" },
];

const topCountries = [
  { flag: "🇺🇸", name: "United States", users: "18,240", pct: 38 },
  { flag: "🇬🇧", name: "United Kingdom", users: "7,120", pct: 15 },
  { flag: "🇩🇪", name: "Germany", users: "5,640", pct: 12 },
  { flag: "🇮🇳", name: "India", users: "4,980", pct: 10 },
  { flag: "🇯🇵", name: "Japan", users: "3,210", pct: 7 },
];

export function UserAnalyticsPage() {
  return (
    <div>
      <PageHeader title="User Analytics" subtitle="Engagement, retention and demographics" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} iconColor={k.iconColor} iconBg={k.iconBg} delta={k.delta} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Traffic by device</CardTitle>
          </CardHeader>
          <DonutChart segments={deviceTraffic} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top countries</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3.5">
            {topCountries.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-xl">{c.flag}</span>
                <span className="flex-1 text-[13px] font-semibold text-t0">{c.name}</span>
                <span className="text-[12.5px] text-t2">{c.users}</span>
                <span className="w-11 text-right text-[12.5px] font-bold text-t0">{c.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
