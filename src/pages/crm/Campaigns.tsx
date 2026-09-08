import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui";
import { Icon, crmIcons } from "./Icons";
import { crmCampaigns } from "@/data/crm";

export function Campaigns() {
  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="8 active · 4,280 leads generated"
        actions={<Button icon={<Icon d={crmIcons.plus} size={14} />}>New campaign</Button>}
      />

      <div className="flex flex-col gap-3.5">
        {crmCampaigns.map((c) => (
          <Card key={c.name} className="flex flex-wrap items-center gap-4 sm:gap-5">
            <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px]" style={{ background: `color-mix(in srgb, ${c.tint} 16%, transparent)`, color: c.tint }}>
              <Icon d={crmIcons[c.icon as keyof typeof crmIcons]} size={22} />
            </div>
            <div className="min-w-[180px] flex-[2]">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <p className="text-[15px] font-bold text-t0">{c.name}</p>
                <Badge status={c.status}>{c.status}</Badge>
              </div>
              <p className="text-[12.5px] text-t2">{c.channel} · {c.dates}</p>
            </div>
            <div className="min-w-[80px] flex-1">
              <p className="text-[11px] font-semibold text-t2">Leads</p>
              <p className="mt-1 font-mono text-lg font-extrabold text-t0">{c.leads}</p>
            </div>
            <div className="min-w-[80px] flex-1">
              <p className="text-[11px] font-semibold text-t2">Conversion</p>
              <p className="mt-1 font-mono text-lg font-extrabold text-ok">{c.conv}</p>
            </div>
            <div className="min-w-[120px] flex-1">
              <p className="mb-1.5 text-[11px] font-semibold text-t2">Budget used</p>
              <ProgressBar value={c.pct} color={c.tint} height={7} />
              <span className="mt-1 block text-[11px] text-t2">{c.spent} / {c.budget}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
