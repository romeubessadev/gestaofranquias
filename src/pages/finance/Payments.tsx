import { Avatar, Badge, Button, Card, CardTitle, PageHeader } from "@/components/ui";
import { Icon, financeIcons } from "./Icons";
import { paymentCards, paymentMethods, payments } from "@/data/finance";

export function Payments() {
  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Incoming and outgoing payment activity"
        actions={<Button icon={<Icon d={financeIcons.plus} size={14} />}>New payment</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {paymentCards.map((c) => (
          <Card key={c.label}>
            <div className="mb-3.5 flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px]" style={{ background: `color-mix(in srgb, ${c.tint} 16%, transparent)`, color: c.tint }}>
                <Icon d={financeIcons[c.icon as keyof typeof financeIcons]} size={19} />
              </span>
              <span className="text-[13px] font-bold text-t1">{c.label}</span>
            </div>
            <p className="font-mono text-2xl font-extrabold" style={{ color: c.color }}>{c.value}</p>
            <p className="mt-1.5 text-xs text-t2">{c.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <CardTitle>Recent payments</CardTitle>
          </div>
          {payments.map((p) => (
            <div key={p.ref} className="flex items-center gap-3.5 border-b border-line px-5 py-3.5 last:border-b-0 hover:bg-bg-3">
              <Avatar name={p.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-t0">{p.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{p.ref} · {p.date}</p>
              </div>
              <Badge status={p.status}>{p.status}</Badge>
              <span className="min-w-[80px] shrink-0 text-right font-mono text-sm font-extrabold text-ok">{p.amount}</span>
            </div>
          ))}
        </Card>

        <Card padding="lg">
          <CardTitle>Payment methods</CardTitle>
          <div className="mt-4 flex flex-col gap-3">
            {paymentMethods.map((m) => (
              <div key={m.last4} className="flex items-center gap-3 rounded-[12px] border border-line bg-bg-inset p-3.5">
                <span className="flex h-[26px] w-[38px] shrink-0 items-center justify-center rounded-[6px] text-[9px] font-extrabold text-white" style={{ background: m.brandBg }}>
                  {m.brand}
                </span>
                <div className="flex-1">
                  <p className="text-[12.5px] font-bold text-t0">•••• {m.last4}</p>
                  <p className="mt-0.5 text-[11px] text-t2">Exp {m.exp}</p>
                </div>
                {m.isDefault && <Badge variant="success">Default</Badge>}
              </div>
            ))}
            <button className="h-10 rounded-[11px] border border-dashed border-line text-[12.5px] font-semibold text-t2 hover:border-acc hover:text-acc">
              + Add method
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
