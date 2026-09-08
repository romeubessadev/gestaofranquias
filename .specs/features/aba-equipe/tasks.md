# Aba Equipe — Tasks

## Execution Protocol (MANDATORY — do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/aba-equipe/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: none (`AGENTS.md`, `CONTRIBUTING.md`, coverage config ou CI gates ausentes) — strong defaults applied. Vitest já configurado na rodada da aba Loja (39 testes verdes em `src/data/gestao/*.test.ts`).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain (business-logic: `src/data/gestao/*.ts`) | unit | All branches; 1:1 to spec ACs (EQUIP-01..07); every listed edge case has a test | `src/data/gestao/**/*.test.ts` | `npx vitest run` |
| Route / e2e (SPA pages, no backend) | none | - (build gate only) | - | build gate only |
| Entity / config / schema | none | - (build gate only) | - | build gate only |

**Provenance**: `vitest.config.ts` com alias `@` e `environment: "node"` já existe; testes rodam contra módulos puros (`equipe.ts`, `desafios.ts`) que importam apenas de `./filiais`, `./vendas`, `./metas`, `./relogio`, `./dashboard` e `@/lib/*` (sem DOM).

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only (most tasks) | `npx vitest run` |
| Full | After tasks with e2e/integration tests | `npx vitest run` (no e2e in scope) |
| Build | After phase completion or UI/config-only tasks | `npm run lint; npm run build` |

**Windows note:** the shell is PowerShell 5 (`&&` is invalid). Use `;` between commands or `cmd /c "a && b"` when chaining. Commits use `git add -A; git commit -m "..."`.

---

## Execution Plan

Phases are ordered and run sequentially — each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation — mocks e motor de meta

```
T1 -> T2
```

- **T1** — mock de desafios ativos com progresso determinístico (EQUIP-05, base de dados).
- **T2** — motor de meta individual derivada + elegibilidade por data (EQUIP-03).

### Phase 2: Views — cálculo por vendedora e composição

Dependencies: Phase 1.

```
T2 -> T3 -> T4 -> T5 -> T6
```

- **T3** — escada de degraus e comissão por vendedora (EQUIP-04).
- **T4** — `montarEquipeView` visão loja: KPIs, tabela, regra `metaAtiva`, tendência e atenção de P.A. (EQUIP-01/02).
- **T5** — visão de desafios, KPI comissão projetada e leitura da IA (EQUIP-04/05/06).
- **T6** — visão rede com resumo por loja (EQUIP-07), construída sobre T4+T5.

### Phase 3: UI e integração

Dependencies: Phase 2.

```
T6 -> T7 -> T8
```

- **T7** — blocos visuais (`blocos.tsx`) com `DataTable` de vendedoras e desafios + `EquipePage`.
- **T8** — integração final: lint/build limpos, revisão e registro em `STATE.md`.

---

## Task Breakdown

### T1: Mock de desafios ativos ✅

