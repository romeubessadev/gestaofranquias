import { Card, CardTitle, PageHeader, ProgressBar, Select } from "@/components/ui";
import { FunnelChart } from "@/components/charts";
import { funnelConversions, funnelKeyMetrics, salesFunnelStages } from "@/data/crm";

export function SalesFunnel() {
  return (
    <div>
      <PageHeader
        title="Sales Funnel"
        subtitle="Conversion from lead to close · Q3 2026"
        actions={
          <div className="w-40">
            <Select>
              <option>This quarter</option>
              <option>This month</option>
              <option>This year</option>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card padding="lg">
          <CardTitle className="mb-5">Funnel stages</CardTitle>
          <FunnelChart stages={salesFunnelStages} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <CardTitle className="mb-4">Conversion rates</CardTitle>
            <div className="flex flex-col gap-4">
              {funnelConversions.map((c) => (
                <div key={c.name}>
                  <div className="mb-1.5 flex justify-between">
                    <span className="text-[12.5px] font-semibold text-t1">{c.name}</span>
                    <span className="text-[12.5px] font-bold" style={{ color: c.color }}>{c.rate}%</span>
                  </div>
                  <ProgressBar value={c.rate} color={c.color} height={6} />
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <CardTitle className="mb-4">Key metrics</CardTitle>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between"><span className="text-[13px] text-t2">Overall conversion</span><span className="text-lg font-extrabold text-ok">{funnelKeyMetrics.overallConversion}</span></div>
              <div className="flex items-center justify-between"><span className="text-[13px] text-t2">Avg. deal cycle</span><span className="text-lg font-extrabold text-t0">{funnelKeyMetrics.avgDealCycle}</span></div>
              <div className="flex items-center justify-between"><span className="text-[13px] text-t2">Avg. deal size</span><span className="text-lg font-extrabold text-acc">{funnelKeyMetrics.avgDealSize}</span></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
