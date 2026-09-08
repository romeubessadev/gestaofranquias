import { useParams } from "react-router-dom";
import { Badge, Button, Card, PageHeader, ProgressBar } from "@/components/ui";
import { paths } from "@/router/paths";
import { employees } from "@/data/hr";

export function EmployeeDetails() {
  const { id } = useParams();
  const employee = employees.find((e) => e.id === id) ?? employees[0];

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Employees", to: paths.hr.employees }, { label: employee.name }]}
        title={employee.name}
        subtitle={`${employee.role} · ${employee.dept} · ${employee.location}`}
        actions={
          <>
            <Button variant="outline" size="sm">
              Message
            </Button>
            <Button size="sm">Edit</Button>
          </>
        }
      />

      <Card padding="none" className="mb-5 overflow-hidden">
        <div className="h-[90px]" style={{ background: "linear-gradient(120deg,#1b1640,#2a2160 50%,#0f3050)" }} />
        <div className="flex flex-wrap items-end gap-4 px-6 pb-5" style={{ marginTop: -32 }}>
          <span
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] border-4 text-2xl font-extrabold text-white"
            style={{ background: employee.avatarBg, borderColor: "var(--bg-2)" }}
          >
            {employee.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-t0">{employee.name}</h2>
              <Badge status={employee.status}>{employee.status}</Badge>
            </div>
            <p className="mt-1 text-[13px] text-t1">
              {employee.role} · {employee.dept} · {employee.location}
            </p>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {employee.stats.map((s) => (
              <Card key={s.label} className="text-center">
                <p className="text-xl font-extrabold" style={{ color: s.color }}>
                  {s.value}
                </p>
                <p className="mt-1 text-[11px] text-t2">{s.label}</p>
              </Card>
            ))}
          </div>

          <Card>
            <h3 className="mb-4 text-[15px] font-bold text-t0">Employment details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11.5px] font-semibold text-t2">Employee ID</p>
                <p className="mt-1 text-[13.5px] font-bold text-t0">{employee.empCode}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-t2">Department</p>
                <p className="mt-1 text-[13.5px] font-bold text-t0">{employee.dept}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-t2">Reports to</p>
                <p className="mt-1 text-[13.5px] font-bold text-t0">{employee.reportsTo}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-t2">Start date</p>
                <p className="mt-1 text-[13.5px] font-bold text-t0">{employee.startDate}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-t2">Employment type</p>
                <p className="mt-1 text-[13.5px] font-bold text-t0">{employee.employmentType}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-semibold text-t2">Work location</p>
                <p className="mt-1 text-[13.5px] font-bold text-t0">{employee.workLocation}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 text-[15px] font-bold text-t0">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((s) => (
                <span key={s} className="rounded-full bg-acc-soft px-3.5 py-1.5 text-xs font-semibold text-acc">
                  {s}
                </span>
              ))}
            </div>
          </Card>
        </div>

        <div className="w-full shrink-0 space-y-4 lg:w-[320px]">
          <Card>
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Contact</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-t2">Email</span>
                <span className="font-semibold text-t0">{employee.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-t2">Phone</span>
                <span className="font-semibold text-t0">{employee.phone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-t2">Emergency</span>
                <span className="font-semibold text-t0">{employee.emergencyPhone}</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Time off balance</p>
            <div className="flex flex-col gap-3.5">
              <ProgressBar
                label="Vacation"
                value={(employee.vacationUsed / employee.vacationTotal) * 100}
                color="var(--acc)"
              />
              <p className="-mt-2 text-[11px] text-t2">
                {employee.vacationUsed} / {employee.vacationTotal} days
              </p>
              <ProgressBar label="Sick leave" value={(employee.sickUsed / employee.sickTotal) * 100} color="var(--ok)" />
              <p className="-mt-2 text-[11px] text-t2">
                {employee.sickUsed} / {employee.sickTotal} days
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
