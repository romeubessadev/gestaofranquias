import { Card, CardHeader, CardSubtitle, CardTitle, PageHeader } from "@/components/ui";
import { Heatmap } from "@/components/charts";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];

// Deterministic pseudo-random activity matrix so the demo looks realistic without a fixtures file.
function buildMatrix() {
  const seedRow = [2, 1, 1, 3, 8, 14, 22, 26, 19, 24, 17, 6];
  return days.map((_, di) =>
    hours.map((_, hi) => {
      const weekendDampen = di >= 5 ? 0.55 : 1;
      const wiggle = ((di * 7 + hi * 3) % 5) - 2;
      return Math.max(0, Math.round((seedRow[hi] + wiggle) * weekendDampen));
    }),
  );
}

const data = buildMatrix();
const legendSteps = [0.08, 0.28, 0.48, 0.68, 1];

export function HeatmapsPage() {
  return (
    <div>
      <PageHeader title="Heatmaps" subtitle="Activity density by hour and day" />
      <Card padding="lg">
        <CardHeader>
          <div>
            <CardTitle>Weekly activity</CardTitle>
            <CardSubtitle>Sessions started, by day and hour</CardSubtitle>
          </div>
        </CardHeader>
        <Heatmap rows={days} cols={hours} data={data} />
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-[11px] text-t2">Less</span>
          {legendSteps.map((alpha) => (
            <div key={alpha} className="h-4 w-4 rounded-[4px]" style={{ background: `rgba(124,92,255,${alpha})` }} />
          ))}
          <span className="text-[11px] text-t2">More</span>
        </div>
      </Card>
    </div>
  );
}
