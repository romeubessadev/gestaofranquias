/**
 * Leitura de tela. No produto, o LLM redige a partir de números da camada de
 * métricas; aqui a frase é montada por regra com os mesmos números.
 *
 * Regra do produto: só aparece se disser algo que os números da tela não
 * dizem. Repetir um valor que já está num indicador não conta.
 *
 * Um só card de leitura na tela, não um card de leitura mais um de alertas de
 * sistema separado: os alertas (`v.alertas` — sync atrasado, nota pendente)
 * entram como frase inicial da mesma leitura, antes da narrativa de
 * desempenho, porque os dois respondem à mesma pergunta de quem abre a tela:
 * "o que eu preciso saber agora?".
 */
import type { LojaView } from "./dashboard";

export function montarLeituraLoja(v: LojaView): string | null {
  const partes = v.alertas.map((a) => a.texto);
  const narrativa = v.visao === "rede" ? leituraRede(v) : v.visao === "dia" ? null : leituraMes(v);
  if (narrativa) partes.push(narrativa);
  return partes.length > 0 ? partes.join(" ") : null;
}

function leituraRede(v: LojaView): string | null {
  if (v.escopo.divisao) return null; // régua vira participação da marca, não fala de meta
  const regua = v.regua;
  if (!regua || regua.length < 2) return null;
  const pior = regua[0];
  const melhor = regua[regua.length - 1];

  const distancia = melhor.atingimentoPct - pior.atingimentoPct;
  if (distancia < 4) return null;

  const queda = pior.variacaoDiaValor !== null && pior.variacaoDiaValor < -0.5;
  const tamanho = pior.variacaoDiaValor === null ? "" : `${Math.abs(Math.round(pior.variacaoDiaValor))}%`;
  const parteHoje = queda
    ? `${pior.nome} está ${tamanho} abaixo do mesmo dia da semana passada e em ${pior.atingimentoTexto} do mês.`
    : `${pior.nome} está em ${pior.atingimentoTexto} do mês, ${Math.round(distancia)} pontos atrás de ${melhor.nome}.`;
  const parteAcao = queda
    ? `Vale checar o que mudou hoje em ${pior.nome} (equipe, fluxo de loja) e reagir ainda no dia.`
    : `Pra fechar a distância, veja o que ${melhor.nome} está fazendo diferente e leve pra ${pior.nome}.`;
  return `${parteHoje} ${parteAcao}`;
}

function leituraMes(v: LojaView): string | null {
  const atendimentos = v.kpiAtendimentos.delta;
  const ticket = v.kpiTicket.delta;
  const pa = v.kpiPA.delta;
  if (!atendimentos && !ticket) return null;

  const bateu = v.tileMeta ? v.tileMeta.barraPct >= 100 : false;

  if (bateu && atendimentos && !atendimentos.positive) {
    return `Bateu a meta com menos gente na loja: os atendimentos caíram ${atendimentos.value} contra o período anterior e o ticket segurou o resultado. Como a meta ficou baixa pro histórico, vale reforçar a escala ou uma ação de captação no próximo mês, antes que o fluxo caia de novo.`;
  }
  if (!bateu && atendimentos && !atendimentos.positive && ticket?.positive) {
    return `Menos gente entrando, gastando mais: os atendimentos caíram ${atendimentos.value} e o ticket subiu ${ticket.value}. O problema é fluxo, não conversão, e o ticket sozinho não fecha a meta — vale investir em divulgação, vitrine ou ação na porta pra trazer mais gente pra loja.`;
  }
  if (pa && !pa.positive && ticket && !ticket.positive) {
    return `O ticket caiu por PA: ${pa.value} a menos de peça por atendimento. A equipe está vendendo o item principal e deixando o segundo na prateleira — reforçar oferta de segunda peça e kit no caixa tende a recuperar o PA.`;
  }
  return null;
}
