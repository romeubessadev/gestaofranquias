import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, DataTable, PageHeader, StatCard, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { users, userStats, type UserRecord } from "@/data/users";
import { Icon, icons } from "./Icons";

const columns: DataTableColumn<UserRecord>[] = [
  {
    key: "member",
    header: "Member",
    render: (u) => (
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={u.name} />
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold text-t0">{u.name}</p>
          <p className="truncate text-[11.5px] text-t2">{u.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (u) => <Badge variant="accent">{u.role}</Badge>,
    hideBelow: "sm",
  },
  {
    key: "status",
    header: "Status",
    render: (u) => <Badge status={u.status}>{u.status}</Badge>,
  },
  {
    key: "last",
    header: "Last active",
    render: (u) => <span className="text-t1">{u.lastActive}</span>,
    hideBelow: "md",
  },
];

export function UsersList() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "User Management" }, { label: "Members" }]}
        title="Team members"
        subtitle="Manage roles, permissions and access across your workspace."
        actions={
          <>
            <Button variant="secondary" icon={<Icon d={icons.shield} />} onClick={() => navigate(paths.users.roles)}>
              Manage roles
            </Button>
            <Button icon={<Icon d={icons.users} />} onClick={() => navigate(paths.users.new)}>
              Invite member
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {userStats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} iconColor={s.tint} iconBg={s.tintBg} delta={{ value: s.delta, positive: s.positive }} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        rowKey={(u) => u.id}
        onRowClick={(u) => navigate(paths.users.detail(u.id))}
      />
      <p className="mt-4 text-center text-[12.5px] text-t2 sm:text-left">
        Showing <strong className="text-t1">{users.length}</strong> of <strong className="text-t1">8,420</strong> members
      </p>
    </div>
  );
}
