import { Avatar, Badge, Button, Card, Input, PageHeader } from "@/components/ui";
import type { StatusVariant } from "@/lib/status";
import { Icon, crmIcons } from "./Icons";
import { crmAccounts } from "@/data/crm";

const healthVariant: Record<string, StatusVariant> = {
  Healthy: "success",
  "At risk": "warning",
  Critical: "danger",
};

export function CrmCustomers() {
  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="182 accounts · $4.2M ARR"
        actions={
          <>
            <div className="w-40"><Input placeholder="Search accounts…" /></div>
            <Button icon={<Icon d={crmIcons.plus} size={14} />}>Add account</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {crmAccounts.map((c) => (
          <Card key={c.name} className="cursor-pointer transition-colors hover:border-line-2">
            <div className="mb-3.5 flex items-center gap-3">
              <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] text-xl" style={{ background: `color-mix(in srgb, ${c.tint} 16%, transparent)`, color: c.tint }}>
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-bold text-t0">{c.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{c.industry}</p>
              </div>
              <Badge variant={healthVariant[c.health] ?? "neutral"}>{c.health}</Badge>
            </div>
            <div className="mb-3.5 grid grid-cols-2 gap-3">
              <div className="rounded-[11px] bg-bg-inset p-3">
                <p className="font-mono text-base font-extrabold text-ok">{c.arr}</p>
                <p className="mt-0.5 text-[10.5px] text-t2">Annual value</p>
              </div>
              <div className="rounded-[11px] bg-bg-inset p-3">
                <p className="font-mono text-base font-extrabold text-t0">{c.seats}</p>
                <p className="mt-0.5 text-[10.5px] text-t2">Seats</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <div className="flex items-center gap-2">
                <Avatar name={c.rep} size="xs" />
                <span className="text-[11.5px] text-t2">{c.rep}</span>
              </div>
              <span className="text-[11.5px] text-t2">Renews {c.renews}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
