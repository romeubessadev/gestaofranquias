# Validação independente — Aba Equipe

## Veredito final: PASS

A verificação foi rederivada da `spec.md` e `tasks.md`, sem assumir o modelo mental do autor. A suíte passou com 95 testes; lint e build passaram (lint somente com warnings preexistentes de `react(only-export-components)`). O sensor matou as três mutações obrigatórias e o worktree temporário foi removido sem alterar o repositório real.

## Faixa de commits avaliada

`git log --oneline master -6`:

- `6e6dd81` feat(equipe): integracao final, consistencia com visao geral e registro de decisao (EQUIP-01..07)
- `8a010f0` feat(equipe): ui da aba equipe - kpis, tabela de vendedoras, desafios e resumo rede (EQUIP-01/07)
- `87b61f0` feat(equipe): desafios na visao, comissao projetada e leitura da ia (EQUIP-04/05/06)
- `2b94cc4` feat(equipe): visao loja com kpis, tabela e regra meta ativa (EQUIP-01/02)
- `f12a72c` refactor(equipe): renomeia modulo de views para equipeVisoes
- `44b57f9` chore(equipe): ignore output local do vitest

Baseline antes do sensor: `git status --porcelain` vazio. Após descarte do worktree e `git worktree prune`, `git status --porcelain` do repo real permaneceu vazio.

## Gates

- `npx vitest run`: **PASS**, 6 arquivos e 95 testes aprovados.
- `npm run lint`: **PASS**, sem erros; warnings existentes de Fast Refresh em arquivos não relacionados à feature.
- `npm run build`: **PASS**, `tsc -b && vite build` e Vite concluídos.

## Outcome check por critério de aceitação

### EQUIP-01 — KPIs da equipe: **PASS**

- Faturamento, ticket e P.A. são derivados na view e expostos como KPIs em `src/data/gestao/equipeVisoes.ts:460-500`.
- Comissão entra somente com `metaAtiva` em `src/data/gestao/equipeVisoes.ts:478-500`; o teste confirma 4 KPIs/desafios no mês e 3 KPIs fora dele em `src/data/gestao/equipeVisoes.test.ts:170-205`.
- Deltas são comparados com o período anterior em `src/data/gestao/equipeVisoes.test.ts:202-206`.
- A integração confere faturamento e delta com a Visão geral para loja e rede em `src/data/gestao/integracaoEquipe.test.ts:14-33`, e ticket/P.A. em `src/data/gestao/integracaoEquipe.test.ts:35-42`.
- A renderização 3/4 KPIs e o layout responsivo estão cobertos pelo build gate em `src/pages/equipe/blocos.tsx:20-38`.

### EQUIP-02 — Lista de vendedoras: **PASS**

- Agregados, dias trabalhados e zeros sem vendas são testados em `src/data/gestao/equipeVisoes.test.ts:66-101`.
- Ordenação maior→menor por atingimento ou faturamento é testada em `src/data/gestao/equipeVisoes.test.ts:210-224`; a implementação está em `src/data/gestao/equipeVisoes.ts:290-335`.
- Atenção de P.A. é calculada contra 95% da média e testada em `src/data/gestao/equipeVisoes.ts:300-305` e `src/data/gestao/equipeVisoes.test.ts:233-244`.
- Avatar, nome, dias, tendência, faturamento, ticket, P.A. e colunas condicionais têm gate de build em `src/pages/equipe/blocos.tsx:50-141`.

### EQUIP-03 — Meta individual e escada: **PASS**

- Soma exata (arredondada ao real), maior peso, proporcionalidade, datas e Fernanda inativa são testados em `src/data/gestao/equipeVisoes.test.ts:20-64`.
- O cálculo proporcional/redistribuição está em `src/data/gestao/equipeVisoes.ts:60-85`.
- `metaAtiva` somente no mês e ausência de meta/comissão/desafios fora do mês são testadas em `src/data/gestao/equipeVisoes.test.ts:170-205`; a regra está documentada em `src/data/gestao/equipeVisoes.ts:1-11`.
- Degraus customizados, fronteiras e próximo degrau estão em `src/data/gestao/equipeVisoes.test.ts:103-164`.

### EQUIP-04 — Comissão projetada: **PASS**

- Degrau, comissão `realizado × percentual / 100`, bônus único e próximo degrau são testados em `src/data/gestao/equipeVisoes.test.ts:103-164` e `src/data/gestao/equipeVisoes.test.ts:402-415`.
- O KPI mensal fechado soma comissão acumulada + bônus em `src/data/gestao/equipeVisoes.test.ts:386-395`.
- A projeção em andamento usa faturamento escalado pela curva e degrau projetado em `src/data/gestao/equipeVisoes.ts:375-415`; plausibilidade e positividade são testadas em `src/data/gestao/equipeVisoes.test.ts:376-401`.

### EQUIP-05 — Desafios ativos: **PASS**

- Tipos, filtro de competência, participantes válidos, unidade/prêmio monetário único, progresso não negativo e determinismo são testados em `src/data/gestao/desafios.test.ts:4-57`.
- Agregado é soma dos progressos individuais e alvo é `alvo × participantes` em `src/data/gestao/equipeVisoes.test.ts:312-326`.
- Engajadas e ausência de engajamento são cobertos em `src/data/gestao/equipeVisoes.test.ts:328-356`; projeção linear é conferida em `src/data/gestao/equipeVisoes.test.ts:358-367`.
- Tabela, prêmio, progresso, engajadas, ritmo e empty message passam pelo build gate em `src/pages/equipe/blocos.tsx:170-247`; a página só monta desafios com meta ativa em `src/pages/equipe/EquipePage.tsx:30-42`.

