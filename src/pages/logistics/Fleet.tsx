import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { fleetKpis, fleetVehicles, logisticsStatusVariant } from "@/data/logistics";
import { Icon, ICONS } from "./icons";

export function Fleet() {
  return (
    <div>
      <PageHeader
        title="Fleet Management"
        subtitle="48 vehicles · 42 active · 6 in maintenance"
        actions={<Button size="sm" icon={<Icon path="M12 5v14M5 12h14" size={14} />}>Add vehicle</Button>}
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fleetKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 font-mono text-[22px] font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fleetVehicles.map((v) => (
          <Card key={v.plate}>
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px]"
                style={{ background: v.tintBg, color: v.tint }}
              >
                <Icon path={ICONS.truck} size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14.5px] font-bold text-t0">{v.plate}</p>
                <p className="mt-0.5 truncate text-[11.5px] text-t2">{v.model}</p>
              </div>
              <Badge variant={logisticsStatusVariant(v.status)}>{v.status}</Badge>
            </div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: v.driverBg }}
              >
                {v.driverAv}
              </span>
              <span className="text-[12.5px] text-t1">{v.driver}</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 border-t border-line pt-3.5">
              <div>
                <p className="text-[11px] text-t2">Mileage</p>
                <p className="mt-1 font-mono text-[13px] font-bold text-t0">{v.mileage}</p>
              </div>
              <div>
                <p className="text-[11px] text-t2">Fuel</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-[4px] bg-bg-inset">
                    <div
                      className="h-full rounded-[4px]"
                      style={{ width: `${v.fuel}%`, background: v.fuel < 25 ? "var(--bad)" : "var(--ok)" }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-t0">{v.fuel}%</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
