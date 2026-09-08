# STATE — Memória de decisões do projeto

> Fonte de verdade das decisões. Substitui `docs/decisoes.md` e o `CLAUDE.md`
> antigo como registro (ambos desconsiderados pelo usuário em 2026-09-07).
> O código real é a evidência do que existe; este arquivo é a evidência do que
> foi decidido.

## Decisions

| ID | Status | Decisão | Data |
|----|--------|---------|------|
| AD-001 | active | `docs/decisoes.md` e `CLAUDE.md` deixam de ser fonte de verdade. Decisões passam a viver em `.specs/STATE.md`. | 2026-09-07 |
| AD-002 | active | Escopo desta rodada: planejar/refinar apenas a aba Loja do Dashboard. Financeiro, Equipe e Produtos ficam como abas futuras. | 2026-09-07 |
| AD-003 | active | Filtro global ao Dashboard: Período, Loja e Marca valem para todas as abas e vivem na URL (`useEscopo`). | 2026-09-07 |
| AD-004 | active | Reaproveitar componentes do template Vela (`src/components/ui`, `src/components/charts`). Não criar componente paralelo quando já existe equivalente. | 2026-09-07 |
| AD-005 | active | Tela Loja será redesenhada do zero. O mosaico atual é protótipo descartável; a nova estrutura será guiada pelo propósito de decisão. | 2026-09-07 |
| AD-006 | active | Ritmo e projeção ficam em destaque; quando fora do trilho, mostrar status, falta por dia e projeção. Alavancas ficam em segundo plano. | 2026-09-07 |
| AD-007 | active | A meta continua mensal em faturamento. Ticket-meta é implícito; fluxo usa atendimentos; mix é leitura de margem/categoria. Sem metas extras. | 2026-09-07 |
| AD-008 | active | A lacuna de alavanca é detalhada por loja e período; a comparação é única e global acima dos cards. | 2026-09-07 |
| AD-009 | active | A aba Loja abre em todas as lojas. Entrar numa loja específica é uma ação. Filtros de período e marca ficam no topo. | 2026-09-07 |
| AD-010 | active | A data de referência do mock é 15/09/2026. | 2026-09-07 |
| AD-011 | active | O detalhamento P3 original foi postergado. | 2026-09-07 |
| AD-012 | active | Python 3.12.10 instalado; validadores determinísticos do skill estão disponíveis. | 2026-09-07 |
| AD-013 | active | O ritmo esperado usa curva diária: média dos quatro dias anteriores equivalentes por dia da semana; a meta é distribuída proporcionalmente, sem divisão linear por calendário. | 2026-09-07 |
| AD-014 | active | A lacuna de receita é decomposta em dois efeitos matemáticos: fluxo e ticket. Mix fica separado como leitura de margem/categoria. | 2026-09-07 |
| AD-015 | active | Ticket-meta usa como denominador os atendimentos esperados do mês, calculados pela soma das médias dos quatro dias anteriores equivalentes para cada dia aberto. | 2026-09-07 |
| AD-016 | active | Status: >=98% da curva acumulada = No trilho; >=90% e <98% = Atenção; <90% = Abaixo do trilho. Projeção disponível a partir do dia 7. Alavanca dominante exige efeito >10% do gap total. | 2026-09-07 |
| AD-017 | active | Meta, ritmo e projeção são sempre do mês corrente e independentes do filtro de período; KPIs, comparação e mix obedecem ao período e marca selecionados. | 2026-09-07 |
| AD-018 | active | Lucro líquido e margem de contribuição ficam fora da aba Loja e pertencem à futura aba Financeiro. A spec cobre loading e ausência de dados. | 2026-09-07 |
| AD-019 | active | A aba exibe um único número operacional: `venda necessária hoje`. Dias restantes incluem hoje; o valor usa o peso de hoje, desconta o realizado de hoje, nunca fica negativo e, se hoje estiver fechado, aponta o próximo dia aberto. O contexto é o gap absoluto em R$ e quantidade de dias. | 2026-09-07 |
| AD-020 | active | Status usa somente a meta acumulada distribuída pela `curvaReceita`; não usa receita histórica esperada como denominador de status. | 2026-09-07 |
| AD-021 | active | Projeção escala a `curvaReceita` restante pelo índice de desempenho acumulado do mês; o gate do dia 7 permanece. | 2026-09-07 |
| AD-022 | active | Diagnóstico usa janelas iguais até a data de referência. A interação é atribuída ao efeito fluxo; não existe residual de UI. Alavanca só é apontada quando efeito positivo >=60% da soma positiva. | 2026-09-07 |
| AD-023 | active | Meta segue o mês do período quando ele cabe em uma competência; em período que cruza meses, usa o mês corrente. | 2026-09-07 |
| AD-024 | active | `curvaReceita` é a única base de rateio: pesos normalizados governam status, venda necessária, projeção e gap. `curvaAtendimentos` serve apenas ao total mensal de atendimentos do `ticketMeta`. | 2026-09-07 |
| AD-025 | active | O termo de interação do diagnóstico é explicativo, não operacional: já está contido no efeito fluxo e não é somado. Não existe residual de UI. | 2026-09-07 |
| AD-026 | active | Histórico insuficiente usa ocorrências disponíveis do mesmo dia da semana; sem nenhuma ocorrência, usa distribuição uniforme entre os dias abertos. | 2026-09-07 |
| AD-027 | active | `atendimentosEsperadosAtéHoje` usa atendimentos esperados do mês multiplicados pela fração acumulada da `curvaReceita`, garantindo que o gap de fluxo/ticket feche com o gap do status. | 2026-09-07 |
| AD-028 | active | O diagnóstico de fluxo/ticket só aparece com status abaixo do trilho (<90%). O termo de interação é nota normativa, não operação de UI. | 2026-09-07 |
| AD-029 | active | O percentual projetado reutiliza o percentual do trilho; não há dois cálculos independentes. A projeção em reais é a extrapolação adicional disponível a partir do dia 7. | 2026-09-07 |
| AD-030 | active | Nova aba Loja segue o padrão visual das páginas da demo do Vela, com referência principal no **Analytics Dashboard** e composição livre a partir de outras telas. | 2026-09-07 |
| AD-031 | active | Layout da nova Loja: cabeçalho + filtro (Loja/Período/Marca) + conteúdo; grade de KPIs em `StatCard` no topo; bloco herói "Status do trilho" com gauge; coluna lateral com venda necessária, projeção e diagnóstico; mix em leitura separada. Uso exclusivo de componentes do template. | 2026-09-07 |
| AD-032 | active | Nos Estados de leitura, cada bloco da visão carrega o próprio estado (`disponivel`, `carregando`, `sem_dados`, `indisponivel`). A página renderiza `Skeleton` ou `EmptyState` por bloco, sem esconder os demais. | 2026-09-07 |
| AD-033 | active | O diagnóstico de fluxo/ticket carrega o flag `exibir`, decidido na camada de dados (`pctTrilho < 90`). A página não decide exibição. | 2026-09-07 |
| AD-034 | active | `curvaReceita` é derivada do histórico de faturamento e `curvaAtendimentos` do histórico de atendimentos, normalizadas separadamente. `pesoDia` continua como base de distribuição e fallback quando não há histórico suficiente. | 2026-09-07 |
| AD-035 | active | Retroceder o `design.md` para `Draft` até que todos os ajustes do parecer sejam incorporados e aprovados novamente. | 2026-09-07 |

## Handoff — snapshot

- Rodada atual: fase **Tasks** da tela Loja.
- `design.md` aprovado (2026-09-07); `tasks.md` criado e validado por `validate_tasks.py` (0 erros, 3 avisos esperados de `Tests: none`).
- Decisões novas registradas: AD-032 (estados por bloco), AD-033 (flag `exibir` do diagnóstico), AD-034 (curvas derivadas de históricos distintos, `pesoDia` como fallback), AD-035 (design volta a Draft até aprovação final — já re-aprovado).
- `git init` feito; baseline commit (T0) pendente.
- Próximo passo: aprovação das tasks pelo usuário; depois Execute (T0→T9), com batch offer (10 tasks > 8) e Verifier ao final.
