import { Card } from "@/components/ui";
import { Timeline, type TimelineEvent } from "@/components/ui";

interface Group {
  day: string;
  items: Array<{ av: string; avColor: string; who: string; text: string; time: string }>;
}

const GROUPS: Group[] = [
  {
    day: "Today",
    items: [
      { av: "ML", avColor: "#7c5cff", who: "Marcus Liu", text: "created a new campaign “Q3 Enterprise Push”.", time: "9:42 AM" },
      { av: "EP", avColor: "#56a8ff", who: "Elena Park", text: "closed the deal with Northwind — $48,000 ARR.", time: "8:15 AM" },
      { av: "SD", avColor: "#33d493", who: "Sara Davis", text: "uploaded 12 files to the Design Assets folder.", time: "7:58 AM" },
      { av: "JM", avColor: "#f7b84e", who: "James Moore", text: "commented on the Revenue Analytics dashboard.", time: "7:20 AM" },
    ],
  },
  {
    day: "Yesterday",
    items: [
      { av: "AR", avColor: "#f76d7d", who: "Amara Reyes", text: "invited 3 new members to the Growth team.", time: "5:04 PM" },
      { av: "TK", avColor: "#9d86ff", who: "Tom Kim", text: "deployed analytics-service v3.2 to production.", time: "3:31 PM" },
      { av: "EP", avColor: "#56a8ff", who: "Elena Park", text: "updated the Enterprise pricing plan.", time: "11:12 AM" },
      { av: "ML", avColor: "#7c5cff", who: "Marcus Liu", text: "resolved 8 support tickets in the Help Desk.", time: "9:47 AM" },
    ],
  },
];

export function ActivityFeedPage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[26px] font-extrabold tracking-tight text-t0">Activity Feed</h1>
        <p className="mt-1.5 text-sm text-t1">Everything happening across your workspace</p>
      </div>
      <Card padding="lg" className="max-w-[760px]">
        {GROUPS.map((g) => {
          const events: TimelineEvent[] = g.items.map((a, i) => ({
            id: `${g.day}-${i}`,
            color: a.avColor,
            icon: <span className="text-[10px] font-bold text-white">{a.av}</span>,
            title: (
              <span>
                <strong className="font-bold text-t0">{a.who}</strong> {a.text}
              </span>
            ),
            time: a.time,
          }));
          return (
            <div key={g.day} className="mb-2">
              <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">{g.day}</p>
              <Timeline events={events} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
