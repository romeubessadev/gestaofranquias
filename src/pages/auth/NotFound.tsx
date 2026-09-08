import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";

/** 404 page with gradient numerals and a back-to-dashboard action. */
export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-bg-0 p-10 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle,var(--acc-soft),transparent 65%)" }}
      />
      <div className="relative">
        <p
          className="text-[140px] font-extrabold leading-none tracking-tight"
          style={{
            background: "linear-gradient(135deg,var(--acc),var(--info))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </p>
        <h1 className="mt-3.5 text-[26px] font-extrabold tracking-tight text-t0">Page not found</h1>
        <p className="mx-auto mb-7 mt-3 max-w-[420px] text-[15px] text-t1">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate(paths.dashboards.analytics)}
            className="flex h-[46px] items-center gap-2 rounded-xl bg-acc px-[22px] text-sm font-bold text-white transition-colors hover:bg-acc-2"
            style={{ boxShadow: "0 10px 24px -10px var(--acc)" }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11 2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0h6m-6 0v-6h6v6" /></svg>
            Back to dashboard
          </button>
          <button className="h-[46px] rounded-xl border border-line bg-bg-2 px-[22px] text-sm font-semibold text-t0 transition-colors hover:bg-bg-3">
            Contact support
          </button>
        </div>
      </div>
    </div>
  );
}
