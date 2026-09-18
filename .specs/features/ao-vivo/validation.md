# Ao vivo — Validation Report

**Verifier:** Independent (author ≠ verifier)  
**Date:** 2026-09-18  
**Verdict:** **PASS** (P1/P2 ACs satisfied; gaps noted below)

---

## Test Gate

| Command | Result |
| --- | --- |
| `npm test -- src/data/gestao/aoVivo.test.ts` | **PASS** — 6/6 tests, exit 0, ~341ms |

---

## P1: Navegação e shell (AOVIVO-01)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. Sidebar **Ao vivo** between Dashboard and Config (alongside Metas) | ✅ | `src/layout/nav-gestao.ts:18-31` — order: Dashboard (18) → Ao vivo (29) → Metas (30) → Configurações (32). Same for gerente nav at `:49-51`. |
| 2. Page at `/ao-vivo` | ✅ | `src/router/paths.ts:44-45` (`root: "/ao-vivo"`); `src/pages/ao-vivo/routes.tsx:14`; wired in `src/router/router.tsx:66`. |
| 3. Topbar store selector scopes Ao vivo data | ✅ | `src/layout/Topbar.tsx:36-37,54-56` (SeletorLoja on `/ao-vivo*`); `src/pages/ao-vivo/AoVivoPage.tsx:44,51-53` (`useEscopo` → `montarAoVivoView(escopo)`). |
| 4. No company/tenant block in header | ✅ | `src/pages/ao-vivo/AoVivoPage.tsx:70-72` — `PageHeader` title/subtitle only; no empresa/tenant markup (grep clean). |
| 5. Header actions **Compartilhar** and **Modo TV** | ✅ | `src/pages/ao-vivo/AoVivoPage.tsx:82-87`. |
| 6. Compartilhar → `/ao-vivo/compartilhar` | ✅ | `AoVivoPage.tsx:82` → `paths.aoVivo.compartilhar` (`paths.ts:46`); shell `routes.tsx:15`, `CompartilharPage.tsx:6-28`. |
| 7. Modo TV → `/ao-vivo/tv` | ✅ | `AoVivoPage.tsx:85-86` → `paths.aoVivo.tv` (`paths.ts:47`); shell `routes.tsx:16`, `TvPage.tsx:6-28`. |

---

## P1: Indicadores mês + pulso do dia (AOVIVO-02)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. Four indicators: Total de Vendas, Faturamento, Meta Mensal, Atingimento | ✅ | Labels defined `src/data/gestao/aoVivo.ts:212-233`; rendered `AoVivoPage.tsx:92-107`. Test: `aoVivo.test.ts:12-18`. |
| 2. Vendas + Faturamento: month primary, today secondary | ✅ | `aoVivo.ts:213-221` — `valor` = month MTD, `sub` = `` `Hoje ${...}` ``. Test: `aoVivo.test.ts:15-16`. |
| 3. Meta Mensal = goal amount; Atingimento = % of goal from month revenue | ✅ | `aoVivo.ts:205-210,223-232` — `metaAlvo`, `atingimentoPct`, `brlK(mes.faturamento)`. |
| 4. No global Hoje/Mês toggle | ✅ | No toggle/Segmented for period in `src/pages/ao-vivo/*` (grep: no Semestre/Ano/Hoje/Mês toggle). |
| 5. Zero sales → 0 values, no error | ✅ (code) / ⚠️ (test) | Domain uses `num(0)` / `brlK(0)` / `pct(0)` paths (`aoVivo.ts:215-216,210-211`). **No dedicated unit test** for zero month/today (see gaps). |

---

## P1: Aba Ranking (AOVIVO-03)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. Rank sellers by faturamento desc, month MTD, store scope | ✅ | `aoVivo.ts:235-250` — `fatVendedorNoPeriodo(c, mesInicio, mesFim)`, sort `b.ag.faturamento - a.ag.faturamento`. Test: `aoVivo.test.ts:21-27`. |
| 2. Top-3 podium (avatar, name, sales, faturamento) when ≥3 sellers with month sales | ⚠️ | Podium UI `blocos.tsx:21-48` (Avatar, vendas, `brlK`). **Condition is `top3.length >= 1`** (`blocos.tsx:26`), not `>= 3` — podium renders with 1–2 sellers too. Spec sufficient-condition only; behavior is permissive, not wrong, but imprecise vs “top-3 podium”. |
| 3. Complete ranking list when sellers in scope | ✅ | `blocos.tsx:51-77` — full table for all `ranking` rows. |
| 4. No month sales → empty state, no podium | ✅ | `blocos.tsx:12-18` — `EmptyState` when `ranking.length === 0`. |
| 5. No Semestre/Ano period tabs | ✅ | Absent from `src/pages/ao-vivo/*` (grep). |
| 6. Vela primitives (Card, Avatar, Badge), not dark neon | ✅ | `blocos.tsx:1,14,32,67,39` — Vela tokens (`bg-bg-inset`, `text-acc`, etc.). |

---

