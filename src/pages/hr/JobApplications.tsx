import { Badge, DataTable, PageHeader, Rating, type DataTableColumn } from "@/components/ui";
import { hrStatusVariant, jobApplications, type JobApplication } from "@/data/hr";

const columns: DataTableColumn<JobApplication>[] = [
  {
    key: "candidate",
    header: "Candidate",
    render: (r) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: r.avatarBg }}
        >
          {r.avatar}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-t0">{r.name}</p>
          <p className="truncate text-[11px] text-t2">{r.email}</p>
        </div>
      </div>
    ),
  },
  { key: "position", header: "Position", render: (r) => <span className="font-semibold text-t1">{r.position}</span> },
  { key: "exp", header: "Experience", render: (r) => <span className="text-t2">{r.exp}</span>, hideBelow: "md" },
  { key: "rating", header: "Rating", align: "center", render: (r) => <Rating value={r.rating} />, hideBelow: "sm" },
  {
    key: "stage",
    header: "Stage",
    align: "center",
    render: (r) => <Badge variant={hrStatusVariant(r.stage)}>{r.stage}</Badge>,
  },
  { key: "applied", header: "Applied", align: "right", render: (r) => <span className="text-xs text-t2">{r.applied}</span>, hideBelow: "lg" },
];

export function JobApplications() {
  return (
    <div>
      <PageHeader
        title="Job Applications"
        subtitle="284 applications · 42 new this week"
        actions={
          <>
            <input
              placeholder="Search…"
              className="h-[38px] w-[150px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3.5 text-[13px] text-t0 placeholder:text-t2 outline-none focus:border-acc"
            />
            <select className="h-[38px] rounded-[var(--radius-vela-md)] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none">
              <option>All positions</option>
              <option>Engineering</option>
              <option>Design</option>
              <option>Sales</option>
            </select>
          </>
        }
      />

      <DataTable columns={columns} data={jobApplications} rowKey={(r) => r.name} />
    </div>
  );
}
