import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

const ACCENTS = ["#7c5cff", "#56a8ff", "#2fd48f", "#ff7a5c"];

export function UiPlaygroundPage() {
  const [accent, setAccent] = useState(0);
  const [radius, setRadius] = useState(14);
  const [density, setDensity] = useState<"comfy" | "compact">("comfy");
  const [shadow, setShadow] = useState(60);
  const color = ACCENTS[accent];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "UI Playground" }]}
        title="UI Playground"
        subtitle="Tweak tokens live and see components update instantly."
      />
      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-[300px_1fr] lg:items-start">
        <Card padding="lg">
          <h3 className="mb-4 text-[15px] font-bold text-t0">Controls</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-t1">Accent color</label>
              <div className="flex gap-2">
                {ACCENTS.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setAccent(i)}
                    className={cn("h-[30px] w-[30px] rounded-[9px] border-2", accent === i ? "border-white" : "border-transparent")}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-t1">Border radius</label>
              <input type="range" min={0} max={24} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full" style={{ accentColor: "var(--acc)" }} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-t1">Density</label>
              <div className="flex gap-0.5 rounded-[10px] border border-line bg-bg-inset p-0.5">
                {(["comfy", "compact"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={cn(
                      "flex-1 rounded-lg py-1.5 text-[11.5px] font-bold capitalize",
                      density === d ? "bg-acc text-white" : "text-t1",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-t1">Shadow intensity</label>
              <input type="range" min={0} max={100} value={shadow} onChange={(e) => setShadow(+e.target.value)} className="w-full" style={{ accentColor: "var(--acc)" }} />
            </div>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card padding="lg" className="flex flex-wrap items-center gap-3">
            <button
              className="h-[42px] px-5 font-bold text-white"
              style={{ background: color, borderRadius: radius, boxShadow: `0 10px 26px -10px ${color}${Math.round((shadow / 100) * 255).toString(16).padStart(2, "0")}` }}
            >
              Primary button
            </button>
            <span className="px-3.5 py-1.5 text-xs font-bold" style={{ color, background: color + "22", borderRadius: radius }}>
              Badge preview
            </span>
            <div className="h-2 w-[200px] overflow-hidden bg-bg-inset" style={{ borderRadius: radius }}>
              <div className="h-full" style={{ width: "64%", background: color, borderRadius: radius }} />
            </div>
          </Card>
          <Card padding="lg">
            <div className="border border-line bg-bg-inset p-4.5" style={{ borderRadius: radius, padding: density === "compact" ? 12 : 18 }}>
              <p className="mb-2 text-sm font-bold text-t0">Live preview card</p>
              <p className="text-[12.5px] leading-relaxed text-t2">
                This card reflects the radius, shadow and accent settings from the controls panel in real time.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
