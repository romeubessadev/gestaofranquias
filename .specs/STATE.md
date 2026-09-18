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

## Handoff

- **Feature:** Ao vivo — P1+P2 implemented in app; share/TV shells only
- **Phase:** Execute complete (pending formal Verifier if desired)
- **Next:** Feature Compartilhar / Modo TV layout; optional Verifier pass
- **URLs:** `/ao-vivo`, `/ao-vivo/compartilhar`, `/ao-vivo/tv`
