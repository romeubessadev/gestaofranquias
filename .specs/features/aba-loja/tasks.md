# Aba Loja — Tasks

## Execution Protocol (MANDATORY — do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/aba-loja/design.md`
**Status**: Draft | Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, test config, or CI gates in repo) — strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain (business-logic: `src/data/gestao/*.ts`) | unit | All branches; 1:1 to spec ACs (LOJA-01..07); every listed edge case has a test | `src/data/gestao/**/*.test.ts` | `npx vitest run` |
| Route / e2e (SPA pages, no backend) | none | - (build gate only) | - | build gate only |
| Entity / config / schema | none | - (build gate only) | - | build gate only |

**Provenance**: no test framework/config exists in repo yet; `vitest` is being introduced this round per user decision. Vitest is chosen for native Vite/TS support (`vite.config.ts` alias `@`). Test files run in Node against pure domain modules (`src/data/gestao/*.ts`) that import only from `./filiais`, `./vendas`, `./metas`, `./relogio`, `./leitura`, and `@/lib/*` (no DOM APIs), so `environment: "node"` suffices.

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only (most tasks) | `npx vitest run` |
| Full | After tasks with e2e/integration tests | `npx vitest run` (no e2e in scope) |
| Build | After phase completion or config/entity-only tasks | `npm run lint; npm run build` |

**Windows note:** the shell is PowerShell 5 (`&&` is invalid). Use `;` between commands or `cmd /c "a && b"` when chaining. Commits use `git add -A; git commit -m "..."` (or `git commit -am` for tracked-only).

---

## Execution Plan

Phases are ordered and run sequentially — each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation — deps, config, git baseline

Tasks that must be done first, in order.

```
T0 -> T1 -> T2
```

- **T0** — baseline commit (git init done; snapshot pre-feature as `chore: baseline current state`).
- **T1** — introduce Vitest + test script + `vitest.config.ts`.
- **T2** — pure-`Map` mock store + first smoke test proving the runner.

### Phase 2: Cálculo — motor de trilho (pure, branch-heavy domain)

Dependencies: Phase 1.

```
T2 -> T3 -> T4 -> T5
```

- **T3** — atende LOJA-01 (status) e LOJA-02 (venda necessária).
- **T4** — atende LOJA-03 (projeção) e LOJA-06 (comparação) na camada de dados.
- **T5** — atende LOJA-04 (diagnóstico fluxo/ticket).

### Phase 3: Visões — composição, estados e mix

Dependencies: Phase 2.

```
T5 -> T6 -> T7 -> T8
```

- **T6** — atende LOJA-05 (visão de grupo com `status`/`pctTrilho`/`temMeta` no card por loja + drill-in preservando filtros).
- **T7** — atende LOJA-07 (estados por bloco, `Skeleton`/`EmptyState`) e o modelo `ComparacaoView`/delta da comparação (LOJA-06 AC 3).
- **T8** — atende a AC 10 do mix (`DonutChart` + participação por categoria + margem na legenda).

### Phase 4: Integração

```
T8 -> T9
```

- **T9** — `npm run lint; npm run build` limpo; revisão de regressão visual do novo layout.

---

## Task Breakdown

### T0: Commitar baseline

**What**: Baseline do repositório `git init` antes de qualquer código da feature.
**Where**: `repo root (git)`
**Depends on**: None
**Reuses**: `.gitignore` já presente
**Requirement**: none — housekeeping

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `git status --short` limpo após o commit
- [ ] `git log -1 --oneline` mostra `chore: baseline current state`

**Tests**: none
**Gate**: build

**Commit**: `chore: baseline current state`

---

### T1: Adicionar Vitest + script de teste

**What**: Introduzir `vitest` como devDependency, `vitest.config.ts` reutilizando o alias `@` e o script `test` em `package.json`.
**Where**: `package.json`
**Depends on**: T0
**Reuses**: `vite.config.ts` (alias `@`, plugins)

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] Vitest instalado e configurado (`vitest.config.ts` com alias `@`, `environment: "node"`)
- [ ] Script `test` em `package.json` rodando `vitest run`
- [ ] `npm run lint` e `npm run build` não quebram
- [ ] Test count: 0 (nenhum teste real ainda — só config)

**Tests**: none (config only — build gate)
**Gate**: build

**Commit**: `chore(test): add vitest test runner and config`

---

### T2: Store puro Map + smoke test

