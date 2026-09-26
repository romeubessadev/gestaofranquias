# ERP Integration — Specification

## Problem Statement

A integração Millennium → WeDash ficou com fluxo sujo: muitos modos, tela de sync instável, logout/presença brigando com histórico assíncrono, e risco de concorrência com código legado. O gestor precisa “logar” o ERP na WeDash, popular KPIs com uma primeira carga confiável, atualizar o dia sem travar o ERP em ranges grandes, e puxar histórico antigo em background — com logs claros e sem consultar o Millennium no page load do dashboard.

## Goals

- [ ] Onboarding grava USER/SENHA/token; troca de usuário ERP limpa dados de sync do tenant.
- [ ] SEED = mês anterior + mês atual até hoje; SyncingPage libera só com essa cobertura no banco.
- [ ] LIGHT = hoje (1× Lista sem filial); FORCE = período filtrado com filial/mês + sempre hoje.
- [ ] HISTORY = mês a mês até teto 24 meses / inauguração, podendo rodar com WeDash deslogado enquanto Integração ERP estiver conectada.
- [ ] Logout WeDash ≠ logout Millennium; desconectar ERP só em Configurações > Integração ERP.
- [ ] Remover caminhos legados que concorrem com este contrato.
- [ ] Dashboard continua lendo só agregados Postgres (zero Millennium no read path).

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| CMV / margem / estoque / outras APIs | Depois do fluxo VENDAS estável |
| Persistência de payload JSON bruto de todas as APIs | Depara multi-API = feature futura |
| Exigir usuário ERP dedicado (hard block) | Copy recomendada; enforce depois |
| Worker multi-host com lease distribuído | MVP = 1 processo |
| CRUD completo de lojas/credencial além de conectar/desconectar | Integração mínima |
| Reescrever Visão Geral / outros dashboards | Já leem agregados; só garantir contrato de dados |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Janela SEED | Mês anterior + mês atual → hoje | Dashboard “este mês / vs mês ant.” usável | y |
| SyncingPage | Mantém até cobertura SEED | Evita dashboard vazio; corrigir bugs atuais | y |
| Logout WeDash | Não chama logout Millennium | Permite HISTORY com gestor offline | y |
| Desconectar ERP | Botão em Configurações > Integração ERP | Libera user no Millennium sob demanda | y |
| Persistência v1 | Só `sales_day_agg` / `sales_hour_agg` | Clean; rollback = re-sync | y |
| Lista sem filial | Só ranges de 1 dia | Probe: 30d sem filial timeout | y |
| ListaTodos | Não usar | HTTP 400 atributos | y |
| HISTORY teto | 24 meses ou `store.opened_at` (o mais recente) | Produto acordado | y |
| Gate de presença (AD-020) | **Superseded** — sync se Integração conectada (`!sync_paused` + token/credencial válida) | Alinhado ao botão Integrações | y |
| Limpeza legado | Remover concorrência (presence gate obrigatório, logout ERP no signOut, spam locked, paralelismo agressivo default) | Fluxo único | y |
| Intervalo LIGHT | Manter 2 min dedicada / 30 min compartilhada | Já no produto | y |
| Force rate limit | OWNER/MANAGER, 1× / 5 min, máx. 90 dias | Evita abuso | y |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Credencial ERP no onboarding ⭐ MVP

**User Story**: As an OWNER, I want to connect my Millennium user/password during onboarding and have the session stored on my tenant so the WeDash keeps that ERP login until I disconnect it.

**Why P1**: Sem credencial + token não há sync.

**Acceptance Criteria**:

1. WHEN the user successfully tests Millennium credentials on onboarding step 2 THEN the system SHALL persist username, encrypted password, and session token on `erp_credential` for that tenant.
2. WHEN the tested Millennium username differs from the previously stored username for the tenant THEN the system SHALL logout the previous token when possible, delete that tenant’s ERP-linked stores, sales aggregates, and sync jobs/runs, THEN persist the new credential and token.
3. WHEN the username is unchanged and only the password changes THEN the system SHALL update the encrypted password and token WITHOUT deleting stores or aggregates.
4. IF Millennium returns invalid password or busy THEN the system SHALL NOT persist a new credential/token as successful and SHALL show a clear error (password vs session occupied).
5. The system SHALL NOT enqueue SEED until onboarding completes with confirmed stores.

**Independent Test**: Test login → row in `erp_credential` with token; change to another username → old aggs/stores gone; finish stores → SEED queued once.

---

### P2: SEED + SyncingPage ⭐ MVP

**User Story**: As an OWNER finishing onboarding, I want a first sync of last month + current month and a syncing screen that only releases me when that data is ready so the dashboard is usable.

**Why P1/P2**: Vertical slice — dado real + UX de espera correta.

