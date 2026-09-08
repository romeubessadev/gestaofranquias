import { Card, CardTitle, PageHeader } from "@/components/ui";
import { logWarehouses, warehouseZones } from "@/data/logistics";

export function Warehouse() {
  return (
    <div>
      <PageHeader
        title="Warehouse Management"
        subtitle="3 warehouses · 68% avg utilization"
        actions={
          <select className="h-[38px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none">
            <option>All warehouses</option>
            <option>West Coast Hub</option>
            <option>Central Depot</option>
            <option>East Coast Hub</option>
          </select>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {logWarehouses.map((w) => (
          <Card key={w.name}>
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[15px] font-bold text-t0">{w.name}</p>
              <span className="text-base font-extrabold" style={{ color: w.color }}>
                {w.pct}%
              </span>
            </div>
            <div className="mb-3.5 h-2 overflow-hidden rounded-[5px] bg-bg-inset">
              <div className="h-full rounded-[5px]" style={{ width: `${w.pct}%`, background: w.color }} />
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-base font-extrabold text-t0">{w.units}</p>
                <p className="mt-0.5 text-[11px] text-t2">Units stored</p>
              </div>
              <div className="text-right">
                <p className="text-base font-extrabold text-t0">{w.orders}</p>
                <p className="mt-0.5 text-[11px] text-t2">Open orders</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg">
        <CardTitle className="mb-4">Zone occupancy — West Coast Hub</CardTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {warehouseZones.map((z) => (
            <div key={z.zone} className="rounded-[12px] border border-line bg-bg-inset p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-extrabold text-t0">{z.zone}</span>
                <span className="text-[11px] font-bold" style={{ color: z.color }}>
                  {z.pct}%
                </span>
              </div>
              <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-bg-3">
                <div className="h-full rounded-full" style={{ width: `${z.pct}%`, background: z.color }} />
              </div>
              <p className="text-[11px] text-t2">{z.items.toLocaleString()} items</p>
              <p className="mt-0.5 text-[10.5px] text-t2">{z.type}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
