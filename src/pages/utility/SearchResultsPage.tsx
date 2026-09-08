import { useState } from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { SearchIcon, FileTextIcon, BarChartIcon, BookIcon, UsersIcon } from "@/pages/utility/icons";

const TABS = [
  { name: "All", count: 248 },
  { name: "Articles", count: 112 },
  { name: "Dashboards", count: 46 },
  { name: "People", count: 38 },
  { name: "Files", count: 52 },
];

const RESULTS = [
  { icon: BarChartIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", type: "Dashboard", title: "Revenue Analytics Overview", excerpt: "Track MRR, ARR, expansion and churn across every plan in a single real-time dashboard." },
  { icon: BookIcon, tint: "var(--info)", tintBg: "var(--info-soft)", type: "Article", title: "How to read your revenue analytics", excerpt: "A guide to interpreting the revenue analytics dashboard, including cohort retention and net revenue." },
  { icon: FileTextIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", type: "Report", title: "Q2 2026 Revenue Report.pdf", excerpt: "Quarterly revenue breakdown by product line, region and customer segment with YoY comparisons." },
  { icon: UsersIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", type: "Person", title: "Revenue Operations Team", excerpt: "8 members responsible for revenue analytics, forecasting and financial reporting." },
  { icon: BarChartIcon, tint: "#9d86ff", tintBg: "#9d86ff22", type: "Dashboard", title: "Analytics — Executive Summary", excerpt: "High-level revenue and growth metrics curated for the leadership team's weekly review." },
];

export function SearchResultsPage() {
  const [active, setActive] = useState("All");
  return (
    <div>
      <div className="mb-5">
        <div className="flex h-12 max-w-[560px] items-center gap-2.5 rounded-[13px] border border-line bg-bg-2 px-4">
          <SearchIcon size={18} className="text-t2" />
          <input defaultValue="revenue analytics" className="flex-1 bg-transparent text-[14.5px] text-t0 outline-none" />
        </div>
        <p className="mt-3 text-[13px] text-t2">
          About <strong className="text-t0">248 results</strong> for "revenue analytics" (0.24 seconds)
        </p>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.name}
            onClick={() => setActive(t.name)}
            className={cn(
              "h-[34px] rounded-full border px-4 text-[12.5px] font-semibold",
              active === t.name ? "border-acc bg-acc text-white" : "border-line bg-bg-2 text-t1 hover:text-t0",
            )}
          >
            {t.name} <span className="opacity-70">{t.count}</span>
          </button>
        ))}
      </div>
      <div className="flex max-w-[720px] flex-col gap-3.5">
        {RESULTS.map((r) => (
          <Card key={r.title} className="cursor-pointer hover:border-line-2">
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: r.tintBg, color: r.tint }}>
                <r.icon size={14} />
              </span>
              <span className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{r.type}</span>
            </div>
            <p className="mb-1.5 text-[15px] font-bold text-acc">{r.title}</p>
            <p className="text-[13px] leading-normal text-t1">{r.excerpt}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
