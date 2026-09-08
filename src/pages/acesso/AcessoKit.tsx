import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { padTopoEBase } from "@/lib/areaSegura";
import { cn } from "@/lib/cn";
import { AuthGlow, AuthInput } from "@/pages/auth/authKit";
import { Marca } from "@/components/gestao/Marca";
import { tenant } from "@/data/gestao/tenant";
import { mascararCpf } from "@/lib/cpf";

/**
 * Complementos das telas de acesso. Tudo que o template já resolve
 * (AuthInput, AuthButton, AuthGlow, o card centralizado das telas de senha)
 * vem de `@/pages/auth/authKit` e é só reexportado aqui.
 */
export { AuthGlow } from "@/pages/auth/authKit";

/** Moldura das telas de acesso, no mesmo formato de ForgotPassword/ResetPassword do template. */
export function AcessoPagina({ children, rodape, largura = 420, marca = true }: { children: ReactNode; rodape?: ReactNode; largura?: number; marca?: boolean }) {
  return (
    <div
      className="tela-cheia pad-topo pad-base relative flex w-full items-center justify-center overflow-hidden bg-bg-0 px-4"
      style={padTopoEBase("2.5rem", "2.5rem")}
    >
      <AuthGlow />
      <div className="relative w-full" style={{ maxWidth: largura }}>
        {marca && (
          <div className="mb-6 flex flex-col items-center gap-3">
            <Marca size={56} />
            <div className="text-center">
              <p className="text-[17px] font-extrabold tracking-tight text-t0">
                {tenant.nomeExibicao}
                <span className="text-acc">.</span>
              </p>
              <p className="text-[11.5px] text-t2">{tenant.slug}.gestaofranquias.com.br</p>
            </div>
          </div>
        )}
        <div className="rounded-[22px] border border-line bg-bg-2 p-7 sm:p-9" style={{ boxShadow: "0 20px 60px -20px rgba(0,0,0,.6)" }}>
          {children}
        </div>
        {rodape && <div className="mt-5">{rodape}</div>}
      </div>
    </div>
  );
}

export function Rotulo({ children, acao }: { children: ReactNode; acao?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center justify-between">
      <span className="text-[12.5px] font-bold text-t1">{children}</span>
      {acao}
    </div>
  );
}

/** CPF com máscara e teclado numérico, sobre o AuthInput do template. */
export function CampoCpf({ value, onChange, erro, ...props }: { value: string; onChange: (v: string) => void; erro?: string | null } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className={cn("[&_input]:font-mono [&_input]:tracking-wide", erro && "[&_input]:border-bad")}>
      <AuthInput {...props} value={value} onChange={(e) => onChange(mascararCpf(e.target.value))} inputMode="numeric" autoComplete="username" placeholder="000.000.000-00" hint={erro ? <p className="mt-1.5 text-[11.5px] font-medium text-bad">{erro}</p> : undefined} />
    </div>
  );
}

/** Senha com botão de revelar, sobre o AuthInput do template. */
export function CampoSenha({ value, onChange, placeholder = "Sua senha", autoComplete = "current-password", erro, ...props }: { value: string; onChange: (v: string) => void; erro?: string | null } & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className={cn("relative [&_input]:pr-12", erro && "[&_input]:border-bad")}>
      <AuthInput {...props} type={mostrar ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoComplete={autoComplete} hint={erro ? <p className="mt-1.5 text-[11.5px] font-medium text-bad">{erro}</p> : undefined} />
      <button type="button" onClick={() => setMostrar((m) => !m)} aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"} className="absolute right-2 top-[5px] flex h-8 w-8 items-center justify-center rounded-lg text-t2 hover:bg-bg-3 hover:text-t0">
        {mostrar ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

/** Aviso neutro dentro do card. */
export function AvisoCard({ tom = "info", children }: { tom?: "info" | "ok" | "bad" | "warn"; children: ReactNode }) {
  const cores = {
    info: "border-info/30 bg-info-soft",
    ok: "border-ok/30 bg-ok-soft",
    bad: "border-bad/30 bg-bad-soft",
    warn: "border-warn/30 bg-warn-soft",
  };
  return <div className={cn("rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed text-t0", cores[tom])}>{children}</div>;
}

/** Ícone redondo no topo do card, como em ForgotPassword/ResetPassword do template. */
export function IconeCard({ tom = "acc", centralizado = false, children }: { tom?: "acc" | "ok" | "bad" | "warn" | "info"; centralizado?: boolean; children: ReactNode }) {
  const bg = { acc: "bg-acc-soft", ok: "bg-ok-soft", bad: "bg-bad-soft", warn: "bg-warn-soft", info: "bg-info-soft" }[tom];
  const cor = { acc: "var(--acc)", ok: "var(--ok)", bad: "var(--bad)", warn: "var(--warn)", info: "var(--info)" }[tom];
  return (
    <div className={cn("mb-5 flex h-16 w-16 items-center justify-center rounded-[18px]", bg, centralizado && "mx-auto")} style={{ color: cor }}>
      {children}
    </div>
  );
}

/** Medidor de força da senha, no formato de barras do ResetPassword do template. */
export function ForcaSenha({ senha }: { senha: string }) {
  const n = senha.length;
  const nivel = n === 0 ? 0 : n < 10 ? 1 : n < 14 ? 2 : n < 20 ? 3 : 4;
  const cor = nivel <= 1 ? "bg-bad" : nivel === 2 ? "bg-warn" : "bg-ok";
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("h-[5px] flex-1 rounded-sm", i <= nivel ? cor : "bg-bg-inset")} />
        ))}
      </div>
      <p className="mt-1.5 text-[11.5px] text-t2">{n === 0 ? "Mínimo de 10 caracteres. Uma frase fácil de lembrar vale mais que símbolos." : n < 10 ? `Faltam ${10 - n} caracteres.` : "Boa. Não precisa de número nem símbolo."}</p>
    </div>
  );
}
