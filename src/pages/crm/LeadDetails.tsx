import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Badge, Breadcrumbs, Button, Card, CardTitle, Textarea, Timeline } from "@/components/ui";
import { paths } from "@/router/paths";
import { Icon, crmIcons } from "./Icons";
import { crmLeads, leadTimeline } from "@/data/crm";

export function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lead = crmLeads.find((l) => l.id === id) ?? crmLeads[0];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={<Icon d={crmIcons.arrowLeft} size={14} />} onClick={() => navigate(paths.crm.leads)}>
          Back
        </Button>
        <Breadcrumbs items={[{ label: "Leads", to: paths.crm.leads }, { label: lead.name }]} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr] lg:items-start">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <Card padding="lg" className="text-center">
            <Avatar name={lead.name} size="xl" className="mx-auto mb-3" />
            <h2 className="text-lg font-extrabold text-t0">{lead.name}</h2>
            <p className="mt-1 text-[13px] text-t2">{lead.role}</p>
            <div className="mt-2"><Badge status={lead.status}>{lead.status} lead</Badge></div>
            <div className="mt-4 flex gap-2">
              <Button fullWidth size="sm">Convert to deal</Button>
              <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3" aria-label="Email">
                <Icon d={crmIcons.mail} size={15} />
              </button>
            </div>
          </Card>

          <Card>
            <div className="mb-3.5 flex items-center justify-between">
              <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">Lead score</p>
              <span className="text-xl font-extrabold text-ok">{lead.score}</span>
            </div>
            <div className="mb-3.5 h-2 overflow-hidden rounded-full bg-bg-inset">
              <div className="h-full rounded-full" style={{ width: `${lead.score}%`, background: "linear-gradient(90deg, var(--warn), var(--ok))" }} />
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between"><span className="text-xs text-t2">Email opens</span><span className="text-[12.5px] font-bold text-t0">14</span></div>
              <div className="flex justify-between"><span className="text-xs text-t2">Page visits</span><span className="text-[12.5px] font-bold text-t0">28</span></div>
              <div className="flex justify-between"><span className="text-xs text-t2">Demo requested</span><span className="text-[12.5px] font-bold text-ok">Yes</span></div>
            </div>
          </Card>

          <Card>
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Contact</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between gap-3"><span className="text-xs text-t2">Email</span><span className="truncate text-xs font-semibold text-t0">{lead.email}</span></div>
              <div className="flex justify-between gap-3"><span className="text-xs text-t2">Phone</span><span className="text-xs font-semibold text-t0">{lead.phone}</span></div>
              <div className="flex justify-between gap-3"><span className="text-xs text-t2">Source</span><span className="text-xs font-semibold text-t0">{lead.source}</span></div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center"><p className="text-xl font-extrabold text-ok sm:text-2xl">{lead.value}</p><p className="mt-1 text-[11.5px] text-t2">Est. value</p></Card>
            <Card className="text-center"><p className="text-xl font-extrabold text-acc sm:text-2xl">70%</p><p className="mt-1 text-[11.5px] text-t2">Win prob.</p></Card>
            <Card className="text-center"><p className="text-xl font-extrabold text-info sm:text-2xl">12</p><p className="mt-1 text-[11.5px] text-t2">Days in pipe</p></Card>
          </div>

          <Card padding="lg">
            <CardTitle className="mb-4">Activity timeline</CardTitle>
            <Timeline
              events={leadTimeline.map((a, i) => ({
                id: i,
                title: a.text,
                time: a.time,
                color: a.tint,
                icon: <Icon d={crmIcons[a.icon as keyof typeof crmIcons]} size={13} />,
              }))}
            />
          </Card>

          <Card padding="lg">
            <CardTitle className="mb-3.5">Notes</CardTitle>
            <div className="mb-3 rounded-[12px] bg-bg-inset p-3.5">
              <p className="text-[13.5px] leading-relaxed text-t1">
                Very interested in the enterprise plan. Budget approved for Q3. Decision expected by end of month. Prefers a technical deep-dive before signing.
              </p>
            </div>
            <Textarea placeholder="Add a note…" className="min-h-[70px]" />
          </Card>
        </div>
      </div>
    </div>
  );
}