**What**: Expor a mesma lógica `diaVendas`/`diasVendas`/`agregadoDoDia`/`somarAgregados` a partir de um store puro `Map` paramétrico, em vez de um Map global no módulo, para permitir testes isolados por cenário; adicionar o primeiro teste smoke que prova o runner.
**Where**: `src/data/gestao/vendas.ts`
**Depends on**: T1
**Reuses**: `filiais`, `PARAMETROS`, `gerarDia` internos; `lojaAberta`, `pesoDia` já exportados

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `DiaVendasStore` expõe `dia`, `dias`, `agregadoDoDia`, `somarAgregados` com o mesmo contrato atual
- [ ] `src/data/gestao/loja.ts` consome o store (factory padrão via `montarLojaView` aceita store injetável com default)
- [ ] Teste smoke `src/data/gestao/__smoke__.test.ts` passa (1 teste)
- [ ] Testes de store: carrega de `INICIO_HISTORICO` a `HOJE_ISO`; `agregado` com `divisao`/"horaMax" corretos
- [ ] Clock e bias por dia da semana preservados (regras existentes intactas)
- [ ] Gate check passa: `npx vitest run`; `npm run lint` e `npm run build` não quebram
- [ ] Test count: ≥4 passam (1 smoke + 3+ store)

**Tests**: unit
**Gate**: build

**Commit**: `refactor(data): parameterize day-sales store for isolated tests`

---

### T3: Implementar motor de trilho — status + venda necessária hoje (LOJA-01, LOJA-02)

**What**: Contrato de view para o herói (status/pct/competência) e a venda necessária hoje, com a curva ponderada por dia da semana, janela da competência e fórmula única da venda necessária.
**Where**: `src/data/gestao/loja.ts`
**Depends on**: T2
**Reuses**: `periodoAnterior`, `diasRestantesMes`, `agregadoPeriodo`, `divSeguro`, `brlK`, `fimDoMes`, `inicioDoMes`, `somarDias`, `pesoDia`, `lojaAberta`, `metaDaFilial`, `HOJE_ISO`

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `TrilhoView.status` cobre `no_trilho`/`atencao`/`abaixo`/`meta_batida`/`meta_nao_batida`; `pctTrilho` é `null` em competência encerrada (Bloco C)
- [ ] `curvaReceita` distribui a meta entre dias abertos proporcionalmente aos pesos normalizados (LOJA-01 AC 7) e usa fração acumulada até a data de referência
- [ ] `vendaNecessariaHoje` = `(faltaRestante × pesoHoje ÷ Σ pesosRestantes) − realizadoHoje`; considera hoje na janela; recalc sem recalcular pesos; `cumpridaHoje` separado de `metaMesAtingida`; hoje fechado → próximo dia aberto
- [ ] Estados de leitura por bloco (`EstadosLojaView`) com `disponivel/carregando/sem_dados/indisponivel`
- [ ] Gate check passa: `npx vitest run`
- [ ] Test count: testes unitários de LOJA-01 e LOJA-02 (≥8) passam

**Tests**: unit
**Gate**: quick

**Commit**: `feat(loja): status do trilho e venda necessaria hoje (LOJA-01/02)`

---

### T4: Implementar projeção e comparação de período (LOJA-03, LOJA-06)

**What**: Projeção de fechamento (índice da competência escalando a curva restante, gate do dia 7) e a comparação única de período com `ComparacaoView` (deltas derivam só dela).
**Where**: `src/data/gestao/loja.ts`
**Depends on**: T3
**Reuses**: `curvaReceita`, `statusTrilho`/`pctTrilho`, `periodoAnterior`, `divSeguro`, `metaDaFilial`

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `ProjecaoView` sem campo `pctTrilho` duplicado (reutiliza `TrilhoView.pctTrilho` — AD-029)
- [ ] Projeção = `realizado + meta × fração restante da curvaReceita × índice da competência`; gate do dia 7; competência encerrada → realizado fechado (sem projeção); sem meta → indisponível
- [ ] `ComparacaoView` com agregados de faturamento/atendimentos/itens por período atual/anterior e rótulos; deltas dos KPIs derivam só desta comparação (LOJA-06 AC 3)
- [ ] Gate check passa: `npx vitest run`
- [ ] Test count: testes de LOJA-03 e LOJA-06 (≥8) passam

**Tests**: unit
**Gate**: quick

**Commit**: `feat(loja): projecao pelo indice da competencia e comparacao unica (LOJA-03/06)`

---

### T5: Implementar diagnóstico fluxo/ticket (LOJA-04)

**What**: Decomposição fechada do gap em efeito fluxo e efeito ticket, regra da alavanca dominante (60%) e flag `exibir` (<90%), com mix separado na camada de dados.
**Where**: `src/data/gestao/loja.ts`
**Depends on**: T4
**Reuses**: `curvaAtendimentos`, `atendimentosEsperadosAtéHoje` (fração da `curvaReceita`), `ticketMeta`, `atendimentosRealizadosAtéHoje`, `agregadoPeriodo`, `divSeguro`

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `ticketMeta = meta ÷ atendimentos esperados do mês` (total da `curvaAtendimentos`)
- [ ] `efeitoFluxo = (atendimentosEsperadosAtéHoje − atendimentosRealizadosAtéHoje) × ticketMeta`; `efeitoTicket = (ticketMeta − ticketRealAtéHoje) × atendimentosRealizadosAtéHoje`; interação já contida no efeito fluxo, não somada (LOJA-04 AC 5-6)
- [ ] `exibir = pctTrilho < 90` (decidido na camada de dados)
- [ ] Alavanca dominante: maior efeito positivo ≥60% da soma dos positivos; senão `null` (LOJA-04 AC 8-9)
- [ ] `MixView` com `divisao` (typo corrigido), participação por categoria + margem para período/marca (AC 10 refinada)
- [ ] Gate check passa: `npx vitest run`
- [ ] Test count: testes de LOJA-04 (≥8) passam; verifica que fluxo+ticket fecha com o gap do status

