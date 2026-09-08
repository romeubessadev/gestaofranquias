import { Link } from "react-router-dom";
import { Badge, Button, Card, CardHeader, CardTitle, PageHeader } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { paths } from "@/router/paths";
import {
  logChartMonths,
  logChartValues,
  logFleet,
  logisticsStatusVariant,
  logKpis,
  logRegions,
  logShipmentsMini,
  logStatus,
  logWarehouses,
} from "@/data/logistics";
import { Icon, ICONS } from "./icons";

const kpiIcons = [ICONS.truck, ICONS.package, ICONS.clockCheck, ICONS.gauge];
const fleetIcons = [ICONS.truck, ICONS.truck, ICONS.route];

export function LogisticsDashboard() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Dashboards" }, { label: "Logistics" }]}
        title="Logistics overview"
        subtitle="Shipments, fleet and warehouse status in real time — Jun 2026."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Icon path="M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" size={14} />}>
              Today
            </Button>
            <Button variant="secondary" size="sm" icon={<Icon path="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" size={14} />}>
              Export
            </Button>
            <Button size="sm" icon={<Icon path="M12 5v14M5 12h14" size={14} />}>
              New shipment
            </Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {logKpis.map((k, i) => (
          <Card key={k.label}>
            <div className="mb-3.5 flex items-center justify-between">
              <span
                className="flex h-[42px] w-[42px] items-center justify-center rounded-[12px]"
                style={{ background: k.tintBg, color: k.tint }}
              >
                <Icon path={kpiIcons[i]} />
              </span>
              <span
                className={
                  k.positive
                    ? "rounded-full bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok"
                    : "rounded-full bg-bad-soft px-2.5 py-1 text-xs font-bold text-bad"
                }
              >
                {k.positive ? "↗" : "↘"} {k.delta}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-t1">{k.label}</p>
            <p className="mt-1 font-mono text-[26px] font-extrabold text-t0">{k.value}</p>
            <p className="text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Warehouse capacity strip */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {logWarehouses.map((w) => (
          <Card key={w.name} padding="sm">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-[13px] font-bold text-t0">
                <span className="h-2 w-2 rounded-full" style={{ background: w.color }} />
                {w.name}
              </span>
              <span className="text-[11.5px] font-bold" style={{ color: w.color }}>
                {w.pct}% full
              </span>
            </div>
            <div className="mb-2 h-2 overflow-hidden rounded-[5px] bg-bg-inset">
              <div className="h-full rounded-[5px]" style={{ width: `${w.pct}%`, background: w.color }} />
            </div>
            <div className="flex justify-between text-[11.5px] text-t2">
              <span>{w.units} units</span>
              <span>{w.orders} pending</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Delivery status + Fleet */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery status</CardTitle>
            <span className="text-xs text-t2">3,284 total shipments</span>
          </CardHeader>
          <div className="mb-4 flex h-3.5 overflow-hidden rounded-lg">
            {logStatus.map((s) => (
              <div key={s.name} style={{ width: `${s.pct}%`, background: s.color }} />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {logStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5">
                <span className="h-[9px] w-[9px] shrink-0 rounded-[3px]" style={{ background: s.color }} />
                <span className="flex-1 text-[13px] font-semibold text-t1">{s.name}</span>
                <span className="font-mono text-[13px] font-bold text-t0">{s.count.toLocaleString()}</span>
                <span className="w-10 text-right text-xs text-t2">{s.pct}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fleet status</CardTitle>
            <Badge variant="success">92% operational</Badge>
          </CardHeader>
          <div className="flex flex-col gap-4">
            {logFleet.map((f, i) => (
              <div key={f.name} className="flex items-center gap-3">
                <span
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px]"
                  style={{ background: f.tintBg, color: f.tint }}
                >
                  <Icon path={fleetIcons[i]} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13.5px] font-bold text-t0">{f.name}</span>
                    <span className="font-mono text-[17px] font-extrabold text-t0">{f.value}</span>
                  </div>
                  <span className="text-[11.5px] text-t2">{f.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Shipment volume + On-time rate */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Shipment volume</CardTitle>
            <Badge variant="success">+7% vs last month</Badge>
          </CardHeader>
          <AreaLineChart data={logChartValues} labels={logChartMonths} height={190} formatValue={(v) => v.toLocaleString()} />
          <div className="mt-2 hidden justify-between px-1 sm:flex">
            {logChartMonths.map((m) => (
              <span key={m} className="text-[11px] font-semibold text-t2">
                {m}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <CardTitle className="mb-4">On-time delivery rate</CardTitle>
          <div className="relative mx-auto mb-4 h-[150px] w-[150px]">
            <svg viewBox="0 0 150 150" className="h-full w-full -rotate-90">
              <circle cx="75" cy="75" r="58" fill="none" stroke="var(--bg-inset)" strokeWidth="15" />
              <circle
                cx="75"
                cy="75"
                r="58"
                fill="none"
                stroke="var(--ok)"
                strokeWidth="15"
                strokeLinecap="round"
                strokeDasharray="364"
                strokeDashoffset="33"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-extrabold text-t0">91%</span>
              <span className="text-[11px] text-t2">on-time</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex justify-between">
              <span className="text-[12.5px] text-t2">Avg. transit time</span>
              <span className="text-[13px] font-bold text-t0">2.4 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12.5px] text-t2">On-time (target 95%)</span>
              <span className="text-[13px] font-bold text-warn">91%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12.5px] text-t2">Damage rate</span>
              <span className="text-[13px] font-bold text-ok">0.4%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Regional performance */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>Regional performance</CardTitle>
          <span className="text-xs text-t2">Jun 2026</span>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {logRegions.map((r) => (
            <div key={r.name} className="rounded-[14px] border border-line bg-bg-inset p-3.5">
              <p className="mb-2 text-[13px] font-bold text-t0">{r.name}</p>
              <p className="font-mono text-xl font-extrabold" style={{ color: r.color }}>
                {r.shipments}
              </p>
              <p className="mb-2.5 text-[11.5px] text-t2">shipments</p>
              <div className="flex justify-between">
                <span className="text-[11px] text-t2">On-time</span>
                <span className="text-[11.5px] font-bold" style={{ color: r.otColor }}>
                  {r.onTime}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipments in transit */}
      <Card>
        <CardHeader>
          <CardTitle>Shipments in transit</CardTitle>
          <Link to={paths.logistics.shipments} className="text-[12.5px] font-bold text-acc">
            Track all
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] font-bold uppercase tracking-wide text-t2">
                <th className="px-1 pb-3">Shipment</th>
                <th className="px-1 pb-3">Destination</th>
                <th className="px-1 pb-3">Carrier</th>
                <th className="px-1 pb-3">ETA</th>
                <th className="px-1 pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {logShipmentsMini.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-b-0 hover:bg-bg-3">
                  <td className="px-1 py-3.5">
                    <Link to={paths.logistics.shipmentDetail(s.id)} className="font-mono text-[12.5px] font-bold text-t1 hover:text-acc">
                      {s.id}
                    </Link>
                  </td>
                  <td className="px-1 py-3.5 text-[13px] font-semibold text-t0">{s.dest}</td>
                  <td className="px-1 py-3.5 text-[13px] text-t1">{s.carrier}</td>
                  <td className="px-1 py-3.5 text-[13px] font-semibold text-t1">{s.eta}</td>
                  <td className="px-1 py-3.5 text-right">
                    <Badge variant={logisticsStatusVariant(s.status)}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
