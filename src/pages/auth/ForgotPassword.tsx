import { Link } from "react-router-dom";
import { paths } from "@/router/paths";
import { AuthButton, AuthGlow } from "./authKit";

/** "Forgot password?" email-entry card. */
export function ForgotPassword() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg-0 p-10">
      <AuthGlow />
      <div className="relative w-full max-w-[420px]">
        <div className="rounded-[22px] border border-line bg-bg-2 p-9 text-center" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] bg-acc-soft">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>
          </div>
          <h2 className="mb-2.5 text-2xl font-extrabold text-t0">Forgot password?</h2>
          <p className="mb-6 text-sm leading-relaxed text-t2">Enter your email and we'll send a reset link within minutes.</p>
          <input
            placeholder="marcus@company.com"
            className="mb-3.5 h-[46px] w-full rounded-xl border border-line bg-bg-inset px-3.5 text-sm text-t0 outline-none focus:border-acc"
          />
          <div className="mb-4">
            <AuthButton>Send reset link</AuthButton>
          </div>
          <p className="text-[13px] text-t2">
            Remember it?{" "}
            <Link to={paths.auth.login} className="font-bold text-acc">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
