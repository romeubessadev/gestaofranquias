import { AuthButton, AuthGlow } from "./authKit";

/** "Set new password" card with a strength meter. */
export function ResetPassword() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg-0 p-10">
      <AuthGlow />
      <div className="relative w-full max-w-[420px]">
        <div className="rounded-[22px] border border-line bg-bg-2 p-9" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] bg-ok-soft">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <h2 className="mb-2 text-2xl font-extrabold text-t0">Set new password</h2>
          <p className="mb-6 text-sm text-t2">Must differ from previous passwords.</p>
          <div className="flex flex-col gap-3.5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-t1">New password</span>
              <input type="password" placeholder="Min. 8 characters" className="h-[46px] w-full rounded-xl border border-line bg-bg-inset px-[13px] text-sm text-t0 outline-none focus:border-acc" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-t1">Confirm password</span>
              <input type="password" placeholder="Re-enter password" className="h-[46px] w-full rounded-xl border border-line bg-bg-inset px-[13px] text-sm text-t0 outline-none focus:border-acc" />
            </label>
            <div className="flex gap-1">
              <span className="h-[5px] flex-1 rounded-sm bg-ok" />
              <span className="h-[5px] flex-1 rounded-sm bg-ok" />
              <span className="h-[5px] flex-1 rounded-sm bg-ok" />
              <span className="h-[5px] flex-1 rounded-sm bg-bg-inset" />
            </div>
            <AuthButton>Reset password</AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