**Acceptance Criteria**:

1. WHEN onboarding completes with valid credential and confirmed stores THEN the system SHALL enqueue exactly one SEED job (deduped if already queued/running) covering previous calendar month start through today for each confirmed store.
2. WHILE SEED coverage for previous-month-start→today is incomplete for the tenant’s confirmed stores the SyncingPage SHALL remain and SHALL reflect real job state (queued / running / busy / failed) without fake “done” steps.
3. WHEN SEED coverage previous-month-start→today exists in aggregates for confirmed stores THEN the SyncingPage SHALL navigate to the dashboard.
4. IF SEED fails with busy THEN the SyncingPage SHALL show that the Millennium user is occupied and SHALL allow retry without marking connecting steps as success.
5. WHEN SEED runs THEN the worker SHALL call `VENDAS.Lista` **with** filial, **one store at a time**, windows **by calendar month** (not all-stores multi-week without filial).

**Independent Test**: Complete onboarding → SyncingPage → after SEED, aggs cover last month + this month; leaving SyncingPage early is impossible until coverage check passes.

---

### P3: LIGHT + FORCE (dia e reparo)

**User Story**: As a MANAGER, I want today’s sales kept fresh and a manual refresh for the filtered period so gaps can be repaired without calling Millennium on every page load.

**Why P2**: Operação diária após o SEED.

**Acceptance Criteria**:

1. WHEN the integration is connected (`sync_paused` is false) and a LIGHT job is due THEN the worker SHALL fetch **today only** with a single `VENDAS.Lista` call **without** filial and split rows by `FILIAL` into per-store aggregates.
2. WHEN OWNER/MANAGER triggers Atualizar with a date range THEN the system SHALL enqueue FORCE for that range (max 90 days), fill missing days per store with filial-scoped monthly windows, and SHALL always include today.
3. IF a FORCE was enqueued for the tenant within the last 5 minutes THEN the system SHALL reject with rate_limited and retry-after seconds.
4. The dashboard read path SHALL NOT call Millennium.

**Independent Test**: LIGHT upserts today for all stores in one Lista call; FORCE on a week repairs holes + today; Overview still only hits aggregate tables.

---

### P4: HISTORY em background

**User Story**: As a franchise owner, I want older months filled in over time (up to 24 months or store open date) so long-range charts work without blocking first use.

**Why P2**: Não bloqueia MVP visual; completa o produto.

**Acceptance Criteria**:

1. WHEN SEED succeeds and older months remain above the history floor THEN the system SHALL enqueue HISTORY one calendar month at a time per tenant.
2. WHILE Integração ERP is connected the worker SHALL be allowed to process HISTORY even if no WeDash browser session is active.
3. WHEN HISTORY reaches the floor (max 24 months back or `opened_at`, whichever is later) THEN the system SHALL stop enqueueing further HISTORY for that store/tenant.
4. HISTORY SHALL use `VENDAS.Lista` with filial and monthly windows, sequential stores.

**Independent Test**: After SEED, HISTORY jobs appear month-by-month; with WeDash logged out but integration connected, worker still processes HISTORY.

---

### P5: Desconectar ERP em Configurações ⭐ MVP

**User Story**: As an OWNER, I want a control in Settings to disconnect Millennium so I can use that ERP user outside WeDash.

**Why P1**: Substitui logout ERP no “Sair” da WeDash.

**Acceptance Criteria**:

1. WHEN the user signs out of WeDash THEN the system SHALL NOT logout the Millennium session and SHALL NOT clear `millennium_session` solely because of WeDash sign-out.
2. WHEN the user activates Desconectar (or equivalent) on Configurações > Integração ERP THEN the system SHALL logout Millennium with the stored token when present, clear the token, and set `sync_paused` true so the worker stops claiming jobs for that tenant.
3. WHEN the user reconnects/resumes integration THEN the system SHALL clear `sync_paused` and allow jobs again (re-login if token missing).
4. WHERE a minimal Integrações UI is shown it SHALL indicate connected vs paused/disconnected.

**Independent Test**: Sair WeDash → token still in DB; Desconectar → token null + sync_paused; worker idles for that tenant.

---

### P6: Limpeza do fluxo legado

**User Story**: As a developer/operator, I want a single sync contract so old presence/logout/parallel paths do not race the new one.

**Why P1**: Sem limpeza, “muito sujo” volta.

**Acceptance Criteria**:

1. The system SHALL NOT require `wedash_present_at` heartbeat as a condition to claim sync jobs.
2. The WeDash `signOut` path SHALL NOT invoke Millennium pause/logout.
3. Default store fetch concurrency for multi-day/SEED/HISTORY SHALL be sequential (one store at a time); LIGHT all-stores-in-one-call does not open N Lista calls.
4. WHEN a credential already has a RUNNING job THEN the worker SHALL skip other jobs for that credential without marking them FAILED in a tight loop or spamming locked errors.
5. Obsolete comments/copy that promise “logout ERP on WeDash exit” or “sync only while tab open” SHALL be updated to match this spec.

