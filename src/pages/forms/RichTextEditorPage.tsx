import { Button, Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Tool {
  label?: string;
  icon?: string;
  bold?: boolean;
  active?: boolean;
  divider?: boolean;
  title: string;
}

const tools: Tool[] = [
  { label: "B", bold: true, title: "Bold" },
  { label: "I", title: "Italic" },
  { label: "U", title: "Underline" },
  { divider: true, title: "" },
  { icon: "M4 6h16M4 12h16M4 18h10", title: "Align left", active: true },
  { icon: "M6 12h12M4 6h16M4 18h16", title: "Align center" },
  { divider: true, title: "" },
  { icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01", title: "Bullet list" },
  { icon: "M9 6h11M9 12h11M9 18h11M5 6v.01M5 12v.01M5 18v.01", title: "Numbered list" },
  { divider: true, title: "" },
  { icon: "M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5", title: "Insert link" },
  { icon: "M21 15l-5-5L5 21M3 3h18v18H3z", title: "Insert image" },
];

export function RichTextEditorPage() {
  return (
    <div>
      <PageHeader title="Rich Text Editor" subtitle="WYSIWYG editing with a formatting toolbar" />
      <div className="max-w-3xl">
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 border-b border-line bg-bg-inset px-3 py-2.5">
            {tools.map((t, i) =>
              t.divider ? (
                <span key={i} className="mx-1 h-5 w-px bg-line" />
              ) : (
                <button
                  key={i}
                  title={t.title}
                  className={cn(
                    "flex h-8.5 w-8.5 items-center justify-center rounded-lg text-[13px] hover:bg-bg-3",
                    t.active ? "bg-acc-soft text-acc" : "text-t1",
                    t.bold && "font-extrabold",
                  )}
                  style={{ height: 34, width: 34 }}
                >
                  {t.icon ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={t.icon} />
                    </svg>
                  ) : (
                    t.label
                  )}
                </button>
              ),
            )}
          </div>
          <div className="min-h-[280px] px-6 py-6 text-[14px] leading-relaxed text-t1" contentEditable suppressContentEditableWarning>
            <h2 className="mb-3 text-xl font-extrabold text-t0">Product Launch Announcement</h2>
            <p className="mb-3.5">
              We're thrilled to announce the launch of <strong className="text-t0">Vela Analytics 2.0</strong> — a complete reimagining of how teams work with data.
              This release brings <em>faster dashboards</em>, real-time collaboration, and a beautiful new dark mode.
            </p>
            <p className="mb-2.5 font-bold text-t0">Key highlights:</p>
            <ul className="mb-3.5 list-disc pl-6">
              <li className="mb-1.5">40% faster load times across all dashboards</li>
              <li className="mb-1.5">New command palette for instant navigation</li>
              <li className="mb-1.5">Fully responsive on mobile and tablet</li>
            </ul>
            <blockquote className="rounded-r-xl border-l-[3px] border-acc bg-bg-inset px-4 py-3 italic text-t2">
              "The best analytics platform we've ever used." — Elena Park, VP Sales
            </blockquote>
          </div>
          <div className="flex items-center justify-between border-t border-line bg-bg-inset px-4 py-3">
            <span className="text-[11.5px] text-t2">248 words · 1,420 characters</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Save draft</Button>
              <Button size="sm">Publish</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
