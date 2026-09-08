import { useParams } from "react-router-dom";
import { Badge, Button, Card, CardHeader, CardTitle, PageHeader, TabNav, Switch } from "@/components/ui";
import { FormField, Input, Textarea, Select } from "@/components/ui";
import { paths } from "@/router/paths";
import { BrandLogo } from "@/components/BrandLogo";
import { KeyIcon, PlusIcon, TrashIcon, LaptopIcon, SmartphoneIcon, GlobeIcon, CheckIcon } from "@/pages/utility/icons";
import { useState } from "react";

const TABS = [
  { label: "Profile", to: paths.account.tab("profile") },
  { label: "Settings", to: paths.account.tab("settings") },
  { label: "Security", to: paths.account.tab("security") },
  { label: "Billing", to: paths.account.tab("billing") },
  { label: "Notifications", to: paths.account.tab("notifications") },
  { label: "Connected Apps", to: paths.account.tab("connected-apps") },
  { label: "API", to: paths.account.tab("api") },
];

const TITLES: Record<string, string> = {
  profile: "Profile",
  settings: "Account Settings",
  security: "Security",
  billing: "Billing",
  notifications: "Notifications",
  "connected-apps": "Connected Apps",
  api: "API Keys",
};

export function AccountPage() {
  const { tab = "profile" } = useParams<{ tab: string }>();
  const title = TITLES[tab] ?? "Account";

  return (
    <div>
      <PageHeader crumbs={[{ label: "Account" }, { label: title }]} title={title} />
      <TabNav items={TABS} />
      <div className="mt-6">
        {tab === "profile" && <ProfileTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "billing" && <BillingTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "connected-apps" && <ConnectedAppsTab />}
        {tab === "api" && <ApiTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr] lg:items-start">
      <Card className="text-center">
        <div className="relative mx-auto mb-3.5 inline-block">
          <span
            className="flex h-[88px] w-[88px] items-center justify-center rounded-[24px] text-[32px] font-extrabold text-white"
            style={{ background: "linear-gradient(135deg,#7c5cff,#56a8ff)" }}
          >
            EP
          </span>
          <button className="absolute -bottom-1 -right-1 flex h-[30px] w-[30px] items-center justify-center rounded-full border-[3px] border-bg-2 bg-acc text-white">
            <PlusIcon size={13} />
          </button>
        </div>
        <h2 className="mb-0.5 text-lg font-extrabold text-t0">Elena Park</h2>
        <p className="mb-3.5 text-[13px] text-t2">VP of Sales</p>
        <Badge variant="accent">Admin</Badge>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="First name">
            <Input defaultValue="Elena" />
          </FormField>
          <FormField label="Last name">
            <Input defaultValue="Park" />
          </FormField>
          <FormField label="Email">
            <Input defaultValue="elena@vela.io" />
          </FormField>
          <FormField label="Phone">
            <Input defaultValue="+1 (415) 555-0192" />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Bio">
              <Textarea defaultValue="Experienced sales leader driving enterprise growth across the West Coast." />
            </FormField>
          </div>
        </div>
        <div className="mt-4.5 flex justify-end gap-2.5">
          <Button variant="outline">Cancel</Button>
          <Button>Save changes</Button>
        </div>
      </Card>
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

function SettingsTab() {
  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Language">
            <Select defaultValue="English (US)">
              <option>English (US)</option>
              <option>العربية</option>
              <option>Français</option>
              <option>Español</option>
            </Select>
          </FormField>
          <FormField label="Timezone">
            <Select>
              <option>PST (UTC−8)</option>
              <option>EST (UTC−5)</option>
              <option>GMT (UTC+0)</option>
            </Select>
          </FormField>
          <FormField label="Date format">
            <Select>
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </Select>
          </FormField>
          <FormField label="Currency">
            <Select>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </Select>
          </FormField>
        </div>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <ToggleRow name="Compact mode" desc="Reduce spacing across tables and lists" defaultOn />
        <ToggleRow name="Show avatars" desc="Display user avatars throughout the app" defaultOn />
        <ToggleRow name="Animations" desc="Enable interface motion and transitions" />
      </Card>
      <Card className="border-bad-soft">
        <h3 className="mb-1.5 text-[15px] font-bold text-bad">Danger zone</h3>
        <p className="mb-4 text-[12.5px] text-t2">Permanently delete your account and all associated data.</p>
        <Button variant="outline" className="border-bad-soft text-bad hover:bg-bad-soft">
          Delete account
        </Button>
      </Card>
    </div>
  );
}

const SESSIONS = [
  { icon: LaptopIcon, device: "MacBook Pro · Chrome", location: "San Francisco, US", time: "Active now", current: true },
  { icon: SmartphoneIcon, device: "iPhone 15 · Safari", location: "San Francisco, US", time: "2 hours ago", current: false },
  { icon: GlobeIcon, device: "Windows PC · Edge", location: "Austin, US", time: "3 days ago", current: false },
];

function SecurityTab() {
  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3.5">
          <FormField label="Current password">
            <Input type="password" defaultValue="password123" />
          </FormField>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <FormField label="New password">
              <Input type="password" placeholder="8+ characters" />
            </FormField>
            <FormField label="Confirm password">
              <Input type="password" placeholder="Re-enter" />
            </FormField>
          </div>
          <Button className="self-start">Update password</Button>
        </div>
      </Card>
      <Card>
        <div className="mb-1.5 flex items-center justify-between">
          <CardTitle>Two-factor authentication</CardTitle>
          <Badge variant="success">Enabled</Badge>
        </div>
        <p className="mb-4 text-[12.5px] leading-relaxed text-t2">Add an extra layer of security using an authenticator app.</p>
        <Button variant="outline">Manage 2FA</Button>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
        </CardHeader>
        {SESSIONS.map((s) => (
          <div key={s.device} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-bg-inset text-t2">
              <s.icon size={17} />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-t0">{s.device}</p>
              <p className="mt-0.5 text-[11.5px] text-t2">
                {s.location} · {s.time}
              </p>
            </div>
            {s.current ? (
              <Badge variant="success">This device</Badge>
            ) : (
              <Button variant="outline" size="sm" className="border-line text-bad hover:bg-bad-soft">
                Revoke
              </Button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

const INVOICES = [
  { id: "INV-2041", date: "Jul 1, 2026", amount: "$499.00" },
  { id: "INV-2033", date: "Jun 1, 2026", amount: "$499.00" },
  { id: "INV-2019", date: "May 1, 2026", amount: "$499.00" },
  { id: "INV-1998", date: "Apr 1, 2026", amount: "$499.00" },
];

function BillingTab() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="flex flex-col gap-4.5">
        <Card>
          <CardHeader>
            <CardTitle>Payment methods</CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3.5 rounded-[13px] border border-acc-soft bg-bg-inset px-4 py-3.5">
              <span
                className="flex h-[30px] w-11 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#1a1f71,#2b3a8f)" }}
              >
                VISA
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-t0">•••• •••• •••• 4242</p>
                <p className="mt-0.5 text-[11.5px] text-t2">Expires 08/2027</p>
              </div>
              <Badge variant="accent">Default</Badge>
            </div>
            <div className="flex items-center gap-3.5 rounded-[13px] border border-line bg-bg-inset px-4 py-3.5">
              <span
                className="flex h-[30px] w-11 shrink-0 items-center justify-center rounded-md text-[9px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#eb001b,#f79e1b)" }}
              >
                MC
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-t0">•••• •••• •••• 8801</p>
                <p className="mt-0.5 text-[11.5px] text-t2">Expires 03/2026</p>
              </div>
              <Button variant="outline" size="sm">
                Remove
              </Button>
            </div>
            <button className="flex h-[42px] items-center justify-center gap-1.5 rounded-xl border border-dashed border-line text-[13px] font-semibold text-t2 hover:border-acc hover:text-acc">
              <PlusIcon size={15} />
              Add payment method
            </button>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Billing history</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] gap-3 border-b border-line pb-2.5 text-[10.5px] font-bold uppercase tracking-wide text-t2">
            <span>Invoice</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span className="text-center">Status</span>
          </div>
          {INVOICES.map((i) => (
            <div key={i.id} className="grid grid-cols-[1.4fr_1fr_1fr_0.8fr] items-center gap-3 border-b border-line py-3 last:border-b-0">
              <span className="text-[13px] font-bold text-acc">{i.id}</span>
              <span className="text-[12.5px] text-t2">{i.date}</span>
              <span className="text-right text-[13px] font-bold tabular-nums text-t0">{i.amount}</span>
              <span className="justify-self-center">
                <Badge variant="success">Paid</Badge>
              </span>
            </div>
          ))}
        </Card>
      </div>
      <Card>
        <Badge variant="accent">Current plan</Badge>
        <h2 className="mb-1 mt-3.5 text-[22px] font-extrabold text-t0">Enterprise</h2>
        <p className="mb-4 text-[13px] text-t2">
          <strong className="text-xl text-t0">$499</strong>/month
        </p>
        <div className="mb-4.5 flex flex-col gap-2">
          {["Unlimited seats", "Advanced analytics", "Priority support"].map((f) => (
            <span key={f} className="flex items-center gap-2 text-[12.5px] text-t1">
              <CheckIcon size={15} className="text-ok" />
              {f}
            </span>
          ))}
        </div>
        <p className="mb-3.5 text-[11.5px] text-t2">Next billing: Aug 1, 2026</p>
        <Button variant="outline" fullWidth>
          Manage plan
        </Button>
      </Card>
    </div>
  );
}