**Independent Test**: Grep/tests: no presence gate in claim; signOut does not call pause; no FAILED-locked storm with one RUNNING + one QUEUED.

---

### P7: Observabilidade mínima

**User Story**: As an operator, I want one clear log line per job start/end/failure so I can act when sync breaks.

**Why P2**: Transparência pedida pelo gestor.

**Acceptance Criteria**:

1. WHEN a job starts THEN the worker SHALL log tenant (short id), job kind, and job id prefix.
2. WHEN a job finishes THEN the worker SHALL log success or failure reason (busy / password / other) and duration or stores done.
3. IF Millennium returns busy THEN the system SHALL persist `last_error` / `last_error_at` on the credential for UI/ops.

**Independent Test**: Run one SEED → exactly start+end lines; force busy → error fields set, no stack spam every poll.

---

## Edge Cases

- IF Millennium timeout on a monthly window THEN the system SHALL fail that window/job with a persisted error and SHALL leave prior successful months intact (no wipe).
- IF stores list is empty after login THEN onboarding SHALL block completion and SHALL NOT enqueue SEED.
- IF FORCE range exceeds 90 days THEN the system SHALL reject with range_too_large.
- IF token is invalid (401) THEN the worker SHALL renew login with stored password once, update token, and retry; IF password fails THEN mark credential INVALID and stop.
- IF user opens Integrações Desconectar during RUNNING job THEN the system SHALL pause further claims; in-flight job SHOULD finish or fail cleanly without leaving an undocumented session (best-effort logout on disconnect).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| ERPI-01 | P1: Persist credential on test | Design | Pending |
| ERPI-02 | P1: Username change wipes ERP data | Design | Pending |
| ERPI-03 | P1: Password-only update keeps data | Design | Pending |
| ERPI-04 | P1: Busy/password no false persist | Design | Pending |
| ERPI-05 | P1: No SEED before onboarding done | Design | Pending |
| ERPI-06 | P2: SEED window month-1 → today | Design | Pending |
| ERPI-07 | P2: SyncingPage until coverage | Design | Pending |
| ERPI-08 | P2: Release on coverage | Design | Pending |
| ERPI-09 | P2: Busy UX on SyncingPage | Design | Pending |
| ERPI-10 | P2: SEED Lista with filial monthly sequential | Design | Pending |
| ERPI-11 | P3: LIGHT today without filial | Design | Pending |
| ERPI-12 | P3: FORCE range + today | Design | Pending |
| ERPI-13 | P3: FORCE rate limit 5 min | Design | Pending |
| ERPI-14 | P3: No Millennium on dashboard read | Design | Pending |
| ERPI-15 | P4: HISTORY month-by-month | Design | Pending |
| ERPI-16 | P4: HISTORY without WeDash session | Design | Pending |
| ERPI-17 | P4: HISTORY floor 24m / opened_at | Design | Pending |
| ERPI-18 | P4: HISTORY filial monthly sequential | Design | Pending |
| ERPI-19 | P5: SignOut keeps Millennium | Design | Pending |
| ERPI-20 | P5: Integrações disconnect | Design | Pending |
| ERPI-21 | P5: Resume integration | Design | Pending |
| ERPI-22 | P5: UI connected vs paused | Design | Pending |
| ERPI-23 | P6: No presence claim gate | Design | Pending |
| ERPI-24 | P6: SignOut no ERP pause | Design | Pending |
| ERPI-25 | P6: Sequential stores for SEED/HISTORY | Design | Pending |
| ERPI-26 | P6: No locked FAILED spam | Design | Pending |
| ERPI-27 | P6: Copy/comments match contract | Design | Pending |
| ERPI-28 | P7: Start/end job logs | Design | Pending |
| ERPI-29 | P7: Persist busy/password errors | Design | Pending |

**Coverage:** 29 total, 0 mapped to tasks, 29 unmapped

---

## Success Criteria

- [ ] Pós-onboarding, SyncingPage libera com agregados cobrindo mês anterior + mês atual.
- [ ] Sair da WeDash não libera o user no Millennium; Desconectar em Integrações libera.
- [ ] LIGHT atualiza hoje sem N chamadas por loja; ranges grandes nunca usam Lista sem filial.
- [ ] HISTORY avança com Integração conectada e WeDash fechado.
- [ ] Nenhum path legado de presence/logout no signOut compete com o novo contrato.
- [ ] Operador identifica falha (busy/senha/timeout) em log + `last_error` sem spam.
