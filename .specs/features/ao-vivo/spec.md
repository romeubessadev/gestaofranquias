# Ao vivo — Specification

## Problem Statement

O gestor precisa acompanhar o andamento do mês na loja (ranking, desafios, meta) com leitura do dia nos volumes — sem transformar o Ao vivo num BI de períodos (semestre/ano). A referência SAAS informa o conteúdo; o produto usa Vela. Compartilhamento/TV fica para um corte posterior.

## Goals

- [ ] Gestor abre **Ao vivo** pelo menu e vê indicadores (mês + pulso do dia) e abas Ranking / Desafios / Metas da competência
- [ ] Ranking, Desafios e Metas permanecem no mês (sem filtros de semestre/ano)
- [ ] Evolução e IA Insights (mock) no app; sem dependência de página de compartilhamento

## Out of Scope

| Feature | Reason |
| --- | --- |
| Link para TV / compartilhamento **completo** (visão externa rica) | Feature seguinte — neste corte: botões + rotas shell |
| Skin dark/neon | Produto Vela claro |
| Header com empresa | Decisão de produto |
| Toggle global Hoje\|Mês ou Ranking Semestre/Ano | Quebra a ideia de “ao vivo”; opção 1 travada |
| Toggle Ranking Mês\|Hoje | Alternativa 2 rejeitada neste corte |
| API real de IA | MVP fixture |
| CRUD de desafios/metas nesta tela | Só leitura |
| WebSocket real-time | Mock Atualizar + timestamp |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Menu | `Dashboard → Ao vivo → Metas → Config` | Pedido do gestor | y |
| Sem empresa no header | Só Ao vivo + loja via Topbar | Pedido | y |
| Periodicidade | Opção 1: KPIs mês+hoje; Ranking/Desafios/Metas = mês | Preserva “ao vivo”; dia só como pulso | y |
| Semestre/Ano no Ranking | Fora | Histórico ≠ ao vivo | y |
| Ordenação ranking | Por faturamento | Métrica principal | y |
| SeletorLoja | Topbar 1 loja ou Todas | Igual Dashboard | y |
| IA | Só app; mock | Sem TV completa neste corte | y |
| Cabeçalho | Compartilhar + Modo TV funcionais → rotas shell | Usuário: botões ativos; tela share em seguida | y |
| Visual | Vela only | Tema do produto | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Navegação e shell ⭐ MVP

**User Story**: As a gestor, I want an **Ao vivo** menu item so that I can open the live board quickly.

**Why P1**: Sem rota/menu a tela não existe.

**Acceptance Criteria**:

1. WHEN the gestor opens the sidebar THEN the system SHALL show a top-level **Ao vivo** item between Dashboard and Configurações (alongside Metas).
2. WHEN the gestor navigates to Ao vivo THEN the system SHALL render the page at path `/ao-vivo`.
3. The system SHALL apply the Topbar store selector to the Ao vivo data scope (one store or all).
4. The system SHALL NOT display a company/tenant name block in the Ao vivo page header.
5. WHEN Ao vivo is shown THEN the system SHALL show header actions **Compartilhar** and **Modo TV**.
6. WHEN the gestor clicks Compartilhar THEN the system SHALL navigate to `/ao-vivo/compartilhar` (shell acceptable until the share feature is built).
7. WHEN the gestor clicks Modo TV THEN the system SHALL navigate to `/ao-vivo/tv` (shell acceptable until the share feature is built).

**Independent Test**: Gestor → Ao vivo no menu → `/ao-vivo` carrega; clicar Compartilhar e Modo TV abre as rotas shell.

---

### P1: Indicadores mês + pulso do dia ⭐ MVP

**User Story**: As a gestor, I want month KPIs with today’s pulse on the same cards so that I see competence progress and daily rhythm together.

**Why P1**: Core da leitura “ao vivo” sem dual-mode confuso.

**Acceptance Criteria**:

1. WHEN Ao vivo loads THEN the system SHALL show four indicators: Total de Vendas, Faturamento, Meta Mensal, Atingimento.
2. WHEN Ao vivo loads THEN Total de Vendas and Faturamento SHALL show month-to-date as the primary value and today’s volume as secondary text on the same card.
3. WHEN Ao vivo loads THEN Meta Mensal SHALL show the current competence goal amount and Atingimento SHALL show percent of that goal using month-to-date revenue.
4. The system SHALL NOT provide a global Hoje/Mês toggle that switches the whole board’s period.
5. IF there are zero sales today or in the month THEN the system SHALL show 0 values for those volumes without erroring.

**Independent Test**: Abrir Ao vivo → cards mostram mês + linha “Hoje …”; Meta/Atingimento mensais.

---

### P1: Aba Ranking (mês) ⭐ MVP

**User Story**: As a gestor, I want the monthly seller ranking with podium and full list so that I see who is leading the competence.

**Why P1**: Superfície motivacional principal.

**Acceptance Criteria**:

1. WHEN the Ranking tab is active THEN the system SHALL rank sellers by faturamento (descending) for the current month-to-date and store scope.
2. WHEN at least three sellers have sales in the month THEN the system SHALL show a top-3 podium with avatar, name, sales count and faturamento.
3. WHEN any sellers exist in scope THEN the system SHALL show a complete ranking list (position, name, sales count, faturamento).
4. IF no sales exist in the month THEN the system SHALL show an empty state (no podium).
5. The system SHALL NOT offer Semestre or Ano period tabs on Ranking in this feature.
6. The system SHALL compose Ranking with Vela primitives (Card, Avatar, Badge) — not a dark neon theme.

**Independent Test**: Ranking com fixture → pódio+lista do mês; dia zerado não esvazia o mês se houver vendas no mês.

---

### P1: Aba Desafios ⭐ MVP

**User Story**: As a gestor, I want active challenges on Ao vivo so that I can see challenge leaders without leaving the board.

**Why P1**: Paridade de informação com a referência.

**Acceptance Criteria**:

1. WHEN the Desafios tab is active THEN the system SHALL list active challenges for the store scope as cards (title, rule/description, time remaining or end context, prize, accumulated progress).
2. WHEN a challenge has participants THEN the system SHALL show at least the top 3 with progress.
3. IF there are no active challenges THEN the system SHALL show an empty state for Desafios.

**Independent Test**: Aba Desafios → cards fixture ou empty.

---

### P1: Aba Metas ⭐ MVP

**User Story**: As a gestor, I want the active monthly goal with per-seller or per-group breakdown so that I see how far the store is from the goal.

**Why P1**: Liga KPI Meta/Atingimento ao detalhe.

**Acceptance Criteria**:

1. WHEN the Metas tab is active THEN the system SHALL show competence goal progress (percent and R$ realized / R$ target).
2. WHEN Metas is active THEN the system SHALL offer **Por Vendedor** and **Por Grupo** views.
3. WHILE Por Vendedor is selected the system SHALL list sellers with attainment percent and faturamento.
4. WHILE Por Grupo is selected the system SHALL list groups with progress (and nested top sellers when fixture data provides them).
5. WHEN goal ladder levels exist THEN the system SHALL show the level legend.
6. IF no active goal exists for the scope THEN the system SHALL show an empty state for Metas.

**Independent Test**: Metas → progresso + toggle Vendedor/Grupo.

---

### P2: Evolução do vendedor

**User Story**: As a gestor, I want seller evolution across recent months so that I can spot acceleration or decline.

**Why P2**: Histórico complementar; não define o “ao vivo”.

**Acceptance Criteria**:

1. WHEN Ao vivo is shown THEN the system SHALL include an Evolução do vendedor section with a per-seller monthly table and an AreaLineChart of faturamento by period.
2. IF a seller has no data in a month THEN the system SHALL show an em dash (—) for that cell without breaking the chart.

**Independent Test**: Seção Evolução renderiza table + chart.

---

### P2: IA Insights (mock)

**User Story**: As a gestor, I want a Generative Insights banner (mock) so that I can get a quick written read of team performance.

**Why P2**: Paridade; só app.

**Acceptance Criteria**:

1. WHEN Ao vivo is shown in the gestor app THEN the system SHALL show an IA Insights banner with a **Gerar Insights** action.
2. WHEN the gestor clicks Gerar Insights THEN the system SHALL display fixture insight text for the current store scope (no external API).
3. The system SHALL NOT require a full share/TV experience for IA Insights (banner stays on `/ao-vivo` only).

**Independent Test**: Gerar Insights → texto mock.

---

### P3: Atualizar / freshness

**User Story**: As a gestor, I want an explicit refresh so that I know the board is current.

**Why P3**: Polish (padrão Equipe).

**Acceptance Criteria**:

1. WHEN the gestor clicks Atualizar THEN the system SHALL refresh Ao vivo view data from fixtures and update the “Atualizado …” label.

---

## Edge Cases

- IF store scope is “Todas as lojas” THEN KPIs and rankings SHALL aggregate across filiais fixtures.
- IF a store has no sellers THEN Ranking SHALL show empty state.
- IF Meta exists but realized is 0 THEN Atingimento SHALL show 0%.
- IF today has zero sales but the month has sales THEN month primary KPIs and Ranking SHALL still show month data and today’s secondary line SHALL show zeros.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| AOVIVO-01 | P1: Navegação | Design | Pending |
| AOVIVO-02 | P1: Indicadores | Design | Pending |
| AOVIVO-03 | P1: Ranking | Design | Pending |
| AOVIVO-04 | P1: Desafios | Design | Pending |
| AOVIVO-05 | P1: Metas | Design | Pending |
| AOVIVO-06 | P2: Evolução | Design | Pending |
| AOVIVO-07 | P2: IA Insights | Design | Pending |
| AOVIVO-08 | P3: Atualizar | Design | Pending |

**Coverage:** 8 total, 0 mapped to tasks, 8 unmapped

---

## Success Criteria

- [ ] Menu → Ao vivo em um clique; KPIs mostram mês + hoje no mesmo card
- [ ] Ranking/Desafios/Metas só do mês; sem Semestre/Ano
- [ ] Empty states cobrem zero vendas / zero desafios / sem meta
- [ ] Demoável sem rota de compartilhamento
- [ ] Só componentes Vela
