import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Section {
  title: string;
  options: string[];
  defaultActive: number;
  swatches?: string[];
}

const SECTIONS: Section[] = [
  { title: "Layout", options: ["Vertical", "Horizontal", "Two-column"], defaultActive: 0 },
  { title: "Skin", options: ["Default", "Bordered", "Flat", "Glass"], defaultActive: 0 },
  { title: "Sidebar", options: ["Expanded", "Collapsed", "Hover"], defaultActive: 0 },
  {
    title: "Accent",
    options: ["Violet", "Blue", "Green", "Coral", "Amber", "Rose"],
    defaultActive: 0,
    swatches: ["#7c5cff", "#56a8ff", "#2fd48f", "#ff7a5c", "#f7b84e", "#f76d7d"],
  },
];

export function ThemeCustomizerPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "Theme Customizer" }]}
        title="Theme Customizer"
        subtitle="Configure layout, skin and accent — changes apply instantly across the app."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <SectionCard key={s.title} section={s} />
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: Section }) {
  const [active, setActive] = useState(section.defaultActive);
  return (
    <Card>
      <h3 className="mb-3.5 text-[14.5px] font-bold text-t0">{section.title}</h3>
      <div className="flex flex-wrap gap-2.5">
        {section.options.map((o, i) => (
          <button
            key={o}
            onClick={() => setActive(i)}
            className={cn(
              "flex items-center gap-2 rounded-[10px] border-[1.5px] px-3.5 py-2 text-xs font-bold",
              active === i ? "border-acc bg-acc-soft text-acc" : "border-line bg-bg-inset text-t1",
            )}
          >
            {section.swatches && <span className="h-3.5 w-3.5 rounded-full" style={{ background: section.swatches[i] }} />}
            {o}
          </button>
        ))}
      </div>
    </Card>
  );
}
