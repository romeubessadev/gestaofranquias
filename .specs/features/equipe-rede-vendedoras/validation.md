# Validação independente — equipe-rede-vendedoras

## Validation

**Result**: PASS

Verificação rederivada da `spec.md` (REDE-01..17), sem assumir o modelo mental do implementador. Diff surface: 4 commits `023df8a`→`c575ca5`. Gates: 101 testes + `tsc -b --noEmit`. Sensor: 1 mutante morto; worktree real permaneceu limpo.

## Diff range

```
c575ca5 feat(equipe): visão rede como tabela de vendedoras com abas Vendedoras|Lojas
d583979 feat(equipe): faixa de meta global com badges de projeção
b556da5 feat(equipe): meta global da rede para faixa do card
023df8a feat(equipe): dimensão filial na linha de vendedora e visão rede flat
```

Baseline sensor: `git status --porcelain` vazio. Após restore da mutação scratch: vazio (match).

## Gates

| Gate | Resultado |
| ---- | --------- |
| `npx vitest run` | **PASS** — 6 files, **101** tests |
| `npx tsc -b --noEmit` | **PASS** (exit 0) |

## Outcome check por AC

| ID | Criterion (resumo) | Spec-defined outcome | Evidence (`file:line` + assertion) | Result |
| -- | ------------------ | -------------------- | ---------------------------------- | ------ |
| REDE-01 | Escopo "Todas" → tabela única de vendedoras | `visao === "rede"` e `vendedoras` flat não-nula | `equipeVisoes.test.ts:320-322` — `expect(v.visao).toBe("rede")`; `expect(v.vendedoras).not.toBeNull()`; `expect(v.vendedoras!.length).toBeGreaterThan(0)`. UI: `EquipePage.tsx:47-54` → `BlocoVendedorasRede`; `BlocoResumoRede` ausente no repo | ✅ PASS |
| REDE-02 | Coluna Shopping = `fantasia` | Toda linha com `filialNome` truthy; UI renderiza `filialNome` | `equipeVisoes.test.ts:325-328` — `expect(l.filialNome, l.nome).toBeTruthy()`; impl. `equipeVisoes.ts:398-399` — `filialNome: filial.fantasia`; UI `blocos.tsx:91-97` — `header: "Shopping"` / `{l.filialNome}` | ✅ PASS |
| REDE-03 | Meta ativa → escada + atenção + premiação (mesmo conteúdo loja) | Linhas da rede vêm de `visaoLoja`/`visaoVendedoras`; mesmas colunas via `BlocoVendedoras` | Domínio: `equipeVisoes.ts:663-668` — `vendedorasFlat.push(...linhas)` de `visaoLoja`. UI: `blocos.tsx:116-155` colunas escada/atenção/premiação quando `metaAtiva`. ⚠️ Sem assert automatizado loja↔rede linha-a-linha | ✅ PASS (impl. + ⚠️) |
| REDE-04 | Sem meta → só Vendedora, Shopping, Fat, Ticket, P.A. | `metaAtiva=false` omite colunas de meta; Shopping permanece | Domínio: `equipeVisoes.test.ts:364-365` — `expect(semMeta.metaGlobal).toBeNull()` com escopo rede/`7dias`. UI: `blocos.tsx:101-115` fat/ticket/pa só se `!metaAtiva`; `blocos.tsx:429-430` flat com `mostrarShopping`. ⚠️ Sem assert de shape de colunas | ✅ PASS (impl. + ⚠️) |
| REDE-05 | Loja específica → tabela sem Shopping | `CardVendedoras` chama `BlocoVendedoras` sem `mostrarShopping` | `EquipePage.tsx:40-46` ramo `visao === "loja"`; `blocos.tsx:245` — `<BlocoVendedoras lista={…} metaAtiva={…} />` (default `mostrarShopping=false` em `blocos.tsx:70`). Domínio: `equipeVisoes.test.ts:367-368` — `loja.metaGlobal` null | ✅ PASS (impl. + ⚠️ UI) |
| REDE-06 | Faixa META DE mês · atingido DE total · pct% | `metaGlobal` com `competTexto`, `realizado`, `total`, `pct` | `equipeVisoes.test.ts:354-362` — `expect(comMeta.metaGlobal).not.toBeNull()`; `expect(g.total).toBe(somaMetas)`; `expect(g.pct).toBeCloseTo((g.realizado/g.total)*100, 6)`; `expect(g.competTexto).toBeTruthy()`. UI: `blocos.tsx:261-266` | ✅ PASS |
| REDE-07 | Barra de progresso do % global | `ProgressBar` com `meta.pct` | `blocos.tsx:283-285` — `<ProgressBar value={Math.min(100, meta.pct)} …/>`; página `EquipePage.tsx:38`. ⚠️ Sem assert DOM | ✅ PASS (impl. + ⚠️) |
| REDE-08 | Soma só lojas com meta | `metaGlobalTotal` via `metaDaFilial?.valorLoja ?? 0` | `equipeVisoes.ts:660-661` — `filiais.reduce((s,f)=>s+(metaDaFilial(f.id,competencia)?.valorLoja??0),0)`; teste `equipeVisoes.test.ts:356-358` — `g.total === somaMetas` das lojas | ✅ PASS |
| REDE-09 | Fora da competência → sem faixa | `metaGlobal === null` | `equipeVisoes.test.ts:364-365` — `expect(semMeta.metaGlobal).toBeNull()`; `EquipePage.tsx:38` — só renderiza se `v.metaGlobal` | ✅ PASS |
| REDE-10 | Badge projeção ≥100% verde / senão âmbar | Texto "Meta será atingida" vs "Projeção abaixo da meta" | `blocos.tsx:256` — `fecha = meta.projetadoPct >= 100`; `blocos.tsx:273` — badge condicional. Domínio: `equipeVisoes.test.ts:360` — `expect(g.projetadoPct).toBeGreaterThan(0)`. ⚠️ Sem assert do texto do badge | ✅ PASS (impl. + ⚠️) |
| REDE-11 | Badge "N dias restantes" | `diasRestantes` nos abertos restantes incl. hoje | `equipeVisoes.test.ts:361` — `expect(g.diasRestantes).toBeGreaterThan(0)`; calc `equipeVisoes.ts:745-755`; UI `blocos.tsx:274-278` — `{meta.diasRestantes}d restantes` | ✅ PASS |
| REDE-12 | Abas Vendedoras \| Lojas (default Vendedoras) | Tabs só com `metaAtiva`; default `"vendedoras"` | `blocos.tsx:391` — `useState<"vendedoras"\|"lojas">("vendedoras")`; `blocos.tsx:405-422` tabs quando `metaAtiva`. ⚠️ Sem assert DOM | ✅ PASS (impl. + ⚠️) |
| REDE-13 | Aba Lojas: bloco fantasia + % meta global + barra + atingido/meta + tabela | `pctMetaGlobal` soma ~100; UI bloco por loja | `equipeVisoes.test.ts:339-349` — `expect(soma).toBeCloseTo(100, 1)`; UI `blocos.tsx:433-450` — `{loja.nome}`, `% da meta global`, `ProgressBar`, `realizado/meta`, `BlocoVendedoras` aninhado | ✅ PASS |
| REDE-14 | Tabelas aninhadas omitem Shopping | Nested `BlocoVendedoras` sem `mostrarShopping` | `blocos.tsx:450` — `<BlocoVendedoras lista={daLoja} metaAtiva={metaAtiva} />` (sem prop). ⚠️ Sem assert DOM | ✅ PASS (impl. + ⚠️) |
| REDE-15 | Sem meta → abas não aparecem | Tabs condicionados a `metaAtiva` | `blocos.tsx:405` — `{metaAtiva && (…tabs…)}`; flat `blocos.tsx:429-430`. ⚠️ Sem assert DOM | ✅ PASS (impl. + ⚠️) |
| REDE-16 | Célula premiação: mesma regra loja (valor, +R$, veredito) | `PremiacaoCelula` único; regras de veredito | `blocos.tsx:187-225` — vereditos `"Faixa máxima"` / `"cruza no ritmo"` / `"precisa acelerar"` / `"fecha sem premiação"`; uso compartilhado `blocos.tsx:153`. Rede e loja compartilham `BlocoVendedoras`. ⚠️ Sem teste unitário do texto do veredito nem comparação loja↔rede | ✅ PASS (impl. + ⚠️) |
| REDE-17 | Sem projeção → usa premiação acumulada | `premiacaoProjetadaIndividual ?? premiacaoAcumulada` | `blocos.tsx:191` — `const projetada = linha.premiacaoProjetadaIndividual ?? linha.premiacaoAcumulada`. Domínio loja: `equipeVisoes.test.ts:289-296` — com meta, projetada não-nula. ⚠️ Branch null sem assert dedicado | ✅ PASS (impl. + ⚠️) |

