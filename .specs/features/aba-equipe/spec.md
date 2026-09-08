# Aba Equipe Specification

## Problem Statement

O gestor gerencia comissão e desempenho individual, mas a aba Equipe é um placeholder: não há onde ver, em segundos, quem está rendendo, quem precisa de atenção, quanto cada vendedora vai ganhar e como estão os desafios ativos. A tela existe no app (rota `/equipe`, shell compartilhado com o Dashboard) e os dados brutos já são gerados no mock (`porVendedora` dia a dia), faltando a camada de visões e a UI.

## Goals

- [ ] Responder "como está minha equipe neste período" com KPIs no topo e visão por vendedora
- [ ] Mostrar evolução de cada vendedora dentro da meta da loja (escada de degraus) e dentro dos desafios ativos
- [ ] Expor comissão projetada por vendedora, coerente com a escada da loja

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| CRUD de metas individuais e degraus (Configurações · Metas) | Tela própria da Fase 2; aqui só consumo/visualização |
| CRUD de desafios (Configurações · Desafios) | Tela própria da Fase 2; aqui só exibição dos desafios mockados |
| Fila de mensagens e botão de WhatsApp | Bloco futuro próprio; não entra nesta rodada |
| Turnos e checklist do dia | Pertence à tela própria do checklist (já decidido fora do Dashboard) |
| Tela "Minha meta" da vendedora | Rota própria da Fase 2 (`/minha-meta`) |
| Histórico por competência (seletor de meses anteriores) | Entrará junto com as telas de configuração de metas |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Meta individual | Distribuição da meta da loja entre as vendedoras elegíveis pelo `pesoVenda`; a soma das individuais fecha com a meta da loja | Usuário confirmou; permite barra de atingimento individual como no print de referência | y |
| Desafios | Mockar 3–4 desafios ativos (produto/quantidade/índice) com participantes, progresso individual, prêmio e veredito | Usuário confirmou | y |
| Comissão projetada | Calculada pela escada de degraus da loja × realizado individual: comissão acumulada, bônus do degrau e quanto falta pro próximo | Usuário confirmou | y |
| Visão rede (todas as lojas) | Um card resumo por loja (KPIs da equipe + destaques); clique entra na loja com o detalhe por vendedora | Usuário confirmou | y |
| Período parcial (admissão/inatividade no meio do mês) | Meta individual proporcional aos dias abertos elegíveis da vendedora no mês (mesmo rateio por peso de dia usado na loja) | Espelha "meta proporcional · 8 dias" do print; evita injustiça com quem entrou no meio do mês | n (assumed) |
| Ordenação da lista | Atingimento da meta individual, maior → menor (como no print) | O ponto de atenção sinaliza quem precisa de cuidado; lista é leitura de ranking | n (assumed) |
| Tendência (subindo/estável/caindo) | Realizado dos últimos 7 dias vs. 7 anteriores da vendedora; ±5% = estável | Mesma janela de comparação usada no Dashboard | n (assumed) |
| Ponto de atenção de P.A. | P.A. da vendedora ≥5% abaixo da média da loja no período | Print sinaliza P.A. -4% e -13%; piso pequeno evita ruído | n (assumed) |
| KPIs do topo | 4 KPIs no padrão da Visão geral: Faturamento, Ticket médio, P.A., Comissão projetada (2×2 no celular, 4×1 no desktop) | Consistência com a tela principal | n (assumed) |
| Vendedora inativa no período (férias/licença/desligamento) | Aparece na lista só com dias trabalhados até a inatividade; meta proporcional aos dias elegíveis | Fernanda entra em férias em 10/09 no mock; excluir sumariamente esconderia venda realizada | n (assumed) |

**Open questions:** none — all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: KPIs da equipe ⭐ MVP

**User Story**: Como gestor, quero KPIs da equipe no topo da aba para medir o desempenho coletivo no período filtrado.

**Why P1**: É o resumo que responde "como está o time" antes de qualquer detalhe.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN a aba Equipe abre THEN o sistema SHALL exibir os KPIs Faturamento, Ticket médio e P.A. calculados sobre o período e loja/marca do filtro global.
2. WHILE o modo "meta ativa" está ligado (período = mês da competência) THEN o sistema SHALL exibir também o KPI Comissão projetada (4 KPIs).
3. WHEN existe período anterior equivalente THEN cada KPI SHALL exibir delta percentual contra o período anterior.
4. WHILE o filtro está em "todas as lojas" THEN os KPIs SHALL somar a rede inteira respeitando a marca selecionada.

