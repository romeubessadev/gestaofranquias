import { useParams } from "react-router-dom";
import { Badge, Card, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";
import { logisticsStatusVariant, shipmentDetails } from "@/data/logistics";
import { Icon } from "./icons";

const stepIcons = [
  "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0", // order placed (bag)
  "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z", // picked up (package)
  "M1 3h15v13H1zM16 8h4l3 3v5h-7", // in transit (truck)
  "M20 6 9 17l-5-5", // delivered (check)
];

export function ShipmentDetails() {
  const { id } = useParams();
  const shipment = shipmentDetails.find((s) => s.tracking === id) ?? shipmentDetails[0];
  const doneCount = shipment.steps.filter((s) => s.done).length;

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Shipments", to: paths.logistics.shipments }, { label: shipment.tracking }]}
        title={shipment.tracking}
        subtitle={`${shipment.from} → ${shipment.to}`}
        actions={<Badge variant={logisticsStatusVariant(shipment.status)}>{shipment.status}</Badge>}
      />

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          {/* Step progress tracker */}
          <Card padding="lg">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-[19px] font-extrabold text-t0">{shipment.tracking}</h2>
                <p className="mt-1 text-[13px] text-t2">
                  {shipment.from} → {shipment.to}
                </p>
              </div>
              <Badge variant={logisticsStatusVariant(shipment.status)}>{shipment.status}</Badge>
            </div>
            <div className="relative px-2">
              <div className="absolute left-6 right-6 top-4 h-0.5 bg-line" />
              <div
                className="absolute left-6 top-4 h-0.5 bg-acc"
                style={{ width: `calc(${(Math.max(doneCount - 1, 0) / (shipment.steps.length - 1)) * 100}% - ${(Math.max(doneCount - 1, 0) / (shipment.steps.length - 1)) * 48}px)` }}
              />
              <div className="relative flex justify-between">
                {shipment.steps.map((s, i) => (
                  <div key={s.label} className="z-[1] flex flex-1 flex-col items-center gap-2">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2"
                      style={{
                        background: s.done ? "var(--acc)" : "var(--bg-3)",
                        borderColor: s.done ? "var(--acc)" : "var(--line)",
                        color: s.done ? "#fff" : "var(--t2)",
                      }}
                    >
                      <Icon path={stepIcons[i] ?? stepIcons[3]} size={15} />
                    </span>
                    <span className={`text-center text-[11px] font-bold ${s.done ? "text-t0" : "text-t2"}`}>{s.label}</span>
                    <span className="hidden text-center text-[10px] text-t2 sm:block">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Tracking history */}
          <Card>
            <h3 className="mb-4 text-[15px] font-bold text-t0">Tracking history</h3>
            <div className="relative">
              <span className="absolute bottom-1.5 left-[15px] top-1.5 w-px bg-line" />
              <div className="flex flex-col gap-4">
                {shipment.history.map((t) => (
                  <div key={t.text + t.time} className="relative flex gap-3">
                    <span
                      className="z-[1] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[2.5px]"
                      style={{ background: t.tintBg, color: t.tint, borderColor: "var(--bg-2)" }}
                    >
                      <Icon path="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" size={13} />
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[13px] font-semibold leading-relaxed text-t0">{t.text}</p>
                      <span className="text-[11px] text-t2">
                        {t.location} · {t.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Side panel */}
        <div className="w-full shrink-0 space-y-4 lg:w-[320px]">
          <Card>
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Details</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-xs text-t2">Carrier</span>
                <span className="text-[12.5px] font-bold text-t0">{shipment.carrier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Service</span>
                <span className="text-[12.5px] font-bold text-t0">{shipment.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Weight</span>
                <span className="font-mono text-[12.5px] font-bold text-t0">{shipment.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Packages</span>
                <span className="text-[12.5px] font-bold text-t0">{shipment.packages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">ETA</span>
                <span className="text-[12.5px] font-bold text-acc">{shipment.eta}</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Recipient</p>
            <div className="flex items-center gap-3">
              <span
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                style={{ background: shipment.recipientAvatarBg }}
              >
                {shipment.recipientName
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div>
                <p className="text-[13px] font-bold text-t0">{shipment.recipientName}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{shipment.recipientAddress}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
