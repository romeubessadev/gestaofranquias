import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

type Mode = "dark" | "light" | "rtl";

const MODES: Array<{ key: Mode; label: string }> = [
  { key: "dark", label: "Dark" },
  { key: "light", label: "Light" },
  { key: "rtl", label: "RTL" },
];

const CARDS = [
  { label: "Revenue", value: "$284K" },
  { label: "Users", value: "38.6K" },
  { label: "Growth", value: "+18%" },
];

export function RtlPreviewPage() {
  const [mode, setMode] = useState<Mode>("dark");
  const isLight = mode === "light";
  const rtl = mode === "rtl";
  const bg = isLight ? "#f5f6fa" : "#0c0e15";
  const fg = isLight ? "#0c0e15" : "#eef1f8";
  const cardBg = isLight ? "#ffffff" : "#151824";
  const border = isLight ? "#e2e5ee" : "#1e2230";

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "RTL / Dark / Light Preview" }]}
        title="RTL / Dark / Light Preview"
        subtitle="Preview how the dashboard adapts without leaving your current mode."
      />
      <div className="mb-4 inline-flex gap-1 rounded-xl border border-line bg-bg-2 p-1">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn("rounded-[9px] px-4 py-1.5 text-[12.5px] font-bold", mode === m.key ? "bg-acc text-white" : "text-t1 hover:text-t0")}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Card padding="none" className="p-2">
        <div dir={rtl ? "rtl" : "ltr"} className="overflow-hidden rounded-[14px] p-6" style={{ background: bg, color: fg }}>
          <div className="mb-5.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg,#7c5cff,#56a8ff)" }}>
                V
              </span>
              <span className="text-[15px] font-extrabold">Vela</span>
            </div>
            <div className="flex gap-2">
              <span className="block h-[30px] w-[30px] rounded-[9px]" style={{ background: cardBg }} />
              <span className="block h-[30px] w-[30px] rounded-full" style={{ background: "linear-gradient(135deg,#7c5cff,#56a8ff)" }} />
            </div>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-3.5">
            {CARDS.map((c) => (
              <div key={c.label} className="rounded-[13px] p-4" style={{ background: cardBg, border: `1px solid ${border}` }}>
                <p className="text-[11.5px] font-semibold opacity-65">{c.label}</p>
                <p className="mt-1.5 text-xl font-extrabold">{c.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[13px] p-4.5" style={{ background: cardBg, border: `1px solid ${border}` }}>
            <p className="mb-3 text-[13px] font-bold">Revenue overview</p>
            <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="h-20 w-full">
              <path d="M0 60 C50 50,100 30,150 40 C200 50,250 20,300 25 C350 30,380 15,400 10" fill="none" stroke="#7c5cff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}
