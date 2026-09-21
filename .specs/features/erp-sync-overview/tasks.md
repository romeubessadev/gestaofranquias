# ERP Sync + Visão Geral — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/erp-sync-overview/design.md`  
**Status**: Approved — Execute in progress (Batch A)

---

## Test Coverage Matrix

> Guidelines found: Vitest `src/data/wedash/*.test.ts`; `package.json` → `test` / `build` / `lint`. Strong defaults for domain.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Domain aggregator | unit | DATA_H+TZ; distinct ops; zero; hours only today | `src/data/wedash/salesAggregate.test.ts` | `npm test -- src/data/wedash/salesAggregate.test.ts` |
| Domain Overview adapter | unit | KPIs from aggs; empty no mocks | `src/data/wedash/dashboard.test.ts` | `npm test -- src/data/wedash/dashboard.test.ts` |
| Worker client + job runner | unit | Map fixture; lock; busy/password; finally logout | `workers/millennium-sync/src/*.test.ts` | `npm test -- workers/millennium-sync` |
| salesRepo | unit | scope filter + empty | `src/data/wedash/salesRepo.test.ts` | `npm test -- src/data/wedash/salesRepo.test.ts` |
| Edge / migrations / Overview UI | none | build gate | respective paths | `npm run build` |

## Gate Check Commands

| Gate Level | When | Command |
| ---------- | ---- | ------- |
| Quick | Domain unit tasks | `npm test -- src/data/wedash/salesAggregate.test.ts src/data/wedash/salesRepo.test.ts src/data/wedash/dashboard.test.ts` |
| Full | Worker + domain | `npm test` |
| Build | UI / schema / phase end | `npm run build` |

---

## Execution Plan

Phases run sequentially. Cross-phase prerequisites are listed in each task’s `Depends on` (foundation T1/T3/T4 before worker and app).

### Phase 1: Schema + fixtures + types

```
T1 -> T2 -> T3
```

### Phase 2: Aggregation domain

```
T4
```

### Phase 3: Worker Millennium

```
T5 -> T6 -> T7
```

### Phase 4: Enqueue + onboarding persist

```
T8 -> T9 -> T10
```

### Phase 5: Overview read path

```
T11 -> T12 -> T13 -> T14
```

---

## Task Breakdown

### Phase 1: Schema + fixtures + types

### T1: Create ERP sync + sales aggregate migration

**What**: Postgres tables `erp_credential`, `store`, `sync_job`, `sync_run`, `sales_day_agg`, `sales_hour_agg` + RLS.  
**Where**: `supabase/migrations/20260922120000_erp_sync_sales.sql`  
**Depends on**: None  
**Reuses**: `supabase/migrations/20260919120000_auth_core.sql`  
**Requirement**: SYNC-01, SYNC-02, SYNC-03  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [x] Natural keys match design
- [x] Watermark column on credential or tenant
- [x] Authenticated SELECT own tenant only; no client writes on sync tables

**Tests**: none  
**Gate**: build  
**Commit**: `feat(sync): add erp sales aggregate schema`

**Status**: ✅ Complete

---

### T2: Add VENDAS.Lista fixture sample

**What**: Anonymized JSON sample for aggregator/client tests.  
**Where**: `workers/millennium-sync/fixtures/vendas-lista.sample.json`  
**Depends on**: T1  
**Reuses**: `ideia.md` §7.4  
**Requirement**: SYNC-02  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [x] Includes COD_OPERACAO, DATA_H, VALOR_FINAL, QUANTIDADE, FILIAL
- [x] Short note on redaction in adjacent README snippet or JSON comment header

**Tests**: none  
**Gate**: build  
**Commit**: `chore(sync): add VENDAS.Lista fixture`

**Status**: ✅ Complete

---

### T3: Define SaleRow and aggregate TypeScript types

**What**: Shared EN types for rows and day/hour aggregates.  
**Where**: `src/data/wedash/salesTypes.ts`  
**Depends on**: T2  
**Reuses**: design models  
**Requirement**: SYNC-06  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [x] Exports SaleRow, SalesDayAgg, SalesHourAgg
- [x] Money as integer cents

**Tests**: none  
**Gate**: build  
**Commit**: `feat(sync): add sales aggregate TypeScript types`

**Status**: ✅ Complete

---

### Phase 2: Aggregation domain

### T4: Implement aggregateSales + unit tests

