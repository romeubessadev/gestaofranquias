import { useParams } from "react-router-dom";
import { useState } from "react";
import { Badge, Button, Card, CardHeader, CardTitle, PageHeader, TabNav, Switch } from "@/components/ui";
import { FormField, Input, Select } from "@/components/ui";
import { paths } from "@/router/paths";
import { CheckIcon } from "@/pages/utility/icons";
import { BrandLogo } from "@/components/BrandLogo";
import { CONNECTIONS, API_KEYS, NOTIF_ROWS, NotifDot } from "@/pages/account/AccountPage";

const TABS = [
  { label: "General", to: paths.settings.tab("general") },
  { label: "Company", to: paths.settings.tab("company") },
  { label: "Theme", to: paths.settings.tab("theme") },
  { label: "Appearance", to: paths.settings.tab("appearance") },
  { label: "Locale", to: paths.settings.tab("locale") },
  { label: "Notifications", to: paths.settings.tab("notifications") },
  { label: "Integrations", to: paths.settings.tab("integrations") },
  { label: "API", to: paths.settings.tab("api") },
];

const TITLES: Record<string, string> = {
  general: "General",
  company: "Company",
  theme: "Theme",
  appearance: "Appearance",
  locale: "Localization",
  notifications: "Notifications",
  integrations: "Integrations",
  api: "API & Webhooks",
};

export function SettingsPage() {
  const { tab = "general" } = useParams<{ tab: string }>();
  const title = TITLES[tab] ?? "Settings";

  return (
    <div>
      <PageHeader crumbs={[{ label: "Settings" }, { label: title }]} title={title} />
      <TabNav items={TABS} />
      <div className="mt-6">
        {tab === "general" && <GeneralTab />}
        {tab === "company" && <CompanyTab />}
        {tab === "theme" && <ThemeTab />}
        {tab === "appearance" && <AppearanceTab />}
        {tab === "locale" && <LocaleTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "integrations" && <IntegrationsTab />}
        {tab === "api" && <ApiTab />}
      </div>
    </div>
  );
}

function ToggleRow({ name, desc, defaultOn }: { name: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
      <div>
        <p className="text-[13.5px] font-bold text-t0">{name}</p>
        <p className="mt-0.5 text-xs text-t2">{desc}</p>
      </div>
      <Switch checked={on} onChange={setOn} />
    </div>
  );
}

function GeneralTab() {
  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Workspace name">
            <Input defaultValue="Vela Inc." />
          </FormField>
          <FormField label="Workspace URL">
            <Input defaultValue="vela.io/app" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Support email">
              <Input defaultValue="support@vela.io" />
            </FormField>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>General preferences</CardTitle>
        </CardHeader>
        <ToggleRow name="Two-factor requirement" desc="Require 2FA for all workspace members" defaultOn />
        <ToggleRow name="Guest access" desc="Allow guests to view shared resources" defaultOn />
        <ToggleRow name="Auto-archive" desc="Archive inactive projects after 90 days" />
        <ToggleRow name="Usage analytics" desc="Share anonymized usage data with us" defaultOn />
      </Card>
    </div>
  );
}

function CompanyTab() {
  return (
    <div className="grid max-w-[900px] grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>Company information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Legal name">
              <Input defaultValue="Vela Technologies, Inc." />
            </FormField>
          </div>
          <FormField label="Industry">
            <Select>
              <option>Software / SaaS</option>
              <option>Ecommerce</option>
              <option>Finance</option>
            </Select>
          </FormField>
          <FormField label="Company size">
            <Select>
              <option>51–200</option>
              <option>1–50</option>
              <option>201–500</option>
            </Select>
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Registered address">
              <Input defaultValue="185 Berry St, Suite 800, San Francisco, CA 94107" />
            </FormField>
          </div>
          <FormField label="Tax ID">
            <Input defaultValue="US 88-1234567" />
          </FormField>
          <FormField label="Founded">
            <Input defaultValue="2021" />
          </FormField>
        </div>
      </Card>
      <Card className="text-center">
        <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Company logo</p>
        <span
          className="mx-auto mb-3.5 flex h-20 w-20 items-center justify-center rounded-[20px] text-[32px] font-extrabold text-white"
          style={{ background: "linear-gradient(135deg,#7c5cff,#56a8ff)" }}
        >
          V
        </span>
        <button className="h-[38px] w-full rounded-[10px] border border-dashed border-line text-[12.5px] font-semibold text-t2 hover:border-acc hover:text-acc">
          Upload new logo
        </button>
      </Card>
    </div>
  );
}

