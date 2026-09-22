# ERP Integration — Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/erp-integration/design.md`  
**Status**: In Progress

---

## Test Coverage Matrix

> Guidelines found: `package.json` (`test` / `build` / `lint`); Vitest under `src/data/wedash/*.test.ts` and `workers/millennium-sync/src/*.test.ts`. Strong defaults for domain/worker logic.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Worker sync domain (`runSyncJob`, `millenniumSales`, claim helpers) | unit | SEED window; LIGHT null-filial path; concurrency default 1; claim ignores presence; no locked-FAILED storm | `workers/millennium-sync/src/*.test.ts` | `npm test -- workers/millennium-sync` |
| App data (`erp.ts` helpers if pure) | unit | Prefer pure helpers; Edge-facing wrappers may be build-only | `src/data/wedash/*.test.ts` | `npm test -- src/data/wedash` |
| Session / SyncingPage / Settings UI | none | build gate | `src/session/*`, `src/pages/**` | `npm run build` |
| Edge Functions / SQL wipe | none | build gate + manual/smoke note in Done when | `supabase/functions/**` | `npm run build` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Worker unit tasks | `npm test -- workers/millennium-sync` |
| Full | After worker + app data | `npm test` |
| Build | UI / Edge / session / phase end | `npm run build` |

---

## Execution Plan

### Phase 1: Legacy strip (unlock contract)

```
T1 → T2
T1 → T3
```

### Phase 2: Credential persist + username wipe

```
T4 → T5 → T6
```

### Phase 3: Worker Lista contract (LIGHT + sequential)

```
T7 → T8
T1 → T9
```

### Phase 4: SyncingPage

```
T10
```

### Phase 5: Integração ERP settings

```
T11 → T12
```

### Phase 6: Logs + copy alignment

```
T13 → T14
```

---

## Task Breakdown

### Phase 1: Legacy strip

### T1: Remove presence gate from job claim / LIGHT enqueue

**What**: Stop requiring `wedash_present_at` when claiming QUEUED jobs or enqueueing LIGHT; keep only `sync_paused` + VALID + no RUNNING sibling.  
**Where**: `workers/millennium-sync/src/deps.ts`  
**Depends on**: None  
**Reuses**: Existing claim loop  
**Requirement**: ERPI-23, ERPI-16

**Done when**:

- [x] `claimNextJob` does not skip for stale/missing `wedash_present_at`
- [x] `enqueueDueLightJobs` does not require presence
- [x] Unit coverage asserts claim allowed when `sync_paused=false` without present_at
- [x] Gate: `npm test -- workers/millennium-sync` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `fix(sync): drop WeDash presence gate from job claim`

---

### T2: Default store Lista concurrency to 1

**What**: Change `storeFetchConcurrency` so default is sequential (1), not “all stores in parallel”.  
**Where**: `workers/millennium-sync/src/runSyncJob.ts`  
**Depends on**: T1  
**Reuses**: Existing `STORE_CONCURRENCY` env override  
**Requirement**: ERPI-25, ERPI-10, ERPI-18

**Done when**:

- [ ] Default concurrency is 1 when env unset/0
- [ ] Unit test locks default = 1
- [ ] Gate: `npm test -- workers/millennium-sync` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `fix(sync): default STORE_CONCURRENCY to sequential`

---

### T3: Stop ERP pause/logout on WeDash signOut

**What**: Remove `pauseErpForLogout` and presence heartbeat from session lifecycle so WeDash logout leaves Millennium token intact.  
**Where**: `src/session/SessionProvider.tsx`  
**Depends on**: T1  
**Reuses**: `logoutAuth` only  
**Requirement**: ERPI-19, ERPI-24

**Done when**:

- [ ] `signOut` does not call Millennium pause/release
- [ ] No `touchErpPresence` interval on mount
- [ ] Comments updated to match AD-021
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `fix(session): keep Millennium session on WeDash logout`

---

### Phase 2: Credential persist + wipe

### T4: Edge wipe tenant ERP sync data on username change

**What**: When persisting a different Millennium username, logout old token and delete tenant sales aggs, sync jobs/runs, ERP stores, membership_store links before saving the new credential.  
**Where**: `supabase/functions/erp-credential-persist/index.ts`  
**Depends on**: T3  
**Reuses**: Existing upsert credential + store loops  
**Requirement**: ERPI-02, ERPI-01

**Done when**:

- [ ] Same username → no wipe; password/token update only
- [ ] Different username → wipe listed tables then upsert
- [ ] Token saved when provided
- [ ] Gate: `npm run build` passes (Edge not in vitest)

**Tests**: none  
**Gate**: build  
**Commit**: `feat(erp): wipe tenant sync data when ERP username changes`

---

### T5: Persist credential on Step2 test success

**What**: On successful ERP test in onboarding Step2, call persist (password + token) before navigating to stores — without enqueueing SEED.  
**Where**: `src/pages/onboarding/Onboarding.tsx`  
**Depends on**: T4  
**Reuses**: `persistErpCredentialAndStores` / Edge invoke; may need persist-without-stores or empty stores allowed — if stores required today, persist credential-only path in Edge first (same file as T4) then wire here  
**Requirement**: ERPI-01, ERPI-05