### Edge cases (spec)

| Edge | Evidence | Result |
| ---- | -------- | ------ |
| Uma única filial → sem visão rede | `montarEquipeView` só chama `visaoRede` se `filialId === "todas"` (`equipeVisoes.ts:792`) | ✅ |
| Sem vendedoras → EmptyState | `blocos.tsx:427-428` título "Sem vendedoras" | ✅ (impl.) |
| Degraus por filial da linha | `visaoVendedoras` usa `degrausDaFilial(filialId, …)` (`equipeVisoes.ts:338`) | ✅ |
| Divisão ativa não filtra pessoas | Sem filtro por divisão em `vendedorasDaLoja` / flat push | ✅ (impl.; assumption n na spec) |

## Sensor de discriminação

Método: cópia backup em `$TEMP\verifier-rede-scratch`, mutação in-place no worktree real, restore imediato (baseline porcelain vazio → vazio).

| Mutação | Teste que matou | Resultado |
| ------- | --------------- | --------- |
| Forçar `metaGlobal.total = 0` sempre (`total: metaGlobalTotal` → `total: 0`) | `equipeVisoes.test.ts:357` — `expect(g.total).toBe(somaMetas)` (Expected 283000, Received 0) | **Killed** (1 failed / 49 passed no arquivo) |

Mutantes sobreviventes: nenhum. Fix tasks do sensor: nenhuma.

## Ranked gaps

1. **UI-only ACs sem assert automatizado** (REDE-03 colunas idênticas, REDE-04/05/07/10/12/14/15/16 textos/DOM): cobertos por evidência de implementação + build gate, conforme matriz em `tasks.md` ("none (render manual)"). Não bloqueiam PASS.
2. **REDE-16/17**: não há teste que compare a mesma vendedora loja vs rede nem o fallback `?? premiacaoAcumulada` com projeção null — risco residual baixo porque a célula é compartilhada e a rede reusa `visaoLoja`.
3. **Assumption n** (ordenação print vs atingimento; clique na linha; divisão×lista): fora do escopo de falha; já logadas na spec.

Nenhum gap gera fix task obrigatória para este veredito.

## Code quality (diff surface)

| Check | Pass? |
| ----- | ----- |
| Sem features além do pedido | ✅ |
| Sem abstrações desnecessárias | ✅ |
| Só arquivos da feature | ✅ |
| Padrões existentes (`equipeVisoes` + `blocos`) | ✅ |
| Testes mapeiam ACs de domínio | ✅ |
| `BlocoResumoRede` removido | ✅ (grep: zero matches) |