**What**: Pure aggregator SaleRow[] → day/hour aggs; co-located Vitest covering TZ/DATA_H edges.  
**Where**: `src/data/wedash/salesAggregate.ts`  
**Depends on**: T3  
**Reuses**: fixture from T2  
**Requirement**: SYNC-02, SYNC-06  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Buckets by local DATA_H date (not DATA)
- [ ] sales_count = distinct COD_OPERACAO
- [ ] Hours only for current local day
- [ ] `salesAggregate.test.ts` covers multi-day, TZ midnight trap, zero rows, duplicate ops (≥4 tests)
- [ ] Quick gate green

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(sync): aggregate VENDAS rows into day/hour buckets`

---

### Phase 3: Worker Millennium

### T5: Implement Millennium fetchSalesLista client

**What**: Worker client for VENDAS.Lista → SaleRow[] with mocked-fetch unit test.  
**Where**: `workers/millennium-sync/src/millenniumSales.ts`  
**Depends on**: T3  
**Reuses**: `supabase/functions/_shared/millennium.ts` patterns  
**Requirement**: SYNC-02, SYNC-04  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Maps fixture-shaped payload to SaleRow
- [ ] Unit test with mocked fetch passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(sync): add Millennium VENDAS.Lista client`

---

### T6: Implement sync job runner

**What**: Claim job, one RUNNING per credential, backfill 90d / light today, upsert, finally logout, sync_run + watermark.  
**Where**: `workers/millennium-sync/src/runSyncJob.ts`  
**Depends on**: T5  
**Reuses**: T1 schema, T4 aggregator, busy/password classification  
**Requirement**: SYNC-01, SYNC-02, SYNC-03, SYNC-04  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Sequential stores; finally logout always
- [ ] busy → failed; password → INVALID
- [ ] Unit tests for lock + logout finally with mocks
- [ ] Full gate green for worker tests

**Tests**: unit  
**Gate**: full  
**Commit**: `feat(sync): run backfill and light sync with session lock`

---

### T7: Document worker setup

**What**: README for BR worker env and poll loop.  
**Where**: `workers/millennium-sync/README.md`  
**Depends on**: T6  
**Reuses**: supabase README Brazil IP note  
**Requirement**: SYNC-05  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Env vars listed; BR requirement stated; job kinds documented

**Tests**: none  
**Gate**: build  
**Commit**: `docs(sync): document millennium-sync worker`

---

### Phase 4: Enqueue + onboarding persist

### T8: Create Edge Function erp-sync-enqueue

**What**: JWT enqueue LIGHT/FORCE_LIGHT/BACKFILL; OWNER/MANAGER; 5‑min force limit.  
**Where**: `supabase/functions/erp-sync-enqueue/index.ts`  
**Depends on**: T1  
**Reuses**: millennium-onboarding CORS/JWT  
**Requirement**: SYNC-11, SYNC-12  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Role gate + rate limit + inserts QUEUED sync_job

**Tests**: none  
**Gate**: build  
**Commit**: `feat(sync): enqueue sync jobs via Edge Function`

---

### T9: Persist ERP credential and stores after onboarding

**What**: Upsert erp_credential (encrypted) + store rows; remap membership_store.  
**Where**: `src/session/authApi.ts`  
**Depends on**: T8  
**Reuses**: saveMembershipStores; T1 schema  
**Requirement**: SYNC-01  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] dedicated → interval 2/30; millennium_store_id set; build green

**Tests**: none  
**Gate**: build  
**Commit**: `feat(sync): persist erp credential and stores after onboarding`

---

### T10: Enqueue BACKFILL when onboarding finishes

**What**: Invoke enqueue BACKFILL after successful persist.  
**Where**: `src/pages/onboarding/Onboarding.tsx`  
**Depends on**: T9  
**Reuses**: functions.invoke pattern  
**Requirement**: SYNC-01  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] QUEUED BACKFILL created; enqueue failure soft-warns only

**Tests**: none  
**Gate**: build  
**Commit**: `feat(sync): enqueue 90-day backfill after onboarding`

---

### Phase 5: Overview read path

### T11: Implement salesRepo for aggregate reads

