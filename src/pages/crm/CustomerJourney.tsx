import { Card, CardTitle, PageHeader } from "@/components/ui";
import { Icon, crmIcons } from "./Icons";
import { journeyStages, journeyTouchpoints } from "@/data/crm";

export function CustomerJourney() {
  return (
    <div>
      <PageHeader title="Customer Journey" subtitle="Touchpoints from awareness to advocacy" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {journeyStages.map((j) => (
          <Card key={j.name} className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: j.color }} />
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ background: `color-mix(in srgb, ${j.color} 16%, transparent)`, color: j.color }}>
              <Icon d={crmIcons[j.icon as keyof typeof crmIcons]} size={19} />
            </span>
            <p className="text-[13.5px] font-bold text-t0">{j.name}</p>
            <p className="mt-1.5 font-mono text-xl font-extrabold sm:text-2xl" style={{ color: j.color }}>{j.count}</p>
            <p className="mt-0.5 text-[11px] text-t2">{j.pct} of total</p>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="mt-4">
        <CardTitle className="mb-5">Journey touchpoints</CardTitle>
        <div className="relative">
          <span className="absolute bottom-2 left-[19px] top-2 w-0.5 bg-line" />
          <div className="flex flex-col gap-5">
            {journeyTouchpoints.map((t) => (
              <div key={t.title} className="relative flex gap-4">
                <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-bg-2" style={{ background: `color-mix(in srgb, ${t.tint} 16%, transparent)`, color: t.tint }}>
                  <Icon d={crmIcons[t.icon as keyof typeof crmIcons]} size={17} />
                </span>
                <div className="flex-1 rounded-[14px] border border-line bg-bg-inset p-4 sm:px-5">
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-t0">{t.title}</p>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: t.tint, background: `color-mix(in srgb, ${t.tint} 16%, transparent)` }}>{t.stage}</span>
                  </div>
                  <p className="mb-2 text-[12.5px] leading-relaxed text-t1">{t.desc}</p>
                  <div className="flex items-center gap-3.5">
                    <span className="text-[11.5px] text-t2">{t.channel}</span>
                    <span className="text-[11.5px] font-bold" style={{ color: t.rateColor }}>{t.rate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