**Done when**:

- [ ] Successful test writes `erp_credential` (+ token)
- [ ] SEED is NOT enqueued at Step2
- [ ] Failed busy/password does not mark success persist
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `feat(onboarding): persist ERP credential on Step2 test`

---

### T6: Keep conclude path: stores + SEED only

**What**: Onboarding conclude confirms stores and enqueues SEED once; does not re-logout Millennium; does not duplicate credential wipe.  
**Where**: `src/pages/onboarding/Onboarding.tsx`  
**Depends on**: T5  
**Reuses**: Existing `persistErpCredentialAndStores` + `erp-sync-enqueue` seed  
**Requirement**: ERPI-05, ERPI-06

**Done when**:

- [ ] Conclude upserts stores + membership_store
- [ ] Enqueues SEED (dedupe-safe)
- [ ] Does not call logout ERP on confirm
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `fix(onboarding): conclude only confirms stores and enqueues SEED`

---

### Phase 3: Worker Lista contract

### T7: Support VENDAS.Lista with FILIAL null

**What**: Allow Lista body without filial (null) for single-day fetches; map rows preserving Millennium FILIAL for later partition.  
**Where**: `workers/millennium-sync/src/millenniumSales.ts`  
**Depends on**: T2  
**Reuses**: `uiBody`, `mapVendasListaPayload`  
**Requirement**: ERPI-11

**Done when**:

- [ ] Optional null filial in request body
- [ ] Unit test covers null-filial body shape and row FILIAL extraction
- [ ] Gate: `npm test -- workers/millennium-sync` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(sync): allow VENDAS.Lista without FILIAL for single-day sync`

---

### T8: LIGHT uses one all-stores Lista for today

**What**: LIGHT job fetches today once with FILIAL null, partitions by filial into store aggs (evento union).  
**Where**: `workers/millennium-sync/src/runSyncJob.ts`  
**Depends on**: T7  
**Reuses**: `seedWindow` untouched; store list + millennium id map  
**Requirement**: ERPI-11, ERPI-14

**Done when**:

- [ ] LIGHT does not loop N Lista-per-store for today
- [ ] Unit test stubs one Lista call for multi-store LIGHT
- [ ] Gate: `npm test -- workers/millennium-sync` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `feat(sync): LIGHT fetches all stores in one Lista call`

---

### T9: Skip QUEUED when credential already RUNNING (no FAILED spam)

**What**: Ensure locked/contention path leaves job QUEUED and stops poll burst without FAILED+log spam.  
**Where**: `workers/millennium-sync/src/deps.ts`  
**Depends on**: T1  
**Reuses**: Existing `processOneJob` locked → return false  
**Requirement**: ERPI-26

**Done when**:

- [ ] Contended job not marked FAILED as `locked`
- [ ] Unit or behavioral test documents skip behavior
- [ ] Gate: `npm test -- workers/millennium-sync` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `fix(sync): avoid FAILED locked loop when job already RUNNING`

---

### Phase 4: SyncingPage

### T10: SyncingPage unlocks only on SEED coverage

**What**: Align stages to real SEED job; busy does not check ✓; navigate only when aggregates cover previous-month-start→today.  
**Where**: `src/pages/onboarding/SyncingPage.tsx`  
**Depends on**: T6, T8  
**Reuses**: `fetchSyncReady`, `fetchLatestSeedJob`, `seedWindow`  
**Requirement**: ERPI-07, ERPI-08, ERPI-09

**Done when**:

- [ ] Coverage gate uses SEED window (mês ant. → hoje)
- [ ] Busy shows retry without false success stages
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `fix(onboarding): SyncingPage waits for SEED coverage`

---

### Phase 5: Integração ERP settings

### T11: Create Integração ERP settings page

**What**: Page showing Millennium username, connected/paused, last success/error, Desconectar and Retomar buttons.  
**Where**: `src/pages/settings/ErpIntegrationPage.tsx`  
**Depends on**: T3  
**Reuses**: Vela `Card`/`Button`/`Badge`; `releaseErpSession` / `resumeErpSync`  
**Requirement**: ERPI-20, ERPI-21, ERPI-22

**Done when**:

- [ ] OWNER can disconnect (pause + logout ERP) and resume
- [ ] UI reflects `sync_paused` / username (no password shown)
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `feat(settings): add Integração ERP disconnect page`

---

### T12: Wire `/configuracoes/erp` to real page

**What**: Replace ComingSoon ERP route with `ErpIntegrationPage`.  
**Where**: `src/pages/coming-soon/routes.tsx`  
**Depends on**: T11  
**Reuses**: `paths.settings.erp`  
**Requirement**: ERPI-22, ERPI-27

**Done when**:

- [ ] Nav “Integração ERP” opens real page
- [ ] ComingSoon stub removed for that path
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `feat(settings): route Integração ERP to live page`

---

### Phase 6: Logs + copy

### T13: Structured one-line job start/end logs

**What**: Emit compact start/ok/fail logs with kind, tenant prefix, job prefix, reason; remove noisy locked messages.  
**Where**: `workers/millennium-sync/src/runSyncJob.ts`  
**Depends on**: T8, T9  
**Reuses**: Existing console  
**Requirement**: ERPI-28, ERPI-29

**Done when**:

- [ ] Start and end lines present for success and busy/password fail
- [ ] Credential `last_error` still set on busy/password
- [ ] Gate: `npm test -- workers/millennium-sync` passes

**Tests**: unit  
**Gate**: quick  
**Commit**: `chore(sync): add structured job start/end logs`

---

### T14: Align product copy with AD-021 / AD-022

**What**: Update CLAUDE.md and worker startup banner so docs match: disconnect in Integrações; SEED window; LIGHT today without filial.  
**Where**: `CLAUDE.md`  
**Depends on**: T12, T13  
**Reuses**: Existing decision list style  
**Requirement**: ERPI-27

**Done when**:

- [ ] No “Sair libera ERP” / “sync só com aba aberta” as active rules
- [ ] SEED/LIGHT/HISTORY contract documented
- [ ] Gate: `npm run build` passes

**Tests**: none  
**Gate**: build  
**Commit**: `docs(erp): align CLAUDE with Integração ERP sync contract`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6

Phase 1:  T1 → T2
          T1 → T3
Phase 2:  T4 → T5 → T6
Phase 3:  T7 → T8
          T1 → T9
Phase 4:  T10
Phase 5:  T11 → T12
Phase 6:  T13 → T14
```

