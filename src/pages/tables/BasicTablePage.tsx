import { Avatar, Badge, Card, CardSubtitle, CardTitle, PageHeader } from "@/components/ui";
import { employees, products } from "./data";

export function BasicTablePage() {
  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Tables" }, { label: "Basic Tables" }]}
        title="Basic Tables"
        subtitle="Simple HTML tables with clean styling"
      />
      <div className="flex flex-col gap-5">
        <Card>
          <CardTitle>Employee Directory</CardTitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b-2 border-line">
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Name</th>
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Role</th>
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Department</th>
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Status</th>
                  <th className="px-3.5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-bg-3">
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={r.name} size="sm" />
                        <div>
                          <p className="text-[13.5px] font-bold text-t0">{r.name}</p>
                          <p className="text-[11.5px] text-t2">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-t1">{r.role}</td>
                    <td className="px-3.5 py-3 text-t1">{r.dept}</td>
                    <td className="px-3.5 py-3">
                      <Badge status={r.status}>{r.status}</Badge>
                    </td>
                    <td className="px-3.5 py-3 text-right text-[14px] font-extrabold text-ok">{r.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardTitle>Striped variant</CardTitle>
          <CardSubtitle>Alternate row backgrounds for readability</CardSubtitle>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b-2 border-line">
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Product</th>
                  <th className="px-3.5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-t2">Category</th>
                  <th className="px-3.5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Price</th>
                  <th className="px-3.5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-t2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.name} className={`border-b border-line last:border-b-0 ${i % 2 === 0 ? "bg-bg-inset" : ""}`}>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{p.emoji}</span>
                        <span className="font-bold text-t0">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 text-t1">{p.cat}</td>
                    <td className="px-3.5 py-3 text-right font-extrabold text-t0">{p.price}</td>
                    <td className={`px-3.5 py-3 text-right font-bold ${p.stock < 10 ? "text-bad" : "text-ok"}`}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
