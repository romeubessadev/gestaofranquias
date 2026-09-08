import { useMemo, useState } from "react";
import { Avatar, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { emails, mailFolders, mailLabels, swatch, type Email as EmailModel } from "@/data/apps";
import {
  BackIcon,
  DraftIcon,
  InboxIcon,
  MailIcon,
  PaperclipIcon,
  PlusIcon,
  SearchIcon,
  SendFolderIcon,
  SpamIcon,
  StarIcon,
  TrashIcon,
} from "./icons";

const folderIcons: Record<string, React.ReactNode> = {
  inbox: <InboxIcon size={16} />,
  starred: <StarIcon size={16} />,
  sent: <SendFolderIcon size={16} />,
  drafts: <DraftIcon size={16} />,
  spam: <SpamIcon size={16} />,
  trash: <TrashIcon size={16} />,
};

/** 3-pane email client: folders + message list + reading pane.
 * Below lg the reading pane replaces the list (single-pane), and folders live
 * behind the message-list column so the pattern collapses cleanly on mobile. */
export function Email() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [starred, setStarred] = useState<Record<string, boolean>>(
    () => Object.fromEntries(emails.filter((e) => e.starred).map((e) => [e.id, true])),
  );

  const list = useMemo(
    () => emails.filter((m) => query.trim() === "" || m.subject.toLowerCase().includes(query.toLowerCase()) || m.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const selected = selectedId ? emails.find((m) => m.id === selectedId) ?? null : null;

  function toggleStar(id: string) {
    setStarred((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex h-[calc(100vh-145px)] min-h-[520px] gap-4">
      {/* Folders */}
      <div className="hidden w-[210px] shrink-0 flex-col gap-4 md:flex">
        <Button fullWidth className="h-11" icon={<PlusIcon size={17} />}>
          Compose
        </Button>
        <div className="rounded-2xl border border-line bg-bg-2 p-2 shadow-[var(--shadow-vela)]">
          {mailFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setActiveFolder(f.id);
                setSelectedId(null);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors",
                activeFolder === f.id ? "bg-acc-soft text-acc" : "text-t1 hover:bg-bg-3 hover:text-t0",
              )}
            >
              {folderIcons[f.id]}
              <span className="flex-1 text-left capitalize">{f.name}</span>
              {f.count ? <span className="text-[11px] font-bold text-t2">{f.count}</span> : null}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-line bg-bg-2 p-3.5 shadow-[var(--shadow-vela)]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-t2">Labels</p>
          <div className="flex flex-col gap-2.5">
            {mailLabels.map((l) => (
              <div key={l.name} className="flex items-center gap-2.5 text-[13px] font-semibold text-t1">
                <span className={cn("h-[9px] w-[9px] rounded-[3px]", swatch(l.swatch).dot)} />
                {l.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Message list */}
      <div
        className={cn(
          "min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-line bg-bg-2 shadow-[var(--shadow-vela)] lg:flex",
          selected ? "hidden lg:flex" : "flex",
        )}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <div className="flex h-[38px] flex-1 items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3">
            <SearchIcon size={15} className="shrink-0 text-t2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mail…"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2"
            />
          </div>
          <span className="hidden shrink-0 text-[12.5px] font-semibold text-t2 sm:inline">1–{list.length} of 248</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.map((m) => (
            <EmailRow key={m.id} email={m} starred={!!starred[m.id]} selected={selectedId === m.id} onSelect={() => setSelectedId(m.id)} onStar={() => toggleStar(m.id)} />
          ))}
          {list.length === 0 && <p className="p-10 text-center text-sm text-t2">No messages found.</p>}
        </div>
      </div>

      {/* Reading pane */}
      <div
        className={cn(
          "min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-bg-2 shadow-[var(--shadow-vela)] lg:flex lg:w-[42%] lg:max-w-[520px]",
          selected ? "flex flex-1 lg:flex-none" : "hidden lg:flex",
        )}
      >
        {selected ? (
          <>
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <button onClick={() => setSelectedId(null)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-t1 hover:bg-bg-3 hover:text-t0 lg:hidden">
                <BackIcon size={16} />
              </button>
              <p className="min-w-0 flex-1 truncate text-[15px] font-bold text-t0">{selected.subject}</p>
              <button onClick={() => toggleStar(selected.id)} className="text-t2 hover:text-warn" aria-label="Star">
                <StarIcon size={17} filled={!!starred[selected.id]} />
              </button>
            </div>
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <Avatar name={selected.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-t0">{selected.name}</p>
                <p className="truncate text-xs text-t2">to me · {selected.time}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 text-[14px] leading-[1.7] text-t1">
              <p className="mb-4">{selected.preview}</p>
              <p className="mb-4">
                Let me know if you have any questions or want to jump on a quick call to align. I've attached the relevant files for reference and flagged the key
                decisions we need to make before the end of the week.
              </p>
              <p>Best,<br />{selected.name}</p>
            </div>
            <div className="flex items-center gap-2 border-t border-line px-5 py-3.5">
              <Button size="sm">Reply</Button>
              <Button size="sm" variant="outline">
                Forward
              </Button>
              <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0" aria-label="Attach">
                <PaperclipIcon size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bg-3 text-t2">
              <MailIcon size={24} />
            </div>
            <p className="text-[14.5px] font-bold text-t0">Select a message</p>
            <p className="mt-1 text-[13px] text-t2">Choose an email from the list to read it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailRow({
  email,
  starred,
  selected,
  onSelect,
  onStar,
}: {
  email: EmailModel;
  starred: boolean;
  selected: boolean;
  onSelect: () => void;
  onStar: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex cursor-pointer items-start gap-3 border-b border-line px-4 py-3.5 hover:bg-bg-3",
        selected && "bg-acc-soft",
        email.unread && "bg-bg-1/40",
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStar();
        }}
        className="mt-1 shrink-0 text-t2 hover:text-warn"
        aria-label="Star"
      >
        <StarIcon size={17} filled={starred} />
      </button>
      <Avatar name={email.name} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("truncate text-[13px]", email.unread ? "font-extrabold text-t0" : "font-semibold text-t1")}>{email.name}</span>
          {email.tag && <span className="shrink-0 rounded-md bg-bg-3 px-1.5 py-px text-[10.5px] font-bold text-t2">{email.tag}</span>}
        </div>
        <p className={cn("mt-0.5 truncate text-[13px]", email.unread ? "font-bold text-t0" : "font-semibold text-t1")}>{email.subject}</p>
        <p className="mt-px truncate text-xs text-t2">{email.preview}</p>
      </div>
      <span className="shrink-0 pt-0.5 text-[11.5px] font-semibold text-t2">{email.time}</span>
    </div>
  );
}
