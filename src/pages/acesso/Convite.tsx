import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { paths } from "@/router/paths";
import { AcessoPagina, AvisoCard, CampoSenha, ForcaSenha, IconeCard, Rotulo } from "./AcessoKit";
import { Skeleton, Button } from "@/components/ui";
import { tenant } from "@/data/gestao/tenant";
import { usuarios, type Papel, type Usuario } from "@/data/gestao/equipe";
import { rotuloPapel, useSessao } from "@/session/SessionProvider";
import { cpfDeBase } from "@/lib/cpf";

type RespostaConvite =
  | { tipo: "ATIVACAO"; nome: string; papel: Papel; usuario: Usuario }
  | { tipo: "ACEITE"; nome: string; papel: Papel }
  | { tipo: "INVALIDO"; motivo: "expirado" | "usado" | "invalido" };

/** GET /convite/{token} simulado: o servidor decide a tela, não o cliente. */
async function consultarConvite(token: string): Promise<RespostaConvite> {
  await new Promise((r) => setTimeout(r, 700));
  if (token === "ativar-gestor") {
    return { tipo: "ATIVACAO", nome: "Paulo Henrique", papel: "GESTOR", usuario: usuarios.find((u) => u.vinculoId === "v-novo")! };
  }
  if (token === "ativar-vendedora") {
    const usuario: Usuario = { vinculoId: "v-natalia", identidadeId: "i-natalia", nome: "Natália Barros", cpf: cpfDeBase("103745561"), email: "natalia.barros@gmail.com", papel: "VENDEDOR", proprietario: false, filiais: ["f2"], colaboradorId: "c16", onboardingEtapa: null };
    return { tipo: "ATIVACAO", nome: "Natália", papel: "VENDEDOR", usuario };
  }
  if (token === "ativar-gerente") {
    return { tipo: "ATIVACAO", nome: "Marcos", papel: "GERENTE", usuario: usuarios.find((u) => u.vinculoId === "v-marcos")! };
  }
  if (token.startsWith("aceite")) return { tipo: "ACEITE", nome: "Marcos", papel: "GERENTE" };
  if (token === "usado") return { tipo: "INVALIDO", motivo: "usado" };
  if (token === "expirado") return { tipo: "INVALIDO", motivo: "expirado" };
  return { tipo: "INVALIDO", motivo: "invalido" };
}

export function Convite() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { entrar } = useSessao();
  const [resposta, setResposta] = useState<RespostaConvite | null>(null);
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    let ativo = true;
    setResposta(null);
    consultarConvite(token).then((r) => ativo && setResposta(r));
    return () => {
      ativo = false;
    };
  }, [token]);

  if (!resposta) {
    return (
      <AcessoPagina>
        <Skeleton className="mb-5 h-16 w-16 rounded-[18px]" />
        <Skeleton className="mb-3 h-7 w-2/3" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-6 h-4 w-5/6" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </AcessoPagina>
    );
  }

  if (resposta.tipo === "INVALIDO") {
    return (
      <AcessoPagina>
        <IconeCard tom="warn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </IconeCard>
        <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Este convite não é mais válido</h1>
        <p className="mb-6 text-[13.5px] leading-relaxed text-t1">Convites valem por 48 horas e só podem ser usados uma vez. Peça a quem convidou para reenviar.</p>
        <Link to={paths.acesso.entrar} className="block text-center text-[13px] font-bold text-acc">
          Ir para o login
        </Link>
      </AcessoPagina>
    );
  }

  if (resposta.tipo === "ACEITE") {
    return (
      <AcessoPagina>
        <IconeCard tom="acc">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" />
          </svg>
        </IconeCard>
        <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Você foi convidado</h1>
        <p className="mb-2 text-[13.5px] leading-relaxed text-t1">
          A <span className="font-bold text-t0">{tenant.nomeExibicao}</span> convidou você para acessar o sistema como <span className="font-bold text-t0">{rotuloPapel[resposta.papel]}</span>.
        </p>
        <p className="mb-6 text-[13.5px] leading-relaxed text-t1">Você já tem uma conta. Use a mesma senha de sempre para entrar.</p>
        <div className="flex flex-col gap-2.5">
          <Button size="lg" fullWidth onClick={() => navigate(paths.acesso.entrar, { replace: true, state: { aviso: "Convite aceito. Entre com a senha de sempre." } })}>
            Aceitar convite
          </Button>
          <Button size="lg" fullWidth variant="outline" onClick={() => navigate(paths.acesso.entrar, { replace: true, state: { aviso: "Convite recusado. Quem convidou foi avisado." } })}>
            Recusar
          </Button>
        </div>
      </AcessoPagina>
    );
  }

  const erroConfirma = confirma.length > 0 && confirma !== senha ? "As senhas não coincidem." : null;
  const pode = senha.length >= 10 && confirma === senha && !carregando;

  async function criar(e: FormEvent) {
    e.preventDefault();
    if (!pode || resposta?.tipo !== "ATIVACAO") return;
    setCarregando(true);
    await new Promise((r) => setTimeout(r, 900));
    const sessao = entrar(resposta.usuario);
    if (sessao.papel === "GESTOR" && sessao.proprietario && sessao.onboardingEtapa !== null) navigate(paths.onboarding, { replace: true });
    else if (sessao.papel === "VENDEDOR") navigate(paths.acesso.instalar, { replace: true });
    else navigate(paths.dashboard, { replace: true });
  }

  return (
    <AcessoPagina>
      <IconeCard tom="ok">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </IconeCard>
      <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Olá, {resposta.nome}.</h1>
      <p className="mb-6 text-[13.5px] leading-relaxed text-t1">
        Crie sua senha para acessar a <span className="font-bold text-t0">{tenant.nomeExibicao}</span> como {rotuloPapel[resposta.papel].toLowerCase()}.
      </p>
      <form onSubmit={criar} className="flex flex-col gap-4" noValidate>
        <div>
          <Rotulo>Senha</Rotulo>
          <CampoSenha value={senha} onChange={setSenha} placeholder="Mínimo de 10 caracteres" autoComplete="new-password" autoFocus />
        </div>
        <ForcaSenha senha={senha} />
        <div>
          <Rotulo>Confirmar senha</Rotulo>
          <CampoSenha value={confirma} onChange={setConfirma} placeholder="Repita a senha" autoComplete="new-password" erro={erroConfirma} />
        </div>
        <Button type="submit" size="lg" fullWidth disabled={!pode || carregando}>{carregando ? "Aguarde…" : "Criar minha conta"}</Button>
        <AvisoCard tom="info">Seu CPF é o login. Ele já veio no convite, você só escolhe a senha.</AvisoCard>
      </form>
    </AcessoPagina>
  );
}
