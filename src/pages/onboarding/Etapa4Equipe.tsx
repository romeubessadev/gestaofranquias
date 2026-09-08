import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, Button, Card, Checkbox, Input, Select, Skeleton, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { consultarFuncionarioErp, listarFuncionariosErp, type FuncionarioErpDetalhe, type FuncionarioErpLista } from "@/data/gestao/erp";
import { filiais, turnos } from "@/data/gestao/filiais";
import { mascararCpf } from "@/lib/cpf";

interface Linha {
  base: FuncionarioErpLista;
  filialId: string;
  detalhe: FuncionarioErpDetalhe | null;
  falhou: boolean;
  /* só do nosso lado */
  marcada: boolean;
  email: string;
  celular: string;
  turnoId: string;
  caixaCentral: boolean;
  corrigido: boolean;
}

function pareceCaixaCentral(nome: string) {
  return /CAIXA|CENTRAL|LOJA\b/.test(nome);
}

function inativoNoErp(d: FuncionarioErpDetalhe | null) {
  return Boolean(d && (d.inativo || d.desativado || d.afastado || d.naoMostrarNoEvento));
}

const PREPOSICOES = new Set(["de", "da", "do", "das", "dos", "e"]);

/** ERP devolve tudo em maiúsculas: "ANA PAULA" → "Ana Paula", "CAIXA LOJA CG" → "Caixa Loja CG". */
function formatarNome(n: string) {
  return n
    .trim()
    .split(/\s+/)
    .map((p) => {
      const min = p.toLowerCase();
      if (PREPOSICOES.has(min)) return min;
      // Palavra de duas letras que não é preposição é sigla de loja: mantém maiúscula.
      if (p.length <= 2) return p.toUpperCase();
      return min.charAt(0).toUpperCase() + min.slice(1);
    })
    .join(" ");
}

