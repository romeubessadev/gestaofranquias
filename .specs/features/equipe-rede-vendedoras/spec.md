# Equipe: visão rede como tabela de vendedoras Specification

## Problem Statement

Na visão "Todas as lojas" da aba Equipe, o card "Equipe por loja" mostra apenas cards de resumo por loja (faturamento, ticket, P.A., premiação, melhor/pior). O gestor não consegue ver o desenvolvimento individual de cada vendedora de toda a rede numa única tela, nem contextualizar de qual loja ela é, nem o quadro global das metas da rede.

## Goals

- [ ] Na visão "Todas as lojas" com meta ativa, o gestor vê todas as vendedoras da rede numa única tabela com a coluna Shopping.
- [ ] O card abre com uma faixa de meta global da rede: valor atingido, valor total e % atingido, no formato do print de referência.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Trocar o comportamento da visão de loja única | Já implementa o formato do print (commit 29bc425); esta feature só muda a visão rede. |
| Edição/cadastro de metas ou desafios | Pertence à futura tela de Configurações · Desafios. |
| Filtro de marca aplicado à tabela de vendedoras | O recorte por marca já vale para os números agregados via escopo; a vendedora não tem divisão própria no mock. |
| Página de detalhe por vendedora | Postergada; a tabela é a visão de análise atual. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Formato da coluna Shopping | `fantasia` da filial (ex.: "Shopping Campo Grande"), mesmo rótulo usado no resumo atual | É o nome pelo qual o usuário se refere às lojas no produto | y |
| Ordenação da tabela da rede | Mesma regra da loja: por atingimento (meta ativa) ou faturamento (sem meta) | Consistência com a visão de loja única; o print ordena por premiação, mas atingimento ordena igual (quem premia mais está acima) | n (validar na revisão visual) |
| Marca no `Escopo` com divisão ativa | A divisão filtra os agregados das lojas; a tabela lista vendedoras das lojas do escopo e cada linha soma TODAS as divisões da vendedora | Mock não tem divisão por vendedora; refinar quando exemplos anexados chegarem | n (usuário avisou que anexará exemplos) |
| Vendedora sem meta individual na rede (semMeta) | Linha aparece na tabela com "—" nas colunas de meta/premiação | Consistente com a visão de loja | y |
| Clique numa linha da tabela da rede | Nenhum (sem ação) — para ver a loja, o filtro de loja no topo continua sendo o caminho | Manter escopo enxuto; drill-down por linha é P3 futuro | n (validar na revisão visual) |
| Abas de visão na rede | Abas `Vendedoras | Lojas`: flat com coluna Shopping + agrupada por loja com % da meta global, barra e tabela aninhada | Extraído do print 2 do sistema anterior; usuário confirmou na rodada 2 | y |
| Badges do cabeçalho global | Badges "Meta será atingida" / "Projeção abaixo da meta" (projeção da rede) + "N dias restantes" | Extraído do print 1; usa projeção da escada e curva já existentes | y |
| Medalhas de ranking | Sem medalhas | Recusado pelo usuário (rodada 2) | y |

**Open questions:** none — all resolved or logged above. Exemplos anexados (rodada 2) foram incorporados: abas Vendedoras|Lojas, badges de projeção/dias e % da meta global por loja; medalhas recusadas.

---

## User Stories

### P1: Tabela da rede com Shopping ⭐ MVP

**User Story**: As a gestor, I want ver todas as vendedoras da rede numa tabela única com a coluna Shopping so that eu localize cada pessoa e compare o desenvolvimento individual sem trocar de filtro.

**Why P1**: É o pedido central: "adicionar a coluna na tabela de Loja, pra dizer onde é a loja... se for Todas ele consegue saber de qual loja é".

**Acceptance Criteria** (EARS):

1. WHEN o escopo está em "Todas as lojas" THEN a aba Equipe SHALL exibir uma única tabela de vendedoras (formato do print: Vendedora, Shopping, Avanço na escada, Ponto de atenção, Premiação · Próximo degrau) no lugar do resumo por loja.
2. WHEN a tabela da rede é exibida THEN cada linha SHALL identificar a filial da vendedora pelo `fantasia` da filial na coluna Shopping.
3. WHEN a competência tem meta ativa THEN a tabela da rede SHALL incluir para cada vendedora o avanço na escada (barra segmentada + % + realizado/meta + degrau atual), o ponto de atenção e a célula de premiação com gancho e veredito, idênticos em conteúdo aos da visão de loja única.
4. IF o período do filtro não é o mês da competência (metaAtiva = false) THEN a tabela da rede SHALL exibir só as colunas de desempenho do período (Vendedora, Shopping, Faturamento, Ticket, P.A.), sem colunas de meta/premiação.
5. WHILE o filtro de loja é uma loja específica THEN a aba Equipe SHALL manter a tabela atual sem a coluna Shopping.

**Independent Test**: selecionar "Todas as lojas" + "Este mês" e conferir que a tabela lista vendedoras das duas lojas com a coluna Shopping preenchida.

### P2: Faixa de meta global da rede ⭐ MVP

**User Story**: As a gestor, I want ver o valor global das metas da rede e quantos % já foi atingido no topo do card so that eu avalie a rede inteira antes de descer ao indivíduo.

**Why P2**: "A ideia é mostrar o valor global das metas, quantos % da meta já foi atingido" — contextualiza a tabela.

**Acceptance Criteria**:

1. WHEN a visão rede com meta ativa é exibida THEN o card SHALL abrir com uma faixa "META DE [MÊS] · R$ [atingido] DE R$ [total] · [pct]%" somando as metas das lojas do escopo e o realizado da rede na competência.
2. WHEN a faixa global é exibida THEN ela SHALL incluir uma barra de progresso do % atingido global.
3. IF uma loja do escopo não tem meta na competência THEN a faixa SHALL somar somente as lojas com meta e a barra refletir esse recorte.
4. WHEN o período não é o mês da competência THEN a faixa de meta global SHALL não aparecer (tabela só de desempenho).
5. WHEN a projeção da rede fecha ≥100% da meta global THEN o cabeçalho SHALL exibir o badge verde "Meta será atingida"; caso contrário SHALL exibir o badge âmbar "Projeção abaixo da meta".
6. WHEN a faixa global é exibida THEN ela SHALL incluir o badge "N dias restantes" com os dias abertos da competência que faltam (incluindo hoje).

**Independent Test**: conferir que "atingido de total" na faixa = soma dos KPIs de faturamento do mês das lojas com meta, e % = atingido/total; badge muda conforme projeção da rede.

### P2b: Abas Vendedoras | Lojas

**User Story**: As a gestor, I want alternar entre a tabela flat (todas as vendedoras com Shopping) e a visão agrupada por loja so that eu consiga tanto comparar indivíduos quanto avaliar cada loja com a própria meta.

**Why P2**: Extraído do print 2 do sistema anterior — "é legal que ele tem visão por grupo e vendedor"; o grupo lá corresponde à nossa loja.

**Acceptance Criteria**:

1. WHEN a visão rede com meta ativa é exibida THEN o card SHALL exibir as abas "Vendedoras" e "Lojas" (Vendedoras ativa por padrão).
2. WHEN a aba Lojas está ativa THEN cada loja SHALL abrir com um bloco "fantasia da loja (X% da meta global)", barra do atingimento da loja, linha `atingido / meta da loja` e a tabela de vendedoras daquela loja aninhada abaixo.
3. WHEN a aba Lojas está ativa THEN as tabelas aninhadas SHALL omitir a coluna Shopping (redundante no agrupamento) e manter as demais colunas do print.
4. WHEN o período não é o mês da competência THEN as abas SHALL não aparecer (a tabela flat com Shopping cobre a visão inteira).

**Independent Test**: clicar na aba "Lojas" e conferir que cada bloco mostra % da meta global da loja, barra, atingido/meta e as vendedoras daquela loja.

### P3: Veredito e gancho coerentes na rede

**User Story**: As a gestor, I want ver na tabela da rede os mesmos vereditos de ritmo da visão de loja so that as promessas de premiação sejam consistentes em qualquer escopo.

**Why P3**: Consistência entre visões evita duplicidade de interpretação.

**Acceptance Criteria**:

1. WHEN a célula de premiação é exibida na rede THEN ela SHALL usar a mesma regra da loja única: valor projetado/garantido em cima, "+R$ X" do próximo degrau, veredito ("cruza no ritmo", "precisa acelerar", "fecha sem premiação", "Faixa máxima").
2. WHEN a projeção individual não está disponível (sem curva) THEN a célula SHALL usar a premiação acumulada como valor exibido.

**Independent Test**: comparar a linha da mesma vendedora na visão loja e na rede — valores devem ser idênticos (mesma competência, mesma marca).

---

## Edge Cases

- IF o usuário logado tem acesso a uma única filial THEN a visão rede SHALL não aparecer e o comportamento atual de loja única se mantém.
- IF nenhuma vendedora elegível existe no escopo THEN a tabela SHALL exibir o EmptyState atual ("Sem vendedoras").
- IF a filial tem metas com degraus diferentes entre lojas THEN a barra segmentada SHALL usar os marcos da escada da filial da própria linha.
- WHEN a divisão (marca) está ativa no escopo THEN a tabela SHALL continuar listando todas as vendedoras das lojas do escopo (a divisão afeta os agregados, não a lista de pessoas).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| REDE-01 | P1: Tabela da rede com Shopping | Tasks | Implementing |
| REDE-02 | P1: Tabela da rede com Shopping | Tasks | Implementing |
| REDE-03 | P1: Tabela da rede com Shopping | Design | Pending |
| REDE-04 | P1: Tabela da rede com Shopping | Design | Pending |
| REDE-05 | P1: Tabela da rede com Shopping | Design | Pending |
| REDE-06 | P2: Faixa de meta global | Design | Pending |
| REDE-07 | P2: Faixa de meta global | Design | Pending |
| REDE-08 | P2: Faixa de meta global | Design | Pending |
| REDE-09 | P2: Faixa de meta global | Design | Pending |
| REDE-10 | P2: Faixa de meta global | Design | Pending |
| REDE-11 | P2: Faixa de meta global | Design | Pending |
| REDE-12 | P2b: Abas Vendedoras \| Lojas | Design | Pending |
| REDE-13 | P2b: Abas Vendedoras \| Lojas | Design | Pending |
| REDE-14 | P2b: Abas Vendedoras \| Lojas | Design | Pending |
| REDE-15 | P2b: Abas Vendedoras \| Lojas | Design | Pending |
| REDE-16 | P3: Veredito coerente | Design | Pending |
| REDE-17 | P3: Veredito coerente | Design | Pending |

**Coverage:** 17 total, 0 mapped to tasks, 17 unmapped ⚠️

---

## Success Criteria

- [ ] Com "Todas as lojas" + "Este mês", a tabela única lista todas as vendedoras da rede com Shopping e as colunas do print.
- [ ] A faixa global mostra R$ atingido de R$ total com % e barra, fechando com a soma das metas das lojas.
- [ ] Sem meta ativa, a tabela vira desempenho puro com Shopping e some a faixa.
- [ ] 99+ testes do projeto continuam passando, incluindo novos testes da visão rede.
