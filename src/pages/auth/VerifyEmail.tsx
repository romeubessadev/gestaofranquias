import { Link } from "react-router-dom";
import { paths } from "@/router/paths";
import { AuthButton } from "./authKit";

/** Post-signup "verify your email" prompt. */
export function VerifyEmail() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg-0 p-10">
      <div className="w-full max-w-[420px]">
        <div className="rounded-[22px] border border-line bg-bg-2 px-9 py-10 text-center" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          <div className="mx-auto mb-[22px] flex h-[72px] w-[72px] items-center justify-center rounded-[20px] bg-acc-soft">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" /></svg>
          </div>
          <h1 className="mb-2.5 text-[23px] font-extrabold tracking-tight text-t0">Verify your email</h1>
          <p className="mb-1.5 text-sm leading-relaxed text-t2">We sent a verification link to</p>
          <p className="mb-6 text-sm font-bold text-acc">elena@stripe.com</p>
          <div className="mb-3 h-11">
            <button className="h-11 w-full rounded-xl bg-acc text-sm font-bold text-white transition-colors hover:bg-acc-2" style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}>
              Open email app
            </button>
          </div>
          <AuthButton variant="ghost">Resend email</AuthButton>
          <p className="mt-[22px] text-[12.5px] text-t2">
            Wrong address?{" "}
            <Link to={paths.auth.register} className="font-bold text-acc">Change email</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