export function Etapa4Equipe({ onConcluir }: { onConcluir: () => void }) {
  const { show } = useToast();
  const [linhas, setLinhas] = useState<Linha[] | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Campos obrigatórios só ficam em destaque depois da primeira tentativa de envio.
  const [tentou, setTentou] = useState(false);

  // 1) Lista rápida por filial; 2) consulta por funcionário, preenchendo conforme chega.
  useEffect(() => {
    let ativo = true;
    (async () => {
      const listas = await Promise.all(filiais.map(async (f) => ({ filialId: f.id, itens: await listarFuncionariosErp(f.milleniumFilial) })));
      if (!ativo) return;
      const iniciais: Linha[] = listas.flatMap(({ filialId, itens }) =>
        itens.map((base) => ({ base, filialId, detalhe: null, falhou: false, marcada: false, email: "", celular: "", turnoId: "", caixaCentral: false, corrigido: false })),
      );
      setLinhas(iniciais);
      iniciais.forEach((l) => {
        consultarFuncionarioErp(l.base.funcionario)
          .then((d) => {
            if (!ativo) return;
            setLinhas((ls) => ls!.map((x) => (x.base.funcionario === l.base.funcionario ? { ...x, detalhe: d, email: d.email ?? "", marcada: Boolean(d.email) && !inativoNoErp(d) && !pareceCaixaCentral(x.base.nome) } : x)));
          })
          .catch(() => {
            if (!ativo) return;
            setLinhas((ls) => ls!.map((x) => (x.base.funcionario === l.base.funcionario ? { ...x, falhou: true } : x)));
          });
      });
    })();
    return () => {
      ativo = false;
    };
  }, []);

  function tentarDeNovo(funcionario: number) {
    setLinhas((ls) => ls!.map((x) => (x.base.funcionario === funcionario ? { ...x, falhou: false } : x)));
    consultarFuncionarioErp(funcionario)
      .then((d) => setLinhas((ls) => ls!.map((x) => (x.base.funcionario === funcionario ? { ...x, detalhe: d, email: d.email ?? "" } : x))))
      .catch(() => setLinhas((ls) => ls!.map((x) => (x.base.funcionario === funcionario ? { ...x, falhou: true } : x))));
  }

  function atualizar(funcionario: number, patch: Partial<Linha>) {
    setLinhas((ls) => ls!.map((x) => (x.base.funcionario === funcionario ? { ...x, ...patch } : x)));
  }

  const total = linhas?.length ?? 0;
  const carregados = linhas?.filter((l) => l.detalhe || l.falhou).length ?? 0;
  const carregando = linhas !== null && carregados < total;

  const atencao = useMemo(() => (linhas ?? []).filter((l) => !l.caixaCentral && !l.corrigido && (pareceCaixaCentral(l.base.nome) || inativoNoErp(l.detalhe))), [linhas]);
  const acesso = useMemo(() => (linhas ?? []).filter((l) => !l.caixaCentral && !l.corrigido && !pareceCaixaCentral(l.base.nome) && !inativoNoErp(l.detalhe)), [linhas]);
  const marcadas = acesso.filter((l) => l.marcada);
  const semEmail = marcadas.filter((l) => !/^\S+@\S+\.\S+$/.test(l.email)).length;
  const semTurno = marcadas.filter((l) => !l.turnoId).length;

  async function convidar() {
    setTentou(true);
    if (marcadas.length === 0 || semEmail > 0 || semTurno > 0) return;
    setEnviando(true);
    await new Promise((r) => setTimeout(r, 900));
    show(`${marcadas.length === 1 ? "1 convite enviado" : `${marcadas.length} convites enviados`} por e-mail. Quem já tem conta recebe um pedido de aceite.`, "success");
    onConcluir();
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-t0">Sua equipe</h2>
      <p className="mb-6 mt-1 text-[13.5px] text-t2">As vendedoras vêm do Millenium. Escolha quem terá acesso ao app e informe o e-mail, que é por onde o convite chega. Você pode fazer isso depois.</p>

      {linhas === null ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-[var(--radius-vela-md)] border border-line p-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
          <p className="text-center text-[12px] text-t2">Consultando funcionários no Millenium…</p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {carregando && (
            <div className="flex items-center gap-3 rounded-[var(--radius-vela-md)] border border-line bg-bg-inset px-4 py-3">
              <span className="h-4 w-4 shrink-0 rounded-full border-2 border-line-2 border-t-acc animate-vela-spin" />
              <span className="text-[12.5px] text-t1">
                Carregando detalhes: {carregados} de {total}
              </span>
              <div className="ml-auto h-1.5 w-32 overflow-hidden rounded-full bg-bg-3">
                <div className="h-full rounded-full bg-acc transition-[width]" style={{ width: `${(carregados / Math.max(total, 1)) * 100}%` }} />
              </div>
            </div>
          )}

          {atencao.length > 0 && (
            <section>
              <h3 className="mb-1 text-[14px] font-bold text-t0">Precisam de atenção</h3>
              <p className="mb-3 text-[12.5px] text-t2">Cadastros com cargo de vendedora que não parecem vendedoras. Isso distorce ranking e meta se ficar assim.</p>
              <div className="flex flex-col gap-2">
                {atencao.map((l) => {
                  const caixa = pareceCaixaCentral(l.base.nome);
                  return (
                    <div key={l.base.funcionario} className="flex flex-col gap-3 rounded-[var(--radius-vela-md)] border border-warn/30 bg-warn-soft/40 p-3 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={formatarNome(l.base.nome)} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-bold text-t0">{formatarNome(l.base.nome)}</p>
                          <p className="text-[11.5px] text-t2">{caixa ? "Parece um caixa central com cargo de vendedora" : "Desativada no Millenium, mas ainda com cargo de vendedora"}</p>
                        </div>
                      </div>
                      {caixa ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            atualizar(l.base.funcionario, { caixaCentral: true });
                            show("Marcado como caixa central. Só do nosso lado, nada muda no ERP.", "info");
                          }}
                        >
                          Marcar como caixa central
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            atualizar(l.base.funcionario, { corrigido: true });
                            show("Cargo corrigido no Millenium e registrado no histórico.", "success");
                          }}
                        >
                          Corrigir no Millenium
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-1 text-[14px] font-bold text-t0">Darão acesso ao app</h3>
            <p className="mb-3 text-[12.5px] text-t2">CPF vem do Millenium. E-mail, celular e turno ficam só aqui.</p>
            <div className="flex flex-col gap-5">
              {filiais.map((f) => {
                const doFilial = acesso.filter((l) => l.filialId === f.id);
                if (doFilial.length === 0) return null;
                const turnosF = turnos.filter((t) => t.filialId === f.id);
                return (
                  <div key={f.id}>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-t2">{f.fantasia}</p>
                    <div className="flex flex-col gap-2">
                      {doFilial.map((l) => (
                        <div key={l.base.funcionario} className={cn("rounded-[var(--radius-vela-md)] border p-3 transition-colors", l.marcada ? "border-line bg-bg-2" : "border-line bg-bg-inset")}>
                          <div className="flex items-center gap-3">
                            <Checkbox checked={l.marcada} onChange={(e) => atualizar(l.base.funcionario, { marcada: e.target.checked })} disabled={!l.detalhe} />
                            <Avatar name={formatarNome(l.base.nome)} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-bold text-t0">{formatarNome(l.base.nome)}</p>
                              {l.falhou ? (
                                <button onClick={() => tentarDeNovo(l.base.funcionario)} className="text-[11.5px] font-semibold text-bad hover:underline">
                                  Não foi possível carregar. Tentar de novo
                                </button>
                              ) : l.detalhe ? (
                                <p className="font-mono text-[11.5px] text-t2">CPF {mascararCpf(l.detalhe.cpf)}</p>
                              ) : (
                                <Skeleton className="mt-1 h-3 w-32" />
                              )}
                            </div>
                            {l.detalhe && !l.detalhe.email && <Badge variant="warning">sem e-mail no ERP</Badge>}
                          </div>
                          {l.marcada && l.detalhe && (
                            <div className="mt-3 grid grid-cols-1 gap-2 pl-7 sm:grid-cols-3">
                              <Input value={l.email} onChange={(e) => atualizar(l.base.funcionario, { email: e.target.value })} placeholder="E-mail (obrigatório)" type="email" className={cn(tentou && !/^\S+@\S+\.\S+$/.test(l.email) && "border-warn")} />
                              <Input value={l.celular} onChange={(e) => atualizar(l.base.funcionario, { celular: e.target.value })} placeholder="Celular com DDD" inputMode="tel" />
                              <Select value={l.turnoId} onChange={(e) => atualizar(l.base.funcionario, { turnoId: e.target.value })} className={cn(tentou && !l.turnoId && "border-warn")}>
                                <option value="">Turno…</option>
                                {turnosF.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.nome} · {Math.max(t.horaInicio, f.abertura)}h às {Math.min(t.horaFim, f.fechamento)}h
                                  </option>
                                ))}
                              </Select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {marcadas.length > 0 && (semEmail > 0 || semTurno > 0) && (
            <p className={cn("text-[12px]", tentou ? "font-medium text-warn" : "text-t2")}>
              Para convidar, cada marcada precisa de e-mail e turno.
              {semEmail > 0 && ` Faltam ${semEmail} ${semEmail === 1 ? "e-mail" : "e-mails"}.`}
              {semTurno > 0 && ` ${semTurno === 1 ? "Falta 1 turno" : `Faltam ${semTurno} turnos`}.`}
            </p>
          )}

          <div className="flex flex-col-reverse items-stretch gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={onConcluir} disabled={enviando}>
              Fazer isso depois
            </Button>
            <Button onClick={convidar} disabled={marcadas.length === 0 || enviando} size="lg">
              {enviando ? "Enviando convites…" : marcadas.length === 0 ? "Convidar marcadas" : `Convidar ${marcadas.length === 1 ? "1 marcada" : `${marcadas.length} marcadas`}`}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