**What**: Criar `desafios.ts` com 3–4 desafios ativos na competência corrente (produto/quantidade/índice, nunca em reais), participantes, alvo individual e progresso individual determinístico por vendedora.
**Where**: `src/data/gestao/desafios.ts`
**Depends on**: None
**Reuses**: técnica de geração determinística do `vendas.ts` (ruido com seed); `colaboradores` de `equipe.ts`; `HOJE_ISO` de `relogio.ts`
**Requirement**: EQUIP-05

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] `interface Desafio` com id, nome, tipo (`produto`/`quantidade`/`indice`), alvo individual, unidade, prêmio, período (competência) e participantes (ids de colaborador)
- [ ] `desafiosAtivos(competencia)` devolve só desafios da competência; competência sem desafios devolve lista vazia
- [ ] Progresso individual por participante é determinístico (mesma chamada, mesmo valor) e ≥0
- [ ] Ao menos um desafio de cada tipo (produto, quantidade, índice)
- [ ] Testes: determinismo, filtro por competência, tipos cobertos, participantes válidos (≥6 testes)
- [ ] Gate check passa: `npx vitest run`; `npm run lint; npm run build` não quebram

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): mock de desafios ativos com progresso deterministico`

---

### T2: Motor de meta individual e elegibilidade por data ✅

**What**: Funções puras em `equipe.ts` que derivam a meta individual de cada vendedora (distribuição por `pesoVenda`, proporcional aos dias elegíveis) e calculam dias trabalhados/agregados por vendedora no período.
**Where**: `src/data/gestao/equipe.ts`
**Depends on**: T1
**Reuses**: `colaboradoresDaFilial`, `vendedorElegivel`, `metaDaFilial`, `diaVendas`/`porVendedora`, `lojaAberta`, `intervaloDias`, `somarDias`, `fimDoMes`, `divSeguro`
**Requirement**: EQUIP-03

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] Meta individual = `metaLoja × pesoVenda ÷ Σ pesos elegíveis`; Σ individuais = meta da loja (assert exato no teste)
- [ ] Dias elegíveis = dias abertos entre `max(admissão, 1º do mês)` e `min(inatividade, fim)`; meta proporcional × `diasElegíveis ÷ diasAbertosMês` quando parcial, com flag `metaProporcional`
- [ ] Vendedora inativa no período aparece com dias trabalhados até a inatividade (Fernanda, férias 10/09, não some)
- [ ] Agregados por vendedora no período: faturamento, atendimentos, itens, dias trabalhados
- [ ] Vendedora sem venda no período retorna zeros sem erro
- [ ] Testes: soma fecha exato, proporcional correto, elegibilidade por data, zeros (≥8 testes)
- [ ] Gate check passa: `npx vitest run`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): meta individual derivada e elegibilidade por data`

---

### T3: Escada de degraus e comissão por vendedora ✅

**What**: Calcular para cada vendedora o degrau alcançado na escada da filial, comissão acumulada, bônus e quanto falta pro próximo degrau.
**Where**: `src/data/gestao/equipe.ts`
**Depends on**: T2
**Reuses**: `Meta.degraus` da filial (não o `degrausPadrao` global), meta individual (T2), `brl`/`pct` de `@/lib/formato`
**Requirement**: EQUIP-04

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] Degrau atual = maior degrau com `atingimentoPct ≥ degrau.atingimentoMinPct`; `null` quando nenhum
- [ ] Comissão acumulada = `realizado × comissaoPct do degrau ÷ 100` (0 quando sem degrau)
- [ ] Bônus entra somente quando o degrau é alcançado (sem dobrar na projeção — risco D4 do design)
- [ ] Próximo degrau: `{ nome, faltaValor }` com `faltaValor = metaIndividual × minPct ÷ 100 − realizado`; `null` quando já está no último degrau
- [ ] Escada lida da `Meta` da filial customizada (teste com degraus não-padrão)
- [ ] Testes: fronteiras de degrau (ex.: exatamente 100%, 120%), comissão, bônus, próximo degrau (≥6 testes)
- [ ] Gate check passa: `npx vitest run`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): escada de degraus e comissao por vendedora`

---

### T4: montarEquipeView — visão loja com metaAtiva

**What**: Compor a `EquipeView` da visão loja: KPIs (Faturamento, Ticket, P.A. + Comissão quando meta ativa), tabela de vendedoras ordenada, regra `metaAtiva`, tendência e atenção de P.A.
**Where**: `src/data/gestao/equipe.ts`
**Depends on**: T3
**Reuses**: `resolverPeriodo` de `dashboard.ts`, regra de competência (período mensal usa o mês do período), agregados por vendedora (T2), escada/comissão (T3), `kpiDelta`, `PALETA_LOJAS` não se aplica aqui
**Requirement**: EQUIP-01, EQUIP-02, EQUIP-03

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] `metaAtiva = true` somente quando o período do filtro é exatamente o mês da competência (Este mês/Mês passado); Hoje/Ontem/7 dias/personalizado/cruzando meses → `metaAtiva = false`
- [ ] Com `metaAtiva=false`: 3 KPIs (comissão `null`), `VendedoraLinha` sem colunas de meta/escada/comissão (campos presentes mas `semMeta`/metaAtiva governa a UI), `desafios = null`
- [ ] KPIs com delta contra o período anterior equivalente (mesma comparação do Dashboard)
- [ ] Lista ordenada por atingimento (meta ativa) ou faturamento (sem meta), maior → menor; zeros no fim
- [ ] Tendência: últimos 7 dias vs. 7 anteriores da vendedora; ±5% = estável; histórico insuficiente = estável
- [ ] Atenção de P.A.: `paVendedora < 0.95 × média da loja` no período, exposto como percentual
- [ ] Estados por bloco (`EstadosEquipeView`) com `disponivel/sem_dados`
- [ ] Testes: metaAtiva por período, ordenação, tendência, P.A., deltas, estados (≥10 testes)
- [ ] Gate check passa: `npx vitest run`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): visao loja com kpis, tabela e regra meta ativa (EQUIP-01/02)`

