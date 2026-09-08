import { useState } from "react";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { chatConversations, chatFiles, chatThreads, type ChatMessage } from "@/data/apps";
import { BackIcon, MoreIcon, PaperclipIcon, PhoneIcon, PlusIcon, SearchIcon, SendIcon, SmileIcon, VideoIcon, fileIcon } from "./icons";

/** Slack/Intercom-style 1:1 chat workspace: conversation list + thread + info panel. */
export function Chat() {
  const [activeId, setActiveId] = useState(chatConversations[0].id);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>({});

  const active = chatConversations.find((c) => c.id === activeId) ?? chatConversations[0];
  const messages = [...(chatThreads[activeId] ?? []), ...(localMessages[activeId] ?? [])];

  function selectConversation(id: string) {
    setActiveId(id);
    setMobileShowThread(true);
  }

  function sendMessage() {
    if (!draft.trim()) return;
    setLocalMessages((prev) => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        { id: `local-${Date.now()}`, mine: true, name: "You", text: draft.trim(), time: "Now" },
      ],
    }));
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[560px] overflow-hidden rounded-[18px] border border-line bg-bg-2 shadow-[var(--shadow-vela)]">
      {/* Conversation list */}
      <div className={cn("w-full shrink-0 flex-col border-line lg:flex lg:w-[280px] lg:border-r", mobileShowThread ? "hidden lg:flex" : "flex")}>
        <div className="border-b border-line p-4 pb-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-t0">Messages</h3>
            <button className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border border-line bg-bg-3 text-acc hover:bg-acc-soft">
              <PlusIcon size={15} />
            </button>
          </div>
          <div className="flex h-9 items-center gap-2 rounded-[10px] border border-line bg-bg-inset px-2.5">
            <SearchIcon size={14} className="shrink-0 text-t2" />
            <input placeholder="Search…" className="w-full bg-transparent text-[12.5px] text-t0 outline-none placeholder:text-t2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chatConversations.map((c) => (
            <div
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 border-b border-line px-3.5 py-3 hover:bg-bg-3",
                c.id === activeId && "bg-acc-soft",
              )}
            >
              <Avatar name={c.name} size="md" status={c.online ? "online" : undefined} />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-baseline justify-between gap-2">
                  <span className="truncate text-[13px] font-bold text-t0">{c.name}</span>
                  <span className="shrink-0 text-[10.5px] text-t2">{c.time}</span>
                </div>
                <p className="truncate text-xs text-t2">{c.last}</p>
              </div>
              {c.unread && (
                <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-acc text-[10px] font-bold text-white">
                  {c.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className={cn("min-w-0 flex-1 flex-col", mobileShowThread ? "flex" : "hidden lg:flex")}>
        <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
          <button onClick={() => setMobileShowThread(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-t1 hover:bg-bg-3 hover:text-t0 lg:hidden">
            <BackIcon size={16} />
          </button>
          <Avatar name={active.name} size="md" status="online" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-t0">{active.name}</p>
            <p className="mt-0.5 text-xs text-ok">Online · last seen now</p>
          </div>
          <div className="flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0">
              <PhoneIcon size={16} />
            </button>
            <button className="hidden h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0 sm:flex">
              <VideoIcon size={16} />
            </button>
            <button className="hidden h-9 w-9 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0 sm:flex">
              <MoreIcon size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex gap-2.5", m.mine && "flex-row-reverse")}>
                {!m.mine && <Avatar name={m.name} size="sm" className="mt-0.5" />}
                <div className={cn("flex max-w-[75%] flex-col sm:max-w-[68%]", m.mine ? "items-end" : "items-start")}>
                  {!m.mine && <span className="mb-1 text-[11.5px] font-semibold text-t2">{m.name}</span>}
                  <div
                    className={cn(
                      "px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                      m.mine ? "rounded-[16px_4px_16px_16px] bg-acc text-white" : "rounded-[4px_16px_16px_16px] bg-bg-3 text-t0",
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="mt-1 text-[11px] text-t2">{m.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5 border-t border-line px-5 py-3.5">
          <button className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0 sm:flex">
            <PaperclipIcon size={17} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message…"
            className="h-[42px] flex-1 rounded-xl border border-line bg-bg-inset px-3.5 text-[13.5px] text-t0 outline-none placeholder:text-t2 focus:border-acc"
          />
          <button className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-line text-t1 hover:bg-bg-3 hover:text-t0 sm:flex">
            <SmileIcon size={17} />
          </button>
          <button
            onClick={sendMessage}
            className="flex h-[42px] shrink-0 items-center gap-1.5 rounded-xl bg-acc px-4 text-[13px] font-bold text-white hover:bg-acc-2"
          >
            <SendIcon size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>

      {/* Info panel */}
      <div className="hidden w-[240px] shrink-0 flex-col gap-4 overflow-y-auto border-l border-line p-5 xl:flex">
        <div className="text-center">
          <Avatar name={active.name} size="xl" className="mx-auto mb-2.5" />
          <p className="text-sm font-bold text-t0">{active.name}</p>
          <p className="mt-0.5 text-xs text-t2">{active.role}</p>
        </div>
        <div className="rounded-xl bg-bg-inset p-3.5">
          <p className="mb-2.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Shared files</p>
          <div className="flex flex-col">
            {chatFiles.map((f) => (
              <div key={f.id} className="flex items-center gap-2.5 border-b border-line py-1.5 last:border-b-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-acc-soft text-acc">{fileIcon(f.type, 13)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-t0">{f.name}</p>
                  <p className="text-[10.5px] text-t2">{f.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
