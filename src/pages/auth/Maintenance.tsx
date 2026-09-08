const countdownBoxes = [
  { val: "02", label: "Days" },
  { val: "14", label: "Hours" },
  { val: "37", label: "Mins" },
  { val: "09", label: "Secs" },
];

/** Shared maintenance / coming-soon splash. `variant` selects the copy + accent. */
export function Maintenance({ variant = "maintenance" }: { variant?: "maintenance" | "coming-soon" }) {
  const isMaint = variant === "maintenance";
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg-0 p-10 text-center">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(50% 50% at 50% 50%,rgba(124,92,255,.12),transparent 70%)" }} />
      <div className="relative max-w-[500px]">
        <div className={`mx-auto mb-6 flex h-[76px] w-[76px] items-center justify-center rounded-[22px] ${isMaint ? "bg-warn-soft" : "bg-acc-soft"}`}>
          {isMaint ? (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>
          ) : (
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          )}
        </div>
        {!isMaint && (
          <span className="mb-4 inline-block rounded-full bg-acc-soft px-3.5 py-1 text-[11.5px] font-bold tracking-wide text-acc">
            COMING SOON
          </span>
        )}
        <h1 className="mb-3.5 text-4xl font-extrabold tracking-tight text-t0">
          {isMaint ? "Under maintenance" : "Something amazing is coming"}
        </h1>
        <p className="mb-8 text-[15px] leading-relaxed text-t2">
          {isMaint
            ? "We're upgrading for a better experience. Back at 14:00 UTC today."
            : "We're building the next generation of analytics. Be the first to know."}
        </p>
        <div className="mb-7 grid grid-cols-4 gap-3">
          {countdownBoxes.map((b) => (
            <div key={b.label} className="rounded-2xl border border-line bg-bg-2 px-2.5 py-[18px]">
              <p className="text-[28px] font-extrabold tabular-nums text-acc">{b.val}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-t2">{b.label}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto flex max-w-[420px] gap-2.5">
          <input
            placeholder={isMaint ? "Notify me when back…" : "Your email for early access"}
            className="h-12 flex-1 rounded-xl border border-line bg-bg-2 px-[15px] text-sm text-t0 outline-none focus:border-acc"
          />
          <button
            className="h-12 flex-none rounded-xl bg-acc px-5 text-sm font-bold text-white transition-colors hover:bg-acc-2"
            style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}
          >
            Notify me
          </button>
        </div>
      </div>
    </div>
  );
}
