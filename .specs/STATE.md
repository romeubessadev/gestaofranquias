# Project State

## Decisions

| ID | Decision | Rationale | Date |
| --- | --- | --- | --- |
| AD-001 | Ao vivo is a top-level menu item (not under Dashboard) | Operational/live board ≠ analytical dashboard | 2026-09-18 |
| AD-002 | No company block in Ao vivo header | User: remove empresa; store via Topbar selector | 2026-09-18 |
| AD-003 | KPIs show month primary + today secondary; no global Hoje\|Mês | Preserves live feel; dual readout on cards | 2026-09-18 |
| AD-004 | Ranking/Desafios/Metas always month; no Semestre/Ano on Ranking | Historical periods ≠ Ao vivo | 2026-09-18 |
| AD-005 | Vela components only; idea from SAAS refs | Product theme strict | 2026-09-18 |
| AD-006 | Share/TV/external page deferred | Implement in-app Ao vivo first | 2026-09-18 |
| AD-007 | IA Insights only in gestor app (mock MVP) | Not on TV; no real LLM yet | 2026-09-18 |
| AD-008 | Ao vivo header: Compartilhar + Modo TV (functional → shell routes) | Next feature builds full external/TV UI | 2026-09-18 |
| AD-009 | Login = e-mail + senha (não CPF); Supabase Auth | Padrão de apps; CPF fica para ERP | 2026-09-19 |
| AD-010 | Sessão PWA sticky; multi-device; F5 não desloga | App instalável + push depois | 2026-09-19 |
| AD-012 | Produto chama-se WeDash (não Vela Franquias) | Nome do dash / projeto Supabase | 2026-09-19 |
| AD-013 | Schema/auth/edge em inglês (`identity`, `membership`, roles OWNER/MANAGER/SELLER) | Padrão profissional; UI copy permanece PT | 2026-09-21 |
| AD-014 | Tenant URL = `wedash.app/{slug}` (path), não subdomínio | Ops simples; slug auto do nome | 2026-09-21 |
| AD-015 | Dashboard lê Postgres; Millennium só via sync (worker BR) | Sessão única ERP + IP + performance | 2026-09-21 |
| AD-016 | Backfill 3 meses; agregados diários (+ hora no dia); VG v1 = VENDAS.Lista | Custo/perf; CMV no pesado depois | 2026-09-21 |
| AD-017 | Canonical dashboard sales read model = `sales_day_agg` / `sales_hour_agg` | Overview e telas seguintes não leem Millennium | 2026-09-21 |

## Handoff

- **Feature:** `erp-sync-overview`
- **Phase:** Execute — Batch A complete (T1–T4 ✅); next Batch B T5
- **Artifacts:** context.md, spec.md, design.md, tasks.md
- **Next:** T5 Millennium VENDAS client (worker)
- **Commits:** b53abbf T1 · 5a47d8e T2 · b8a1b77 T3 · (T4 pending)
- **Note:** T1 commit also included prior staged renames; later commits are surgical. Migration not applied remotely yet.