import { Badge, Button, PageHeader } from "@/components/ui";
import { promotions } from "@/data/ecommerce";
import { IconPlus } from "./icons";

export function Promotions() {
  return (
    <div>
      <PageHeader
        title="Promotions"
        subtitle="6 active promotions · $24,800 impact"
        actions={<Button icon={<IconPlus />}>New promotion</Button>}
      />

      <div className="flex flex-col gap-3.5">
        {promotions.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px]" style={{ background: p.bg }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={p.icon} />
              </svg>
            </div>
            <div className="min-w-[180px] flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="text-sm font-bold text-t0">{p.name}</p>
                <Badge status={p.status}>{p.status}</Badge>
              </div>
              <p className="text-[12.5px] text-t2">{p.desc}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="w-20">
                <p className="text-base font-extrabold" style={{ color: p.color }}>
                  {p.discount}
                </p>
                <p className="mt-0.5 text-[11px] text-t2">Discount</p>
              </div>
              <div className="w-20">
                <p className="text-base font-extrabold text-t0">{p.used.toLocaleString()}</p>
                <p className="mt-0.5 text-[11px] text-t2">Used</p>
              </div>
              <div className="w-20">
                <p className="text-base font-extrabold text-ok">{p.revenue}</p>
                <p className="mt-0.5 text-[11px] text-t2">Revenue</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm">
                Edit
              </Button>
              <Button variant="outline" size="sm" className="border-bad-soft text-bad hover:bg-bad-soft">
                End
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
