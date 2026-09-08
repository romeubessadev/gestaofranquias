# Aba Equipe Context

**Gathered:** 2026-09-08
**Spec:** `.specs/features/aba-equipe/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Aba Equipe do Dashboard (`/equipe`): KPIs da equipe no topo, visão por vendedora com meta individual (escada de degraus), comissão projetada e desafios ativos. Funciona com o filtro global (período, loja, marca); em "todas as lojas" mostra um card resumo por loja.

---

## Implementation Decisions

### Meta individual

- Distribuição da meta da loja entre vendedoras elegíveis pelo `pesoVenda`; soma fecha com a meta da loja.
- Período parcial (admissão/inatividade no meio do mês): meta proporcional aos dias abertos elegíveis da vendedora, com rótulo "meta proporcional · N dias".
- Meta sempre mensal (competência do período ou mês corrente em períodos que cruzam meses, padrão AD-017).

### Desafios

- Mockar 3–4 desafios ativos na competência corrente: produto (ex.: "Body Cream — acima de 15 un"), quantidade e índice (P.A.), com participantes, progresso individual, prêmio e veredito de ritmo.
- Desafio nunca em reais (regra da tela futura de configuração).
- Sem desafios ativos: EmptyState que não bloqueia o resto da tela.

### Comissão

- Escada de degraus da loja (`degrausPadrao`) aplicada ao atingimento individual: percentual por degrau + bônus ao alcançar o degrau.
- KPI "Comissão projetada" soma a projeção de todas (realizado escalado pelo índice de desempenho acumulado do mês).
- Mostrar "quanto falta" em R$ para o próximo degrau.

### Visão rede (todas as lojas)

- Um card por loja: KPIs da equipe da loja + melhor/pior atingimento individual.
- Clique navega para `/equipe` com filtro da loja, preservando período e marca.

### KPIs do topo

- 4 KPIs no padrão da Visão geral: Faturamento, Ticket médio, P.A., Comissão projetada (2×2 no celular, 4×1 no desktop), com delta contra período anterior.

### Ordenação e atenção

- Lista por atingimento da meta individual, maior → menor (como no print de referência).
- Ponto de atenção: P.A. da vendedora ≥5% abaixo da média da loja no período; quem está abaixo da meta e caindo entra na leitura da IA.

---

## Agent's Discretion

- Formatação visual final dos cards de vendedora (usar componentes existentes do Vela: `KpiTile`, `Card`, `ProgressBar`, `Badge`, `Avatar`).
- Textos das leituras da IA e rótulos dos estados.
- Estrutura interna dos dados de desafio no mock.

---

## Declined / Undiscussed Gray Areas → Assumptions

- Tendência (subindo/estável/caindo): últimos 7 dias vs. 7 anteriores da vendedora; ±5% = estável (assumed, mesma janela do Dashboard).
- Limiar de atenção de P.A.: ≥5% abaixo da média da loja (assumed, print usa -4%/-13%).
- Vendedora inativa no período aparece com dias trabalhados até a inatividade e meta proporcional (assumed; esconderia venda já realizada).
- Histórico insuficiente para tendência → "estável" (assumed, fallback honesto).

---

## Specific References

- Print de referência do Claude (metas individuais por vendedora, escada, comissão projetada, pontos de atenção) — anexo na conversa; visual final usa componentes Vela, não o print literal.
- Padrão visual e de estados: Visão geral do Dashboard (KPIs 2×2/4×1, `EstadoBloco`, avisos no topo).
- Print de desafios ativos: tabela com progresso "X de Y un · Z%", engajadas "N de M", prêmio e veredito no cabeçalho.

---

## Deferred Ideas

- Fila de mensagens com badge e botão de WhatsApp (bloco próprio futuro).
- Histórico por competência com seletor de meses anteriores (entra com Configurações · Metas).
- Cadastro/CRUD de desafios e metas individuais (Configurações, Fase 2).