import { useState } from "react";
import { Button, Card, Checkbox, FormField, Input, useToast } from "@/components/ui";
import { CampoSenha } from "@/pages/acesso/AcessoKit";
import { testarLoginErp, type ResultadoLoginErp } from "@/data/gestao/erp";

const mensagemErro: Record<Exclude<ResultadoLoginErp, { ok: true }>["motivo"], { titulo: string; texto: string }> = {
  senha: { titulo: "Usuário ou senha do Millenium incorretos", texto: "Nada foi salvo. Confira os dados e tente de novo. Não vamos tentar sozinhos, para não bloquear seu usuário." },
  ocupado: { titulo: "Seu usuário está conectado ao Millenium", texto: "O ERP aceita um login por vez. Saia de lá e tente de novo." },
  outro: { titulo: "Não foi possível conectar", texto: "O ERP não respondeu. Nada foi salvo. Tente novamente em alguns minutos." },
};

export function Etapa2Credencial({ onConcluir, onVoltar }: { onConcluir: () => void; onVoltar: () => void }) {
  const { show } = useToast();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [dedicada, setDedicada] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [testando, setTestando] = useState(false);
  const [erro, setErro] = useState<Exclude<ResultadoLoginErp, { ok: true }>["motivo"] | null>(null);

  const pode = usuario.trim().length > 0 && senha.length > 0 && aceite && !testando;

  async function testar() {
    if (!pode) return;
    setErro(null);
    setTestando(true);
    const r = await testarLoginErp(usuario, senha);
    setTestando(false);
    if (!r.ok) {
      setErro(r.motivo);
      return;
    }
    show("Conectado ao Millenium. A sessão fica aberta para a próxima etapa.", "success");
    onConcluir();
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-t0">Conexão com o Millenium</h2>
      <p className="mb-6 mt-1 text-[13.5px] text-t2">Vendas, custos, estoque e cadastros vêm do ERP por sincronização. Precisamos de um usuário para isso.</p>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Usuário do Millenium" required>
            <Input value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="ex.: essencia.integracao" autoComplete="off" autoFocus />
          </FormField>
          <FormField label="Senha do Millenium" required>
            <CampoSenha value={senha} onChange={setSenha} placeholder="Senha do ERP" autoComplete="off" />
          </FormField>
        </div>

        <div className="rounded-[var(--radius-vela-md)] border border-line bg-bg-inset p-4">
          <Checkbox checked={dedicada} onChange={(e) => setDedicada(e.target.checked)} label={<span className="font-semibold">Este é um usuário exclusivo para integração</span>} />
          <p className="mt-2 pl-6 text-[12.5px] leading-relaxed text-t1">
            O Millenium aceita um login por vez. Enquanto o sistema sincroniza, esse usuário não consegue entrar no ERP.
            {dedicada ? " Com usuário exclusivo, atualizamos as vendas a cada 2 minutos." : " Se for o seu usuário do dia a dia, atualizamos a cada 30 minutos, para não te derrubar do ERP."}
          </p>
        </div>

        <div className="rounded-[var(--radius-vela-md)] border border-line bg-bg-inset p-4">
          <Checkbox checked={aceite} onChange={(e) => setAceite(e.target.checked)} label={<span className="font-semibold">Autorizo o uso desta credencial para sincronização</span>} />
          <p className="mt-2 pl-6 text-[12.5px] leading-relaxed text-t1">A senha é guardada cifrada, usada só pelo servidor e nunca exibida de novo. Você pode trocar ou remover a qualquer momento em Configurações.</p>
        </div>

        {erro && (
          <div className="rounded-[var(--radius-vela-md)] border border-bad/30 bg-bad-soft p-4">
            <p className="text-[13.5px] font-bold text-t0">{mensagemErro[erro].titulo}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-t1">{mensagemErro[erro].texto}</p>
          </div>
        )}

        <p className="text-[11.5px] text-t2">Demonstração: a senha “errada”, “ocupado” ou “falha” simula cada erro. Qualquer outra conecta.</p>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" onClick={onVoltar} disabled={testando}>
            Voltar
          </Button>
          <Button onClick={testar} disabled={!pode} size="lg">
            {testando ? "Testando no Millenium…" : "Testar e salvar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