---

### T5: Desafios na visão, comissão projetada e leitura da IA

**What**: Mapear desafios para `DesafioView` (progresso agregado, engajadas, veredito de ritmo), calcular o KPI comissão projetada e gerar a leitura da IA (`montarLeituraEquipe`).
**Where**: `src/data/gestao/equipe.ts`
**Depends on**: T4
**Reuses**: `desafiosAtivos` (T1), comissão por vendedora (T3), índice de desempenho da competência, `montarLeituraLoja` como padrão (`leitura.ts`)
**Requirement**: EQUIP-04, EQUIP-05, EQUIP-06

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] `DesafioView` com progresso agregado = soma do individual; `progressoPct = agregado ÷ (alvo × participantes)`; engajadas = participantes com progresso > 0
- [ ] `fechaNoRitmo` = projeção linear até o fim do período alcança o alvo agregado; veredito do cabeçalho conta os que não fecham
- [ ] Desafio sem progresso: engajadas 0 de M, estado "sem engajamento"; sem desafios → lista vazia sem quebrar a view
- [ ] KPI Comissão projetada = Σ (comissão acumulada + percentual estimado sobre o realizado projetado pelo índice de desempenho); bônus só de degrau já alcançado
- [ ] Leitura da IA: até 2 linhas (efeito de ticket/mix + destaque de quem está abaixo da meta e caindo); segunda linha omitida quando ninguém está abaixo
- [ ] Testes: agregado, engajadas, veredito, projeção de comissão, leitura com/sem destaque (≥8 testes)
- [ ] Gate check passa: `npx vitest run`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): desafios na visao, comissao projetada e leitura da ia (EQUIP-04/05/06)`

---

### T6: Visão rede — resumo por loja

**What**: Com "todas as lojas", compor um `LojaEquipeResumo` por loja (KPIs da equipe da loja, melhor e pior atingimento) e navegação por clique.
**Where**: `src/data/gestao/equipe.ts`
**Depends on**: T5
**Reuses**: `montarEquipeView` por filial (T4), desafios e comissão projetada (T5), `PALETA_LOJAS`/tints do `dashboard.ts`
**Requirement**: EQUIP-07

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] Visão "todas": `lojas` com um resumo por filial (faturamento, ticket, P.A., comissão projetada, melhor e pior com `nome`+`atingimentoPct`)
- [ ] `vendedoras = null` na visão rede (detalhe só dentro da loja)
- [ ] Loja sem vendedoras elegíveis: resumo com zeros, `melhor`/`pior` `null`, sem erro
- [ ] Testes: um resumo por loja, melhor/pior corretos, loja vazia (≥4 testes)
- [ ] Gate check passa: `npx vitest run`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): visao rede com resumo por loja (EQUIP-07)`

---

### T7: UI — blocos e página da Equipe

**What**: Criar `blocos.tsx` (KPIs em `KpiTile`, tabela de vendedoras e tabela de desafios em `DataTable`, leitura, estados) e reescrever `EquipePage` montando a `EquipeView`.
**Where**: `src/pages/equipe/blocos.tsx`
**Depends on**: T6
**Reuses**: `DataTable`, `KpiTile`, `Card`/`CardTitle`/`CardHeader`, `ProgressBar`, `Badge`, `Avatar`, `EmptyState`, `Skeleton`, padrão `EstadoBloco` do dashboard, `DashboardShell` (tab "equipe")
**Requirement**: EQUIP-01, EQUIP-02, EQUIP-05 (UI)

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] `BlocoKpisEquipe`: 3 KPIs (4 com meta ativa), 2×2 no celular e 4×1 no desktop, deltas renderizados (UI não calcula)
- [ ] `BlocoVendedoras`: `DataTable` com colunas vendedora (Avatar+nome+dias+tendência), faturamento, ticket, P.A. (+⚠ atenção); com meta ativa: meta individual, barra de escada, comissão, próximo degrau
- [ ] Colunas de meta/comissão não existem quando `metaAtiva=false`; tabela mobile esconde colunas secundárias (`hideBelow`)
- [ ] `BlocoDesafios`: `DataTable` com desafio+tipo, progresso (barra+"X de Y un · Z%"), engajadas, prêmio, ritmo; cabeçalho com veredito "N não fecham no ritmo"; EmptyState quando vazio
- [ ] `EquipePage` monta avisos, leitura, KPIs, tabela e desafios conforme a visão (loja/rede); visão rede renderiza resumo por loja com clique que troca o filtro preservando período/marca
- [ ] Estados: `Skeleton` em carregando, `EmptyState` por bloco sem dados, sem esconder os demais
- [ ] Gate check passa: `npm run lint; npm run build`
- [ ] Test count: 39+ testes de domínio continuam passando (nenhum novo de UI — ver matriz)

