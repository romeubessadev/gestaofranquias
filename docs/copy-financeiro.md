# Copy final — Dashboard → Financeiro

Fase 1 (chrome + KPIs compartilhados) + fase 2 (cards exclusivos).
**Só copy visual** — mesmos cards, números e cálculos.

---

## Diretriz

- Tooltip = como **interpretar** o indicador (não descrever o gráfico)
- Linguagem comercial: **venda** (não “atendimento”)
- **CMV** no lugar de “Custo” / “Custo dos produtos” onde for rótulo
- **Preço médio (por item)** por extenso neste tela — evita confusão com o PA da Visão Geral (itens por venda)
- `?` só quando o título sozinho não basta; Formas de Pagamento sem `?`

---

## 1. Cabeçalho (fase 1)

| Item | Final |
|---|---|
| Subtítulo | `Receita, custos e margem da operação.` |
| Atualização | `Atualizado há {N} min` |
| Atualizar / Exportar / DateRange / Marcas | chrome `sm` como Visão Geral |

---

## 2. KPI cards (fase 1)

| Label | Sub | Tooltip |
|---|---|---|
| Faturamento | — | sem `?` |
| CMV | `CMV {N}%` | `Mostra quanto do faturamento foi consumido pelo custo dos produtos vendidos. Quanto maior o percentual de CMV, maior a pressão sobre a margem.` |
| Lucro bruto | — | `O que sobra do faturamento após descontar o custo dos produtos vendidos.` |
| Margem | — | `Percentual de lucro sobre o faturamento, antes das despesas fixas.` |

---

## 3. CMV, Lucro e Margem (widget central)

| Elemento | Final |
|---|---|
| Título | `CMV, Lucro e Margem` *(era “Custo, Lucro e Margem”)* |
| Tooltip | `Acompanhe se o lucro bruto acompanha o faturamento ou se o CMV está pressionando a margem ao longo dos meses.` |
| Legenda | `CMV` · `Lucro bruto` · `Margem` |

---

## 4. Faturamento vs Ticket Médio

| Elemento | Final |
|---|---|
| Título | `Faturamento vs Ticket Médio` |
| Tooltip | `Mostra se o faturamento sobe por mais volume de vendas ou por ticket médio maior.` |
| Legendas | `Faturamento` · `Ticket Médio (×100)` *(escala só visual no gráfico)* |

---

## 5. Itens vs Preço Médio

| Elemento | Final |
|---|---|
| Título | `Itens vs Preço Médio` *(era “Itens Vendidos vs Preço Médio”)* |
| Tooltip | `Indica se o período vendeu mais unidades ou itens com preço médio maior (valor médio por item).` |

---

## 6. Formas de Pagamento

| Elemento | Final |
|---|---|
| Título | `Formas de Pagamento` |
| Tooltip | **sem `?`** |

---

## 7. Custos Fixos e Franquia

| Elemento | Final |
|---|---|
| Título | `Custos Fixos e Franquia` |
| Tooltip | `O que sobra do lucro bruto depois de aluguel, royalties e taxa de marketing — o resultado operacional do período.` |
| Linhas | **manter** (`Lucro bruto`, `Aluguel fixo`, `Aluguel % shopping`, `Royalties`, `Taxa marketing WEPINK/WPINK`, `Total custos fixos`, `Resultado operacional`) |

---

## 8. Evolução Mensal

| Elemento | Final |
|---|---|
| Título | `Evolução Mensal` |
| Tooltip | `Resumo mensal de faturamento, CMV, lucro bruto, margem e ticket médio.` |
| Colunas | `Mês` · `Faturamento` · `CMV` · `Lucro bruto` · `Margem` · `Ticket Médio` |

---

## Glossário (Financeiro)

| Termo | Significado |
|---|---|
| **CMV** | Custo da Mercadoria Vendida |
| **Lucro bruto** | Faturamento − CMV |
| **Margem** | Lucro bruto ÷ Faturamento |
| **Ticket Médio** | Valor médio **por venda** |
| **Preço médio (por item)** | Faturamento ÷ itens — distinto do PA da Visão Geral |
| **Resultado operacional** | Lucro bruto − custos fixos/franquia |

---

## Escopo

1. Atualizar títulos, legendas, colunas e tooltips em `FinanceiroPage.tsx`
2. Não alterar `montarFinanceiroView` (valores/séries)