**Independent Test**: Abrir `/equipe` com filtro Hoje e conferir que Faturamento/Ticket/P.A. batem com os mesmos KPIs da Visão geral para o mesmo filtro.

---

### P1: Lista de vendedoras por loja ⭐ MVP

**User Story**: Como gestor, quero uma linha por vendedora com seu desempenho para saber quem precisa de atenção.

**Why P1**: É o núcleo da tela — o detalhe por pessoa que hoje não existe em lugar nenhum.

**Acceptance Criteria**:

1. WHEN uma loja está selecionada THEN o sistema SHALL exibir em tabela as vendedoras elegíveis da loja ordenadas por atingimento da meta individual (maior → menor), com: vendedora (avatar, nome, dias trabalhados, tendência), faturamento, ticket, P.A., e — com meta ativa — meta individual, avanço na escada, comissão até agora e próximo degrau.
2. IF a vendedora tem P.A. ≥5% abaixo da média da loja no período THEN a linha SHALL exibir o ponto de atenção de P.A. com o percentual.
3. IF a vendedora tem admissão ou inatividade dentro do mês THEN a meta individual dela SHALL ser proporcional aos dias abertos elegíveis e a linha SHALL indicar "meta proporcional · N dias".
4. IF a loja não tem vendedora elegível THEN o sistema SHALL exibir EmptyState no lugar da lista.

**Independent Test**: Selecionar a loja f1 e conferir que a soma das metas individuais é igual à meta da loja e que a ordem da lista segue o atingimento.

---

### P1: Meta individual e escada de degraus ⭐ MVP

**User Story**: Como gestor, quero ver quanto cada vendedora avançou na meta individual e na escada para saber quem vai ganhar qual comissão.

**Why P1**: Liga desempenho individual à meta da loja — a pergunta central do gestor.

**Acceptance Criteria**:

1. WHEN a competência tem meta cadastrada THEN cada vendedora SHALL ter meta individual = meta da loja × peso (pesoVenda ÷ soma dos pesos elegíveis), e a soma das individuais SHALL ser igual à meta da loja.
2. WHILE o período do filtro é exatamente o mês da competência THEN a tela SHALL exibir o modo "meta ativa": colunas de meta individual, escada, comissão e a seção de desafios.
3. IF o período do filtro não é o mês da competência (Hoje, Ontem, 7 dias, personalizado ou cruzando meses) THEN a tela SHALL exibir somente o desempenho do período — KPIs sem comissão, tabela sem colunas de meta/escada/comissão e sem desafios.
4. IF a competência não tem meta THEN a tela SHALL exibir somente o desempenho do período (equivalente a meta ativa false) e a lista SHALL ordenar por faturamento.

**Independent Test**: Conferir que Σ metas individuais = `metaDaFilial().valorLoja` e que a barra da líder bate com o atingimento calculado do mock.

---

### P2: Comissão projetada

**User Story**: Como gestor, quero a comissão por vendedora (acumulada e projetada) para prever o custo da folha e motivar o próximo degrau.

**Why P2**: Depende da meta individual (P1), mas a projeção agrega valor após o básico funcionar.

**Acceptance Criteria**:

1. WHEN a vendedora tem realizado acumulado THEN o sistema SHALL exibir comissão acumulada = realizado individual × percentual de comissão do degrau atingido na escada da loja.
2. WHEN a vendedora alcança um degrau THEN a linha SHALL exibir o bônus do degrau e quanto falta em R$ para o próximo degrau.
3. WHILE a competência está em andamento THEN o KPI Comissão projetada SHALL somar a comissão projetada de todas (realizado escalado pelo ritmo até o fim do mês, reutilizando o índice de desempenho acumulado).

**Independent Test**: Conferir que comissão da líder = realizado × % do degrau correspondente ao atingimento dela na tabela `degrausPadrao`.

---

### P2: Desafios ativos

**User Story**: Como gestor, quero ver os desafios ativos com progresso e engajamento para saber se valem prêmio no ritmo atual.

**Why P2**: Complemento motivacional; depende só dos dados mockados novos.

**Acceptance Criteria**:

