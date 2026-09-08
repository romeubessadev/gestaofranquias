import { useNavigate, useSearchParams } from "react-router-dom";
import { padTopoEBase } from "@/lib/areaSegura";
import { cn } from "@/lib/cn";
import { paths } from "@/router/paths";
import { AuthGlow } from "@/pages/auth/authKit";
import { Marca } from "@/components/gestao/Marca";
import { useSessao, useSessaoAtiva } from "@/session/SessionProvider";
import { Etapa1Marca } from "./Etapa1Marca";
import { Etapa2Credencial } from "./Etapa2Credencial";
import { Etapa3Filiais } from "./Etapa3Filiais";
import { Etapa4Equipe } from "./Etapa4Equipe";

const etapas = [
  { num: 1, label: "Marca" },
  { num: 2, label: "ERP" },
  { num: 3, label: "Filiais" },
  { num: 4, label: "Equipe" },
];

export function Onboarding() {
  const sessao = useSessaoAtiva();
  const { atualizar, sair } = useSessao();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  // ?etapa=N abre direto naquela etapa, para revisar sem refazer o fluxo.
  const forcada = Number(params.get("etapa"));
  const atual = forcada >= 1 && forcada <= 4 ? forcada : (sessao.onboardingEtapa ?? 1);

  function irPara(etapa: number | null) {
    atualizar({ onboardingEtapa: etapa });
    if (etapa === null) {
      navigate(paths.loja, { replace: true });
      return;
    }
    if (params.has("etapa")) setParams(new URLSearchParams({ etapa: String(etapa) }), { replace: true });
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="tela-cheia relative w-full overflow-hidden bg-bg-0">
      <AuthGlow />
      <div className="pad-topo pad-base relative mx-auto w-full max-w-3xl px-4" style={padTopoEBase("2rem", "2rem")}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Marca size={40} nome={sessao.nome} logoUrl={null} fallback="iniciais" />
            <div>
              <p className="text-[15px] font-extrabold text-t0">Configuração inicial</p>
              <p className="text-[12px] text-t2">Olá, {sessao.nome.split(" ")[0]}. Leva uns dez minutos e pode ser retomado depois.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sair();
              navigate(paths.acesso.entrar);
            }}
            className="text-[12px] font-semibold text-t2 hover:text-t0"
          >
            Sair
          </button>
        </div>

        <div className="mb-8 flex items-center justify-center">
          {etapas.map((s, i) => {
            const done = s.num < atual;
            const active = s.num === atual;
            return (
              <div key={s.num} className="flex items-center">
                <div className="flex min-w-[64px] flex-col items-center gap-2 sm:min-w-[80px]">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 text-[13px] font-extrabold", done && "border-acc bg-acc text-white", active && "border-acc bg-acc-soft text-acc", !done && !active && "border-line bg-bg-inset text-t2")}>
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={cn("whitespace-nowrap text-[11.5px] font-semibold", active ? "text-t0" : "text-t2")}>{s.label}</span>
                </div>
                {i < etapas.length - 1 && <div className={cn("mb-5 h-0.5 w-8 sm:w-16", s.num < atual ? "bg-acc" : "bg-line")} />}
              </div>
            );
          })}
        </div>

        {atual === 1 && <Etapa1Marca onConcluir={() => irPara(2)} />}
        {atual === 2 && <Etapa2Credencial onConcluir={() => irPara(3)} onVoltar={() => irPara(1)} />}
        {atual === 3 && <Etapa3Filiais onConcluir={() => irPara(4)} onVoltar={() => irPara(2)} />}
        {atual === 4 && <Etapa4Equipe onConcluir={() => irPara(null)} />}
      </div>
    </div>
  );
}
