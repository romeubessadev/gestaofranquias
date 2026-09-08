import { Link, useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { AuthGlow } from "./authKit";

/** Locked-session unlock screen for the current user. */
export function LockScreen() {
  const navigate = useNavigate();
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg-0 p-10">
      <AuthGlow />
      <div className="relative w-full max-w-[420px] text-center">
        <span
          className="mx-auto mb-4 flex h-[88px] w-[88px] items-center justify-center rounded-3xl text-3xl font-extrabold text-white"
          style={{ background: "linear-gradient(135deg,#7c5cff,#56a8ff)", boxShadow: "0 16px 40px -12px rgba(124,92,255,.5)" }}
        >
          EP
        </span>
        <h2 className="mb-1 text-[22px] font-extrabold text-t0">Elena Park</h2>
        <p className="mb-7 text-sm text-t2">Locked · VP of Sales</p>
        <div className="rounded-[20px] border border-line bg-bg-2 p-7" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          <div className="relative mb-3.5">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
            <input
              type="password"
              placeholder="Enter your password"
              className="h-[50px] w-full rounded-[13px] border border-line bg-bg-inset pl-11 pr-3 text-[15px] text-t0 outline-none focus:border-acc"
            />
          </div>
          <button
            onClick={() => navigate(paths.dashboards.analytics)}
            className="h-12 w-full rounded-[13px] bg-acc text-[15px] font-bold text-white transition-colors hover:bg-acc-2"
            style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}
          >
            Unlock session
          </button>
          <p className="mt-4 text-[13px] text-t2">
            Not you?{" "}
            <Link to={paths.auth.login} className="font-bold text-acc">Switch accounts</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
