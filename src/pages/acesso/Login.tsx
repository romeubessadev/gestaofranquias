import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { BrandMark } from "@/pages/auth/authKit";
import { tenant } from "@/data/gestao/tenant";
import { usuarios } from "@/data/gestao/equipe";
import { isSupabaseConfigured } from "@/lib/supabase";
import { loginComEmail, MENSAGEM_LOGIN } from "@/session/authApi";
import { rotuloPapel, useSessao } from "@/session/SessionProvider";
import { inicioDoPapel } from "@/session/RequireSession";
import { cn } from "@/lib/cn";

function emailValido(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

const inputClass =
  "h-[46px] w-full rounded-xl border border-line bg-bg-inset px-[15px] text-sm text-t0 outline-none focus:border-acc";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { aplicarSessao, entrar } = useSessao();
  const aviso = (location.state as { aviso?: string } | null)?.aviso ?? null;

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarDemo, setMostrarDemo] = useState(false);

  const podeEnviar = email.trim().length > 0 && senha.length > 0 && !carregando;

  useEffect(() => {
    const como = new URLSearchParams(location.search).get("como");
    if (!como || isSupabaseConfigured()) return;
    const usuario = usuarios.find((u) => u.vinculoId === como);
    if (!usuario) return;
    const sessao = entrar(usuario);
    navigate(sessao.onboardingEtapa !== null ? paths.onboarding : inicioDoPapel(sessao.papel), { replace: true });
  }, [location.search, entrar, navigate]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!podeEnviar) return;
    if (!emailValido(email)) {
      setErroEmail("Informe um e-mail válido.");
      return;
    }
    setErro(null);
    setErroEmail(null);
    setCarregando(true);
    const r = await loginComEmail(email, senha);
    setCarregando(false);
    if (!r.ok) {
      setErro(r.erro || MENSAGEM_LOGIN);
      return;
    }
    aplicarSessao(r.sessao);
    const destino = (location.state as { de?: string } | null)?.de;
    if (r.sessao.onboardingEtapa !== null) navigate(paths.onboarding, { replace: true });
    else navigate(destino && destino !== "/" ? destino : inicioDoPapel(r.sessao.papel), { replace: true });
  }

  return (
    <div className="grid min-h-screen w-full bg-bg-0 lg:grid-cols-2">
      {/* Hero — layout LoginSplit */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: "linear-gradient(150deg,#14103a,#1b1650 45%,#0f2d54)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(70% 60% at 75% 15%,rgba(124,92,255,.4),transparent 60%)" }}
        />
        <div className="relative flex items-center gap-3">
          <BrandMark size={38} light />
          <span className="text-[17px] font-extrabold text-white">{tenant.nomeExibicao}</span>
        </div>
        <div className="relative">
          <h2 className="mb-3.5 text-[30px] font-extrabold leading-[1.25] tracking-tight text-white">
            Suas lojas, os números
            <br />
            certos, no bolso.
          </h2>
          <p className="max-w-[400px] text-[15px] leading-relaxed text-white/70">
            Faturamento, meta, comissão e margem de todas as unidades — com a mesma conta em toda tela.
          </p>
        </div>
        <div className="relative flex gap-2">
          <span className="h-1 w-8 rounded-sm bg-white" />
          <span className="h-1 w-2.5 rounded-sm bg-white/40" />
          <span className="h-1 w-2.5 rounded-sm bg-white/40" />
        </div>
      </div>

      {/* Form — layout LoginSplit */}
      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-14">
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <BrandMark size={34} />
          <span className="text-[16px] font-extrabold text-t0">{tenant.nomeExibicao}</span>
        </div>

        <div className="w-full max-w-[380px]">
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-t0">Bem-vindo de volta</h1>
          <p className="mb-7 text-sm text-t2">Entre com o e-mail e a senha da sua conta {tenant.nomeExibicao}.</p>

          {aviso && (
            <p className="mb-4 rounded-xl border border-ok/30 bg-ok/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-ok">{aviso}</p>
          )}

          <form onSubmit={enviar} className="flex flex-col gap-3.5" noValidate>
            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-t0">E-mail</span>
              <input
                type="email"
                autoComplete="username"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErro(null);
                  if (erroEmail) setErroEmail(null);
                }}
                className={cn(inputClass, erroEmail && "border-bad")}
                placeholder="seu@email.com"
              />
              {erroEmail && <p className="mt-1.5 text-[11.5px] font-medium text-bad">{erroEmail}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12.5px] font-bold text-t0">Senha</span>
              <input
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro(null);
                }}
                className={inputClass}
                placeholder="Sua senha"
              />
            </label>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-t1">
                <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} style={{ accentColor: "var(--acc)" }} />
                Manter conectado
              </label>
              <Link to={paths.acesso.recuperar} className="text-[12.5px] font-bold text-acc">
                Esqueci minha senha
              </Link>
            </div>

            {erro && (
              <p className="rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-[12.5px] text-bad">
                <span className="font-bold">{erro}.</span> Confira os dados e tente de novo.
              </p>
            )}

            <button
              type="submit"
              disabled={!podeEnviar || carregando}
              className="mt-1 h-[46px] w-full rounded-xl bg-acc text-sm font-bold text-white transition-colors hover:bg-acc-2 disabled:opacity-60"
              style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}
            >
              {carregando ? "Aguarde…" : "Entrar"}
            </button>
          </form>

          <p className="mt-[22px] text-center text-[13px] text-t2">Acesso somente por convite — não há cadastro público.</p>

          {!isSupabaseConfigured() && (
            <div className="mt-6 rounded-[16px] border border-dashed border-line bg-bg-2/60 p-4">
              <button type="button" onClick={() => setMostrarDemo((m) => !m)} className="flex w-full items-center justify-between text-left">
                <span className="text-[12px] font-bold uppercase tracking-wide text-t2">Demo (sem Supabase)</span>
                <span className="text-[11px] text-t2">{mostrarDemo ? "ocultar" : "mostrar"}</span>
              </button>
              {mostrarDemo && (
                <div className="mt-3 flex flex-col gap-1.5">
                  {usuarios
                    .filter((u) => u.onboardingEtapa === null)
                    .map((u) => (
                      <button
                        key={u.vinculoId}
                        type="button"
                        onClick={() => {
                          setEmail(u.email);
                          setSenha("demonstracao");
                          setErro(null);
                          setErroEmail(null);
                        }}
                        className="flex items-center justify-between gap-2 rounded-[10px] border border-line bg-bg-2 px-3 py-2 text-left hover:bg-bg-3"
                      >
                        <span className="min-w-0 truncate text-[12.5px] font-bold text-t0">
                          {u.nome}
                          <span className="ml-1 font-normal text-t2">· {rotuloPapel[u.papel]}</span>
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
