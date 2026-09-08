import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { logisticsStatusVariant, shipmentKpis, shipments, type Shipment } from "@/data/logistics";
import { Icon, ICONS } from "./icons";

const kpiIcons = [ICONS.package, ICONS.truck, ICONS.clockCheck, ICONS.alertTriangle];

const columns: DataTableColumn<Shipment>[] = [
  {
    key: "tracking",
    header: "Tracking",
    render: (r) => <span className="font-mono text-xs font-bold text-acc">{r.tracking}</span>,
  },
  {
    key: "route",
    header: "Route",
    render: (r) => (
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="text-xs font-semibold text-t0">{r.from}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-semibold text-t0">{r.to}</span>
      </div>
    ),
  },
  { key: "customer", header: "Customer", render: (r) => <span className="text-[12.5px] text-t1">{r.customer}</span>, hideBelow: "md" },
  { key: "carrier", header: "Carrier", render: (r) => <span className="text-xs text-t2">{r.carrier}</span>, hideBelow: "lg" },
  {
    key: "status",
    header: "Status",
    align: "center",
    render: (r) => <Badge variant={logisticsStatusVariant(r.status)}>{r.status}</Badge>,
  },
  {
    key: "eta",
    header: "ETA",
    align: "right",
    render: (r) => <span className={`text-xs font-semibold ${r.etaWarn ? "text-bad" : "text-t1"}`}>{r.eta}</span>,
    hideBelow: "sm",
  },
];

export function Shipments() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Shipments"
        subtitle="3,284 total · 412 in transit"
        actions={
          <>
            <input
              placeholder="Track shipment…"
              className="h-[38px] w-[160px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3.5 text-[13px] text-t0 placeholder:text-t2 outline-none focus:border-acc"
            />
            <select className="h-[38px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none">
              <option>All status</option>
              <option>In transit</option>
              <option>Delivered</option>
              <option>Delayed</option>
            </select>
            <Button size="sm" icon={<Icon path="M12 5v14M5 12h14" size={14} />}>
              New shipment
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shipmentKpis.map((k, i) => (
          <Card key={k.label} className="flex items-center gap-3.5">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]"
              style={{ background: k.tintBg, color: k.color }}
            >
              <Icon path={kpiIcons[i]} />
            </span>
            <div>
              <p className="font-mono text-[22px] font-extrabold" style={{ color: k.color }}>
                {k.value}
              </p>
              <p className="mt-0.5 text-[11.5px] text-t2">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={shipments}
        rowKey={(r) => r.tracking}
        onRowClick={(r) => navigate(paths.logistics.shipmentDetail(r.tracking))}
      />
    </div>
  );
}
