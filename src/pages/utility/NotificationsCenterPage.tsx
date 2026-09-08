import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { UsersIcon, DollarIcon, MessageSquareIcon, CheckIcon, AlertCircleIcon, BellIcon, ZapIcon } from "@/pages/utility/icons";

const NOTIFS = [
  { icon: UsersIcon, tint: "var(--acc)", tintBg: "var(--acc-soft)", who: "Marcus Liu", text: "invited you to the Growth Team workspace.", time: "5 minutes ago", unread: true },
  { icon: DollarIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", who: "Billing", text: "your invoice INV-2041 for $499.00 was paid successfully.", time: "1 hour ago", unread: true },
  { icon: MessageSquareIcon, tint: "var(--info)", tintBg: "var(--info-soft)", who: "Elena Park", text: "commented on the Q3 Enterprise Push campaign.", time: "2 hours ago", unread: true },
  { icon: CheckIcon, tint: "var(--ok)", tintBg: "var(--ok-soft)", who: "Deploy bot", text: "successfully deployed analytics-service to production.", time: "3 hours ago", unread: true },
  { icon: AlertCircleIcon, tint: "var(--warn)", tintBg: "var(--warn-soft)", who: "Security", text: "detected a new sign-in from Austin, US on your account.", time: "Yesterday", unread: true },
  { icon: ZapIcon, tint: "#9d86ff", tintBg: "#9d86ff22", who: "Vela", text: "released AI-powered insights — try it on any dashboard.", time: "2 days ago", unread: true },
  { icon: BellIcon, tint: "var(--t1)", tintBg: "var(--bg-3)", who: "Reminder", text: "your weekly pipeline report runs tomorrow at 9:00.", time: "3 days ago", unread: false },
];

export function NotificationsCenterPage() {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold tracking-tight text-t0">Notifications</h1>
          <p className="mt-1.5 text-sm text-t1">
            You have <strong className="text-acc">6 unread</strong> notifications
          </p>
        </div>
        <Button variant="secondary">Mark all read</Button>
      </div>
      <Card padding="none" className="max-w-[760px] overflow-hidden">
        {NOTIFS.map((n, i) => (
          <div
            key={i}
            className={cn(
              "flex cursor-pointer items-start gap-3.5 border-b border-line px-5 py-4 last:border-b-0 hover:bg-bg-3",
              n.unread && "bg-acc-soft",
            )}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: n.tintBg, color: n.tint }}>
              <n.icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] leading-normal text-t1">
                <strong className="font-bold text-t0">{n.who}</strong> {n.text}
              </p>
              <span className="text-[11.5px] text-t2">{n.time}</span>
            </div>
            {n.unread && <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-acc" />}
          </div>
        ))}
      </Card>
    </div>
  );
}
