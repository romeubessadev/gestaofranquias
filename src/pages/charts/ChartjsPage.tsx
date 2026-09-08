import { Card, CardHeader, CardTitle, PageHeader } from "@/components/ui";
import { DonutChart, StackedBarChart } from "@/components/charts";

const revenueMix = [
  { label: "Product sales", value: 148, color: "var(--acc)" },
  { label: "Subscriptions", value: 62, color: "var(--ok)" },
  { label: "Services", value: 24, color: "var(--warn)" },
  { label: "Other", value: 14, color: "var(--info)" },
];

const stackedWeekly = [
  { label: "Mon", desktop: 42, mobile: 28, tablet: 10 },
  { label: "Tue", desktop: 48, mobile: 31, tablet: 12 },
  { label: "Wed", desktop: 40, mobile: 35, tablet: 9 },
  { label: "Thu", desktop: 52, mobile: 30, tablet: 14 },
  { label: "Fri", desktop: 46, mobile: 38, tablet: 11 },
];

const trafficSources = [
  { label: "Organic search", value: 38, color: "var(--acc)" },
  { label: "Direct", value: 24, color: "var(--ok)" },
  { label: "Social", value: 19, color: "var(--warn)" },
  { label: "Referral", value: 12, color: "var(--info)" },
  { label: "Email", value: 7, color: "var(--acc-2)" },
];

export function ChartjsPage() {
  return (
    <div>
      <PageHeader title="Chart.js Charts" subtitle="Doughnut, stacked bar and category distribution" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Doughnut</CardTitle>
          </CardHeader>
          <DonutChart segments={revenueMix} centerValue="$248k" centerLabel="Total" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stacked bar</CardTitle>
          </CardHeader>
          <StackedBarChart
            data={stackedWeekly}
            keys={["desktop", "mobile", "tablet"]}
            colors={["var(--acc)", "var(--ok)", "var(--warn)"]}
            height={200}
          />
          <div className="mt-4 flex items-center gap-4 text-[11.5px] text-t1">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-acc" />Desktop</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-ok" />Mobile</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-warn" />Tablet</span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category mix</CardTitle>
          </CardHeader>
          <DonutChart segments={trafficSources} centerValue="100%" centerLabel="Traffic" thickness={18} />
        </Card>
      </div>
    </div>
  );
}
