import { Card, PageHeader, Badge } from "@/components/ui";
import type { StatusVariant } from "@/lib/status";

interface Entry {
  version: string;
  tag: string;
  tagVariant: StatusVariant;
  date: string;
  items: Array<{ type: "New" | "Improved" | "Fixed"; text: string }>;
}

const TYPE_VARIANT: Record<string, StatusVariant> = {
  New: "success",
  Improved: "info",
  Fixed: "warning",
};

const ENTRIES: Entry[] = [
  {
    version: "3.2.0",
    tag: "Latest",
    tagVariant: "success",
    date: "Jun 27, 2026",
    items: [
      { type: "New", text: "AI-powered insights on every dashboard widget." },
      { type: "New", text: "12 new prebuilt dashboard modules." },
      { type: "Improved", text: "Charts render up to 3x faster on large datasets." },
    ],
  },
  {
    version: "3.1.4",
    tag: "Stable",
    tagVariant: "info",
    date: "Jun 12, 2026",
    items: [
      { type: "Fixed", text: "Timezone offset in scheduled report exports." },
      { type: "Improved", text: "Sidebar collapse animation is now smoother." },
    ],
  },
  {
    version: "3.1.0",
    tag: "Stable",
    tagVariant: "info",
    date: "May 30, 2026",
    items: [
      { type: "New", text: "Audience segments builder in the Marketing module." },
      { type: "New", text: "SMS campaign analytics." },
      { type: "Fixed", text: "Rare crash when deleting the last API key." },
    ],
  },
  {
    version: "3.0.2",
    tag: "Patch",
    tagVariant: "warning",
    date: "May 8, 2026",
    items: [
      { type: "Fixed", text: "Billing history pagination on Safari." },
      { type: "Improved", text: "Accessibility of the notifications center." },
    ],
  },
  {
    version: "3.0.0",
    tag: "Major",
    tagVariant: "accent",
    date: "Apr 21, 2026",
    items: [
      { type: "New", text: "Complete visual redesign with a new dark theme." },
      { type: "New", text: "Reports module with scheduling and PDF export." },
      { type: "Improved", text: "Rebuilt data tables with virtual scrolling." },
    ],
  },
];

export function ChangelogPage() {
  return (
    <div>
      <PageHeader crumbs={[{ label: "Premium" }, { label: "Changelog" }]} title="Changelog" subtitle="Every update, in order." />
      <div className="flex max-w-[760px] flex-col gap-4">
        {ENTRIES.map((c) => (
          <Card key={c.version}>
            <div className="mb-2.5 flex items-center gap-3">
              <span className="text-[15px] font-extrabold text-acc">v{c.version}</span>
              <Badge variant={c.tagVariant}>{c.tag}</Badge>
              <span className="ml-auto text-xs text-t2">{c.date}</span>
            </div>
            <div className="flex flex-col gap-2">
              {c.items.map((i, idx) => (
                <div key={idx} className="flex gap-2.5">
                  <span className="h-fit shrink-0">
                    <Badge variant={TYPE_VARIANT[i.type]}>{i.type}</Badge>
                  </span>
                  <span className="text-[13px] leading-normal text-t1">{i.text}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
