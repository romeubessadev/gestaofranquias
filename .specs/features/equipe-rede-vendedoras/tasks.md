# equipe-rede-vendedoras Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/equipe-rede-vendedoras/design.md`
**Status**: Done · Verified PASS

---

## Test Coverage Matrix

> Generated from codebase sampling. Guidelines found: none formalized — strong defaults applied; padrão existente do projeto: Vitest colocalizado (`*.test.ts` ao lado do módulo em `src/data/gestao/`), gates `tsc -b --noEmit` + `vitest run` (usados em todas as features anteriores).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain / visões (`equipeVisoes.ts`) | unit | Todos os ACs REDE-01..09, 16, 17 e edge cases da spec (1:1); asserts determinísticos | `src/data/gestao/equipeVisoes.test.ts` | `npx vitest run src/data/gestao/equipeVisoes.test.ts` |
| UI (`src/pages/equipe/blocos.tsx`) | none (render manual) | Prova visual no Pages + build limpo; lógica vive na camada de visões | `src/pages/equipe/*` | build gate only |
| Suíte de regressão | unit | Nenhum teste existente quebra (99 testes atuais) | `src/**/*.test.ts` | `npx vitest run` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Após T1, T2 (unit only) | `npx vitest run src/data/gestao/equipeVisoes.test.ts` |
| Full | Após T3, T4 (UI + regressão) | `npx vitest run` |
| Build | Sempre, em cada task | `npx tsc -b --noEmit` |

---

## Execution Plan

```
T1 → T2 → T3 → T4 → T5
```

Fase única (cadeia linear; 5 tasks, batch único inline).

---

## Task Breakdown

### T1: dimensão filial na linha + visão rede flat

- [x] **T1 — `filialId`/`filialNome` em `VendedoraLinha` e `vendedoras` flat na visão rede** — **Done**
**Where**: `src/data/gestao/equipeVisoes.ts` (modify)
**Depends on**: None
**Reuses**: `visaoVendedoras` (única fonte de linha), `visaoRede` existente
**Requirement**: REDE-01, REDE-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `VendedoraLinha` tem `filialId`/`filialNome` preenchidos nas duas visões
- [x] `visaoRede` retorna `vendedoras` (flat, ordenada pela regra da loja)
- [x] `LojaEquipeResumo` com os 3 campos novos calculados
- [x] Testes novos passam; count sobe sem deletar existentes
- [x] Gate check passes: `npx vitest run src/data/gestao/equipeVisoes.test.ts` + `npx tsc -b --noEmit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): dimensão filial na linha de vendedora e visão rede flat`

---

### T2: meta global da rede

- [x] **T2 — `RedeMetaGlobal` em `EquipeView.metaGlobal`** — **Done**
**What**: `RedeMetaGlobal` (competTexto, realizado, total, pct, projetadoPct, diasRestantes) em `EquipeView.metaGlobal`, null fora da competência.
**Where**: `src/data/gestao/equipeVisoes.ts` (modify)
**Depends on**: T1
**Reuses**: `curvaReceita` (AD-021), `lojaAberta` (AD-019), `metaDaFilial`
**Requirement**: REDE-06, REDE-07, REDE-08, REDE-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `metaGlobal` calculada só em visão rede com meta ativa; null caso contrário
- [x] `total` soma só lojas com meta; `pct = realizado/total*100`
- [x] `projetadoPct` via fração acumulada da curva da rede
- [x] Gate check passes: `npx vitest run src/data/gestao/equipeVisoes.test.ts`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(equipe): meta global da rede para faixa do card`

---

### T3: faixa de meta global na UI

- [x] **T3 — `FaixaMetaGlobal` + badges** — **Done**
**What**: Componente `FaixaMetaGlobal` (faixa + barra + badges de projeção e dias restantes) renderizado na EquipePage em visão rede com meta ativa.
**Where**: `src/pages/equipe/blocos.tsx`, `src/pages/equipe/EquipePage.tsx` (modify)
**Depends on**: T2
**Reuses**: `ProgressBar`, `Badge`, `ICONS` do tema; padrão de badges do print 1
**Requirement**: REDE-10, REDE-11

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Faixa com formato `META DE [MÊS] · R$ X DE R$ Y · Z%` + barra + % à direita
- [x] Badge "Meta será atingida"/"Projeção abaixo da meta" conforme `projetadoPct >= 100`; "N dias restantes"
- [x] Não aparece fora da visão rede nem sem meta
- [x] Gate check passes: `npx tsc -b --noEmit` + `npx vitest run`

**Tests**: none (UI render — cobertura da matriz é prova visual)
**Gate**: build

**Commit**: `feat(equipe): faixa de meta global com badges de projeção`

---

### T4: tabela da rede com Shopping e abas Vendedoras|Lojas

- [x] **T4 — `BlocoVendedoras` + `BlocoVendedorasRede`; remove `BlocoResumoRede`** — **Done**
**What**: `BlocoVendedoras` reutilizável (`mostrarShopping`), `BlocoVendedorasRede` com abas internas substituindo `BlocoResumoRede`.
**Where**: `src/pages/equipe/blocos.tsx`, `src/pages/equipe/EquipePage.tsx` (modify)
**Depends on**: T3
**Reuses**: `BarraEscada`, `PremiacaoCelula`, `DataTable`, `Segmentado`-like do tema
**Requirement**: REDE-02, REDE-03, REDE-04, REDE-05, REDE-12, REDE-13, REDE-14, REDE-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Coluna Shopping presente na aba Vendedoras e ausente nas tabelas aninhadas da aba Lojas
- [x] Aba Lojas: bloco por loja com `% da meta global`, barra, `atingido / meta` e tabela aninhada
- [x] Abas só com meta ativa; sem meta → tabela flat de desempenho (REDE-04)
- [x] Loja única inalterada (REDE-05); `BlocoResumoRede` removido sem referências pendentes
- [x] Gate check passes: `npx tsc -b --noEmit` + `npx vitest run` (99+ testes)

**Tests**: none (unit — cobertura via regressão da suíte; UI por prova visual)
**Gate**: full

**Commit**: `feat(equipe): visão rede como tabela de vendedoras com abas Vendedoras|Lojas`

---

### T5: verificação final

- [x] **T5 — Verifier + validation.md + AD-045** — **Done**
**What**: Verifier (spec-anchored + discrimination sensor), `validation.md`, AD-045 no `STATE.md`.
**Where**: `.specs/features/equipe-rede-vendedoras/validation.md`, `.specs/STATE.md`
**Depends on**: T4
**Reuses**: `validate_state.py`
**Requirement**: REDE-16, REDE-17

**Tools**:

- MCP: NONE
- Skill: tlc-spec-driven (verifier)

**Done when**:

- [x] validation.md PASS com evidências file:line por AC
- [x] Sensor de discriminação executado (mutantes mortos)
- [x] AD-045 registrada
- [x] Gate check passes: `npx vitest run` + `validate_state.py` exit 0

**Tests**: unit
**Gate**: full

**Commit**: `docs(specs): validar equipe-rede-vendedoras e registrar AD-045`

---

## Phase Execution Map

```
Phase 1:  T1 → T2 → T3 → T4 → T5
```

## Coverage (req → task)

| Req | Task |
| --- | ---- |
| REDE-01, 02 | T1 |
| REDE-06..09 | T2 |
| REDE-10, 11 | T3 |
| REDE-03..05, 12..15 | T4 |
| REDE-16, 17 | T5 |
