import { useState } from "react";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { chatConversations, groupChannels, groupMembers, groupMessages, type GroupMessage } from "@/data/apps";
import { BackIcon, PaperclipIcon, SearchIcon, SendIcon, SmileIcon, UsersIcon } from "./icons";

/** Slack-style group chat: channel list + message stream + members panel. */
export function GroupChat() {
  const [activeId, setActiveId] = useState(groupChannels[0].id);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, GroupMessage[]>>({});

  const active = groupChannels.find((c) => c.id === activeId) ?? groupChannels[0];
  const baseMessages = activeId === groupChannels[0].id ? groupMessages : [];
  const messages = [...baseMessages, ...(localMessages[activeId] ?? [])];

  function selectChannel(id: string) {
    setActiveId(id);
    setMobileShowThread(true);
  }

  function send() {
    if (!draft.trim()) return;
    setLocalMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: `local-${Date.now()}`, name: "You", text: draft.trim(), time: "Now" }],
    }));
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[560px] overflow-hidden rounded-[18px] border border-line bg-bg-2 shadow-[var(--shadow-vela)]">
      {/* Channel list */}
      <div className={cn("w-full shrink-0 flex-col border-line bg-bg-1 lg:flex lg:w-[220px] lg:border-r", mobileShowThread ? "hidden lg:flex" : "flex")}>
        <div className="border-b border-line px-3.5 py-4">
          <h3 className="mb-2.5 text-sm font-bold text-t0">Workspace</h3>
          <div className="flex h-8 items-center gap-2 rounded-[9px] border border-line bg-bg-inset px-2.5">
            <SearchIcon size={13} className="shrink-0 text-t2" />
            <input placeholder="Search…" className="w-full bg-transparent text-xs text-t0 outline-none placeholder:text-t2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-1.5 py-2">
          <p className="mx-2 mb-1.5 mt-2.5 text-[10px] font-bold uppercase tracking-wider text-t2">Channels</p>
          {groupChannels.map((ch) => (
            <div
              key={ch.id}
              onClick={() => selectChannel(ch.id)}
              className={cn(
                "mb-0.5 flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-2 hover:bg-bg-3",
                ch.id === activeId && "bg-acc-soft",
              )}
            >
              <span className={cn("text-[15px]", ch.id === activeId ? "text-acc" : "text-t2")}>#</span>
              <span className={cn("flex-1 truncate text-[13px]", ch.id === activeId ? "font-bold text-t0" : "font-semibold text-t1")}>{ch.name}</span>
              {ch.unread && (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-acc text-[10px] font-bold text-white">{ch.unread}</span>
              )}
            </div>
          ))}
          <p className="mx-2 mb-1.5 mt-3.5 text-[10px] font-bold uppercase tracking-wider text-t2">Direct messages</p>
          {chatConversations.slice(0, 4).map((c) => (
            <div key={c.id} className="mb-0.5 flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-1.5 hover:bg-bg-3">
              <Avatar name={c.name} size="xs" status={c.online ? "online" : undefined} />
              <span className="flex-1 truncate text-[12.5px] font-semibold text-t1">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className={cn("min-w-0 flex-1 flex-col", mobileShowThread ? "flex" : "hidden lg:flex")}>
        <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <button onClick={() => setMobileShowThread(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-t1 hover:bg-bg-3 hover:text-t0 lg:hidden">
            <BackIcon size={16} />
          </button>
          <span className="text-lg font-bold text-acc">#</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-t0">{active.name}</p>
            <p className="mt-0.5 truncate text-xs text-t2">
              {active.members} members · {active.topic}
            </p>
          </div>
          <button className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0">
            <UsersIcon size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4.5">
            {messages.length === 0 && (
              <p className="py-10 text-center text-sm text-t2">No messages yet in #{active.name}. Say hello!</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className="flex gap-3">
                <Avatar name={m.name} size="md" className="mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-baseline gap-2.5">
                    <span className="text-[13.5px] font-bold text-t0">{m.name}</span>
                    <span className="text-[11px] text-t2">{m.time}</span>
                  </div>
                  <div className="text-[13.5px] leading-relaxed text-t1">{m.text}</div>
                  {m.code && (
                    <pre className="mt-2 overflow-x-auto rounded-[10px] border border-line bg-bg-inset px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-ok">
                      {m.code}
                    </pre>
                  )}
                  {m.reactions && (
                    <div className="mt-2 flex gap-1.5">
                      {m.reactions.map((r, i) => (
                        <span key={i} className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-bg-inset px-2.5 py-1 text-[12.5px] hover:border-acc">
                          {r.emoji} <span className="text-[11px] font-bold text-t2">{r.count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-line px-5 py-3.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message #${active.name}`}
            className="h-[42px] flex-1 rounded-xl border border-line bg-bg-inset px-3.5 text-[13.5px] text-t0 outline-none placeholder:text-t2 focus:border-acc"
          />
          <button className="hidden h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0 sm:flex">
            <SmileIcon size={17} />
          </button>
          <button className="hidden h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0 sm:flex">
            <PaperclipIcon size={17} />
          </button>
          <button onClick={send} className="flex h-[38px] shrink-0 items-center justify-center rounded-[11px] bg-acc px-4 font-bold text-white hover:bg-acc-2">
            <SendIcon size={15} />
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="hidden w-[200px] shrink-0 overflow-y-auto border-l border-line bg-bg-1 px-3 py-4 xl:block">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-t2">Members · {active.members}</p>
        <div className="flex flex-col gap-1.5">
          {groupMembers.map((m) => (
            <div key={m.id} className="flex cursor-pointer items-center gap-2.5 rounded-[9px] px-1.5 py-1 hover:bg-bg-3">
              <Avatar name={m.name} size="sm" status={m.online ? "online" : undefined} />
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-semibold text-t1">{m.name}</p>
                <p className="truncate text-[10.5px] text-t2">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
