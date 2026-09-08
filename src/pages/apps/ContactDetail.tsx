import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Badge, Button, PageHeader, Textarea } from "@/components/ui";
import { paths } from "@/router/paths";
import { contacts } from "@/data/apps";
import { BackIcon, BuildingIcon, MailIcon, MapPinIcon, MoreIcon, PhoneIcon } from "./icons";

export function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const contact = contacts.find((c) => c.id === id) ?? contacts[0];

  const info = [
    { icon: <MailIcon size={14} />, label: "Email", value: contact.email },
    { icon: <PhoneIcon size={14} />, label: "Phone", value: contact.phone },
    { icon: <MapPinIcon size={14} />, label: "Location", value: contact.location },
    { icon: <BuildingIcon size={14} />, label: "Company", value: contact.company },
  ];

  return (
    <div>
      <PageHeader
        title={contact.name}
        crumbs={[{ label: "Apps" }, { label: "Contacts", to: paths.apps.contacts }, { label: contact.name }]}
        actions={
          <Button variant="secondary" icon={<BackIcon size={14} />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[300px_1fr]">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[18px] border border-line bg-bg-2 p-6 text-center shadow-[var(--shadow-vela)]">
            <Avatar name={contact.name} size="xl" status={contact.online ? "online" : undefined} className="mx-auto mb-3.5" />
            <h2 className="text-lg font-extrabold text-t0">{contact.name}</h2>
            <p className="mt-0.5 text-[13.5px] text-t2">{contact.role}</p>
            <p className="mt-0.5 mb-4 text-[13px] font-semibold text-acc">{contact.company}</p>
            <div className="flex justify-center gap-2">
              <Button size="sm" icon={<MailIcon size={13} />}>
                Email
              </Button>
              <Button size="sm" variant="secondary" icon={<PhoneIcon size={13} />}>
                Call
              </Button>
              <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-bg-2 text-t1 hover:bg-bg-3 hover:text-t0">
                <MoreIcon size={14} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Contact info</p>
            <div className="flex flex-col gap-3">
              {info.map((i) => (
                <div key={i.label} className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-bg-inset text-t2">{i.icon}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-t2">{i.label}</p>
                    <p className="mt-0.5 break-all text-[13px] font-semibold text-t0">{i.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((t) => (
                <Badge key={t} variant="accent">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {contact.stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-line bg-bg-2 p-4 text-center shadow-[var(--shadow-vela)]">
                <p className="font-mono text-xl font-extrabold text-t0 sm:text-[22px]">{s.value}</p>
                <p className="mt-1 text-[11.5px] font-semibold text-t2">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-[18px] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-t0">Deals</h3>
              <Button size="sm">+ New deal</Button>
            </div>
            {contact.deals.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-t2">No deals yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[420px]">
                  <div className="grid grid-cols-[2fr_1fr_1fr_0.8fr] gap-2.5 border-b border-line pb-2.5 text-[10.5px] font-bold uppercase tracking-wide text-t2">
                    <span>Deal name</span>
                    <span className="text-right">Value</span>
                    <span className="text-center">Stage</span>
                    <span className="text-right">Date</span>
                  </div>
                  {contact.deals.map((d) => (
                    <div key={d.id} className="grid grid-cols-[2fr_1fr_1fr_0.8fr] items-center gap-2.5 border-b border-line py-3 last:border-b-0 hover:bg-bg-3">
                      <span className="truncate text-[13px] font-bold text-t0">{d.name}</span>
                      <span className="text-right font-mono text-[13px] font-extrabold text-ok">{d.value}</span>
                      <span className="justify-self-center">
                        <Badge status={d.stage}>{d.stage}</Badge>
                      </span>
                      <span className="text-right text-xs text-t2">{d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[18px] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-t0">Activity timeline</h3>
              <Button size="sm" variant="outline">
                Log activity
              </Button>
            </div>
            <div className="relative flex flex-col gap-4">
              <span className="absolute bottom-1.5 left-[15px] top-1.5 w-px bg-line" />
              {contact.timeline.map((a) => (
                <div key={a.id} className="relative flex gap-3">
                  <span className="z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-[2.5px] border-bg-2 bg-acc-soft text-acc">
                    ●
                  </span>
                  <div className="flex-1 pt-0.5">
                    <p className="text-[13px] font-semibold leading-relaxed text-t0">{a.text}</p>
                    <span className="text-[11px] text-t2">{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-bg-2 p-5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-3.5 text-[15px] font-bold text-t0">Notes</h3>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this contact…" className="h-[90px] resize-none" />
            <Button size="sm" className="mt-2.5">
              Save note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