**What**: Fetch day/hour aggs + watermark by tenant/scope; unit tests with mock client.  
**Where**: `src/data/wedash/salesRepo.ts`  
**Depends on**: T3  
**Reuses**: `src/lib/supabase.ts`; T1 tables  
**Requirement**: SYNC-05, SYNC-06, SYNC-07, SYNC-09  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Filters store/date/brand; empty arrays not mocks; unit tests green

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(sync): add salesRepo for dashboard reads`

---

### T12: Adapt buildOverviewView for real aggregates

**What**: Overview domain uses SalesDayAgg input; no PRNG mocks for fat/ticket/sales; CMV/top → empty pending.  
**Where**: `src/data/wedash/dashboard.ts`  
**Depends on**: T11  
**Reuses**: OverviewView shape  
**Requirement**: SYNC-05, SYNC-06, SYNC-07, SYNC-08  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Empty aggs → empty KPIs (no fabricated R$)
- [ ] dashboard.test updated; quick gate green

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(overview): build KPIs from sales aggregates`

---

### T13: Wire OverviewPage to salesRepo

**What**: Async load aggs; pending/empty UI; scope filters; no Millennium on load.  
**Where**: `src/pages/dashboards/OverviewPage.tsx`  
**Depends on**: T12  
**Reuses**: StatCard/charts; T11  
**Requirement**: SYNC-06, SYNC-07, SYNC-08  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Loads from Supabase only; empty CMV/top; build green

**Tests**: none  
**Gate**: build  
**Commit**: `feat(overview): load real aggregates on Visão Geral`

---

### T14: Watermark + force refresh on Overview

**What**: Show last_light_sync_at; OWNER/MANAGER force via enqueue; 5‑min guard.  
**Where**: `src/pages/dashboards/OverviewPage.tsx`  
**Depends on**: T13  
**Reuses**: T8 enqueue; header actions  
**Requirement**: SYNC-10, SYNC-11, SYNC-12  

**Tools**: Skill `tlc-spec-driven` · MCP NONE  

**Done when**:

- [ ] Watermark visible; SELLER no force; second force blocked <5 min; build green

**Tests**: none  
**Gate**: build  
**Commit**: `feat(overview): watermark and rate-limited force refresh`

---

## Phase Execution Map

```
Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5

Phase 1: T1 -> T2 -> T3
Phase 2: T4
Phase 3: T5 -> T6 -> T7
Phase 4: T8 -> T9 -> T10
Phase 5: T11 -> T12 -> T13 -> T14
```

**Batches (~7 tasks):** A = T1–T4 · B = T5–T10 · C = T11–T14  

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1–T14 | One primary file each | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram (intra-phase) | Status |
| ---- | ----------------- | --------------------- | ------ |
| T1 | None | start | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T2 | T2→T3 | ✅ |
| T4 | T3 | (cross-phase via Reuses/T3; Phase2 solo) | ✅ |
| T5 | T3 | Phase3 start (T3 prior phase) | ✅ |
| T6 | T5 | T5→T6 | ✅ |
| T7 | T6 | T6→T7 | ✅ |
| T8 | T1 | Phase4 start | ✅ |
| T9 | T8 | T8→T9 | ✅ |
| T10 | T9 | T9→T10 | ✅ |
| T11 | T3 | Phase5 start | ✅ |
| T12 | T11 | T11→T12 | ✅ |
| T13 | T12 | T12→T13 | ✅ |
| T14 | T13 | T13→T14 | ✅ |

---

## Test Co-location Validation

| Task | Layer | Matrix | Task Says | Status |
| ---- | ----- | ------ | --------- | ------ |
| T1 | schema | none | none | ✅ |
| T2 | fixture | none | none | ✅ |
| T3 | types | none | none | ✅ |
| T4 | aggregator | unit | unit | ✅ |
| T5 | worker client | unit | unit | ✅ |
| T6 | job runner | unit | unit | ✅ |
| T7 | docs | none | none | ✅ |
| T8 | Edge | none | none | ✅ |
| T9 | authApi | none | none | ✅ |
| T10 | onboarding UI | none | none | ✅ |
| T11 | salesRepo | unit | unit | ✅ |
| T12 | dashboard domain | unit | unit | ✅ |
| T13 | Overview UI | none | none | ✅ |
| T14 | Overview UI | none | none | ✅ |

---

## Requirement Traceability

| ID | Tasks |
| -- | ----- |
| SYNC-01 | T1, T6, T9, T10 |
| SYNC-02 | T1, T2, T4, T5, T6 |
| SYNC-03 | T1, T6 |
| SYNC-04 | T5, T6 |
| SYNC-05 | T7, T11, T12, T13 |
| SYNC-06 | T3, T4, T11, T12, T13 |
| SYNC-07 | T11, T12, T13 |
| SYNC-08 | T12, T13 |
| SYNC-09 | T11 |
| SYNC-10 | T14 |
| SYNC-11 | T8, T14 |
| SYNC-12 | T8, T14 |
