import { Card } from "@/components/ui";
import { SearchIcon, ZapIcon, DollarIcon, UsersIcon, KeyIcon, BarChartIcon, ShieldIcon } from "@/pages/utility/icons";

const TOPICS = [
  { icon: ZapIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", name: "Getting started", desc: "Set up your workspace and invite your team.", count: 18 },
  { icon: DollarIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", name: "Billing & plans", desc: "Manage subscriptions, invoices and payment methods.", count: 12 },
  { icon: UsersIcon, tint: "var(--info)", tintBg: "var(--info-soft)", name: "Team & permissions", desc: "Roles, access control and member management.", count: 9 },
  { icon: KeyIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", name: "API & developers", desc: "Authentication, endpoints and webhooks.", count: 24 },
  { icon: BarChartIcon, tint: "#9d86ff", tintBg: "#9d86ff22", name: "Analytics", desc: "Build dashboards and understand your metrics.", count: 31 },
  { icon: ShieldIcon, tint: "var(--bad)", tintBg: "var(--bad-soft)", name: "Security & privacy", desc: "Data protection, compliance and 2FA.", count: 7 },
];

export function HelpCenterPage() {
  return (
    <div>
      <div
        className="relative mb-6 overflow-hidden rounded-[20px] px-8 py-11 text-center"
        style={{ background: "linear-gradient(135deg,#1b1650,#0f3050)" }}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 80% at 50% 0%,rgba(124,92,255,.35),transparent 60%)" }} />
        <div className="relative">
          <h1 className="mb-2.5 text-[28px] font-extrabold tracking-tight text-white">How can we help?</h1>
          <p className="mb-5 text-sm text-white/70">Search our help center or browse topics below.</p>
          <div
            className="mx-auto flex h-[50px] max-w-[480px] items-center gap-2.5 rounded-[14px] px-4.5"
            style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", backdropFilter: "blur(8px)" }}
          >
            <SearchIcon size={18} className="text-white/70" />
            <input placeholder="Search for help…" className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/60" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => (
          <Card key={t.name} className="cursor-pointer hover:border-line-2">
            <span className="mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-[13px]" style={{ background: t.tintBg, color: t.tint }}>
              <t.icon size={22} />
            </span>
            <p className="mb-1.5 text-[15px] font-bold text-t0">{t.name}</p>
            <p className="mb-3 text-[12.5px] leading-normal text-t2">{t.desc}</p>
            <span className="text-xs font-bold text-acc">{t.count} articles →</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
