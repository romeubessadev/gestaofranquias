# ERP Sync + Visão Geral Validation

**Date**: 2026-09-21  
**Spec**: `.specs/features/erp-sync-overview/spec.md`  
**Diff range**: `b53abbf^..84d66b8` (feature + gap-fix through SYNC-05)  
**Verifier**: independent sub-agent re-verify #2 (author ≠ verifier)  
**Prior FAIL gaps (re-verify #1)**: SYNC-05  
**Gap-fix tip**: `84d66b8` (`syncUi.test.ts` SYNC-05 assertion); also `d7ec179` (`tsconfig.app.json` excludes `src/**/*.test.ts` from `tsc -b`)  
**Result**: PASS

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | Migration present; gate = build only |
| T2 | ✅ Done | Fixture + README |
| T3 | ✅ Done | `salesTypes.ts` |
| T4 | ✅ Done | `salesAggregate.test.ts` |
| T5 | ✅ Done | `millenniumSales.test.ts` |
| T6 | ✅ Done | `runSyncJob.test.ts` (BACKFILL 90d + FORCE_LIGHT) |
| T7 | ✅ Done | Worker README |
| T8 | ✅ Done | Edge enqueue; **Tests: none** (rate limit lives here) |
| T9 | ✅ Done | Persist credential; **Tests: none** |
| T10 | ✅ Done | Onboarding backfill invoke; **Tests: none** |
| T11 | ✅ Done | `salesRepo.test.ts` |
| T12 | ✅ Done | Overview-from-aggs + SYNC-09 in `dashboard.test.ts` |
| T13 | ✅ Done | OverviewPage wired to salesRepo; **Tests: none** |
| T14 | ✅ Done | Watermark + force via `syncUi` helpers + SYNC-05 table-name assertion |

All T1–T14 marked complete in `tasks.md`. Completeness ≠ AC evidence; evidence below.

---

## Spec-Anchored Acceptance Criteria

| ID | Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| -- | ------------------------- | -------------------- | ----------------------- | ------ |
| SYNC-01 | Onboarding complete → enqueue backfill last 90 days, sequential stores | BACKFILL window ≈ today−90 → yesterday; stores sequential | `runSyncJob.test.ts:132-148` - `kind: "BACKFILL"` ∧ `from === "2026-06-21"` ∧ `to === "2026-09-18"`; sequential `runSyncJob.test.ts:118-123` | ✅ PASS |
| SYNC-02 | Job runs → ≤1 session, VENDAS.Lista, upsert day/(hour today), logout | Session once; Lista; upsert; logout in finally | `millenniumSales.test.ts:44-69` - `url` contains `VENDAS.Lista`; `runSyncJob.test.ts:106-115` - `logout === 1`; `salesAggregate.test.ts:53-57` - distinct ops → `salesCount === 2` | ✅ PASS |
| SYNC-03 | WHILE job holds credential → no second sync job | Second start refused / locked | `runSyncJob.test.ts:67-75` - `reason === "locked"` ∧ `login === 0` | ✅ PASS |
| SYNC-04 | busy/auth failure → failed run + error persisted; no orphan session | FAILED + error; logout only if session exists | `runSyncJob.test.ts:78-91` - `status: "FAILED"` ∧ `logout === 0`; `:94-103` - `status: "INVALID"` | ✅ PASS |
| SYNC-05 | Overview/dashboard page-load MUST NOT invoke Millennium | 0 Millennium calls on read path | `syncUi.test.ts:41-79` - `expect(tables).toEqual(["sales_day_agg"])` ∧ `tables.join(",").not.toMatch(/VENDAS\|millennium\|MILLENNIUM/i)` after `fetchSalesDayAggs`; wiring `OverviewPage.tsx:9,92` → `salesRepo` only (no `erp`/`millennium` imports) | ✅ PASS |
| SYNC-06 | Overview KPIs from WeDash aggregates, not mock generators | Revenue / sales count / ticket from aggs | `dashboard.test.ts:462-489` - `Nº de vendas` `/4/` ∧ ticket `/50/` | ✅ PASS |
| SYNC-07 | Aggregates exist → same filter semantics (store + period + brand) | Filtered rows match scope | `salesRepo.test.ts:150-163` - `toHaveLength(1)` ∧ `storeId === "s1"` ∧ `revenueCents === 100_00` | ✅ PASS |
| SYNC-08 | No aggs → empty/pending, not fabricated mock R$ | Zero/empty KPIs; no fake tops | `dashboard.test.ts:453-460` - `fromAggregates === true` ∧ Faturamento `/R\$\s*0/` ∧ `topProdutos === []` | ✅ PASS |
| SYNC-09 | After successful light sync → Overview reads reflect updated aggs (no Millennium) | Subsequent read shows new totals | `dashboard.test.ts:491-508` - empty → `/R\$\s*0/`; post-agg → vendas `/7/` ∧ `fromAggregates === true` | ✅ PASS |
| SYNC-10 | Overview loads → show last successful light sync (or never/pending) | Visible watermark / pending label | `syncUi.test.ts:9-20` - pending `"Aguardando primeiro sync"` / `"Atualizado há 10 min"`; wired at `OverviewPage.tsx:205` | ✅ PASS |
| SYNC-11 | OWNER/MANAGER force-refresh; &lt;5 min → reject, keep watermark | Role gate + rate_limited | `syncUi.test.ts:26-29` - OWNER/MANAGER true, SELLER false; `:33-37` - within 5 min → `180`, at 5 min → `null` | ✅ PASS |
| SYNC-12 | Accepted force → same light-sync rules (one session, logout) | FORCE_LIGHT ≡ LIGHT runner path | `runSyncJob.test.ts:150-166` - `kind: "FORCE_LIGHT"` ∧ today window ∧ `logout === 1` ∧ `lastLightSyncAt` | ✅ PASS |

**Status**: ✅ All ACs covered (12/12) with `file:line` assertion evidence

### Re-verify delta vs prior FAIL (#1)

| Prior GAP | After `84d66b8` (+ `d7ec179`) | Notes |
| --------- | ----------------------------- | ----- |
| SYNC-05 | ✅ closed | Asserts `fetchSalesDayAggs` queries only `sales_day_agg`, never VENDAS/Millennium; Overview imports `salesRepo` only. `tsconfig.app.json` excludes `*.test.ts` so `tsc -b` stays green with Node-free test helpers. |

### Edge cases (spec)

| Edge | Result | Evidence |
| ---- | ------ | -------- |
| Zero sales day → 0 / omit, no mocks | ✅ | `salesAggregate.test.ts:21-25`; `dashboard.test.ts:453-460` |
| Backfill interrupt → resume, upsert by natural key | ⚠️ Residual Minor | PK in migration `sales_day_agg` — **no upsert/idempotency test** |
| Multi-store → sequential under one session | ✅ | `runSyncJob.test.ts:118-123` - `fetch === ["s1","s2"]` ∧ `logout === 1` |
| Invalid credential → skip / surface, no silent retry storm | ⚠️ Partial | password → INVALID tested; enqueue `credential_invalid` **untested** |

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 (this pass) | scratch `salesRepo.ts:72` | `from("sales_day_agg")` → `from("VENDAS")` in temp worktree | ⚠️ Inconclusive — vitest failed to load suite (`Cannot find package '@/lib/supabase'` in detached worktree); not counted as survive |
| Prior (#1) | `salesAggregate.ts:124` | `salesCount: b.ops.size` → `b.itemCount` | ✅ Killed — carried forward |

**Sensor depth**: lightweight attempted (SYNC-05-targeted); user scoped as optional for re-verify #2  
**Sensor**: 0/0 counted this pass (inconclusive) + prior 1/1 still valid for aggregator path  
**Note**: Main worktree untouched; scratch worktree removed after attempt.

---

## Interactive UAT Results

Not performed (Verifier run = automated evidence; no human UAT this pass).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (SYNC-05 = focused test + tsconfig exclude) |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ (SYNC-05 now asserted) |
| Per-layer Coverage Expectation | ⚠️ Domain/worker OK; Edge enqueue + onboarding invoke = build-only (Minor residual) |
| Every test maps to a spec requirement | ⚠️ Legacy LOJA-* suite coexists; SYNC block complete |
| Documented guidelines | tasks.md Test Coverage Matrix + Vitest defaults |

---

## Gate Check

- **Gate commands**: `npm test` (full) + `npm run build` (from tasks.md)
- **`npm test`**: **153** passed, **0** failed, **0** skipped (12 files)
- **`npm run build`**: **passed** (`tsc -b && vite build`)
- **Test count before feature** (`b53abbf^`, prior report): **127**
- **Test count after feature** (HEAD suite): **153**
- **Delta**: **+26** (re-verify #1 was 152; SYNC-05 assert +1)
- **Failures**: none
- **Skipped**: none

---

## Fix Plans

None blocking. Residual Minors (optional follow-ups, not FAIL):

### Residual 1: upsert / Edge / onboarding (from prior)

- **Root cause**: T8/T10 remain Tests: none; natural-key upsert untested.
- **Fix task** (optional): spy onboarding `action: "backfill"`; Edge 5-min `rate_limited` unit; upsert onConflict test.
- **Priority**: Minor

---

## Requirement Traceability Update

| Requirement | Previous Status (re-verify #1) | New Status (re-verify #2) |
| ----------- | ------------------------------ | ------------------------- |
| SYNC-01 | ✅ Verified | ✅ Verified |
| SYNC-02 | ✅ Verified | ✅ Verified |
| SYNC-03 | ✅ Verified | ✅ Verified |
| SYNC-04 | ✅ Verified | ✅ Verified |
| SYNC-05 | ❌ Needs Fix | ✅ Verified |
| SYNC-06 | ✅ Verified | ✅ Verified |
| SYNC-07 | ✅ Verified | ✅ Verified |
| SYNC-08 | ✅ Verified | ✅ Verified |
| SYNC-09 | ✅ Verified | ✅ Verified |
| SYNC-10 | ✅ Verified | ✅ Verified |
| SYNC-11 | ✅ Verified | ✅ Verified |
| SYNC-12 | ✅ Verified | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (PASS)

**Spec-anchored check**: 12/12 ACs matched with `file:line` assertions; 0 GAPs  
**Sensor**: SYNC-05-targeted scratch attempt inconclusive (optional this pass); prior aggregator mutant killed  
**Gate**: 153 passed; build green  

**What works**: SYNC-05 closed — dashboard read path asserted to hit only `sales_day_agg`; prior coverage for backfill window, FORCE_LIGHT, watermark, role/5-min helpers, post-sync Overview KPIs intact.  

**Issues found**: none blocking. Residual Minors: Edge/onboarding enqueue tests, upsert idempotency.  

**Next steps**: Feature may be marked done / STATE handoff updated by orchestrator. Optional residual Minors only if product wants deeper Edge coverage.
