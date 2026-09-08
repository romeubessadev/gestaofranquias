import { Card } from "@/components/ui";
import { AlertCircleIcon } from "@/pages/utility/icons";
import { cn } from "@/lib/cn";

const NAV = [
  {
    section: "Getting Started",
    items: [
      { name: "Introduction", active: false },
      { name: "Quick Start", active: true },
      { name: "Installation", active: false },
    ],
  },
  {
    section: "Core Concepts",
    items: [
      { name: "Workspaces", active: false },
      { name: "Dashboards", active: false },
      { name: "Data sources", active: false },
    ],
  },
  {
    section: "API",
    items: [
      { name: "Authentication", active: false },
      { name: "Endpoints", active: false },
      { name: "Webhooks", active: false },
    ],
  },
  {
    section: "Guides",
    items: [
      { name: "Embedding charts", active: false },
      { name: "Custom widgets", active: false },
    ],
  },
];

export function DocumentationPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
      <div className="lg:sticky lg:top-0">
        {NAV.map((s) => (
          <div key={s.section} className="mb-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-t2">{s.section}</p>
            {s.items.map((i) => (
              <a
                key={i.name}
                href="#"
                className={cn(
                  "mb-0.5 block rounded-lg px-2.5 py-1.5 text-[13px] hover:text-t0",
                  i.active ? "bg-acc-soft font-bold text-acc" : "font-medium text-t1",
                )}
              >
                {i.name}
              </a>
            ))}
          </div>
        ))}
      </div>
      <Card className="max-w-[760px] p-8 sm:p-10">
        <div className="mb-3.5 flex items-center gap-2 text-xs text-t2">
          <span>Docs</span>
          <span>/</span>
          <span>Getting Started</span>
          <span>/</span>
          <span className="font-semibold text-t1">Quick Start</span>
        </div>
        <h1 className="mb-2 text-[28px] font-extrabold tracking-tight text-t0">Quick Start Guide</h1>
        <p className="mb-6 text-sm text-t2">Get up and running with Vela in under 5 minutes.</p>
        <h2 className="mb-3 text-lg font-bold text-t0">1. Install the SDK</h2>
        <p className="mb-3.5 text-sm leading-relaxed text-t1">Add the Vela client library to your project using your package manager of choice.</p>
        <div className="relative mb-6 rounded-xl border border-line bg-bg-inset px-4.5 py-4 font-mono text-[13px] text-ok">
          <span className="text-t2">$</span> npm install @vela/client
          <button className="absolute right-3 top-3 rounded-md border border-line bg-bg-3 px-2.5 py-1 text-[11px] text-t1 hover:text-t0">Copy</button>
        </div>
        <h2 className="mb-3 text-lg font-bold text-t0">2. Initialize the client</h2>
        <p className="mb-3.5 text-sm leading-relaxed text-t1">Import and configure the client with your API key from the dashboard.</p>
        <div className="mb-6 rounded-xl border border-line bg-bg-inset px-4.5 py-4 font-mono text-[13px] leading-relaxed">
          <span className="text-acc">import</span> <span className="text-t0">{"{ Vela }"}</span> <span className="text-acc">from</span>{" "}
          <span className="text-ok">'@vela/client'</span>;<br />
          <span className="text-acc">const</span> <span className="text-t0">vela = </span>
          <span className="text-acc">new</span> <span className="text-info">Vela</span>
          <span className="text-t0">(</span>
          <span className="text-ok">'sk_live_...'</span>
          <span className="text-t0">);</span>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-info-soft p-4">
          <AlertCircleIcon size={20} className="shrink-0 text-info" />
          <p className="text-[13px] leading-normal text-t1">Keep your secret keys safe. Never commit them to version control.</p>
        </div>
      </Card>
    </div>
  );
}
