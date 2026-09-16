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

## Granularidade dos cards de tendência

| Período filtrado | Eixo | Subtítulo |
|---|---|---|
| 1 dia | hora | `{rotulo} · por hora` |
| 2–31 dias | dia | `{rotulo} · por dia` |
| > 31 dias | mês | `{rotulo} · por mês` |

- **Séries** (Fat vs Meta, CMV/Lucro, Resultado): seguem o eixo + subtítulo.
- **Snapshots** (KPIs, Formas, Custos, Ranking, Tops, Categorias): só o período, sem subtítulo de eixo.
- **Dia da Semana vs Meta**: oculto em 1 dia.
- **Evolução Mensal**: sempre `Últimos 6 meses` (não finge range curto).
- **Resultado em hora/dia**: custos fixos mensais **rateados** no eixo (tooltip explica).

---

## 3. CMV, Lucro e Margem + Resultado operacional (par)

### CMV, Lucro e Margem
| Elemento | Final |
|---|---|
| Título | `CMV, Lucro e Margem` |
| Tooltip | `Acompanhe se o lucro bruto acompanha o faturamento ou se o CMV está pressionando a margem ao longo dos meses.` |
| Padrão | Chrome Visão Geral: totais no header + `AreaLineChart` com `compareData` |
| Séries | Lucro bruto · CMV |
| Header | `Lucro bruto` · `CMV` · `Margem %` + badge vs período |

### Resultado operacional
| Elemento | Final |
|---|---|
| Título | `Resultado operacional` |
| Tooltip | `O que sobra do lucro bruto depois de aluguel, royalties e marketing — e se esse resultado está melhorando ou piorando ao longo dos meses.` |
| Padrão | Mesmo chrome do card ao lado |
| Séries | Lucro bruto · Resultado operacional |
| Header | `Lucro bruto` · `Resultado` · `Margem op. %` + badge vs período |
| Layout | Par `lg:grid-cols-2` com CMV/Lucro (não mais largura total sozinho) |

---

## 4. Faturamento vs Ticket Médio

> **Removido do Financeiro.** Diagnóstico comercial (volume vs ticket) sem próximo passo financeiro claro — ticket médio permanece só na Evolução Mensal.
> Não reintroduzir nesta tela.

~~Removido do Financeiro.~~

---

## 5. Itens vs Preço Médio

> **Movido para Produtos** (fora do Financeiro). Card de mix/volume × preço por item — não é núcleo de dinheiro.
> Reintroduzir em `ProdutosPage` com as duas séries (qty + preço médio).

~~Removido do Financeiro.~~

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
| Linhas | **com % mockado** — `Aluguel % shopping (5%)`, `Royalties WEPINK (5%)`, `Royalties WPINK (5%)`, `Taxa de marketing WEPINK (2%)`, `Taxa de marketing WPINK (2%)` + `Aluguel fixo` sem % |

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
| **Margem op.** | Resultado operacional ÷ Faturamento |

---

## Escopo

1. Atualizar títulos, legendas, colunas e tooltips em `FinanceiroPage.tsx`
2. Não alterar `montarFinanceiroView` (valores/séries)