export const NOTIF_ROWS = [
  { name: "Product updates", desc: "New features and improvements", email: true, push: true, sms: false },
  { name: "Security alerts", desc: "Login attempts and password changes", email: true, push: true, sms: true },
  { name: "Billing", desc: "Invoices and payment reminders", email: true, push: false, sms: false },
  { name: "Team activity", desc: "Mentions, comments and assignments", email: true, push: true, sms: false },
  { name: "Marketing", desc: "Tips, offers and newsletters", email: false, push: false, sms: false },
];

export function NotifDot({ on }: { on: boolean }) {
  return (
    <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-[7px] ${on ? "bg-ok" : "bg-bg-inset"}`}>
      {on && <CheckIcon size={13} className="text-white" />}
    </span>
  );
}

function NotificationsTab() {
  return (
    <Card className="max-w-[720px]">
      <h3 className="mb-1 text-[15px] font-bold text-t0">Notification preferences</h3>
      <p className="mb-4.5 text-[12.5px] text-t2">Choose how and when you want to be notified.</p>
      <div className="grid grid-cols-[2fr_auto_auto_auto] gap-3 border-b border-line pb-3 text-[10.5px] font-bold uppercase tracking-wide text-t2">
        <span>Notify me about</span>
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

export const CONNECTIONS = [
  { brand: "slack", name: "Slack", desc: "Team messaging & alerts", connected: true },
  { brand: "google-drive", name: "Google Drive", desc: "File storage & sync", connected: true },
  { brand: "github", name: "GitHub", desc: "Code repositories", connected: true },
  { brand: "salesforce", name: "Salesforce", desc: "CRM & customer data", connected: false },
  { brand: "zapier", name: "Zapier", desc: "Workflow automation", connected: false },
  { brand: "google-calendar", name: "Google Calendar", desc: "Scheduling & events", connected: true },
] as const;

function ConnectedAppsTab() {
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
                Disconnect
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

export const API_KEYS = [
  { name: "Production key", env: "Live", envColor: "var(--ok)", key: "sk_live_••••••••••••4f2a", created: "Jan 12, 2026", used: "2 hours ago" },
  { name: "Staging key", env: "Test", envColor: "var(--warn)", key: "sk_test_••••••••••••9c1b", created: "Feb 3, 2026", used: "1 day ago" },
  { name: "CI/CD key", env: "Test", envColor: "var(--warn)", key: "sk_test_••••••••••••7e88", created: "Mar 18, 2026", used: "5 days ago" },
];

function ApiTab() {
  return (
    <Card>
      <div className="mb-1.5 flex items-center justify-between">
        <CardTitle>API keys</CardTitle>
        <Button icon={<PlusIcon size={14} />}>Create key</Button>
      </div>
      <p className="mb-4.5 text-[12.5px] text-t2">Manage keys used to authenticate API requests. Keep them secret.</p>
      <div className="flex flex-col gap-2.5">
        {API_KEYS.map((k) => (
          <div key={k.name} className="flex flex-col gap-3 rounded-[13px] border border-line bg-bg-inset px-4 py-3.5 sm:flex-row sm:items-center">
            <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-acc-soft text-acc">
              <KeyIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13.5px] font-bold text-t0">{k.name}</p>
                <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ color: k.envColor, background: k.envColor + "22" }}>
                  {k.env}
                </span>
              </div>
              <p className="mt-0.5 truncate font-mono text-xs text-t2">{k.key}</p>
            </div>
            <div className="shrink-0 text-right text-[11.5px] text-t2">
              <p>Created {k.created}</p>
              <p className="mt-0.5">Last used {k.used}</p>
            </div>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-line text-bad hover:bg-bad-soft">
              <TrashIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
