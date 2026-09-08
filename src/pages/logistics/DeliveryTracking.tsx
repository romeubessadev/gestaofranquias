import { Card, PageHeader, ProgressBar } from "@/components/ui";
import { MapPins } from "@/components/charts";
import { activeDeliveries, logisticsStatusVariant } from "@/data/logistics";
import { Badge } from "@/components/ui";
import { Icon, ICONS } from "./icons";

const pins = [
  { x: 12, y: 80, color: "var(--ok)", label: "Origin" },
  { x: 50, y: 60, color: "var(--acc)" },
  { x: 88, y: 22, color: "var(--warn)", label: "Destination" },
  { x: 36, y: 40, color: "var(--info)" },
  { x: 68, y: 72, color: "var(--info)" },
  { x: 24, y: 22, color: "var(--info)" },
];
const route = [
  { x: 12, y: 80 },
  { x: 32, y: 50 },
  { x: 50, y: 60 },
  { x: 70, y: 40 },
  { x: 88, y: 22 },
];

export function DeliveryTracking() {
  return (
    <div>
      <PageHeader title="Delivery Tracking" subtitle="Live view · 412 active deliveries" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card padding="sm" className="relative">
          <MapPins pins={pins} route={route} height={420} />
          <div className="absolute left-6 top-6 rounded-[10px] border border-line bg-bg-2 px-3 py-2">
            <p className="text-[11px] text-t2">Live tracking</p>
            <p className="mt-0.5 text-sm font-extrabold text-ok">412 active</p>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          {activeDeliveries.map((d) => (
            <Card key={d.id} padding="sm">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-acc">{d.id}</span>
                <Badge variant={logisticsStatusVariant(d.status)}>{d.status}</Badge>
              </div>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span
                  className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]"
                  style={{ background: d.tintBg, color: d.tint }}
                >
                  <Icon path={ICONS.truck} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-bold text-t0">{d.driver}</p>
                  <p className="truncate text-[11px] text-t2">{d.vehicle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1">
                  <ProgressBar value={d.progress} color={d.tint} height={6} />
                </div>
                <span className="text-[11px] font-bold" style={{ color: d.tint }}>
                  {d.progress}%
                </span>
              </div>
              <p className="mt-2 text-[11px] text-t2">
                {d.stops} stops · ETA {d.eta}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
