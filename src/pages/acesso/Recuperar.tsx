import { Button } from "@/components/ui";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { paths } from "@/router/paths";
import { AcessoPagina, AvisoCard, CampoCpf, IconeCard, Rotulo } from "./AcessoKit";
import { cpfValido, somenteDigitos } from "@/lib/cpf";

export function Recuperar() {
  const [cpf, setCpf] = useState("");
  const [erroCpf, setErroCpf] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const d = somenteDigitos(cpf);
    if (!cpfValido(d)) {
      setErroCpf("CPF inválido. Confira os dígitos.");
      return;
    }
    setCarregando(true);
    // Mesmo tempo e mesma resposta, exista ou não a conta.
    await new Promise((r) => setTimeout(r, 900));
    setCarregando(false);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <AcessoPagina>
        <IconeCard tom="ok">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6" />
          </svg>
        </IconeCard>
        <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Verifique seu e-mail</h1>
        <p className="mb-6 text-[13.5px] leading-relaxed text-t1">Se houver uma conta com esse CPF, enviamos um link para o e-mail cadastrado. O link vale por 2 horas.</p>
        <Link to={paths.acesso.entrar} className="block text-center text-[13px] font-bold text-acc">
          Voltar para o login
        </Link>
      </AcessoPagina>
    );
  }

  return (
    <AcessoPagina>
      <IconeCard tom="acc">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </IconeCard>
      <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Esqueci minha senha</h1>
      <p className="mb-6 text-[13.5px] leading-relaxed text-t1">Informe seu CPF. Se houver uma conta, o link de recuperação vai para o e-mail cadastrado.</p>
      <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
        <div>
          <Rotulo>CPF</Rotulo>
          <CampoCpf
            value={cpf}
            onChange={(v) => {
              setCpf(v);
              setErroCpf(null);
            }}
            erro={erroCpf}
            autoFocus
          />
        </div>
        <Button type="submit" size="lg" fullWidth disabled={somenteDigitos(cpf).length < 11 || carregando}>{carregando ? "Aguarde…" : "Enviar link"}</Button>
        <AvisoCard tom="info">Por segurança, a resposta é a mesma exista ou não a conta, e o e-mail nunca é mostrado.</AvisoCard>
      </form>
      <Link to={paths.acesso.entrar} className="mt-6 block text-center text-[13px] font-bold text-acc">
        Voltar para o login
      </Link>
    </AcessoPagina>
  );
}
