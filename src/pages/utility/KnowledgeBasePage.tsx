import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  { name: "Getting Started", count: 18 },
  { name: "Account & Billing", count: 24 },
  { name: "Dashboards", count: 31 },
  { name: "Integrations", count: 22 },
  { name: "API Reference", count: 44 },
  { name: "Security", count: 12 },
  { name: "Troubleshooting", count: 27 },
];

const ARTICLES = [
  { cat: "Getting Started", tint: "var(--acc)", tintBg: "var(--acc-soft)", time: "4 min", title: "Setting up your first workspace", excerpt: "A step-by-step walkthrough of creating your workspace, inviting your team and configuring initial settings." },
  { cat: "Dashboards", tint: "#9d86ff", tintBg: "#9d86ff22", time: "6 min", title: "Building custom dashboards", excerpt: "Learn how to drag, drop and configure widgets to create dashboards tailored to your team's needs." },
  { cat: "API Reference", tint: "var(--warn)", tintBg: "var(--warn-soft)", time: "8 min", title: "Authenticating with API keys", excerpt: "Generate, rotate and scope API keys, and use them to authenticate requests to the Vela REST API." },
  { cat: "Integrations", tint: "var(--info)", tintBg: "var(--info-soft)", time: "5 min", title: "Connecting Slack notifications", excerpt: "Route alerts, mentions and report digests straight into your Slack channels in a few clicks." },
  { cat: "Security", tint: "var(--bad)", tintBg: "var(--bad-soft)", time: "3 min", title: "Enabling two-factor authentication", excerpt: "Add an extra layer of protection to your account using an authenticator app or SMS codes." },
  { cat: "Account & Billing", tint: "var(--ok)", tintBg: "var(--ok-soft)", time: "4 min", title: "Understanding your invoice", excerpt: "A breakdown of line items, proration, taxes and how usage-based charges appear on your bill." },
];

export function KnowledgeBasePage() {
  const [active, setActive] = useState("Getting Started");
  return (
    <div>
      <PageHeader title="Knowledge Base" subtitle="248 articles across 12 categories" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_1fr] lg:items-start">
        <Card padding="sm">
          {CATEGORIES.map((c) => {
            const isActive = c.name === active;
            return (
              <button
                key={c.name}
                onClick={() => setActive(c.name)}
                className={cn(
                  "mb-0.5 flex w-full items-center justify-between rounded-[10px] px-3 py-2.5 text-left hover:bg-bg-3",
                  isActive && "bg-acc-soft",
                )}
              >
                <span className={cn("text-[13px]", isActive ? "font-bold text-t0" : "font-semibold text-t1")}>{c.name}</span>
                <span className="text-[11.5px] text-t2">{c.count}</span>
              </button>
            );
          })}
        </Card>
        <div className="flex flex-col gap-3">
          {ARTICLES.map((a) => (
            <Card key={a.title} className="cursor-pointer hover:border-line-2">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: a.tint, background: a.tintBg }}>
                  {a.cat}
                </span>
                <span className="text-[11.5px] text-t2">{a.time} read</span>
              </div>
              <p className="mb-1.5 text-[14.5px] font-bold text-t0">{a.title}</p>
              <p className="text-[12.5px] leading-normal text-t2">{a.excerpt}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
