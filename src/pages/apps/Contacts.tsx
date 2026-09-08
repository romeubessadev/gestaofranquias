import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Badge, Button, PageHeader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { paths } from "@/router/paths";
import { contacts } from "@/data/apps";
import { MailIcon, MoreIcon, PhoneIcon, PlusIcon, SearchIcon } from "./icons";

const DEPARTMENTS = ["All", "Sales", "Engineering", "Design", "Marketing", "Support"] as const;

export function Contacts() {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<(typeof DEPARTMENTS)[number]>("All");

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesDept = dept === "All" || c.department === dept;
      const matchesQuery = query.trim() === "" || c.name.toLowerCase().includes(query.toLowerCase()) || c.company.toLowerCase().includes(query.toLowerCase());
      return matchesDept && matchesQuery;
    });
  }, [query, dept]);

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} people in your workspace`}
        actions={
          <>
            <div className="flex h-10 items-center gap-2 rounded-[11px] border border-line bg-bg-2 px-3.5">
              <SearchIcon size={15} className="text-t2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contacts…"
                className="w-32 bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2 sm:w-40"
              />
            </div>
            <Button icon={<PlusIcon size={15} />}>Add contact</Button>
          </>
        }
      />

      <div className="mb-5 flex w-fit flex-wrap gap-1 rounded-[13px] border border-line bg-bg-2 p-1">
        {DEPARTMENTS.map((d) => (
          <button
            key={d}
            onClick={() => setDept(d)}
            className={cn(
              "rounded-[10px] px-4 py-1.5 text-[12.5px] font-bold transition-colors",
              dept === d ? "bg-acc text-white" : "text-t1 hover:text-t0",
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-vela-lg)] border border-dashed border-line bg-bg-2 p-10 text-center text-sm text-t1">
          No contacts match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={paths.apps.contactDetail(c.id)}
              className="animate-vela-up rounded-[18px] border border-line bg-bg-2 p-5 text-center shadow-[var(--shadow-vela)] transition-all hover:-translate-y-0.5 hover:border-line-2"
            >
              <div className="relative mx-auto mb-3 w-fit">
                <Avatar name={c.name} size="lg" status={c.online ? "online" : undefined} />
              </div>
              <p className="text-sm font-bold text-t0">{c.name}</p>
              <p className="mt-0.5 mb-2 text-xs text-t2">{c.role}</p>
              <Badge variant="accent">{c.department}</Badge>
              <div className="mt-3.5 flex justify-center gap-2">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line text-t1 hover:border-acc hover:text-acc">
                  <MailIcon size={16} />
                </span>
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line text-t1 hover:border-acc hover:text-acc">
                  <PhoneIcon size={16} />
                </span>
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line text-t1 hover:border-acc hover:text-acc">
                  <MoreIcon size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
