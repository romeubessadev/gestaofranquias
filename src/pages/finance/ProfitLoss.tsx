import { Button, Card, CardTitle, PageHeader, Select } from "@/components/ui";
import { cn } from "@/lib/cn";
import { Icon, financeIcons } from "./Icons";
import { pnlRows, pnlSummary } from "@/data/finance";

export function ProfitLoss() {
  return (
    <div>
      <PageHeader
        title="Profit & Loss"
        subtitle="Income statement · Year to date 2026"
        actions={
          <>
            <div className="w-32">
              <Select>
                <option>YTD 2026</option>
                <option>Q2 2026</option>
                <option>FY 2025</option>
              </Select>
            </div>
            <Button variant="secondary" icon={<Icon d={financeIcons.download} size={14} />}>Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {pnlSummary.map((s, i) => (
          <Card
            key={s.label}
            className={cn(i === 2 && "border-acc-soft")}
            style={i === 2 ? { background: "linear-gradient(135deg, var(--acc-soft), transparent)" } : undefined}
          >
            <p className="text-xs font-semibold text-t2">{s.label}</p>
            <p className="mt-1.5 font-mono text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className={cn("mt-0.5 text-[11.5px]", s.sub.startsWith("+") || s.sub.includes("margin") ? "text-ok" : "text-t2")}>{s.sub}</p>
          </Card>
        ))}
      </div>

      <Card padding="lg" className="mt-4">
        <CardTitle className="mb-4">Income statement</CardTitle>
        <div>
          {pnlRows.map((r) => (
            <div key={r.label} className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
              <span
                className={cn(
                  r.bold ? "text-sm font-extrabold text-t0" : "text-[13px] font-semibold",
                  r.indent ? "pl-4 text-t2 sm:pl-5" : "text-t0",
                )}
              >
                {r.label}
              </span>
              <span
                className={cn("font-mono", r.bold ? "text-[15px] font-extrabold" : "text-[13.5px] font-bold")}
                style={{ color: r.color ?? "var(--t0)" }}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
