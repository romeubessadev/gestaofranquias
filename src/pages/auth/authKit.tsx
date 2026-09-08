import type { ReactNode, InputHTMLAttributes } from "react";

/** Vela brand mark used across auth screens. */
export function BrandMark({ size = 34, light = false }: { size?: number; light?: boolean }) {
  return (
    <span
      className="flex items-center justify-center rounded-[10px]"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg,var(--acc),var(--acc-2))",
      }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke={light ? "#fff" : "#fff"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2 4 7v10l8 5 8-5V7z" />
        <path d="M12 22V12" />
        <path d="m4 7 8 5 8-5" />
      </svg>
    </span>
  );
}

/** Labeled text input styled to match the auth mockups. */
export function AuthInput({
  label,
  hint,
  ...props
}: { label?: ReactNode; hint?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-[12.5px] font-bold text-t1">{label}</span>
      )}
      <input
        {...props}
        className="h-11 w-full rounded-xl border border-line bg-bg-inset px-3.5 text-[13.5px] text-t0 outline-none transition-colors focus:border-acc"
      />
      {hint}
    </label>
  );
}

/** Full-width primary submit button used across auth cards. */
export function AuthButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
}) {
  if (variant === "ghost") {
    return (
      <button
        onClick={onClick}
        className="h-11 w-full rounded-xl border border-line bg-transparent text-[13.5px] font-semibold text-t0 transition-colors hover:bg-bg-3"
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="h-12 w-full rounded-[13px] bg-acc text-[15px] font-bold text-white transition-colors hover:bg-acc-2"
      style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}
    >
      {children}
    </button>
  );
}

/** Decorative radial glow backdrop used behind centered auth cards. */
export function AuthGlow() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(50% 50% at 50% 40%,rgba(124,92,255,.14),transparent 70%)",
      }}
    />
  );
}
