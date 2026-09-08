import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Card, CardTitle } from "@/components/ui";
import { paths } from "@/router/paths";
import { myProfile, userActivity, userContactInfo } from "@/data/users";

export function MyProfile() {
  const navigate = useNavigate();
  return (
    <div>
      <Card padding="none" className="mb-5 overflow-hidden">
        <div
          className="relative h-[110px] sm:h-[120px]"
          style={{ background: "linear-gradient(120deg,#1b1640,#2a2160 50%,#0f3050)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(80% 120% at 80% 0%, rgba(124,92,255,.4), transparent 60%)" }}
          />
        </div>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
          <Avatar name={myProfile.name} size="xl" ring className="-mt-12 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-t0 sm:text-[22px]">{myProfile.name}</h1>
              <Badge status={myProfile.status}>{myProfile.status}</Badge>
            </div>
            <p className="mt-1.5 text-[13.5px] text-t1">{myProfile.title}</p>
          </div>
          <div className="flex shrink-0 gap-2.5">
            <Button variant="outline">Message</Button>
            <Button onClick={() => navigate(paths.users.edit(myProfile.id))}>Edit profile</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
          {myProfile.stats.map((s, i) => (
            <div key={s.label} className={`px-4 py-4 text-center sm:px-6 ${i < myProfile.stats.length - 1 ? "border-r border-line" : ""}`}>
              <p className="text-xl font-extrabold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="mt-1 text-[11.5px] font-semibold text-t2">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
            <CardTitle className="mb-3.5">About</CardTitle>
            <p className="text-[13.5px] leading-[1.7] text-t1">{myProfile.bio}</p>
          </Card>
          <Card>
            <CardTitle className="mb-4">Recent activity</CardTitle>
            <div className="relative">
              <span className="absolute bottom-1.5 left-[15px] top-1.5 w-px bg-line" />
              <div className="flex flex-col gap-4">
                {userActivity.map((a) => (
                  <div key={a.text} className="relative flex gap-3">
                    <span
                      className="z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[2.5px] border-bg-2 text-sm"
                      style={{ background: a.tintBg, color: a.tint }}
                    >
                      {a.icon}
                    </span>
                    <div className="pt-0.5">
                      <p className="text-[13px] font-semibold leading-[1.45] text-t0">{a.text}</p>
                      <span className="text-[11px] text-t2">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-[320px] lg:shrink-0">
          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Contact</p>
            <div className="flex flex-col gap-3">
              {userContactInfo.map((i) => (
                <div key={i.label} className="flex items-start gap-2.5">
                  <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-bg-inset text-t2">{i.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] text-t2">{i.label}</p>
                    <p className="mt-0.5 break-all text-[12.5px] font-semibold text-t0">{i.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card padding="sm">
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Role &amp; access</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-[12.5px]">
                <span className="text-t2">Role</span>
                <span className="font-bold text-acc">{myProfile.role}</span>
              </div>
              <div className="flex justify-between text-[12.5px]">
                <span className="text-t2">Team</span>
                <span className="font-bold text-t0">{myProfile.department}</span>
              </div>
              <div className="flex justify-between text-[12.5px]">
                <span className="text-t2">2FA</span>
                <span className="font-bold text-ok">{myProfile.twoFactor ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
