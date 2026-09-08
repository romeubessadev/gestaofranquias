import { Button, PageHeader } from "@/components/ui";
import { categories } from "@/data/ecommerce";
import { IconEdit, IconPlus } from "./icons";

export function ProductCategories() {
  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} categories · 248 products`}
        actions={<Button icon={<IconPlus />}>Add category</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => (
          <div key={c.id} className="cursor-pointer rounded-2xl border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)] transition-colors hover:border-line-2">
            <div className="mb-3.5 flex items-center gap-3.5">
              <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[14px] text-2xl" style={{ background: c.bg }}>
                {c.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-t0">{c.name}</p>
                <p className="mt-0.5 text-[12.5px] text-t2">{c.count} products</p>
              </div>
              <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line text-t2 hover:border-acc hover:text-acc">
                <IconEdit width={12} height={12} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[13px] font-extrabold text-ok">{c.revenue}</span>
              <span className="text-[11.5px] text-t2">{c.pct}% of sales</span>
            </div>
            <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-bg-inset">
              <div className="h-full rounded-full bg-acc" style={{ width: `${c.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
