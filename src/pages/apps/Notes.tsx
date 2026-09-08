import { useMemo, useState } from "react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { noteTags, notes } from "@/data/apps";
import { BackIcon, BoldIcon, ItalicIcon, LinkIcon, ListIcon, PlusIcon, SearchIcon } from "./icons";

/** Notes workspace: tag-filterable note list + rich-text style editor pane. */
export function Notes() {
  const [activeId, setActiveId] = useState(notes[0].id);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [mobileShowEditor, setMobileShowEditor] = useState(false);

  const active = notes.find((n) => n.id === activeId) ?? notes[0];

  const filtered = useMemo(
    () =>
      notes.filter(
        (n) =>
          (tagFilter === null || n.tag === tagFilter) &&
          (query.trim() === "" || n.title.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, tagFilter],
  );

  return (
    <div className="flex h-[calc(100vh-130px)] min-h-[560px] overflow-hidden rounded-[18px] border border-line bg-bg-1 shadow-[var(--shadow-vela)]">
      {/* Sidebar */}
      <div className={cn("w-full shrink-0 flex-col border-line bg-bg-2 lg:flex lg:w-[280px] lg:border-r", mobileShowEditor ? "hidden lg:flex" : "flex")}>
        <div className="border-b border-line p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-t0">Notes</h3>
            <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-acc text-white hover:bg-acc-2" aria-label="New note">
              <PlusIcon size={14} />
            </button>
          </div>
          <div className="flex h-[34px] items-center gap-2 rounded-[9px] border border-line bg-bg-inset px-2.5">
            <SearchIcon size={13} className="shrink-0 text-t2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notes…"
              className="w-full bg-transparent text-xs text-t0 outline-none placeholder:text-t2"
            />
          </div>
        </div>
        <div className="border-b border-line px-3 py-2.5">
          <p className="mx-1.5 mb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-t2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {noteTags.map((t) => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)}>
                <Badge variant={tagFilter === t ? "accent" : "neutral"}>{t}</Badge>
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                setActiveId(n.id);
                setMobileShowEditor(true);
              }}
              className={cn(
                "mb-1 cursor-pointer rounded-xl border p-3 hover:bg-bg-3",
                n.id === activeId ? "border-acc-soft bg-acc-soft" : "border-transparent",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-t0">{n.title}</span>
                <span className="shrink-0 text-[10.5px] text-t2">{n.time}</span>
              </div>
              <p className="truncate text-[11.5px] text-t2">{n.preview}</p>
              {n.tag && (
                <span className="mt-1.5 inline-block">
                  <Badge variant="accent" className="text-[10.5px]">
                    {n.tag}
                  </Badge>
                </span>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p className="p-4 text-center text-xs text-t2">No notes match.</p>}
        </div>
      </div>

      {/* Editor */}
      <div className={cn("min-w-0 flex-1 flex-col bg-bg-1", mobileShowEditor ? "flex" : "hidden lg:flex")}>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
          <button
            onClick={() => setMobileShowEditor(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-t1 hover:bg-bg-3 hover:text-t0 lg:hidden"
            aria-label="Back to notes"
          >
            <BackIcon size={16} />
          </button>
          <div className="flex gap-1 rounded-[9px] border border-line bg-bg-2 p-[3px]">
            {[
              { key: "bold", icon: <BoldIcon size={14} /> },
              { key: "italic", icon: <ItalicIcon size={14} /> },
              { key: "list", icon: <ListIcon size={14} /> },
              { key: "link", icon: <LinkIcon size={14} /> },
            ].map((t) => (
              <button key={t.key} className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] text-t1 hover:bg-bg-3 hover:text-t0" aria-label={t.key}>
                {t.icon}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <span className="hidden text-xs text-t2 sm:inline">Auto-saved · Jun 27, 2026</span>
          <Button size="sm">Share</Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
          <input
            key={active.id}
            defaultValue={active.title}
            className="mb-5 block w-full bg-transparent text-xl font-extrabold tracking-tight text-t0 outline-none sm:text-[26px]"
          />
          <div className="text-sm leading-[1.75] text-t1 sm:text-[14.5px]">
            <p className="mb-3.5">{active.content.intro}</p>
            {active.content.themes.length > 0 && (
              <>
                <p className="mb-2 text-base font-bold text-t0">Key themes</p>
                <div className="mb-4 flex flex-col gap-1.5 pl-5">
                  {active.content.themes.map((t) => (
                    <div key={t} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-acc" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            {active.content.metrics.length > 0 && (
              <>
                <p className="mb-2 text-base font-bold text-t0">Success metrics</p>
                <div className="mb-4 flex flex-col gap-2.5 rounded-xl border border-line bg-bg-2 p-4">
                  {active.content.metrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between gap-3">
                      <span className="text-[13.5px] font-semibold text-t0">{m.label}</span>
                      <span className="font-mono text-[13.5px] font-extrabold text-ok">{m.change}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="text-[13px] italic text-t2">{active.content.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