## P1: Aba Desafios (AOVIVO-04)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. Active challenges as cards (title, rule, time, prize, progress) | ✅ | `blocos.tsx:82-110` — `CardDesafio` with `nome`, `objetivo`, `prazoRotulo`, `premio`, `acumuladoRotulo`, `ProgressBar`. Domain: `aoVivo.ts:252-285`. |
| 2. Top 3 participants when challenge has participants | ✅ | `blocos.tsx:99-106` (`d.top3`); built `aoVivo.ts:267` (`parts.slice(0, 3)`). |
| 3. No active challenges → empty state | ✅ | `blocos.tsx:113-114`. Test proxy: `aoVivo.test.ts:36-40`. |

---

## P1: Aba Metas (AOVIVO-05)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. Competence progress (% and R$ realized / R$ target) | ✅ | `blocos.tsx:136-138`; domain `aoVivo.ts:331-336`. |
| 2. **Por Vendedor** and **Por Grupo** views | ✅ | `blocos.tsx:140-147` — `Segmented` toggle. |
| 3. Por Vendedor: attainment % and faturamento | ✅ | `blocos.tsx:158-188`. |
| 4. Por Grupo: groups + nested top sellers | ✅ | `blocos.tsx:190-217` (`g.top3`). Domain `aoVivo.ts:305-328`. |
| 5. Goal ladder level legend | ✅ | `blocos.tsx:150-156`; `aoVivo.ts:337` (`degrausPadrao`). Test: `aoVivo.test.ts:49`. |
| 6. No active goal → empty state | ✅ | `blocos.tsx:127-128`; domain sets `meta: null` when `metaAlvo === 0` (`aoVivo.ts:287-288`). |

---

## P2: Evolução do vendedor (AOVIVO-06)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. Evolução section: per-seller monthly table + AreaLineChart | ✅ | `AoVivoPage.tsx:121-123` → `BlocoEvolucao`; table `blocos.tsx:230-254`, chart `blocos.tsx:257-265`. Domain `aoVivo.ts:343-355`. Test: `aoVivo.test.ts:52-56`. |
| 2. Missing month → em dash (—), chart intact | ✅ | `blocos.tsx:248` (`v == null ? "—"`); chart maps null→0 `blocos.tsx:258-259` without throw. |

**Note:** Chart plots first **2** sellers (`blocos.tsx:257-259,267-271`) while table lists up to **4** (`aoVivo.ts:344`). Spec says “per-seller” chart without specifying count — acceptable MVP, minor precision gap.

---

## P2: IA Insights mock (AOVIVO-07)

| AC | Status | Evidence |
| --- | --- | --- |
| 1. IA Insights banner + **Gerar Insights** on `/ao-vivo` | ✅ | `BlocoIaInsights` `blocos.tsx:279-296`; mounted `AoVivoPage.tsx:125-127`. |
| 2. Click → fixture text, no external API | ✅ | `AoVivoPage.tsx:126` `setInsight(view.insightMock)`; text `aoVivo.ts:357-360`. |
| 3. Banner stays on `/ao-vivo` only (not share/TV) | ✅ | Only in `AoVivoPage.tsx`; `CompartilharPage.tsx` / `TvPage.tsx` have no IA block. |

---

## Edge Cases (spec § Edge Cases)

| Case | Status | Evidence |
| --- | --- | --- |
| “Todas as lojas” aggregates KPIs/ranking | ✅ | `aoVivo.ts:13-14` (`filialIds.length === 0` → all filiais); test `aoVivo.test.ts:30-34`. |
| Store with no sellers → ranking empty | ✅ | `vendedoresNoEscopo` + filter → `ranking.length === 0` → `EmptyState`. |
| Meta exists, realized 0 → Atingimento 0% | ✅ | `aoVivo.ts:210` (`mes.faturamento / metaAlvo * 100` → 0). |
| Zero today, month has sales → month KPIs + ranking persist, today sub zeros | ✅ (code) / ⚠️ (test) | Separate aggregates `aoVivo.ts:202-203,216-221`; ranking uses month window only. **No unit test** (tasks.md claims coverage). |

---

## Discrimination Sensor

**Status:** sensor skipped — timeboxed; recommend follow-up

**Minimal check performed:** `aoVivo.test.ts:21-27` asserts descending faturamento order — would fail if `sort` at `aoVivo.ts:242` were inverted. Confirms at least one AC-linked invariant is test-guarded.

**Not run:** full mutant worktree / structural mutation sweep on UI or domain.

---

## Spec-Precision & Traceability Gaps

1. **tasks.md vs tests:** T2 “Done when” lists *empty month* and *zero-today-with-month-sales* unit tests — **not present** in `aoVivo.test.ts` (only 6 tests). Domain logic appears correct; coverage claim overstated.
2. **Podium threshold:** Spec AC “≥3 sellers” vs implementation `top3.length >= 1` (`blocos.tsx:26`).
3. **Evolução chart scope:** Table shows 4 sellers; chart 2 series — spec silent on count.
4. **spec.md traceability table** still “Pending” / “0 mapped” — doc drift vs implemented tasks.
5. **P3 Atualizar** implemented (`AoVivoPage.tsx:56-63,79-80`) but out of P1/P2 scope for this gate.
6. **Section title:** UI “Evolução por Vendedor” vs spec “Evolução do vendedor” — cosmetic.

---

## Summary

All **P1 and P2 acceptance criteria are met** in code with file:line evidence. Domain quick gate passes. Residual risk is **undertested edge paths** (zero sales, empty month) and **podium display with <3 sellers**. Recommend adding the two missing unit tests from tasks.md before treating AOVIVO-02/03 as fully gated.