Note: T10 also depends on T6+T8; T11 on T3; T13 on T8+T9; T14 on T12+T13 (see task bodies).

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 file claim logic | ✅ |
| T2 | 1 function concurrency | ✅ |
| T3 | 1 session provider | ✅ |
| T4 | 1 Edge function wipe | ✅ |
| T5 | Step2 persist wire | ✅ |
| T6 | Conclude SEED wire | ✅ |
| T7 | Lista null filial | ✅ |
| T8 | LIGHT path | ✅ |
| T9 | locked skip | ✅ |
| T10 | SyncingPage | ✅ |
| T11 | Settings page | ✅ |
| T12 | Route wire | ✅ |
| T13 | Logs | ✅ |
| T14 | Docs | ✅ |

---

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram / plan | Status |
| ---- | ----------------- | -------------- | ------ |
| T1 | None | Phase1 start | ✅ |
| T2 | T1 | T1→T2 | ✅ |
| T3 | T1 | T1→T3 | ✅ |
| T4 | T3 | after Phase1 | ✅ |
| T5 | T4 | T4→T5 | ✅ |
| T6 | T5 | T5→T6 | ✅ |
| T7 | T2 | after T2 | ✅ |
| T8 | T7 | T7→T8 | ✅ |
| T9 | T1 | T1→T9 | ✅ |
| T10 | T6, T8 | after Phase2+3 | ✅ |
| T11 | T3 | after T3 | ✅ |
| T12 | T11 | T11→T12 | ✅ |
| T13 | T8, T9 | after Phase3 | ✅ |
| T14 | T12, T13 | T12/T13→T14 | ✅ |

---

## Test Co-location Validation

| Task | Layer | Matrix Requires | Task Says | Status |
| ---- | ----- | --------------- | --------- | ------ |
| T1 | Worker domain | unit | unit | ✅ |
| T2 | Worker domain | unit | unit | ✅ |
| T3 | Session UI | none | none | ✅ |
| T4 | Edge | none | none | ✅ |
| T5 | Onboarding UI | none | none | ✅ |
| T6 | Onboarding UI | none | none | ✅ |
| T7 | Worker domain | unit | unit | ✅ |
| T8 | Worker domain | unit | unit | ✅ |
| T9 | Worker domain | unit | unit | ✅ |
| T10 | SyncingPage UI | none | none | ✅ |
| T11 | Settings UI | none | none | ✅ |
| T12 | Routes | none | none | ✅ |
| T13 | Worker domain | unit | unit | ✅ |
| T14 | Docs | none | none | ✅ |

---

## Requirement Traceability (task map)

| Requirement | Tasks |
| ----------- | ----- |
| ERPI-01 | T4, T5 |
| ERPI-02 | T4 |
| ERPI-03 | T4 |
| ERPI-04 | T5 |
| ERPI-05 | T5, T6 |
| ERPI-06 | T6, T10 |
| ERPI-07–09 | T10 |
| ERPI-10 | T2 |
| ERPI-11 | T7, T8 |
| ERPI-12–14 | T8 (FORCE already; verify no dash Millennium) |
| ERPI-15–18 | T2 (+ existing HISTORY; no new task if unchanged) |
| ERPI-19,24 | T3 |
| ERPI-20–22 | T11, T12 |
| ERPI-23 | T1 |
| ERPI-25 | T2 |
| ERPI-26 | T9 |
| ERPI-27 | T12, T14 |
| ERPI-28–29 | T13 |
