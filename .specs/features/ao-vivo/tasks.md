# Ao vivo — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.**

**Design**: `.specs/features/ao-vivo/design.md`  
**Status**: Approved

---

## Test Coverage Matrix

> Guidelines found: existing Vitest under `src/data/wedash/*.test.ts`. Strong defaults for domain; UI pages build-gate only.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Domain `buildLiveView` | unit | Dual KPI month+today; ranking month; empty; Todas aggregate | `src/data/wedash/live.test.ts` | `npm test` |
| Routes / pages UI | none | build gate | `src/pages/ao-vivo/**` | `npm run build` |
| Nav / paths | none | build gate | `paths.ts`, `nav-wedash.ts` | `npm run build` |

## Gate Check Commands

| Gate Level | When | Command |
| --- | --- | --- |
| Quick | After domain tasks | `npm test -- src/data/wedash/live.test.ts` |
| Build | After UI / wiring | `npm run build` |
| Full | Phase end | `npm test` && `npm run build` |

---

## Execution Plan

Phases are ordered; tasks run sequentially.

### Phase 1: Foundation through P2

```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

---

## Task Breakdown

### T1: Wire Ao vivo paths, nav, routes and share/TV shells

**What**: Register `/ao-vivo`, `/ao-vivo/compartilhar`, `/ao-vivo/tv`; menu item; shell pages; SeletorLoja on Ao vivo.  
**Where**: `src/pages/ao-vivo/routes.tsx`  
**Depends on**: None  
**Reuses**: `src/pages/metas/routes.tsx` pattern  
**Requirement**: AOVIVO-01  

**Done when**:

- [x] `paths.aoVivo` exists and routes render shells with Voltar
- [x] Gestor nav shows Ao vivo between Dashboard and Config
- [x] Topbar SeletorLoja appears on `/ao-vivo*`

**Tests**: none  
**Gate**: build  
**Status**: done  

---

### T2: Implement `buildLiveView` with unit tests

**What**: Domain view for KPIs (mês+hoje), ranking mês, desafios, meta, evolução, insight mock.  
**Where**: `src/data/wedash/live.ts`  
**Depends on**: T1  
**Reuses**: `dashboard.ts` aggregates, `challenges.ts`, `goals.ts`, `equipe.ts`  
**Requirement**: AOVIVO-02, AOVIVO-03, AOVIVO-04, AOVIVO-05  

**Status**: done

**Done when**:

- [x] View exports typed `AoVivoView`
- [x] Unit tests cover dual KPI, ranking order, empty month, zero-today-with-month-sales
- [x] Gate quick passes

**Tests**: unit  
**Gate**: quick  

---

### T3: AoVivoPage chrome — KPIs, header actions, tabs, Atualizar

**What**: Main page with PageHeader actions, 4 StatCards, tab chrome, refresh label.  
**Where**: `src/pages/ao-vivo/AoVivoPage.tsx`  
**Depends on**: T2  
**Reuses**: EquipePage / FinanceiroPage patterns  
**Requirement**: AOVIVO-01, AOVIVO-02, AOVIVO-08  

**Status**: done

**Done when**:

- [x] Compartilhar → `/ao-vivo/compartilhar`; Modo TV → `/ao-vivo/tv`
- [x] KPIs show month primary + today sub
- [x] Atualizar updates freshness label
- [x] Build passes

**Tests**: none  
**Gate**: build  

---

### T4: Ranking tab podium and list

**What**: Month ranking podium top 3 + full list + empty state.  
**Where**: `src/pages/ao-vivo/blocos.tsx`  
**Depends on**: T3  
**Reuses**: Avatar, Badge, Card, EmptyState  
**Requirement**: AOVIVO-03  

**Status**: done

**Done when**:

- [x] Podium + list render from view
- [x] Empty state when no month sales
- [x] Build passes

**Tests**: none  
**Gate**: build  

---

### T5: Desafios tab cards

**What**: Active challenge cards with top 3 progress + empty state.  
**Where**: `src/pages/ao-vivo/blocos.tsx`  
**Depends on**: T4  
**Reuses**: ProgressBar, Card, desafios fixtures via view  
**Requirement**: AOVIVO-04  

**Status**: done

**Done when**:

- [x] Cards list active challenges
- [x] Empty state when none
- [x] Build passes

**Tests**: none  
**Gate**: build  

---

### T6: Metas tab Por Vendedor / Por Grupo

**What**: Competence progress, toggle, lists, level legend, empty state.  
**Where**: `src/pages/ao-vivo/blocos.tsx`  
**Depends on**: T5  
**Reuses**: Segmented or button toggle, ProgressBar  
**Requirement**: AOVIVO-05  

**Status**: done

**Done when**:

- [x] Por Vendedor / Por Grupo switch works
- [x] Progress + legend render
- [x] Build passes

**Tests**: none  
**Gate**: build  

---

### T7: Evolução section and IA Insights banner

**What**: Monthly evolution table+chart and Gerar Insights mock banner.  
**Where**: `src/pages/ao-vivo/AoVivoPage.tsx`  
**Depends on**: T6  
**Reuses**: AreaLineChart, Card  
**Requirement**: AOVIVO-06, AOVIVO-07  

**Status**: done

**Done when**:

- [x] Evolução renders table + chart
- [x] Gerar Insights shows fixture text
- [x] Full gate passes

**Tests**: none  
**Gate**: full  

---

## Phase Execution Map

```
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

## Diagram-Definition Cross-Check

| Edge | Matches Depends on |
| --- | --- |
| T1 → T2 | ✅ |
| T2 → T3 | ✅ |
| T3 → T4 | ✅ |
| T4 → T5 | ✅ |
| T5 → T6 | ✅ |
| T6 → T7 | ✅ |

## Test Co-location Validation

| Task | Layer | Tests field | Matrix OK |
| --- | --- | --- | --- |
| T1 | config/routes | none | ✅ |
| T2 | domain | unit | ✅ |
| T3–T7 | UI | none | ✅ |

## Traceability

| Req ID | Task |
| --- | --- |
| AOVIVO-01 | T1, T3 |
| AOVIVO-02 | T2, T3 |
| AOVIVO-03 | T2, T4 |
| AOVIVO-04 | T2, T5 |
| AOVIVO-05 | T2, T6 |
| AOVIVO-06 | T7 |
| AOVIVO-07 | T7 |
| AOVIVO-08 | T3 |
