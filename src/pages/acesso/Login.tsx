import { Button } from "@/components/ui";
import { padTopoEBase } from "@/lib/areaSegura";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { AvisoCard, CampoCpf, CampoSenha, Rotulo } from "./AcessoKit";
import { Marca, MarcaComNome } from "@/components/gestao/Marca";
import { tenant } from "@/data/gestao/tenant";
import { cpfValido, mascararCpf, somenteDigitos } from "@/lib/cpf";
import { usuarioPorCpf, usuarios } from "@/data/gestao/equipe";
import { rotuloPapel, useSessao } from "@/session/SessionProvider";
import { inicioDoPapel } from "@/session/RequireSession";

const MENSAGEM_ERRO = "CPF ou senha inválidos";

/** O que o produto corrige em relação ao painel da franqueadora. */
const DIFERENCAS = [
  "Ticket médio por atendimento, não por item vendido",
  "CMV só de mercadoria, sem royalties embutidos",
  "Uma fórmula por métrica, igual em todas as telas",
];

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { entrar } = useSessao();
  const aviso = (location.state as { aviso?: string } | null)?.aviso ?? null;

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erroCpf, setErroCpf] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [mostrarDemo, setMostrarDemo] = useState(false);

  const podeEnviar = somenteDigitos(cpf).length > 0 && senha.length > 0 && !carregando;

  // Atalho de demonstração: /entrar?como=<vinculoId> entra direto naquela conta.
  useEffect(() => {
    const como = new URLSearchParams(location.search).get("como");
    if (!como) return;
    const usuario = usuarios.find((u) => u.vinculoId === como);
    if (!usuario) return;
    const sessao = entrar(usuario);
    navigate(sessao.onboardingEtapa !== null ? paths.onboarding : inicioDoPapel(sessao.papel), { replace: true });
  }, [location.search, entrar, navigate]);

  function validarCpfLocal() {
    const d = somenteDigitos(cpf);
    if (d.length === 11 && !cpfValido(d)) setErroCpf("CPF inválido. Confira os dígitos.");
    else setErroCpf(null);
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!podeEnviar) return;
    const digitos = somenteDigitos(cpf);
    if (!cpfValido(digitos)) {
      setErroCpf("CPF inválido. Confira os dígitos.");
      return;
    }
    setErro(null);
    setCarregando(true);
    // Tempo constante de resposta, exista ou não o CPF.
    await new Promise((r) => setTimeout(r, 800));
    const usuario = usuarioPorCpf(digitos);
    if (!usuario || tentativas >= 5) {
      setTentativas((t) => t + 1);
      setErro(MENSAGEM_ERRO);
      setCarregando(false);
      return;
    }
    const sessao = entrar(usuario);
    const destino = (location.state as { de?: string } | null)?.de;
    if (sessao.onboardingEtapa !== null) navigate(paths.onboarding, { replace: true });
    else navigate(destino && destino !== "/" ? destino : inicioDoPapel(sessao.papel), { replace: true });
  }

  return (
    <div className="tela-cheia flex w-full flex-col bg-bg-0 lg:flex-row">
      {/* Painel da marca. Antes do login só existem nome, logo e cor: nada de número de loja. */}
      <div className="relative hidden flex-[1.05] flex-col justify-between overflow-hidden p-12 lg:flex" style={{ background: "linear-gradient(165deg,#1b1640,#0c0e15 70%)" }}>
        <div className="pointer-events-none absolute -right-16 -top-20 h-[340px] w-[340px] rounded-full" style={{ background: "radial-gradient(circle,rgba(124,92,255,.35),transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-[300px] w-[300px] rounded-full" style={{ background: "radial-gradient(circle,rgba(86,168,255,.22),transparent 70%)" }} />

        <div className="relative">
          <MarcaComNome size={38} claro />
        </div>

        <div className="relative max-w-[440px]">
          <h2 className="text-[38px] font-extrabold leading-[1.1] tracking-tight text-white">Suas lojas, os números certos, no bolso.</h2>
          <p className="mt-[18px] text-[15px] leading-relaxed text-white/60">Faturamento, meta, comissão e margem de todas as unidades, com a mesma conta em toda tela. Sem planilha, sem número que muda de um relatório para o outro.</p>
        </div>

        <div className="relative max-w-[440px] rounded-2xl border border-white/10 p-5 backdrop-blur" style={{ background: "rgba(255,255,255,.05)" }}>
          <p className="mb-3.5 text-[12px] font-bold uppercase tracking-wider text-white/50">O que muda aqui</p>
          <ul className="flex flex-col gap-2.5">
            {DIFERENCAS.map((d) => (
              <li key={d} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-white/85">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Formulário */}
      <div className="pad-topo pad-base flex flex-1 items-center justify-center px-6" style={padTopoEBase("2.5rem", "2.5rem")}>
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex flex-col items-center gap-2.5 lg:hidden">
            <Marca size={52} />
            <div className="text-center">
              <p className="text-[17px] font-extrabold tracking-tight text-t0">
                {tenant.nomeExibicao}
                <span className="text-acc">.</span>
              </p>
              <p className="text-[11.5px] text-t2">{tenant.slug}.gestaofranquias.com.br</p>
            </div>
          </div>

          <h1 className="text-[26px] font-extrabold tracking-tight text-t0">Entrar</h1>
          <p className="mb-6 mt-2 text-sm text-t1">Use seu CPF e a senha da sua conta.</p>

          {aviso && (
            <div className="mb-5">
              <AvisoCard tom="ok">{aviso}</AvisoCard>
            </div>
          )}

          <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
            <div>
              <Rotulo>CPF</Rotulo>
              <CampoCpf
                value={cpf}
                onChange={(v) => {
                  setCpf(v);
                  setErro(null);
                  if (erroCpf) setErroCpf(null);
                }}
                onBlur={validarCpfLocal}
                erro={erroCpf}
                autoFocus
              />
            </div>
            <div>
              <Rotulo
                acao={
                  <Link to={paths.acesso.recuperar} className="text-[12px] font-bold text-acc">
                    Esqueci minha senha
                  </Link>
                }
              >
                Senha
              </Rotulo>
              <CampoSenha
                value={senha}
                onChange={(v) => {
                  setSenha(v);
                  setErro(null);
                }}
              />
            </div>

            {erro && (
              <AvisoCard tom="bad">
                <span className="font-bold">{erro}.</span> Confira os dados e tente de novo.
              </AvisoCard>
            )}

            <div className="mt-1">
              <Button type="submit" size="lg" fullWidth disabled={!podeEnviar || carregando}>{carregando ? "Aguarde…" : "Entrar"}</Button>
            </div>
          </form>

          <div className="mt-8 rounded-[16px] border border-dashed border-line bg-bg-2/60 p-4">
            <button onClick={() => setMostrarDemo((m) => !m)} className="flex w-full items-center justify-between text-left">
              <span className="text-[12px] font-bold uppercase tracking-wide text-t2">Atalhos de demonstração</span>
              <span className="text-[11px] text-t2">{mostrarDemo ? "ocultar" : "mostrar"}</span>
            </button>
            {mostrarDemo && (
              <div className="mt-3 space-y-3">
                <p className="text-[12px] leading-relaxed text-t1">Qualquer senha funciona para estas contas. Toque para preencher o CPF.</p>
                <div className="flex flex-col gap-1.5">
                  {usuarios
                    .filter((u) => u.onboardingEtapa === null)
                    .map((u) => (
                      <button
                        key={u.vinculoId}
                        type="button"
                        onClick={() => {
                          setCpf(mascararCpf(u.cpf));
                          setSenha("demonstracao");
                          setErro(null);
                          setErroCpf(null);
                        }}
                        className="flex items-center justify-between gap-2 rounded-[10px] border border-line bg-bg-2 px-3 py-2 text-left hover:bg-bg-3"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-[12.5px] font-bold text-t0">{u.nome}</span>
                          <span className="block text-[11px] text-t2">
                            {rotuloPapel[u.papel]}
                            {u.proprietario ? " · proprietária" : ""}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[11.5px] text-t1">{mascararCpf(u.cpf)}</span>
                      </button>
                    ))}
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11.5px]">
                  <Link to={paths.acesso.convite("ativar-gestor")} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Ativar conta · franqueado
                  </Link>
                  <Link to={paths.acesso.convite("ativar-vendedora")} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Ativar conta · vendedora
                  </Link>
                  <Link to={paths.acesso.convite("aceite-gerente")} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Aceitar convite
                  </Link>
                  <Link to={paths.acesso.convite("expirado")} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Convite expirado
                  </Link>
                  <Link to={paths.acesso.redefinir("token-valido")} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Redefinir senha
                  </Link>
                  <Link to={paths.acesso.redefinir("expirado")} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Link inválido
                  </Link>
                  <Link to={paths.acesso.instalar} className="rounded-[9px] bg-bg-3 px-2.5 py-2 font-semibold text-t1 hover:text-t0">
                    Instalar o app
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
