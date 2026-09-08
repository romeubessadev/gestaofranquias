import { Card, PageHeader } from "@/components/ui";

interface Mask {
  label: string;
  value: string;
  mask: string;
  icon: string;
}

const masks: Mask[] = [
  { label: "Phone number", value: "+1 (555) 123-4567", mask: "+9 (999) 999-9999", icon: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2z" },
  { label: "Credit card", value: "4242 4242 4242 4242", mask: "9999 9999 9999 9999", icon: "M2 5h20v14H2zM2 10h20" },
  { label: "Expiry date", value: "12 / 28", mask: "99 / 99", icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" },
  { label: "Currency", value: "$1,299.00", mask: "$9,999.99", icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { label: "Date (ISO)", value: "2026-07-10", mask: "9999-99-99", icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18" },
  { label: "Zip code", value: "94103-1234", mask: "99999-9999", icon: "M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
];

export function InputMasksPage() {
  return (
    <div>
      <PageHeader title="Input Masks" subtitle="Formatted inputs for phone, card, date and currency" />
      <div className="grid max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {masks.map((m) => (
          <Card key={m.label}>
            <label className="mb-2 block text-[12.5px] font-bold text-t1">{m.label}</label>
            <div className="flex h-11 items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={m.icon} />
              </svg>
              <span className="font-mono text-[14px] font-semibold text-t0">{m.value}</span>
            </div>
            <p className="mt-2 text-[11px] text-t2">
              Mask: <span className="font-mono text-t1">{m.mask}</span>
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
