import { useRef } from "react";
import { AuthButton, AuthGlow } from "./authKit";

/** Two-factor code entry with 6 auto-advancing digit boxes. */
export function TwoFactor() {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const onInput = (i: number, v: string) => {
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-bg-0 p-10">
      <AuthGlow />
      <div className="relative w-full max-w-[420px]">
        <div className="rounded-[22px] border border-line bg-bg-2 p-9 text-center" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] bg-info-soft">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
          </div>
          <h2 className="mb-2 text-2xl font-extrabold text-t0">Two-factor auth</h2>
          <p className="mb-1.5 text-sm text-t2">6-digit code sent to</p>
          <p className="mb-6 text-[14.5px] font-bold text-t0">elena@stripe.com</p>
          <div className="mb-[22px] flex justify-center gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                maxLength={1}
                onChange={(e) => onInput(i, e.target.value)}
                className="h-[58px] w-[50px] rounded-[13px] border border-line bg-bg-inset text-center text-2xl font-extrabold text-t0 outline-none focus:border-2 focus:border-acc"
              />
            ))}
          </div>
          <div className="mb-3.5">
            <AuthButton>Verify code</AuthButton>
          </div>
          <p className="text-[13px] text-t2">
            Didn't get it? <a href="#" className="font-bold text-acc">Resend</a> · expires in{" "}
            <strong className="text-warn">2:34</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
