import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
import { AcessoPagina, AvisoCard, IconeCard } from "./AcessoKit";
import { useToast, Button } from "@/components/ui";
import { useSessao } from "@/session/SessionProvider";
import { inicioDoPapel } from "@/session/RequireSession";
import { cn } from "@/lib/cn";

type Plataforma = "ios" | "android" | "desktop";

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

const passos: Record<Exclude<Plataforma, "desktop">, string[]> = {
  ios: ["Toque no botão Compartilhar, o quadrado com a seta para cima, na barra do Safari.", "Role a lista e toque em \"Adicionar à Tela de Início\".", "Confirme em \"Adicionar\". O ícone aparece junto dos outros apps.", "Abra pelo ícone e aceite as notificações quando pedir."],
  android: ["Toque no aviso \"Instalar app\" que aparece embaixo, ou nos três pontos do Chrome.", "Escolha \"Instalar aplicativo\" e confirme.", "Abra pelo ícone e aceite as notificações quando pedir."],
};

export function Instalar() {
  const navigate = useNavigate();
  const { sessao, atualizar } = useSessao();
  const { show } = useToast();
  const detectada = useMemo(detectarPlataforma, []);
  const [plataforma, setPlataforma] = useState<Plataforma>(detectada);

  const destino = sessao ? (sessao.onboardingEtapa !== null ? paths.onboarding : inicioDoPapel(sessao.papel)) : paths.acesso.entrar;

  function concluir(instalou: boolean) {
    if (sessao && instalou) atualizar({ appInstalado: true });
    navigate(destino, { replace: true });
  }

  return (
    <AcessoPagina largura={460}>
      <IconeCard tom="acc">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      </IconeCard>
      <h1 className="mb-2 text-[22px] font-extrabold tracking-tight text-t0">Instale o app no celular</h1>
      <p className="mb-5 text-[13.5px] leading-relaxed text-t1">Com o app instalado você recebe o aviso na hora em que cruzar um degrau da meta. Sem ele, o aviso não chega.</p>

      <div className="mb-5 flex gap-1 rounded-[var(--radius-vela-md)] bg-bg-3 p-1">
        {(["ios", "android", "desktop"] as Plataforma[]).map((p) => (
          <button key={p} onClick={() => setPlataforma(p)} className={cn("flex-1 rounded-[10px] px-3 py-1.5 text-[12.5px] font-semibold transition-colors", plataforma === p ? "bg-bg-1 text-t0 shadow-[var(--shadow-vela)]" : "text-t1 hover:text-t0")}>
            {p === "ios" ? "iPhone" : p === "android" ? "Android" : "Computador"}
          </button>
        ))}
      </div>

      {plataforma === "desktop" ? (
        <div className="flex flex-col gap-3">
          <AvisoCard tom="info">O app funciona melhor no celular. Mande o link para você mesma e instale por lá.</AvisoCard>
          <Button size="lg" fullWidth onClick={() => show("Link enviado para o seu e-mail.", "success")}>Enviar link pro meu e-mail</Button>
          <Button size="lg" fullWidth variant="outline" onClick={() => concluir(false)}>Continuar no computador</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <ol className="flex flex-col gap-3">
            {passos[plataforma].map((p, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-acc-soft text-[12px] font-extrabold text-acc">{i + 1}</span>
                <span className="text-[13.5px] leading-relaxed text-t0">{p}</span>
              </li>
            ))}
          </ol>
          {plataforma === "ios" && <AvisoCard tom="warn">No iPhone, as notificações só funcionam com o app instalado pela tela de início.</AvisoCard>}
          <Button size="lg" fullWidth onClick={() => concluir(true)}>Já instalei</Button>
          <Button size="lg" fullWidth variant="outline" onClick={() => concluir(false)}>Pular por agora</Button>
          <p className="text-center text-[11.5px] text-t2">Este guia fica sempre disponível no seu perfil.</p>
        </div>
      )}
    </AcessoPagina>
  );
}
