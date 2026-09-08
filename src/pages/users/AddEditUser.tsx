import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Badge, Breadcrumbs, Button, Card, FormField, Input, Select, Switch, useToast } from "@/components/ui";
import { paths } from "@/router/paths";
import { roles, users } from "@/data/users";
import { Icon, icons } from "./Icons";

const managerPerms = [
  { name: "View reports", on: true },
  { name: "Edit deals", on: true },
  { name: "Manage team", on: true },
  { name: "Billing access", on: false },
  { name: "Admin settings", on: false },
];

const notifDefaults = [
  { label: "Email notifications", desc: "Task updates, mentions, and weekly summaries", on: true },
  { label: "Push notifications", desc: "Real-time alerts on desktop and mobile", on: true },
  { label: "SMS alerts", desc: "Critical account and security alerts only", on: false },
];

export function AddEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const existing = useMemo(() => users.find((u) => u.id === id) ?? (isEdit ? users[0] : undefined), [id, isEdit]);

  const [selectedRole, setSelectedRole] = useState(existing?.role ?? "Manager");
  const [notifs, setNotifs] = useState(notifDefaults.map((n) => n.on));
  const [inviteEmail, setInviteEmail] = useState(true);
  const [status, setStatus] = useState(existing?.status ?? "Active");

  function handleSave() {
    toast.show(isEdit ? "User changes saved." : "User invited successfully.", "success");
    navigate(paths.users.list);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button variant="secondary" size="sm" icon={<Icon d={icons.arrowLeft} size={14} />} onClick={() => navigate(paths.users.list)}>
            Back
          </Button>
          <div>
            <Breadcrumbs items={[{ label: "User Management" }, { label: isEdit ? "Edit User" : "Add User" }]} />
            <h1 className="mt-1 text-xl font-extrabold text-t0 sm:text-2xl">
              {isEdit ? `Edit ${existing?.name ?? "user"}` : "Add new user"}
            </h1>
          </div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => navigate(paths.users.list)}>
            Cancel
          </Button>
          <Button icon={<Icon d={icons.check} size={14} />} onClick={handleSave}>
            {isEdit ? "Save changes" : "Create user"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-acc-soft text-acc">
                <Icon d={icons.users} size={17} />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-t0">Personal information</h3>
                <p className="mt-0.5 text-xs text-t2">Basic details shown on their profile</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="First name" required>
                <Input defaultValue={isEdit ? existing?.firstName : ""} placeholder="e.g. Marcus" />
              </FormField>
              <FormField label="Last name" required>
                <Input defaultValue={isEdit ? existing?.lastName : ""} placeholder="e.g. Liu" />
              </FormField>
              <FormField label="Work email" required hint="Used for sign-in and notifications">
                <Input type="email" defaultValue={isEdit ? existing?.email : ""} placeholder="name@company.com" />
              </FormField>
              <FormField label="Phone">
                <Input defaultValue={isEdit ? existing?.phone : ""} placeholder="+1 (000) 000-0000" />
              </FormField>
              <FormField label="Job title">
                <Input defaultValue={isEdit ? existing?.jobTitle : ""} placeholder="e.g. Sales Manager" />
              </FormField>
              <FormField label="Location">
                <Input defaultValue={isEdit ? existing?.location : ""} placeholder="City, Country" />
              </FormField>
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-info-soft text-info">
                <Icon d={icons.shield} size={17} />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-t0">Role &amp; access</h3>
                <p className="mt-0.5 text-xs text-t2">Controls what this user can see and do</p>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {roles.slice(0, 4).map((r) => {
                const selected = selectedRole === r.name;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.name)}
                    className="rounded-[13px] border-2 p-3 text-center transition-colors"
                    style={{ borderColor: selected ? "var(--acc)" : "var(--line)", background: selected ? "var(--acc-soft)" : "var(--bg-inset)" }}
                  >
                    <span className="mx-auto mb-2 flex h-[34px] w-[34px] items-center justify-center rounded-[10px] text-lg" style={{ background: r.tintBg, color: r.tint }}>
                      {r.icon}
                    </span>
                    <p className={`text-[12.5px] font-bold ${selected ? "text-t0" : "text-t1"}`}>{r.name}</p>
                    <p className="mt-0.5 text-[10.5px] leading-tight text-t2">{r.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Department">
                <Select defaultValue={isEdit ? existing?.department : "Sales"}>
                  {["Sales", "Engineering", "Marketing", "Finance", "Design", "Support"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Reports to">
                <Select defaultValue={existing?.reportsTo}>
                  <option>Elena Park — VP Sales</option>
                  <option>Dana Keller — CEO</option>
                  <option>David Stone — CTO</option>
                </Select>
              </FormField>
            </div>
            <div className="mt-4 rounded-xl border border-line bg-bg-inset p-4">
              <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">{selectedRole} role includes</p>
              <div className="flex flex-wrap gap-1.5">
                {managerPerms.map((p) => (
                  <span
                    key={p.name}
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold"
                    style={{ color: p.on ? "var(--ok)" : "var(--t2)", background: p.on ? "var(--ok-soft)" : "var(--bg-3)" }}
                  >
                    <Icon d={p.on ? icons.check : icons.x} size={11} />
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4.5 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-warn-soft text-warn">
                <Icon d={icons.mail} size={17} />
              </span>
              <div>
                <h3 className="text-[15px] font-bold text-t0">Notifications</h3>
                <p className="mt-0.5 text-xs text-t2">How this user gets notified</p>
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              {notifDefaults.map((n, i) => (
                <div key={n.label} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-bg-inset p-3.5">
                  <div>
                    <p className="text-[13px] font-bold text-t0">{n.label}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">{n.desc}</p>
                  </div>
                  <Switch
                    checked={notifs[i]}
                    onChange={(v) =>
                      setNotifs((prev) => {
                        const next = [...prev];
                        next[i] = v;
                        return next;
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </Card>

          {isEdit && (
            <Card className="border-bad-soft">
              <h3 className="mb-3.5 text-[15px] font-bold text-bad">Danger zone</h3>
              <div className="flex flex-wrap items-center justify-between gap-3.5">
                <div>
                  <p className="text-[13px] font-bold text-t0">Deactivate this account</p>
                  <p className="mt-0.5 text-xs text-t2">User loses access immediately. Data is kept for 90 days.</p>
                </div>
                <Button variant="outline" className="border-bad-soft text-bad hover:bg-bad-soft">
                  Deactivate account
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Profile photo</p>
            <div className="flex flex-col items-center gap-3">
              <Avatar name={existing?.name ?? "New User"} size="xl" />
              <div className="flex w-full gap-2">
                <Button variant="outline" size="sm" className="flex-1 border-dashed">
                  Upload
                </Button>
                {isEdit && (
                  <Button variant="outline" size="sm" className="flex-1 hover:border-bad hover:text-bad">
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-center text-[10.5px] text-t2">PNG or JPG, at least 400×400px, max 2MB</p>
            </div>
          </Card>

          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Account status</p>
            <Select className="mb-3" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Active</option>
              <option>Invited — pending</option>
              <option>Suspended</option>
            </Select>
            <div className="flex items-start gap-2 rounded-[10px] bg-ok-soft p-2.5">
              <Icon d={icons.check} size={13} className="mt-0.5 shrink-0 text-ok" />
              <span className="text-[11.5px] leading-relaxed text-ok">Active users can sign in and access all features their role allows.</span>
            </div>
          </Card>

          {!isEdit && (
            <Card padding="sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[13px] font-bold text-t0">Send invite email</p>
                <Switch checked={inviteEmail} onChange={setInviteEmail} />
              </div>
              <p className="text-[11.5px] leading-relaxed text-t2">The user receives a welcome email with a link to set their password.</p>
            </Card>
          )}

          {isEdit && (
            <Card padding="sm">
              <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Account info</p>
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-t2">Created</span>
                  <span className="font-bold text-t0">Feb 12, 2024</span>
                </div>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-t2">Last sign-in</span>
                  <span className="font-bold text-t0">{existing?.lastActive}</span>
                </div>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-t2">2FA</span>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex justify-between text-[12.5px]">
                  <span className="text-t2">User ID</span>
                  <span className="font-mono text-[11.5px] font-semibold text-t2">{existing?.id}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
