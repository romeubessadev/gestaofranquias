# Copy final — Dashboard → Visão Geral

Decisões fechadas (gestor + revisão). Pronto para implementar.

---

## Diretriz

- Tela = resumo executivo para tomada de decisão
- Tooltip = como interpretar o indicador (não explicar o gráfico)
- Linguagem comercial consistente: **venda** (não “atendimento”)
  - Nº de vendas = quantas vendas
  - Ticket Médio = quanto cada venda valeu
  - PA = quantos itens por venda
  - Faturamento = quanto isso gerou

---

## 1. Cabeçalho

| Original | Final | Notas |
|---|---|---|
| Subtítulo longo | `Principais indicadores, metas e desempenho da operação.` | |
| `Atualizado há {N} minuto(s)` | `Atualizado há {N} min` | |
| Demais (`Dashboard`, `Visão Geral`, `Atualizar`, `Exportar`, marcas) | **manter** | |

### DateRangePicker (decisão **global** / design system — não só Visão Geral)

| Item | Decisão |
|---|---|
| `Atalhos` → `Períodos rápidos` | **Sim** (global) |
| Dias do calendário | `D S T Q Q S S` (global; largura crítica) |
| `Período personalizado` → `Selecionar período` | **Não mexer agora** |

---

## 2. KPI cards

### Faturamento
| Elemento | Final |
|---|---|
| Label | `Faturamento` |
| Sub | `Meta: {R$}` (manter) |
| Tooltip | **sem `?`** |

### CMV
| Elemento | Final |
|---|---|
| Label | `CMV` |
| Sub | `CMV {N}%` |
| Tooltip | `Mostra quanto do faturamento foi consumido pelo custo dos produtos vendidos. Quanto maior o percentual de CMV, maior a pressão sobre a margem.` |

### Nº de vendas
| Elemento | Final |
|---|---|
| Label | `Nº de vendas` |
| Sub | `{N} itens vendidos` |
| Tooltip | **sem `?`** |

### Ticket Médio
| Elemento | Final |
|---|---|
| Label | `Ticket Médio` |
| Sub | `PA {N}` |
| Tooltip | `Valor médio faturado por venda no período selecionado.` |

### Layout (linha meta)
- **Atingimento da Meta** (esquerda, `1fr`) → **Faturamento vs Meta** (direita, `1.6fr`)
- Sem `?` em Atingimento da Meta e Ranking de Lojas

### Deltas
| Original | Final |
|---|---|
| `vs os N dias anteriores` | `vs N dias anteriores` |
| Badge dos cards (`+X% vs ago`) | Só `+X%` / `−X%` no chip; base no tooltip `Comparado a {rótulo}: acima/abaixo` (igual KPI/`StatCard`) |
| Demais padrões `{+/-}% vs {rótulo}` nos KPIs | **manter** (% no chip + tooltip) |

---

## 3. Faturamento vs Meta

| Elemento | Final |
|---|---|
| Título | `Faturamento vs Meta` |
| Subtítulo | `{rotulo} · por hora/dia/mês` conforme eixo do período |
| Totais no header | último ponto acumulado (não soma dos pontos) |
| Tooltip | `Compare o ritmo do faturamento com a meta acumulada e identifique se a operação está acima ou abaixo do esperado.` |
| Legendas `Realizado` / `Meta` | **manter** |

---

## 4. Atingimento da Meta

| Elemento | Final |
|---|---|
| Título | `Atingimento da Meta` |
| Tooltip | **sem `?`** |
| `da meta` / `Faturamento` / `Meta do mês` / `Faltam` / `Projeção` | **manter** |
| Valor quando bateu | `Meta atingida` (não só `Atingida`) |
| Empty | `Nenhuma meta cadastrada para o período.` |
| Legado `Meta atingida! 🎉` | `Meta atingida` (sem emoji) |
| Legado `Faltam {R$} pra bater…` | `Faltam {R$} para atingir a Meta do mês` |
| Nomes Meta / Super / Hiper | **Dados dinâmicos** — não hardcodar |

---

## 5. Categorias vs Meta

| Elemento | Final |
|---|---|
| Título | `Categorias vs Meta` |
| Tooltip | `Compare o faturamento de cada categoria com sua meta no período e identifique onde estão os maiores desvios.` |

---

## 6. Dia da Semana vs Meta

| Elemento | Final |
|---|---|
| Título | `Dia da Semana vs Meta` *(manter família “vs Meta”)* |
| Visibilidade | **oculto** quando período = 1 dia |
| Tooltip | `Compare o faturamento médio de cada dia da semana com a meta diária e identifique os dias de maior e menor desempenho.` |

---

## 7. Ranking de Lojas

| Elemento | Final |
|---|---|
| Título | `Ranking de Lojas` |
| Badge | `Total {R$}` |
| Empty | `Sem dados no período selecionado.` |
| Tooltip | **sem `?`** |

---

## 8. Formas de Pagamento

| Elemento | Final |
|---|---|
| Título | `Formas de Pagamento` |
| Empty | `Sem dados no período selecionado.` |
| Padrão | Igual Financeiro (Expense breakdown): donut centralizado + lista com cor · forma · R$ · % |

---

## 9. Top Vendedoras

| Elemento | Final |
|---|---|
| Título | `Top Vendedoras` |
| Link | `Ver equipe` |
| Contagem | `{N} vendas` *(manter “vendas”, não “atendimentos”)* |
| Ticket | `Ticket {R$}` *(não `T.M.`)* |
| Empty | `Sem dados no período selecionado.` |

---

## 10. Top Produtos

| Elemento | Final |
|---|---|
| Título | `Top Produtos` |
| Link | `Ver produtos` |
| Coluna | `Itens vendidos` *(era “Vendas”)* |
| Coluna | `Variação` *(era “Vs anterior”)* |
| Célula qtd | `{N}` *(sem sufixo “itens”)* |
| Empty | `Sem dados no período selecionado.` |

---

## 11. Transversais

| Original | Final |
|---|---|
| `Sem dados no período.` | `Sem dados no período selecionado.` |
| `Ver mais` | Destino específico (`Ver equipe`, `Ver produtos`) |
| `Realizado` / `Meta` / `?` / `—` / `vs` | **manter** |

---

## Glossário (linguagem fechada)

| Termo | Significado |
|---|---|
| **Faturamento** | Valor bruto vendido no período |
| **CMV** | Custo da Mercadoria Vendida |
| **CMV% / percentual de CMV** | Parte do faturamento consumida pelo custo |
| **Nº de vendas** | Quantidade de vendas/transações concluídas |
| **Itens vendidos** | Unidades de produto |
| **Ticket Médio** | Valor médio faturado **por venda** |
| **PA** | Quantidade média de itens **por venda** |
| **Meta** | Objetivo cadastrado (nomes de faixas são dinâmicos) |

---

## Escopo de implementação

1. **Visão Geral** + `montarVisaoGeralView` — copy acima
2. **DateRangePicker** (global) — só `Períodos rápidos` + `D S T Q Q S S`
3. Não alterar placeholder `Período personalizado` agora
