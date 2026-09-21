import { useEffect, useRef, useState } from "react";
import { posBase } from "@/lib/areaSegura";
import { Button, Input, Modal } from "@/components/ui";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/cn";

interface Mensagem {
  de: "eu" | "ia";
  texto: string;
}

/** Respostas mockadas. No produto, o modelo chama funções da camada de métricas. */
function responder(pergunta: string): string {
  const p = pergunta.toLowerCase();
  if (p.includes("desconto") || p.includes("20%")) {
    return "Body Splash no Shopping Campo Grande: margem atual de 73% (setembro). Com 20% de desconto a margem cai para 66%, ainda acima do piso configurado de 55%. No Shopping Três Lagoas não há piso configurado, então devolvo só o número: 65%.";
  }
  if (p.includes("kit")) {
    return "Kit sugerido de body splash para o Shopping Campo Grande: Cherry Blossom (gira em 9 dias), Pink Dream (cobertura de 84 dias, encalhe) e Sweet Vanilla (ticket acima da média). Margem combinada de 71%, preço de vitrine sugerido entre R$ 129 e R$ 149.";
  }
  if (p.includes("três lagoas") || p.includes("tres lagoas")) {
    return "Shopping Três Lagoas projeta 90% da meta de setembro. O PA caiu para 2,1 contra 2,4 em agosto, com preço médio estável: a equipe está deixando o segundo item. Juliana Prado e Karina Mendes estão abaixo da média em PA. Fluxo de atendimentos igual ao mês passado.";
  }
  if (p.includes("como está") || p.includes("como esta")) {
    return "Grupo em setembro: R$ 126.499 realizados, 45% da meta consolidada até o dia 15. Shopping Campo Grande projeta 96%, Shopping Três Lagoas 90%. Ticket médio do grupo R$ 178, PA 2,3.";
  }
  return "Não tenho esse dado na camada de métricas para responder com segurança. Posso consultar faturamento, ticket, PA, margem por categoria, estoque, equipe, metas e comparar filiais.";
}

const SUGESTOES = ["Como está o grupo este mês?", "Posso fazer 20% em body splash?", "Qual kit de body splash?"];

/** Chat da IA em Modal do template, aberto por um botão flutuante. */
export function ChatIA() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ de: "ia", texto: "Posso responder com números do grupo ou de cada loja. Toda resposta vem da camada de métricas, com valor, loja e período." }]);
  const [pensando, setPensando] = useState(false);
  const fim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fim.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, pensando, aberto]);

  function enviar(pergunta?: string) {
    const q = (pergunta ?? texto).trim();
    if (!q || pensando) return;
    setMensagens((m) => [...m, { de: "eu", texto: q }]);
    setTexto("");
    setPensando(true);
    setTimeout(() => {
      setMensagens((m) => [...m, { de: "ia", texto: responder(q) }]);
      setPensando(false);
    }, 900);
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        aria-label="Abrir chat da IA"
        className="pos-base fixed right-5 z-[80] flex items-center justify-center rounded-full bg-acc text-white shadow-[0_12px_28px_-8px_var(--acc)] transition-transform hover:scale-105"
        style={{ width: 52, height: 52, ...posBase("1.25rem") }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
          <path d="M9 12h.01M13 12h.01" />
        </svg>
      </button>

      <Modal
        open={aberto}
        onClose={() => setAberto(false)}
        title="Pergunte à IA"
        size="md"
        footer={
          <div className="flex w-full items-center gap-2">
            <Input value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} placeholder="Pergunte sobre o grupo ou uma loja" />
            <Button onClick={() => enviar()} disabled={!texto.trim() || pensando}>
              Enviar
            </Button>
          </div>
        }
      >
        <div className="flex max-h-[50vh] min-h-[240px] flex-col gap-3 overflow-y-auto">
          {mensagens.map((m, i) => (
            <div key={i} className={cn("flex gap-2.5", m.de === "eu" ? "justify-end" : "justify-start")}>
              {m.de === "ia" && <Avatar name="IA" size="sm" />}
              <div className={cn("max-w-[80%] rounded-[14px] px-3.5 py-2.5 text-[13px] leading-relaxed", m.de === "eu" ? "bg-acc text-white" : "bg-bg-3 text-t0")}>{m.texto}</div>
            </div>
          ))}
          {pensando && (
            <div className="flex gap-2.5">
              <Avatar name="IA" size="sm" />
              <div className="rounded-[14px] bg-bg-3 px-3.5 py-2.5 text-[13px] text-t2">Consultando métricas…</div>
            </div>
          )}
          <div ref={fim} />
        </div>
        {mensagens.length === 1 && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {SUGESTOES.map((s) => (
              <Button key={s} size="sm" variant="secondary" onClick={() => enviar(s)}>
                {s}
              </Button>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
