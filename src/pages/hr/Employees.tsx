import { Link } from "react-router-dom";
import { Avatar, Button, Card, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";
import { employees, hrEmpKpis } from "@/data/hr";
import { Icon } from "./icons";

export function Employees() {
  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="142 employees · 6 departments"
        actions={
          <>
            <input
              placeholder="Search employees…"
              className="h-[38px] w-[160px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3.5 text-[13px] text-t0 placeholder:text-t2 outline-none focus:border-acc"
            />
            <select className="h-[38px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none">
              <option>All departments</option>
              <option>Engineering</option>
              <option>Sales</option>
              <option>Design</option>
            </select>
            <Button size="md" icon={<Icon path="M12 5v14M5 12h14" size={15} />}>
              Add employee
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {hrEmpKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-2xl font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {employees.map((e) => (
          <Link key={e.id} to={paths.hr.employeeDetail(e.id)}>
            <Card className="h-full text-center transition-colors hover:border-line-2">
              <div className="mb-3 flex justify-center">
                <Avatar name={e.name} size="xl" status={e.online ? "online" : undefined} />
              </div>
              <p className="text-[15px] font-bold text-t0">{e.name}</p>
              <p className="mt-1 text-[12.5px] text-t2">{e.role}</p>
              <div className="mt-2.5 flex justify-center">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{ color: e.deptColor, background: e.deptBg }}
                >
                  {e.dept}
                </span>
              </div>
              <div className="mt-4 flex justify-around border-t border-line pt-3.5">
                <div>
                  <p className="text-[11px] text-t2">ID</p>
                  <p className="mt-0.5 text-xs font-bold text-t0">{e.empCode}</p>
                </div>
                <div className="w-px bg-line" />
                <div>
                  <p className="text-[11px] text-t2">Tenure</p>
                  <p className="mt-0.5 text-xs font-bold text-t0">{e.tenure}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
