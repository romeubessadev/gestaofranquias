import { Button } from "@/components/ui";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { paths } from "@/router/paths";
import { AcessoPagina, CampoSenha, ForcaSenha, IconeCard, Rotulo } from "./AcessoKit";

export function Redefinir() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const invalido = token === "expirado" || token === "usado" || token === "invalido";

  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [carregando, setCarregando] = useState(false);

  const erroConfirma = confirma.length > 0 && confirma !== senha ? "As senhas não coincidem." : null;
  const pode = senha.length >= 10 && confirma === senha && !carregando;

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!pode) return;
    setCarregando(true);
    await new Promise((r) => setTimeout(r, 900));
    // Revoga todas as sessões da identidade e volta ao login, sem entrar automaticamente.
    navigate(paths.acesso.entrar, { replace: true, state: { aviso: "Senha alterada. Entre com a nova senha." } });
  }

  if (invalido) {
    return (
      <AcessoPagina>
        <IconeCard tom="warn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </IconeCard>
        <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Este link não é mais válido</h1>
        <p className="mb-6 text-[13.5px] leading-relaxed text-t1">Links de recuperação valem por 2 horas e só podem ser usados uma vez.</p>
        <Link to={paths.acesso.recuperar}>
          <Button size="lg" fullWidth>Pedir um novo link</Button>
        </Link>
        <Link to={paths.acesso.entrar} className="mt-5 block text-center text-[13px] font-bold text-acc">
          Voltar para o login
        </Link>
      </AcessoPagina>
    );
  }

  return (
    <AcessoPagina>
      <IconeCard tom="ok">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </IconeCard>
      <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Nova senha</h1>
      <p className="mb-6 text-[13.5px] leading-relaxed text-t1">A senha é sua, não da franquia. Ao salvar, todos os aparelhos conectados precisam entrar de novo.</p>
      <form onSubmit={salvar} className="flex flex-col gap-4" noValidate>
        <div>
          <Rotulo>Nova senha</Rotulo>
          <CampoSenha value={senha} onChange={setSenha} placeholder="Mínimo de 10 caracteres" autoComplete="new-password" autoFocus />
        </div>
        <ForcaSenha senha={senha} />
        <div>
          <Rotulo>Confirmar senha</Rotulo>
          <CampoSenha value={confirma} onChange={setConfirma} placeholder="Repita a senha" autoComplete="new-password" erro={erroConfirma} />
        </div>
        <Button type="submit" size="lg" fullWidth disabled={!pode || carregando}>{carregando ? "Aguarde…" : "Salvar nova senha"}</Button>
      </form>
    </AcessoPagina>
  );
}