### EQUIP-06 — Leitura da equipe: **PASS**

- A leitura é criada na camada de visão, não hardcoded na página, em `src/data/gestao/equipeVisoes.ts:420-450`.
- Casos com risco, sem risco e sem meta são testados em `src/data/gestao/equipeVisoes.test.ts:418-449`.
- A renderização reutiliza `BlocoLeitura` em `src/pages/equipe/EquipePage.tsx:20-30` e passa pelo build gate.

### EQUIP-07 — Visão rede: **PASS**

- Um resumo por filial, `vendedoras = null`, melhor/pior e soma de KPIs são testados em `src/data/gestao/equipeVisoes.test.ts:264-305`.
- Comissão ausente fora de meta ativa é testada em `src/data/gestao/equipeVisoes.test.ts:302-309`.
- Card por loja e callback de escolha estão em `src/pages/equipe/blocos.tsx:250-289`; a página preserva período/marca ao trocar somente `filialId` e zerar divisão em `src/pages/equipe/EquipePage.tsx:30-39`. O build gate valida a UI compilável; não há teste DOM/e2e por decisão explícita de `tasks.md`.

## Done when — T1–T8

- **T1 PASS**: interface e campos em `src/data/gestao/desafios.ts:10-27`; filtro em `src/data/gestao/desafios.ts:86-91`; PRNG em `src/data/gestao/desafios.ts:29-42`; três tipos/determinismo/filtro/testes em `src/data/gestao/desafios.test.ts:4-57`; gates globais acima.
- **T2 PASS**: rateio proporcional e datas em `src/data/gestao/equipeVisoes.ts:30-85`; agregados/zeros/inatividade em `src/data/gestao/equipeVisoes.ts:90-120`; testes em `src/data/gestao/equipeVisoes.test.ts:20-101`.
- **T3 PASS**: escada customizada, comissão, bônus e próximo degrau em `src/data/gestao/equipeVisoes.ts:120-165`; fronteiras e customização em `src/data/gestao/equipeVisoes.test.ts:103-164`.
- **T4 PASS**: metaAtiva, ordenação, tendência e atenção em `src/data/gestao/equipeVisoes.ts:270-335`; testes em `src/data/gestao/equipeVisoes.test.ts:170-260`.
- **T5 PASS**: desafios/projeção/leitura em `src/data/gestao/equipeVisoes.ts:340-450`; testes em `src/data/gestao/equipeVisoes.test.ts:312-449`.
- **T6 PASS**: rede em `src/data/gestao/equipeVisoes.ts:520-610` (composição) e testes em `src/data/gestao/equipeVisoes.test.ts:264-309`.
- **T7 PASS**: componentes e colunas em `src/pages/equipe/blocos.tsx:20-300`; montagem em `src/pages/equipe/EquipePage.tsx:14-42`; build passa.
- **T8 PASS**: integração Equipe/Visão geral em `src/data/gestao/integracaoEquipe.test.ts:14-55`; lint/build/suíte passam; decisão AD-039–AD-044 em `.specs/STATE.md:50-56`.

## Sensor de discriminação

Executado em worktree temporário detached em `$env:TEMP\verifier-equipe`, criado a partir de `HEAD` (`6e6dd81`), sem `git stash`. Cada mutação foi aplicada isoladamente e revertida antes da próxima:

| Mutação | Teste que matou | Resultado |
|---|---|---|
| **M1** — comparator `kb - ka` → `ka - kb` | `src/data/gestao/equipeVisoes.test.ts:210-224`, ordenação por atingimento e faturamento | **OK / morta** (2 testes falharam) |
| **M2** — remove fator `dias.length / diasAbertosMes` de `pesoAjustado` | `src/data/gestao/equipeVisoes.test.ts:20-27`, soma fecha exatamente com meta da loja | **OK / morta** (a soma mutada foi 200172 contra 185000) |
| **M3** — PRNG substituído por `Math.random()` | `src/data/gestao/desafios.test.ts:37-42`, determinismo da mesma chave | **OK / morta** (teste falhou) |

Mutations surviving: **nenhuma**. Fix tasks do sensor: **nenhuma**.

## Spec-precision gaps

1. A spec diz “delta percentual de cada KPI”, mas não define o comportamento esperado quando o período anterior não tem atendimentos; os testes explicitam apenas que o delta fica `undefined` nesse caso (`src/data/gestao/equipeVisoes.ts:470-500`). É uma lacuna de precisão da spec, não falha de implementação.
2. “Leitura com até 2 linhas” não define separador/formato de linha; o teste usa marcadores semânticos, não uma regra formal de quebra (`src/data/gestao/equipeVisoes.test.ts:433-445`).
3. “Projeção linear até o fim do período” não fixa se dias corridos ou dias abertos devem ser usados. O código usa dias abertos da competência (`src/data/gestao/equipeVisoes.ts:365-372`), enquanto o teste de veredito usa constantes `15` e `30` (`src/data/gestao/equipeVisoes.test.ts:358-367`). A intenção é testada, mas a spec deveria fixar a base temporal.
4. O critério de navegação da rede não especifica um contrato de URL/roteamento; o teste existente é de domínio e a UI é coberta pelo build gate conforme `tasks.md` declara ausência de e2e (`src/pages/equipe/EquipePage.tsx:30-39`).

Nenhum gap acima foi classificado como falha de implementação ou gerou fix task, pois são ambiguidades/limitações explicitamente deixadas pela spec e pelo plano de testes.
