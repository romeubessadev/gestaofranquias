import { Link, useNavigate } from "react-router-dom";
import { Avatar, Badge, Button, Card, CardTitle, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";
import { filiais } from "@/data/gestao/filiais";
import { tenant } from "@/data/gestao/tenant";
import { mascararCpf } from "@/lib/cpf";
import { rotuloPapel, useSessao, useSessaoAtiva } from "@/session/SessionProvider";

export function Perfil() {
  const sessao = useSessaoAtiva();
  const { sair } = useSessao();
  const navigate = useNavigate();
  const minhas = filiais.filter((f) => sessao.filiais.includes(f.id));

  return (
    <div>
      <PageHeader title="Meu perfil" subtitle="Sua conta e seu acesso a esta franquia" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar name={sessao.nome} size="xl" />
            <div className="min-w-0">
              <p className="truncate text-[17px] font-extrabold text-t0">{sessao.nome}</p>
              <p className="text-[12.5px] text-t2">{sessao.email}</p>
              <p className="mt-1 font-mono text-[12px] text-t1">CPF {mascararCpf(sessao.cpf)}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 text-[13px]">
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-t2">Franquia</span>
              <span className="font-bold text-t0">{tenant.nomeExibicao}</span>
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="text-t2">Papel</span>
              <Badge variant="accent">{rotuloPapel[sessao.papel]}{sessao.proprietario ? " · proprietária" : ""}</Badge>
            </div>
            <div className="flex items-start justify-between border-t border-line pt-3">
              <span className="text-t2">Lojas</span>
              <span className="text-right font-semibold text-t0">{minhas.map((f) => f.fantasia).join(", ")}</span>
            </div>
          </div>
          <p className="mt-5 text-[11.5px] text-t2">A senha é sua, não da franquia. Trocar a senha desconecta todos os aparelhos em todas as franquias em que você tem acesso.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to={paths.acesso.recuperar}>
              <Button variant="outline" size="sm">
                Trocar senha
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sair();
                navigate(paths.acesso.entrar);
              }}
            >
              Sair deste aparelho
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>App no celular</CardTitle>
          <p className="mt-1 text-[12.5px] text-t1">{sessao.appInstalado ? "Instalado. As notificações de degrau chegam por aqui." : "Ainda não instalado. Sem o app, o aviso de degrau vira rascunho de WhatsApp para o gestor enviar."}</p>
          <div className="mt-4">
            <Link to={paths.acesso.instalar}>
              <Button size="sm" variant={sessao.appInstalado ? "outline" : "primary"}>
                {sessao.appInstalado ? "Ver o guia de novo" : "Instalar o app"}
              </Button>
            </Link>
          </div>
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-[12.5px] font-bold text-t0">Outras franquias</p>
            <p className="mt-1 text-[12px] text-t2">Você tem acesso só a esta franquia. Se receber convite de outra, o seletor aparece aqui.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
