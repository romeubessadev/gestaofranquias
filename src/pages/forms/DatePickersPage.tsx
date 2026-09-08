import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

const dow = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
// July 2026 starts on a Wednesday (offset 3); 31 days.
const monthOffset = 3;
const daysInMonth = 31;
const quickRanges = ["Today", "Last 7 days", "Last 30 days", "This month", "This quarter"];

export function DatePickersPage() {
  const [selectedDay, setSelectedDay] = useState(6);
  const [activeRange, setActiveRange] = useState("Last 7 days");

  const cells: (number | null)[] = [
    ...Array.from({ length: monthOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      <PageHeader title="Date Pickers" subtitle="Calendar, range and inline pickers" />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(300px,340px)_1fr] items-start gap-5">
        <Card padding="lg">
          <div className="mb-3.5 flex items-center justify-between">
            <button className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-line text-t1 hover:bg-bg-3" style={{ height: 30, width: 30 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm font-bold text-t0">July 2026</span>
            <button className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-line text-t1 hover:bg-bg-3" style={{ height: 30, width: 30 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
          <div className="mb-1.5 grid grid-cols-7 gap-1">
            {dow.map((d) => (
              <span key={d} className="py-1 text-center text-[10.5px] font-bold text-t2">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((n, i) =>
              n === null ? (
                <span key={`e${i}`} />
              ) : (
                <button
                  key={n}
                  onClick={() => setSelectedDay(n)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-[9px] text-[12.5px] font-semibold transition-colors",
                    n === selectedDay ? "bg-acc text-white" : "text-t1 hover:bg-bg-3",
                  )}
                >
                  {n}
                </button>
              ),
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <label className="mb-2 block text-[12.5px] font-bold text-t1">Single date</label>
            <div className="flex h-[42px] items-center gap-2.5 rounded-[11px] border border-acc bg-bg-inset px-3.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="text-[13.5px] font-semibold text-t0">Jul {selectedDay}, 2026</span>
            </div>
          </Card>
          <Card>
            <label className="mb-2 block text-[12.5px] font-bold text-t1">Date range</label>
            <div className="flex h-[42px] items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3.5">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span className="text-[13.5px] font-semibold text-t0">Jul 1 – Jul 14, 2026</span>
            </div>
          </Card>
          <Card>
            <label className="mb-2.5 block text-[12.5px] font-bold text-t1">Quick ranges</label>
            <div className="flex flex-wrap gap-2">
              {quickRanges.map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveRange(q)}
                  className={cn(
                    "h-8 rounded-[9px] border px-3 text-xs font-semibold transition-colors",
                    activeRange === q ? "border-acc bg-acc-soft text-acc" : "border-line text-t1 hover:border-acc",
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
