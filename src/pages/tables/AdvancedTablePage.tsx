import { Badge, Card, PageHeader } from "@/components/ui";
import { employees } from "./data";

const rows = employees.slice(0, 6);

function parseSalary(s: string) {
  return Number(s.replace(/[^0-9.-]/g, ""));
}

const total = rows.reduce((sum, r) => sum + parseSalary(r.salary), 0);

export function AdvancedTablePage() {
  return (
    <div>
      <PageHeader title="Advanced Tables" subtitle="Grouped rows, frozen columns, totals" />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-2 border-line">
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Name</th>
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Role</th>
                <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Department</th>
                <th className="px-3.5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Salary</th>
                <th className="px-3.5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-t2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line hover:bg-bg-3">
                  <td className="px-3.5 py-3 text-[13.5px] font-bold text-t0">{r.name}</td>
                  <td className="px-3.5 py-3 text-t1">{r.role}</td>
                  <td className="px-3.5 py-3 text-t1">{r.dept}</td>
                  <td className="px-3.5 py-3 text-right text-[14px] font-extrabold text-ok">{r.salary}</td>
                  <td className="px-3.5 py-3 text-center">
                    <Badge status={r.status}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-line bg-bg-inset">
                <td colSpan={3} className="px-3.5 py-3 text-[13.5px] font-extrabold text-t0">Total</td>
                <td className="px-3.5 py-3 text-right text-[14px] font-extrabold text-ok">
                  ${total.toLocaleString()}
                </td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