**Tests**: none (UI-only; domínio coberto em T1–T6)
**Gate**: build

**Commit**: `feat(equipe): ui da aba com tabelas de vendedoras e desafios`

---

### T8: Integração final e registro de decisão

**What**: Fechamento: lint/build limpos, revisão de consistência com a Visão geral, atualização do `STATE.md` (decisão da aba Equipe) e handoff.
**Where**: `src/pages/equipe/EquipePage.tsx`
**Depends on**: T7
**Reuses**: todos os blocos (T1–T7)
**Requirement**: todos (EQUIP-01..07)

**Tools**:

- MCP: none
- Skill: NONE

**Done when**:

- [ ] `npm run lint` sem erros novos
- [ ] `npm run build` (`tsc -b && vite build`) passa
- [ ] Test count: todos os testes de domínio passam (baseline 39 + novos de T1–T6, sem deleções silenciosas)
- [ ] Consistência: KPIs da Equipe batem com os KPIs da Visão geral no mesmo filtro (conferência manual no mock)
- [ ] `STATE.md` registra a decisão da aba Equipe (meta individual derivada, metaAtiva, DataTable, desafios mock) como próximo AD-NNN
- [ ] Nenhum componente paralelo novo (só reuso de template)

**Tests**: unit (domínio — reexecução)
**Gate**: build

**Commit**: `feat(equipe): integracao final e registro de decisao (EQUIP-01..07)`

---

## Phase Execution Map

```
Phase 1 -> Phase 2 -> Phase 3

Phase 1:  T1 ------→ T2
Phase 2:  T2 ------→ T3 ------→ T4 ------→ T5 ------→ T6
Phase 3:  T6 ------→ T7 ------→ T8
```

Execution is strictly sequential — there is no intra-phase parallelism. A single agent (or batch worker) works one task at a time, in order.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1: Mock de desafios | 1 arquivo + testes | ✅ Granular |
| T2: Meta individual + elegibilidade | 1 arquivo (funções puras) | ✅ Granular |
| T3: Escada + comissão | 1 arquivo (funções puras) | ✅ Granular |
| T4: montarEquipeView loja | 1 função compositora | ✅ Granular |
| T5: Desafios view + projeção + leitura | 1 arquivo (3 funções coesas) | ✅ Granular |
| T6: Visão rede | 1 função | ✅ Granular |
| T7: Blocos + página | 2 arquivos coesos (UI da mesma aba) | ⚠️ OK — coesos |
| T8: Integração + STATE | housekeeping final | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T1 | None | início da Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |

Regras: nenhuma dependência aponta para fase posterior; toda seta do diagrama tem `Depends on` correspondente.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Domain (`desafios.ts`) | unit | unit | ✅ OK |
| T2 | Domain (`equipe.ts`) | unit | unit | ✅ OK |
| T3 | Domain (`equipe.ts`) | unit | unit | ✅ OK |
| T4 | Domain (`equipe.ts`) | unit | unit | ✅ OK |
| T5 | Domain (`equipe.ts`) | unit | unit | ✅ OK |
| T6 | Domain (`equipe.ts`) | unit | unit | ✅ OK |
| T7 | Route/UI (`blocos.tsx`, `EquipePage.tsx`) | none (build gate) | none | ✅ OK |
| T8 | Integration housekeeping | unit (reexecução) | unit | ✅ OK |