import { Button, Card, PageHeader, useToast } from "@/components/ui";
import { permissionMatrix } from "@/data/users";
import { Icon, icons } from "./Icons";

const roleColumns = ["Admin", "Manager", "Editor", "Viewer"] as const;
const roleKeys = ["admin", "manager", "editor", "viewer"] as const;

export function Permissions() {
  const toast = useToast();

  return (
    <div>
      <PageHeader
        title="Permissions"
        subtitle="Configure access for each role"
        actions={<Button onClick={() => toast.show("Permissions saved.", "success")}>Save changes</Button>}
      />
      <Card padding="none" className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-3.5 text-left text-[10.5px] font-bold uppercase tracking-wide text-t2">Permission</th>
              {roleColumns.map((r) => (
                <th key={r} className="px-4 py-3.5 text-center text-[10.5px] font-bold uppercase tracking-wide text-t2">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissionMatrix.map((p) => (
              <tr key={p.name} className="border-b border-line transition-colors last:border-b-0 hover:bg-bg-3">
                <td className="px-5 py-3.5">
                  <p className="text-[13.5px] font-bold text-t0">{p.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-t2">{p.desc}</p>
                </td>
                {roleKeys.map((k) => (
                  <td key={k} className="px-4 py-3.5">
                    <span
                      className="mx-auto flex h-[22px] w-[22px] items-center justify-center rounded-[7px] text-white"
                      style={{ background: p[k] ? "var(--ok)" : "var(--bg-inset)" }}
                    >
                      {p[k] && <Icon d={icons.check} size={13} />}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