1. WHILE o modo "meta ativa" está ligado e existem desafios na competência THEN o sistema SHALL listar cada desafio em tabela com nome, tipo (produto/quantidade/índice), progresso agregado ("X de Y un · Z%"), engajadas ("N de M"), prêmio e veredito de ritmo.
2. WHEN o progresso projetado do desafio não alcança o alvo até o fim do período THEN o cabeçalho da seção SHALL exibir veredito "N desafio(s) não fecham no ritmo".
3. WHEN nenhuma vendedora fez progresso no desafio THEN a linha SHALL exibir engajadas 0 de M e estado "sem engajamento".
4. IF não há desafios ativos THEN a seção SHALL exibir EmptyState e não SHALL bloquear o restante da tela.

**Independent Test**: Conferir que o progresso agregado de cada desafio é a soma do progresso individual das participantes mockadas.

---

### P2: Leitura da IA da equipe

**User Story**: Como gestor, quero uma leitura curta reconciliando meta, ritmo e mix da equipe para decidir sem ler linha por linha.

**Why P2**: Padrão já estabelecido no Dashboard (`BlocoLeitura`), baixo custo alto valor.

**Acceptance Criteria**:

1. WHEN a visão de uma loja é montada THEN o sistema SHALL exibir leitura com até 2 linhas: (a) efeito de mix/ticket da equipe no período e (b) destaque de quem está abaixo da meta e caindo.
2. IF ninguém está abaixo da meta THEN a segunda linha SHALL omitir o destaque e o sistema SHALL exibir apenas a leitura de mix/ticket.

**Independent Test**: Texto gerado pela camada de dados (`montarLeituraEquipe`), não hardcoded na página.

---

### P3: Visão rede — resumo por loja

**User Story**: Como gestor multi-franqueado, quero um resumo da equipe de cada loja para decidir onde entrar primeiro.

**Why P3**: O gestor opera majoritariamente dentro de uma loja; o resumo de rede é conveniência.

**Acceptance Criteria**:

1. WHILE o filtro está em "todas as lojas" THEN o sistema SHALL exibir um card por loja com faturamento da equipe, ticket médio, P.A. e comissão projetada da loja, e destaque de melhor e pior atingimento individual.
2. WHEN o gestor toca no card de uma loja THEN o sistema SHALL navegar para `/equipe` com o filtro daquela loja, preservando período e marca.

**Independent Test**: Filtrar "todas", conferir um card por loja e que o clique troca o filtro para a loja.

---

## Edge Cases

- IF o período do filtro cruza meses THEN os painéis de meta/escada/comissão SHALL usar a competência do mês corrente e a tela SHALL exibir o aviso "Meta e comissão são mensais".
- IF a marca está selecionada THEN os KPIs e listas SHALL refletir o recorte da marca; comissão e meta individual continuam da loja inteira com aviso (padrão da Visão geral).
- IF a vendedora não tem nenhuma venda no período THEN a linha SHALL exibir zero e entrar no fim da ordenação, sem erro.
- IF o histórico de 7 dias da vendedora é insuficiente para tendência THEN o estado SHALL ser "estável".
- WHILE os dados carregam THEN cada bloco SHALL exibir Skeleton próprio (padrão AD-032), sem esconder os demais.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| EQUIP-01 | P1: KPIs da equipe | Design | Pending |
| EQUIP-02 | P1: Lista de vendedoras por loja | Design | Pending |
| EQUIP-03 | P1: Meta individual e escada | Design | Pending |
| EQUIP-04 | P2: Comissão projetada | Design | Pending |
| EQUIP-05 | P2: Desafios ativos | Design | Pending |
| EQUIP-06 | P2: Leitura da IA da equipe | Design | Pending |
| EQUIP-07 | P3: Visão rede | Design | Pending |

**Coverage:** 7 total, 0 mapped to tasks yet, 7 unmapped ⚠️

---

## Success Criteria

- [ ] O gestor abre a aba Equipe e identifica em segundos quem precisa de atenção (atingimento + tendência + P.A.)
- [ ] A soma das metas individuais fecha exatamente com a meta da loja
- [ ] A comissão exibida bate com a escada de degraus da loja (percentual e bônus corretos por atingimento)
- [ ] KPIs da aba batem com os mesmos KPIs da Visão geral no mesmo filtro