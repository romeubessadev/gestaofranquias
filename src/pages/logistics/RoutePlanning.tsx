import { Badge, Button, Card, CardTitle, PageHeader } from "@/components/ui";
import { MapPins } from "@/components/charts";
import { routeStops } from "@/data/logistics";
import { Icon } from "./icons";

const pins = [
  { x: 12, y: 88, color: "var(--ok)", label: "S" },
  { x: 26, y: 68, color: "var(--acc)" },
  { x: 22, y: 45, color: "var(--acc)" },
  { x: 44, y: 40, color: "var(--acc)" },
  { x: 58, y: 55, color: "var(--acc)" },
  { x: 76, y: 36, color: "var(--acc)" },
  { x: 86, y: 18, color: "var(--warn)", label: "E" },
];

export function RoutePlanning() {
  return (
    <div>
      <PageHeader
        title="Route Planning"
        subtitle="Optimized delivery routes · today"
        actions={<Button size="sm" icon={<Icon path="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20" size={14} />}>Optimize routes</Button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card padding="sm">
          <MapPins pins={pins} route={pins} height={440} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <div className="mb-3.5 flex items-center justify-between">
              <CardTitle>Route R-24</CardTitle>
              <Badge variant="success">Optimized</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <p className="text-base font-extrabold text-t0">42 km</p>
                <p className="mt-0.5 text-[11px] text-t2">Distance</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-t0">2h 15m</p>
                <p className="mt-0.5 text-[11px] text-t2">Est. time</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-ok">−18%</p>
                <p className="mt-0.5 text-[11px] text-t2">Fuel saved</p>
              </div>
            </div>
          </Card>

          <Card className="flex-1">
            <CardTitle className="mb-3.5">Stops · {routeStops.length}</CardTitle>
            <div className="relative">
              <span className="absolute bottom-1.5 left-[13px] top-1.5 w-px bg-line" />
              <div className="flex flex-col gap-3.5">
                {routeStops.map((s) => (
                  <div key={s.num} className="relative flex gap-3">
                    <span
                      className="z-[1] flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[2.5px] text-[10px] font-extrabold"
                      style={{ background: s.tintBg, color: s.tint, borderColor: "var(--bg-2)" }}
                    >
                      {s.num}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12.5px] font-bold text-t0">{s.address}</p>
                        <span className="shrink-0 text-[11px] font-bold" style={{ color: s.statusColor }}>
                          {s.time}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-t2">{s.packages} packages</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
