import { Button, PageHeader } from "@/components/ui";
import { coupons } from "@/data/ecommerce";
import { IconEdit, IconPlus, IconTrash } from "./icons";

export function Coupons() {
  return (
    <div>
      <PageHeader
        title="Coupons"
        subtitle="24 active coupons · $8,420 redeemed"
        actions={<Button icon={<IconPlus />}>Create coupon</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => {
          const usedPct = Math.round((c.used / c.limit) * 100);
          return (
            <div key={c.code} className="relative overflow-hidden rounded-2xl border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[80px] opacity-10" style={{ background: c.color }} />
              <div className="mb-3.5 flex items-start justify-between">
                <div>
                  <span className="rounded-full px-2.5 py-0.5 text-[11.5px] font-bold" style={{ color: c.color, background: `color-mix(in srgb, ${c.color} 14%, transparent)` }}>
                    {c.type}
                  </span>
                  <p className="mb-1 mt-2.5 font-mono text-xl font-extrabold text-acc">{c.code}</p>
                  <p className="text-2xl font-extrabold" style={{ color: c.color }}>
                    {c.discount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-t2">Used</p>
                  <p className="my-1 text-xl font-extrabold text-t0">
                    {c.used.toLocaleString()}/{c.limit.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="mb-3.5 h-[5px] overflow-hidden rounded-full bg-bg-inset">
                <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: c.color }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-t2">Expires {c.expires}</span>
                <div className="flex gap-1.5">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-t2 hover:border-acc hover:text-acc">
                    <IconEdit />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-t2 hover:border-bad hover:text-bad">
                    <IconTrash />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