const ACCENTS = ["#7c5cff", "#56a8ff", "#2fd48f", "#ff7a5c", "#f7b84e", "#f76d7d"];

function ThemeTab() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<"dark" | "light" | "system">("dark");
  return (
    <div className="flex max-w-[760px] flex-col gap-4.5">
      <Card>
        <h3 className="mb-1 text-[15px] font-bold text-t0">Color mode</h3>
        <p className="mb-4.5 text-[12.5px] text-t2">Choose how the interface looks</p>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {(["dark", "light", "system"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-[14px] border-2 p-3.5 text-left ${mode === m ? "border-acc" : "border-line hover:border-line-2"}`}
            >
              <div
                className="mb-2.5 h-16 rounded-[9px] border"
                style={{
                  background: m === "dark" ? "#0c0e15" : m === "light" ? "#f5f6fa" : "linear-gradient(135deg,#0c0e15 50%,#f5f6fa 50%)",
                  borderColor: m === "light" ? "#e2e5ee" : "#1e2230",
                }}
              />
              <div className="flex items-center gap-1.5">
                {mode === m && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-acc">
                    <CheckIcon size={10} className="text-white" />
                  </span>
                )}
                <span className="text-[12.5px] font-bold capitalize text-t0">{m}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="mb-1 text-[15px] font-bold text-t0">Accent color</h3>
        <p className="mb-4.5 text-[12.5px] text-t2">Pick a primary color for buttons and highlights</p>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((c, i) => (
            <button
              key={c}
              onClick={() => setActive(i)}
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: c, boxShadow: active === i ? `0 0 0 2px var(--bg-2), 0 0 0 4px ${c}` : "none" }}
            >
              {active === i && <CheckIcon size={18} className="text-white" />}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AppearanceTab() {
  const rows: Array<{ name: string; desc: string; toggle: boolean; opts?: string[]; on?: boolean }> = [
    { name: "Compact density", desc: "Tighter spacing across tables and lists", toggle: true, on: true },
    { name: "Sidebar collapsed by default", desc: "Start with a collapsed navigation sidebar", toggle: true, on: false },
    { name: "Font size", desc: "Base font size across the interface", toggle: false, opts: ["Small", "Medium", "Large"] },
    { name: "Table row height", desc: "Default row height in data tables", toggle: false, opts: ["Compact", "Comfortable", "Spacious"] },
    { name: "Card corner radius", desc: "Roundness of cards and panels", toggle: false, opts: ["Sharp", "Rounded", "Extra rounded"] },
  ];
  return (
    <Card className="max-w-[720px]">
      <CardHeader>
        <CardTitle>Layout &amp; density</CardTitle>
      </CardHeader>
      {rows.map((a) => (
        <div key={a.name} className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-b-0">
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-bold text-t0">{a.name}</p>
            <p className="mt-0.5 text-xs text-t2">{a.desc}</p>
          </div>
          {a.toggle ? (
            <ToggleInline defaultOn={a.on} />
          ) : (
            <Select className="h-[38px] shrink-0" style={{ width: 180 }}>
              {a.opts?.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          )}
        </div>
      ))}
    </Card>
  );
}

function ToggleInline({ defaultOn }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return <Switch checked={on} onChange={setOn} />;
}

function LocaleTab() {
  const [rtl, setRtl] = useState(false);
  return (
    <Card className="max-w-[720px]">
      <CardHeader>
        <CardTitle>Regional settings</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Language">
          <Select>
            <option>English (US)</option>
            <option>العربية</option>
            <option>Français</option>
            <option>Deutsch</option>
            <option>Español</option>
          </Select>
        </FormField>
        <FormField label="Region">
          <Select>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>UAE</option>
          </Select>
        </FormField>
        <FormField label="Timezone">
          <Select>
            <option>PST (UTC−8)</option>
            <option>EST (UTC−5)</option>
            <option>GMT (UTC+0)</option>
          </Select>
        </FormField>
        <FormField label="Currency">
          <Select>
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
          </Select>
        </FormField>
        <FormField label="Date format">
          <Select>
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </Select>
        </FormField>
        <FormField label="First day of week">
          <Select>
            <option>Sunday</option>
            <option>Monday</option>
          </Select>
        </FormField>
      </div>
      <div className="mt-4.5 flex items-center justify-between border-t border-line pt-4.5">
        <div>
          <p className="text-[13.5px] font-bold text-t0">Right-to-left (RTL)</p>
          <p className="mt-0.5 text-xs text-t2">Mirror the layout for RTL languages</p>
        </div>
        <Switch checked={rtl} onChange={setRtl} />
      </div>
    </Card>
  );
}

function NotificationsTab() {
  return (
    <Card className="max-w-[720px]">
      <h3 className="mb-1 text-[15px] font-bold text-t0">Notification channels</h3>
      <p className="mb-4.5 text-[12.5px] text-t2">Configure workspace-wide notification defaults.</p>
      <div className="grid grid-cols-[2fr_auto_auto_auto] gap-3 border-b border-line pb-3 text-[10.5px] font-bold uppercase tracking-wide text-t2">
        <span>Event</span>
        <span className="w-[50px] text-center">Email</span>
        <span className="w-[50px] text-center">Push</span>
        <span className="w-[50px] text-center">SMS</span>
      </div>
      {NOTIF_ROWS.map((n) => (
        <div key={n.name} className="grid grid-cols-[2fr_auto_auto_auto] items-center gap-3 border-b border-line py-3.5 last:border-b-0">
          <div>
            <p className="text-[13.5px] font-bold text-t0">{n.name}</p>
            <p className="mt-0.5 text-[11.5px] text-t2">{n.desc}</p>
          </div>
          <span className="flex w-[50px] justify-center">
            <NotifDot on={n.email} />
          </span>
          <span className="flex w-[50px] justify-center">
            <NotifDot on={n.push} />
          </span>
          <span className="flex w-[50px] justify-center">
            <NotifDot on={n.sms} />
          </span>
        </div>
      ))}
    </Card>
  );
}

function IntegrationsTab() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CONNECTIONS.map((c) => (
        <Card key={c.name}>
          <div className="mb-3.5 flex items-center gap-3">
            <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] border border-line bg-bg-inset">
              <BrandLogo brand={c.brand} />
            </span>
            <div className="flex-1">
              <p className="text-[14.5px] font-bold text-t0">{c.name}</p>
              <p className="mt-0.5 text-[11.5px] text-t2">{c.desc}</p>
            </div>
          </div>
          {c.connected ? (
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-ok">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                Connected
              </span>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          ) : (
            <Button fullWidth size="sm" className="mt-3">
              Connect
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

const WEBHOOKS = [
  { url: "https://api.vela.io/hooks/orders", active: true },
  { url: "https://api.vela.io/hooks/billing", active: false },
];

function ApiTab() {
  return (
    <div className="flex flex-col gap-4.5">
      <Card>
        <div className="mb-1.5 flex items-center justify-between">
          <CardTitle>API keys</CardTitle>
          <Button icon={<span className="text-base leading-none">+</span>}>Create key</Button>
        </div>
        <p className="mb-4.5 text-[12.5px] text-t2">Keys authenticate requests to the Vela API. Keep them secret.</p>
        <div className="flex flex-col gap-2.5">
          {API_KEYS.map((k) => (
            <div key={k.name} className="flex flex-col gap-3 rounded-[13px] border border-line bg-bg-inset px-4 py-3.5 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-bold text-t0">{k.name}</p>
                  <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ color: k.envColor, background: k.envColor + "22" }}>
                    {k.env}
                  </span>
                </div>
                <p className="mt-0.5 truncate font-mono text-xs text-t2">{k.key}</p>
              </div>
              <span className="shrink-0 text-[11.5px] text-t2">Used {k.used}</span>
              <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-line text-bad hover:bg-bad-soft">
                ×
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card className="max-w-[720px]">
        <CardHeader>
          <CardTitle>Webhooks</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-2.5">
          {WEBHOOKS.map((w) => (
            <div key={w.url} className="flex items-center gap-3 rounded-xl bg-bg-inset px-3.5 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${w.active ? "bg-ok" : "bg-t2"}`} />
              <span className="flex-1 truncate font-mono text-[12.5px] text-t1">{w.url}</span>
              <Badge variant={w.active ? "success" : "neutral"}>{w.active ? "Active" : "Paused"}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
