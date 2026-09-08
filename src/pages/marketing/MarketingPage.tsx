import { useParams } from "react-router-dom";
import type { ReactNode } from "react";
import { Badge, Button, Card, CardHeader, CardTitle, PageHeader, TabNav } from "@/components/ui";
import { AreaLineChart, DonutChart } from "@/components/charts";
import { paths } from "@/router/paths";
import { PlusIcon, DollarIcon, UsersIcon, MailIcon, MessageSquareIcon, LayoutIcon, BarChartIcon } from "@/pages/utility/icons";

const TABS = [
  { label: "Overview", to: paths.marketing.root, end: true },
  { label: "Email", to: paths.marketing.tab("email") },
  { label: "SMS", to: paths.marketing.tab("sms") },
  { label: "Landing Pages", to: paths.marketing.tab("landing-pages") },
  { label: "Segments", to: paths.marketing.tab("segments") },
  { label: "Analytics", to: paths.marketing.tab("analytics") },
];

const TITLES: Record<string, string> = {
  overview: "Marketing Dashboard",
  email: "Email Campaigns",
  sms: "SMS Campaigns",
  "landing-pages": "Landing Pages",
  segments: "Audience Segments",
  analytics: "Marketing Analytics",
};

function Shell({ tab, children }: { tab: string; children: ReactNode }) {
  const title = TITLES[tab] ?? "Marketing";
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <PageHeader crumbs={[{ label: "Marketing" }, { label: title }]} title={title} />
        <Button icon={<PlusIcon size={14} />}>New campaign</Button>
      </div>
      <TabNav items={TABS} />
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function MarketingDashboardPage() {
  return (
    <Shell tab="overview">
      <DashboardContent />
    </Shell>
  );
}

export function MarketingTabPage() {
  const { tab = "email" } = useParams<{ tab: string }>();
  return (
    <Shell tab={tab}>
      {tab === "email" && <EmailContent />}
      {tab === "sms" && <SmsContent />}
      {tab === "landing-pages" && <LandingPagesContent />}
      {tab === "segments" && <SegmentsContent />}
      {tab === "analytics" && <AnalyticsContent />}
      {tab === "overview" && <DashboardContent />}
    </Shell>
  );
}

const KPIS = [
  { icon: DollarIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", delta: "+18.2%", label: "Ad spend", value: "$48,290", sub: "This month" },
  { icon: UsersIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", delta: "+9.4%", label: "New leads", value: "3,842", sub: "This month" },
  { icon: BarChartIcon, tint: "var(--info)", tintBg: "var(--info-soft)", delta: "+2.1%", label: "Avg. ROAS", value: "4.6x", sub: "Across channels" },
  { icon: MailIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", delta: "-1.3%", label: "Open rate", value: "38.4%", sub: "Email campaigns" },
];

const CAMPAIGNS = [
  { icon: BarChartIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", name: "Q3 Enterprise Push", channel: "Google Ads", spent: "$12,400", pct: 74, roas: 5.2, status: "Active" },
  { icon: MailIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", name: "Summer Sale Email", channel: "Email", spent: "$2,100", pct: 40, roas: 6.8, status: "Active" },
  { icon: UsersIcon, tint: "var(--info)", tintBg: "var(--info-soft)", name: "LinkedIn ABM", channel: "LinkedIn", spent: "$9,800", pct: 88, roas: 3.4, status: "Active" },
  { icon: MessageSquareIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", name: "Retention SMS", channel: "SMS", spent: "$650", pct: 22, roas: 7.1, status: "Scheduled" },
  { icon: LayoutIcon, tint: "var(--bad)", tintBg: "var(--bad-soft)", name: "Holiday Landing Page", channel: "Organic", spent: "$0", pct: 0, roas: 2.9, status: "Paused" },
];

function DashboardContent() {
  return (
    <div>
      <div className="mb-4.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[11px]" style={{ background: k.tintBg, color: k.tint }}>
                <k.icon size={18} />
              </span>
              <Badge variant={k.delta.startsWith("-") ? "danger" : "success"}>{k.delta}</Badge>
            </div>
            <p className="text-[11.5px] font-semibold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-t0">{k.value}</p>
            <p className="text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>
      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Active campaigns</CardTitle>
          <a href="#" className="text-[12.5px] font-bold text-acc">
            Manage all
          </a>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr] gap-2.5 border-b border-line pb-3 text-[10.5px] font-bold uppercase tracking-wide text-t2">
          <span>Campaign</span>
          <span className="text-right">Budget</span>
          <span className="text-right">ROAS</span>
          <span className="text-center">Status</span>
        </div>
        {CAMPAIGNS.map((c) => (
          <div key={c.name} className="grid grid-cols-[2fr_1fr_1fr_0.8fr] items-center gap-2.5 border-b border-line py-3.5 last:border-b-0 hover:bg-bg-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px]" style={{ background: c.tintBg, color: c.tint }}>
                <c.icon size={17} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-t0">{c.name}</p>
                <p className="text-[11px] text-t2">{c.channel}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold tabular-nums text-t0">{c.spent}</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-inset">
                <div className="h-full rounded-full bg-acc" style={{ width: `${c.pct}%` }} />
              </div>
            </div>
            <span className={`text-right text-[13.5px] font-extrabold tabular-nums ${c.roas >= 4 ? "text-ok" : "text-warn"}`}>{c.roas}x</span>
            <span className="justify-self-center">
              <Badge status={c.status}>{c.status}</Badge>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

const EMAIL_KPIS = [
  { label: "Sent", value: "84,200", sub: "Last 30 days", color: "var(--t0)" },
  { label: "Open rate", value: "38.4%", sub: "+2.1% vs prev.", color: "var(--ok)" },
  { label: "Click rate", value: "6.8%", sub: "+0.4% vs prev.", color: "var(--acc)" },
  { label: "Unsubscribe", value: "0.12%", sub: "-0.02% vs prev.", color: "var(--bad)" },
];

const EMAILS = [
  { subject: "Summer Sale — 30% off everything", date: "Jul 2, 2026", sent: "24,100", open: "42.1%", click: "8.3%", status: "Sent" },
  { subject: "New feature: AI-powered insights", date: "Jun 28, 2026", sent: "31,200", open: "39.6%", click: "7.1%", status: "Sent" },
  { subject: "Your weekly digest", date: "Jun 24, 2026", sent: "18,900", open: "35.2%", click: "5.4%", status: "Sent" },
  { subject: "Webinar invite: Q3 roadmap", date: "Jun 20, 2026", sent: "9,800", open: "44.8%", click: "11.2%", status: "Sent" },
  { subject: "August newsletter draft", date: "Scheduled Aug 1", sent: "—", open: "—", click: "—", status: "Scheduled" },
  { subject: "Cart abandonment reminder", date: "Draft", sent: "—", open: "—", click: "—", status: "Draft" },
];

function EmailContent() {
  return (
    <div>
      <div className="mb-4.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EMAIL_KPIS.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold tabular-nums" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>
      <Card padding="none" className="overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_0.9fr] gap-3 border-b border-line px-5 py-3.5 text-[10.5px] font-bold uppercase tracking-wide text-t2">
          <span>Email</span>
          <span className="text-right">Sent</span>
          <span className="text-right">Open rate</span>
          <span className="text-right">Click rate</span>
          <span className="text-center">Status</span>
        </div>
        {EMAILS.map((e) => (
          <div key={e.subject} className="grid grid-cols-[2fr_1fr_1fr_1fr_0.9fr] items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0 hover:bg-bg-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-t0">{e.subject}</p>
              <p className="text-[11px] text-t2">{e.date}</p>
            </div>
            <span className="text-right text-[13px] font-bold tabular-nums text-t0">{e.sent}</span>
            <span className="text-right text-[13px] font-bold tabular-nums text-ok">{e.open}</span>
            <span className="text-right text-[13px] font-bold tabular-nums text-acc">{e.click}</span>
            <span className="justify-self-center">
              <Badge status={e.status}>{e.status}</Badge>
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

const SMS_KPIS = [
  { label: "Sent", value: "12,480", sub: "Last 30 days", color: "var(--t0)" },
  { label: "Delivery rate", value: "98.6%", sub: "+0.3% vs prev.", color: "var(--ok)" },
  { label: "CTR", value: "14.2%", sub: "+1.8% vs prev.", color: "var(--acc)" },
  { label: "Opt-outs", value: "0.4%", sub: "-0.1% vs prev.", color: "var(--bad)" },
];

const SMS_LIST = [
  { name: "Flash Sale Alert", status: "Sent", preview: "48hr flash sale — 25% off sitewide. Shop now →", sent: "4,820", ctr: "16.4%" },
  { name: "Order Shipped", status: "Automated", preview: "Your order #48291 has shipped and is on its way!", sent: "3,102", ctr: "22.1%" },
  { name: "Cart Reminder", status: "Automated", preview: "You left something in your cart — complete your order.", sent: "2,450", ctr: "9.8%" },
  { name: "Win-back Offer", status: "Scheduled", preview: "We miss you! Here's 15% off your next order.", sent: "1,890", ctr: "—" },
];

function SmsContent() {
  return (
    <div>
      <div className="mb-4.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SMS_KPIS.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold tabular-nums" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {SMS_LIST.map((s) => (
          <Card key={s.name} className="flex flex-wrap items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-acc-soft text-acc">
              <MessageSquareIcon size={20} />
            </span>
            <div className="min-w-[180px] flex-[2]">
              <div className="mb-1 flex items-center gap-2">
                <p className="text-sm font-bold text-t0">{s.name}</p>
                <Badge status={s.status}>{s.status}</Badge>
              </div>
              <p className="text-[12.5px] leading-normal text-t2">{s.preview}</p>
            </div>
            <div className="min-w-[80px] flex-1 text-center">
              <p className="text-lg font-extrabold tabular-nums text-t0">{s.sent}</p>
              <p className="text-[11px] text-t2">Sent</p>
            </div>
            <div className="min-w-[80px] flex-1 text-center">
              <p className="text-lg font-extrabold tabular-nums text-ok">{s.ctr}</p>
              <p className="text-[11px] text-t2">CTR</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

const LANDING_PAGES = [
  { name: "Enterprise Landing", slug: "enterprise", status: "Live", visits: "12.4k", conv: "4.8%", color: "#7c5cff" },
  { name: "Summer Sale", slug: "summer-sale", status: "Live", visits: "28.1k", conv: "6.2%", color: "#33d493" },
  { name: "Webinar Signup", slug: "webinar-q3", status: "Live", visits: "5.6k", conv: "12.1%", color: "#56a8ff" },
  { name: "Product Launch", slug: "launch-2026", status: "Draft", visits: "0", conv: "—", color: "#f7b84e" },
  { name: "Referral Program", slug: "refer", status: "Live", visits: "9.2k", conv: "3.4%", color: "#f76d7d" },
  { name: "Holiday Promo", slug: "holiday", status: "Archived", visits: "41.8k", conv: "5.9%", color: "#9d86ff" },
];

function LandingPagesContent() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {LANDING_PAGES.map((p) => (
        <Card key={p.name} padding="none" className="cursor-pointer overflow-hidden hover:border-line-2">
          <div className="relative flex h-[130px] items-center justify-center" style={{ background: `linear-gradient(135deg,${p.color},${p.color}99)` }}>
            <LayoutIcon size={40} className="text-white/60" />
            <span className="absolute right-2.5 top-2.5">
              <Badge status={p.status}>{p.status}</Badge>
            </span>
          </div>
          <div className="p-4">
            <p className="truncate text-sm font-bold text-t0">{p.name}</p>
            <p className="mb-3 text-[11.5px] text-t2">/{p.slug}</p>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <div>
                <p className="text-[15px] font-extrabold text-t0">{p.visits}</p>
                <p className="text-[10.5px] text-t2">Visits</p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-extrabold text-ok">{p.conv}</p>
                <p className="text-[10.5px] text-t2">Conversion</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

const SEGMENTS = [
  { emoji: "💎", name: "VIP Customers", rule: "LTV > $5,000", size: "1,240", pct: "3.2%", growth: "+8.1%" },
  { emoji: "🛒", name: "Cart Abandoners", rule: "Cart activity, no purchase 7d", size: "6,820", pct: "17.6%", growth: "+2.4%" },
  { emoji: "🆕", name: "New Signups", rule: "Joined in last 30 days", size: "4,105", pct: "10.6%", growth: "+21.3%" },
  { emoji: "😴", name: "Dormant Users", rule: "No activity in 90 days", size: "9,940", pct: "25.7%", growth: "-4.2%" },
  { emoji: "⭐", name: "Power Users", rule: "10+ sessions / week", size: "2,310", pct: "6.0%", growth: "+5.7%" },
  { emoji: "🌍", name: "EU Region", rule: "Location = Europe", size: "11,290", pct: "29.2%", growth: "+1.1%" },
];

function SegmentsContent() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SEGMENTS.map((a) => (
        <Card key={a.name}>
          <div className="mb-3.5 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-acc-soft text-xl">{a.emoji}</span>
            <div className="flex-1">
              <p className="text-[14.5px] font-bold text-t0">{a.name}</p>
              <p className="mt-0.5 text-[11.5px] text-t2">{a.rule}</p>
            </div>
          </div>
          <div className="mb-3 flex items-baseline gap-2">
            <span className="text-[26px] font-extrabold tabular-nums text-t0">{a.size}</span>
            <span className="text-xs text-t2">contacts</span>
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-[11.5px] text-t2">{a.pct} of total</span>
            <span className={`text-[11.5px] font-bold ${a.growth.startsWith("-") ? "text-bad" : "text-ok"}`}>{a.growth}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

const FUNNEL = [
  { name: "Impressions", value: "412,800", w: "100%", bg: "var(--acc)" },
  { name: "Clicks", value: "38,210", w: "68%", bg: "var(--acc-2)" },
  { name: "Leads", value: "8,420", w: "42%", bg: "#56a8ff" },
  { name: "MQLs", value: "3,180", w: "24%", bg: "#7c5cff99" },
  { name: "Customers", value: "1,560", w: "12%", bg: "#7c5cff66" },
];

const MIX = [
  { name: "Organic search", color: "#7c5cff", val: "3,120", pct: 37 },
  { name: "Paid social", color: "#56a8ff", val: "2,080", pct: 25 },
  { name: "Email", color: "#33d493", val: "1,540", pct: 18 },
  { name: "Referral", color: "#f7b84e", val: "980", pct: 12 },
  { name: "Direct", color: "#f76d7d", val: "700", pct: 8 },
];

const CHANNELS = MIX.map((m) => ({ ...m, dc: "var(--ok)" }));

function AnalyticsContent() {
  return (
    <div>
      <div className="mb-4.5 grid grid-cols-1 gap-4.5 lg:grid-cols-[1.6fr_1fr]">
        <Card padding="lg">
          <div className="mb-4.5 flex items-start justify-between">
            <div>
              <CardTitle>Marketing funnel</CardTitle>
              <p className="mt-1.5 text-[12.5px] text-t2">Awareness → acquisition this month</p>
            </div>
            <Badge variant="success">3.8% CVR</Badge>
          </div>
          <div className="flex flex-col gap-3.5">
            {FUNNEL.map((f) => (
              <div key={f.name} className="flex items-center gap-3.5">
                <div className="w-[90px] shrink-0 text-right">
                  <span className="text-xs font-semibold text-t2">{f.name}</span>
                </div>
                <div className="flex-1">
                  <div className="flex h-[34px] items-center rounded-lg px-3" style={{ width: f.w, background: f.bg }}>
                    <span className="text-[13px] font-extrabold tabular-nums text-white">{f.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card padding="lg" className="flex flex-col">
          <CardTitle>Channel mix</CardTitle>
          <p className="mb-2 mt-1 text-[12.5px] text-t2">Traffic share by source</p>
          <div className="mx-auto my-2">
            <DonutChart segments={MIX.map((m) => ({ label: m.name, value: m.pct, color: m.color }))} centerValue="8,420" centerLabel="conversions" size={152} />
          </div>
        </Card>
      </div>
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Conversions by channel</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          {CHANNELS.map((c) => (
            <div key={c.name}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-t1">
                  <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c.color }} />
                  {c.name}
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11.5px] text-t2">{c.val}</span>
                  <span className="text-xs font-bold text-ok">{c.pct}%</span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-inset">
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-4.5">
        <Card padding="lg">
          <CardTitle>Traffic trend</CardTitle>
          <div className="mt-3">
            <AreaLineChart data={[2200, 2800, 2400, 3100, 3400, 3000, 3800]} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} height={180} />
          </div>
        </Card>
      </div>
    </div>
  );
}
