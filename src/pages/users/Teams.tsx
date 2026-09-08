import { AvatarGroup, Button, Card, PageHeader } from "@/components/ui";
import { teams } from "@/data/users";
import { Icon, icons } from "./Icons";

export function Teams() {
  const totalMembers = teams.reduce((sum, t) => sum + t.count, 0);

  return (
    <div>
      <PageHeader
        title="Teams"
        subtitle={`${teams.length} teams · ${totalMembers} members`}
        actions={<Button icon={<Icon d={icons.plus} size={14} />}>New team</Button>}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((t) => (
          <Card key={t.id}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[13px] text-[22px]" style={{ background: t.tintBg, color: t.tint }}>
                {t.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-t0">{t.name}</p>
                <p className="mt-0.5 text-xs text-t2">Led by {t.lead}</p>
              </div>
            </div>
            <div className="mb-3.5 flex items-center justify-between">
              <AvatarGroup names={t.members} max={4} />
              <span className="text-xs font-semibold text-t2">{t.count} members</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 border-t border-line pt-3.5">
              <div>
                <p className="text-base font-extrabold" style={{ color: t.tint }}>
                  {t.projects}
                </p>
                <p className="mt-0.5 text-[11px] text-t2">Projects</p>
              </div>
              <div>
                <p className="text-base font-extrabold text-ok">{t.active}</p>
                <p className="mt-0.5 text-[11px] text-t2">Active now</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
