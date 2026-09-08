import { Button, Card, PageHeader } from "@/components/ui";
import { FileTextIcon, LayoutIcon, ZapIcon, KeyIcon, BookIcon, BarChartIcon } from "@/pages/utility/icons";

const FILES = [
  { icon: FileTextIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", name: "index.html", desc: "Entry point with the base layout shell", size: "4.2 KB" },
  { icon: LayoutIcon, tint: "var(--info)", tintBg: "var(--info-soft)", name: "styles/theme.scss", desc: "Design tokens, colors and typography", size: "8.7 KB" },
  { icon: ZapIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", name: "scripts/app.js", desc: "Sidebar, theme toggle and interactions", size: "6.1 KB" },
  { icon: KeyIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", name: "config/gulpfile.js", desc: "Build pipeline and asset compilation", size: "2.9 KB" },
  { icon: BookIcon, tint: "#9d86ff", tintBg: "#9d86ff22", name: "README.md", desc: "Setup instructions and usage guide", size: "3.4 KB" },
  { icon: BarChartIcon, tint: "var(--bad)", tintBg: "var(--bad-soft)", name: "pages/dashboard.html", desc: "Sample dashboard page to build on", size: "11.2 KB" },
];

export function StarterKitPage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "Starter Kit" }]}
        title="Starter Kit"
        subtitle="A minimal boilerplate to build your own pages on top of Vela."
      />
      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-3">
          {FILES.map((f) => (
            <Card key={f.name} className="flex items-center gap-3.5">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px]" style={{ background: f.tintBg, color: f.tint }}>
                <f.icon size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-bold text-t0">{f.name}</p>
                <p className="mt-0.5 text-[11.5px] text-t2">{f.desc}</p>
              </div>
              <span className="shrink-0 font-mono text-[11.5px] text-t2">{f.size}</span>
            </Card>
          ))}
        </div>
        <Card padding="lg">
          <h3 className="mb-3.5 text-[15px] font-bold text-t0">Download</h3>
          <p className="mb-4.5 text-[12.5px] leading-relaxed text-t2">Includes SCSS source, Gulp build config, and a minimal 3-page starter.</p>
          <Button fullWidth className="mb-2.5">
            Download .zip
          </Button>
          <Button variant="outline" fullWidth>
            View on GitHub
          </Button>
        </Card>
      </div>
    </div>
  );
}
