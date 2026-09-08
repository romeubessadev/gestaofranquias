import { useState } from "react";
import { Avatar, Card, PageHeader, Select } from "@/components/ui";
import { cn } from "@/lib/cn";

const searchOptions = ["Marketing", "Market research", "Marketplace", "Margin analysis"];

export function SelectComponentsPage() {
  const [tags, setTags] = useState(["React", "TypeScript", "Tailwind"]);
  const [tagInput, setTagInput] = useState("");
  const [selectedOption, setSelectedOption] = useState("Marketing");

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  }

  return (
    <div>
      <PageHeader title="Select Components" subtitle="Single, multi, searchable and tag selects" />
      <div className="grid max-w-4xl grid-cols-1 sm:grid-cols-2 items-start gap-5">
        <Card>
          <label className="mb-2 block text-[12.5px] font-bold text-t1">Single select</label>
          <Select defaultValue="United States">
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Germany</option>
            <option>Japan</option>
          </Select>
        </Card>

        <Card>
          <label className="mb-2 block text-[12.5px] font-bold text-t1">Multi-select (tags)</label>
          <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[11px] border border-acc bg-bg-inset px-2.5 py-1.5">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1.5 rounded-lg bg-acc-soft px-2.5 py-1 text-xs font-semibold text-acc">
                {t}
                <button onClick={() => removeTag(t)}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Add more…"
              className="min-w-[80px] flex-1 bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2"
            />
          </div>
        </Card>

        <Card>
          <label className="mb-2 block text-[12.5px] font-bold text-t1">Searchable select</label>
          <div className="overflow-hidden rounded-[11px] border border-acc bg-bg-inset">
            <div className="flex h-[42px] items-center gap-2 border-b border-line px-3.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input defaultValue="Mar" className="flex-1 bg-transparent text-[13.5px] text-t0 outline-none" />
            </div>
            <div className="max-h-[132px] overflow-y-auto">
              {searchOptions.map((o) => (
                <button
                  key={o}
                  onClick={() => setSelectedOption(o)}
                  className={cn(
                    "block w-full px-3.5 py-2.5 text-left text-[13px] hover:bg-bg-3",
                    o === selectedOption ? "bg-acc-soft font-bold text-acc" : "text-t1",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <label className="mb-2 block text-[12.5px] font-bold text-t1">Select with avatars</label>
          <div className="flex h-12 items-center gap-2.5 rounded-[11px] border border-line bg-bg-inset px-3">
            <Avatar name="Elena Park" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-t0">Elena Park</p>
              <p className="truncate text-[11px] text-t2">elena@vela.io</p>
            </div>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </Card>
      </div>
    </div>
  );
}
