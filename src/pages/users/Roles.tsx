import { AvatarGroup, Button, Card, PageHeader } from "@/components/ui";
import { roles } from "@/data/users";
import { Icon, icons } from "./Icons";

export function Roles() {
  const totalUsers = roles.reduce((sum, r) => sum + r.usersCount, 0);

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle={`${roles.length} roles · ${totalUsers} users assigned`}
        actions={
          <Button icon={<Icon d={icons.plus} size={14} />}>New role</Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((r) => (
          <Card key={r.id}>
            <div className="mb-3.5 flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-xl" style={{ background: r.tintBg, color: r.tint }}>
                {r.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-t0">{r.name}</p>
                <p className="mt-0.5 text-xs text-t2">{r.usersCount} users</p>
              </div>
            </div>
            <p className="mb-3.5 text-[12.5px] leading-relaxed text-t1">{r.desc}</p>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <AvatarGroup names={r.avatars} max={3} />
              <Button variant="outline" size="sm">
                Edit role
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
