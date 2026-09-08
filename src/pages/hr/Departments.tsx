import { Button, Card, PageHeader } from "@/components/ui";
import { hrDepts } from "@/data/hr";
import { Icon } from "./icons";

export function Departments() {
  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="6 departments · 142 employees"
        actions={<Button icon={<Icon path="M12 5v14M5 12h14" size={14} />}>Add department</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hrDepts.map((d) => (
          <Card key={d.name}>
            <div className="mb-4 flex items-center gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] text-[22px]"
                style={{ background: d.tintBg, color: d.tint }}
              >
                {d.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-t0">{d.name}</p>
                <p className="truncate text-[11.5px] text-t2">Head: {d.head}</p>
              </div>
            </div>
            <div className="mb-3.5 flex items-center justify-between">
              <div className="flex">
                {d.members.map((m, i) => (
                  <span
                    key={i}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 text-[10px] font-bold text-white"
                    style={{ background: m.bg, borderColor: "var(--bg-2)", marginLeft: i > 0 ? -7 : 0 }}
                  >
                    {m.av}
                  </span>
                ))}
                <span
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 bg-bg-inset text-[10px] font-bold text-t2"
                  style={{ borderColor: "var(--bg-2)", marginLeft: -7 }}
                >
                  +{d.more}
                </span>
              </div>
              <span className="text-xs font-semibold text-t2">{d.count} people</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 border-t border-line pt-3.5">
              <div>
                <p className="text-lg font-extrabold" style={{ color: d.tint }}>
                  {d.open}
                </p>
                <p className="mt-0.5 text-[11px] text-t2">Open roles</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-ok">{d.retention}</p>
                <p className="mt-0.5 text-[11px] text-t2">Retention</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
