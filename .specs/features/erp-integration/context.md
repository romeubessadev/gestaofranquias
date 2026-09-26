# ERP Integration Context

**Gathered:** 2026-09-22
**Spec:** `.specs/features/erp-integration/spec.md`
**Status:** Used in design

---

## Feature Boundary

Redesenhar a integração Millennium → WeDash: onboarding grava USER/SENHA/token; primeira sync cobre mês anterior + mês atual (com tela Sincronizando corrigida); LIGHT atualiza hoje; histórico antigo mês a mês até teto 24m; dashboard só lê agregados; desconectar ERP é ação explícita em Configurações. Remover/substituir o fluxo sujo anterior para não haver concorrência.

---

## Implementation Decisions

### Janela da primeira sync (SEED)

- **Mês anterior + mês atual até hoje** (não só hoje + 1 dia).
- Libera o dashboard quando essa cobertura mínima estiver no banco.
- Tela **Sincronizando** permanece até essa cobertura — precisa ficar 100% funcional (corrigir estado atual quebrado).

### Sessão ERP × logout WeDash

- USER/SENHA/token ficam no tenant (“ERP logado dentro da WeDash”).
- **Logout WeDash NÃO desloga o Millennium.**
- Desconectar ERP = botão em **Configurações > Integração ERP** (logout Millennium + pausa sync / limpa token).
- Assim o histórico pode rodar de madrugada / com gestor fora do app, sem prender o fluxo ao heartbeat da aba.
- Ideal de produto: usuário Millennium dedicado à WeDash (copy no onboarding); não bloqueante do MVP técnico.

### Tela Sincronizando

- Manter (opção A).
- Corrigir: progresso alinhado ao job real, busy claro, não ficar presa, liberar só com cobertura SEED no banco.

### Persistência v1

- Só agregados usados pelos cards (`sales_day_agg` / `sales_hour_agg` no dia corrente).
- Rollback futuro = re-sync do período (FORCE), não archive JSON de todas as APIs.
- Depara multi-API + raw payload = feature futura.

### Credencial no onboarding

- Step2 testa e **grava** usuário + senha + token.
- Se o usuário Millennium **mudar** (username diferente): logout token antigo + apaga lojas ERP, agregados, jobs/runs do tenant ligados ao sync → grava o novo.
- Mesma senha / mesmo user: só atualiza ciphertext + token.
- SEED só após concluir onboarding (lojas confirmadas).

### Chamadas Millennium (prova real)

- `VENDAS.Lista` **sem** filial: só janelas de **1 dia** (LIGHT / hoje).
- Período maior: `VENDAS.Lista` **com** filial, **mês a mês**, lojas **sequenciais**.
- Não usar `VENDAS.ListaTodos` (400 no ERP atual).

### Limpeza do fluxo anterior

- Remover / desativar caminhos que concorrem: presença obrigatória como gate de claim, logout Millennium no signOut WeDash, paralelismo agressivo de lojas, kinds/UX confusos, spam de log `locked`.
- Um contrato só: SEED / LIGHT / FORCE / HISTORY — sem estados fantasmas.

### Agent's Discretion

- Copy exata da SyncingPage e do botão Integrações.
- Formato de log estruturado (1 linha por job) desde que seja grepável.
- Intervalo LIGHT (manter 2/30 min se dedicado/compartilhado já existir).

### Declined / Undiscussed Gray Areas → Assumptions

- User ERP dedicado: recomendado na copy, não enforced no MVP.
- Overnight explícito (cron 00–06): pode ser “HISTORY sempre que houver fila e sync não pausado”; janela de madrugada é otimização, não requisito duro.
- Raw JSON de APIs futuras: fora do MVP.

---

## Specific References

- Probe 2026-09-21: Lista sem filial 1 dia OK (~169s, 3 lojas); 30 dias sem filial = timeout 180s; ListaTodos = 400.
- Decisão do gestor: deslogar Millennium só em Integrações, não no Sair da WeDash.

---

## Deferred Ideas

- Tabela `erp_raw_snapshot` / salvar retorno completo de cada API.
- Depara entre APIs para cortar chamadas.
- CMV / estoque / outras fontes.
- Worker multi-máquina com lease no Postgres.
- Force-user ERP dedicado (bloqueio no onboarding).
