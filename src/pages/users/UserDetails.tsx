import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Badge, Breadcrumbs, Button, Card, CardTitle } from "@/components/ui";
import { paths } from "@/router/paths";
import { users, userDetailStats, userPermTags, userSessions } from "@/data/users";
import { Icon, icons } from "./Icons";

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = users.find((u) => u.id === id) ?? users[0];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={<Icon d={icons.arrowLeft} size={14} />} onClick={() => navigate(paths.users.list)}>
          Back
        </Button>
        <Breadcrumbs items={[{ label: "Users", to: paths.users.list }, { label: user.name }]} />
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex w-full flex-col gap-4 lg:w-[280px] lg:shrink-0">
          <Card className="text-center">
            <Avatar name={user.name} size="xl" className="mx-auto mb-3" />
            <h2 className="text-lg font-extrabold text-t0">{user.name}</h2>
            <p className="mb-2 text-[13px] text-t2">{user.email}</p>
            <Badge variant="accent">{user.role}</Badge>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => navigate(paths.users.edit(user.id))}>
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1 border-bad-soft text-bad hover:bg-bad-soft">
                Suspend
              </Button>
            </div>
          </Card>
          <Card padding="sm">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Details</p>
            <div className="flex flex-col gap-2.5">
              <Row label="Status">
                <span className="font-bold text-ok">{user.status}</span>
              </Row>
              <Row label="Department">{user.department}</Row>
              <Row label="Location">{user.location}</Row>
              <Row label="Joined">{user.joined}</Row>
              <Row label="Last active">{user.lastActive}</Row>
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="grid grid-cols-3 gap-3.5">
            {userDetailStats.map((s) => (
              <Card key={s.label} padding="sm" className="text-center">
                <p className="text-xl font-extrabold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="mt-1 text-[11.5px] text-t2">{s.label}</p>
              </Card>
            ))}
          </div>

          <Card>
            <CardTitle className="mb-4">Permissions</CardTitle>
            <div className="flex flex-wrap gap-2">
              {userPermTags.map((p) => (
                <span
                  key={p.name}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ color: p.granted ? "var(--ok)" : "var(--t2)", background: p.granted ? "var(--ok-soft)" : "var(--bg-inset)" }}
                >
                  <Icon d={p.granted ? icons.check : icons.x} size={12} />
                  {p.name}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Recent sessions</CardTitle>
            <div className="flex flex-col">
              {userSessions.map((s, i) => (
                <div key={s.device} className={`flex items-center gap-3 py-2.5 ${i < userSessions.length - 1 ? "border-b border-line" : ""}`}>
                  <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-bg-inset text-t2">
                    <Icon d={icons.calendar} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-t0">{s.device}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">
                      {s.location} · {s.time}
                    </p>
                  </div>
                  {s.current && <Badge variant="success">Current</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between text-[12.5px]">
      <span className="text-t2">{label}</span>
      <span className="font-bold text-t0">{children}</span>
    </div>
  );
}