**Tests**: unit
**Gate**: quick

**Commit**: `feat(loja): diagnostico fluxo/ticket e mix separado (LOJA-04)`

---

### T6: Implementar visão de grupo (todas as lojas) com drill-in (LOJA-05)

**What**: Lista de lojas na visão "todas" com status do trilho por loja e interação de drill-in preservando período e marca.
**Where**: `src/data/gestao/loja.ts`
**Depends on**: T5
**Reuses**: `montarLojaView`, `CalcularStatus` por filial, `PaletaLojas`, `Card`, `Badge`, `ProgressBar`, `Avatar`

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `LojaResumoView` com `filialId`, `nome`, `pctTrilho`, `status`, `temMeta` (modelo do design A1)
- [ ] Visão de grupo mostrta todas as lojas; cada linh a mostrta status/`pctTrilho` e `temMeta`
- [ ] Tocar numa loja abre só ela **mantendo período e marca** (`mudar({ ...escopo, filialId })`)
- [ ] Retornar a "todas" preserva período e marca
- [ ] Loja do grupo sem meta não impede o status das demais (edge case)
- [ ] Gate check passa: `npx vitest run`
- [ ] Test count: testes de LOJA-05 (≥3) passam

**Tests**: unit
**Gate**: quick

**Commit**: `feat(loja): visão de grupo com status por loja e drill-in (LOJA-05)`

---

### T7: Implementar estados de leitura e deltas na UI (LOJA-07 + LOJA-06 AC 3)

**What**: Estados por bloco na página (`Skeleton`/`EmptyState`) e renderização dos deltas derivados da comparação única.
**Where**: `src/pages/loja/LojaPage.tsx`
**Depends on**: T6
**Reuses**: `Skeleton`, `EmptyState`, `EstadoLojaView` (T3), `ComparacaoView` (T4), `StatCard`

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] Bloco carregando mostrra `Skeleton`; escopo sem dados mostrra `EmptyState`; bloco sem dados não oculta os demais (LOJA-07 AC 1-3)
- [ ] Delas dos KPIs vêm de `ComparacaoView` (a UI não calcula)
- [ ] Gate check passa: `npx vitest run` (domínio) + Build/Lint
- [ ] Test count: testes de domínio da camada de estados existentes passam (nenhum novo de UI — ver matriz)

**Tests**: unit
**Gate**: build

**Commit**: `feat(loja): estados de leitura por bloco e deltas da comparação (LOJA-07/06)`

---

### T8: Implementar mix em DonutChart com margem (AC 10)

**What**: Renderizar o mix por categoria como `DonutChart` (participação de faturamento) com margem na legend a/detalhe, para o período e a marca selecionados.
**Where**: `src/pages/loja/blocos.tsx`
**Depends on**: T7
**Reuses**: `DonutChart` (template), `MixView` (T5), `Card`/`CardTitle`, `formato.brl`

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] Mix renderiza `DonutChart` com participação por categoria
- [ ] Legend a/detalhe mostrra a margem por categoria
- [ ] Segue o período e a marca selecionados (AC 10)
- [ ] Gate check passa: Build + Lint
- [ ] Test count: nenhum novo de UI (ver matriz); domínio do mix já cobert o em T5

**Tests**: none (UI-only; mix domain covered in T5)
**Gate**: build

**Commit**: `feat(loja): mix em donut chart com margem por categoria (LOJA-04-AC10)`

---

### T9: Integração — build/lint limpos e revisão do novo layut

**What**: Fechamento da integração: `npm run lint; npm run build` sem erros, revisão do novo layut operacional e ajustes finos.
**Where**: `src/pages/loja/LojaPage.tsx`
**Depends on**: T8
**Reuses**: todos os blocos (T3-T8)

**Tools**:
- MCP: none
- Skill: NONE

**Done when**:
- [ ] `npm run lint` sem erros
- [ ] `npm run build` (`tsc -b && vite build`) passa
- [ ] Revisão visuall: herói + venda necessária + projeção + díagnóstico + mix + grupo, todos consistentes
- [ ] Nenhum componente paralelo novo (só reuso de template)
- [ ] Test count: todos os testes de domínio (das fases 2-3) passam

**Tests**: unit (domínio — reexecução)
**Gate**: build

**Commit**: `chore(loja): integrate redesigned loja dashboard` (se houver mudanças; senão rebuild-only)