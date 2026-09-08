import { Card, CardHeader, CardTitle, CardSubtitle, PageHeader } from "@/components/ui";
import { AreaLineChart, BarChart } from "@/components/charts";
import { RadialProgress } from "@/components/ui";

const monthlyActiveUsers = [8200, 9100, 8800, 10400, 11200, 10800, 12600, 13400, 12900, 14800, 15600, 16900];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const revenueByQuarter = [
  { label: "Q1", value: 184 },
  { label: "Q2", value: 212 },
  { label: "Q3", value: 198 },
  { label: "Q4", value: 261 },
  { label: "Q1'27", value: 289 },
  { label: "Q2'27", value: 305 },
];

const conversionTrend = [3.1, 4.2, 3.6, 5.8, 4.9, 6.7];

const radialSeries = [
  { label: "Desktop", value: 75, color: "var(--acc)" },
  { label: "Mobile", value: 65, color: "var(--ok)" },
  { label: "Tablet", value: 60, color: "var(--warn)" },
];

export function ApexChartsPage() {
  return (
    <div>
      <PageHeader title="Apex Charts" subtitle="Area, bar, radial and mixed chart types" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Area chart</CardTitle>
              <CardSubtitle>Monthly active users</CardSubtitle>
            </div>
          </CardHeader>
          <AreaLineChart data={monthlyActiveUsers} labels={monthLabels} height={220} formatValue={(v) => v.toLocaleString()} />
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Column chart</CardTitle>
              <CardSubtitle>Revenue by quarter</CardSubtitle>
            </div>
          </CardHeader>
          <BarChart data={revenueByQuarter} height={220} formatValue={(v) => `$${v}k`} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Radial bars</CardTitle>
          </CardHeader>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {radialSeries.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <RadialProgress value={s.value} size={110} color={s.color} />
                <span className="text-[12.5px] font-semibold text-t1">{s.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Line + markers</CardTitle>
              <CardSubtitle>Conversion trend</CardSubtitle>
            </div>
          </CardHeader>
          <AreaLineChart data={conversionTrend} labels={monthLabels.slice(0, 6)} height={220} color="var(--info)" showArea={false} formatValue={(v) => `${v}%`} />
        </Card>
      </div>
    </div>
  );
}
