import { Card, PageHeader, Badge } from "@/components/ui";

const highlights = [
  "Completely redesigned analytics engine with sub-second queries.",
  "12 new prebuilt dashboard modules across every domain.",
  "AI-powered insight summaries on dashboard widgets.",
  "Charts and tables render up to 3x faster on large datasets.",
  "New dark & light theme system with instant switching.",
];

const prevReleases = [
  { v: "3.1", title: "Collaboration & Sharing", date: "May 15, 2026" },
  { v: "3.0", title: "The Big Redesign", date: "Apr 02, 2026" },
  { v: "2.8", title: "Performance Pass", date: "Feb 20, 2026" },
];

/** Detailed notes for the latest major release, plus a previous-releases list. */
export function ReleaseNotesPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Premium" }, { label: "Release Notes" }]}
        title="Release Notes"
        subtitle="Detailed notes for our latest major release."
      />
      <div className="max-w-[760px]">
        <Card className="mb-[18px] p-[26px]">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-[21px] font-extrabold text-t0">Vela 3.2 — Analytics Overhaul</h2>
            <Badge variant="success">Latest</Badge>
          </div>
          <p className="mb-5 text-[13px] text-t2">Released Jun 27, 2026</p>
          <p className="mb-5 text-sm leading-relaxed text-t1">
            This release brings a completely redesigned analytics engine, 12 new dashboard modules,
            and major performance improvements across every table and chart in the app.
          </p>
          <div className="flex flex-col gap-2.5">
            {highlights.map((h) => (
              <div key={h} className="flex gap-3">
                <svg className="mt-px flex-none" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                <span className="text-[13.5px] leading-relaxed text-t1">{h}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-[22px]">
          <h3 className="mb-3.5 text-[15px] font-bold text-t0">Previous releases</h3>
          <div className="flex flex-col">
            {prevReleases.map((p) => (
              <div key={p.v} className="flex items-center justify-between border-b border-line py-3 last:border-0">
                <span className="text-[13px] font-bold text-t0">v{p.v} — {p.title}</span>
                <span className="text-xs text-t2">{p.date}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
