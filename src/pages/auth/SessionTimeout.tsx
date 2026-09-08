import { Link, useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";

/** "Session expired" re-authentication prompt. */
export function SessionTimeout() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-0 p-10">
      <div className="w-full max-w-[420px]">
        <div className="rounded-[22px] border border-line bg-bg-2 px-9 py-10 text-center" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          <div className="mx-auto mb-[22px] flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-warn-soft">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--warn)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2" /></svg>
          </div>
          <h1 className="mb-2.5 text-[23px] font-extrabold tracking-tight text-t0">Session expired</h1>
          <p className="mb-6 text-sm leading-relaxed text-t2">
            Your session timed out after 30 minutes of inactivity. Please sign in again to continue
            where you left off.
          </p>
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-bg-inset px-4 py-3.5 text-left">
            <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,#7c5cff,#56a8ff)" }}>EP</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-t0">Elena Park</p>
              <p className="mt-0.5 text-[11.5px] text-t2">elena@stripe.com</p>
            </div>
          </div>
          <button
            onClick={() => navigate(paths.dashboards.analytics)}
            className="mb-3 h-11 w-full rounded-xl bg-acc text-sm font-bold text-white transition-colors hover:bg-acc-2"
            style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}
          >
            Sign in again
          </button>
          <Link to={paths.auth.login} className="text-[12.5px] font-bold text-t2">
            Sign in as a different user
          </Link>
        </div>
      </div>
    </div>
  );
}
