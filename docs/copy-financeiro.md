# Copy — Dashboard → Financeiro

Textos atuais da tela (para revisão / melhoria de copy).
Público: gestor sênior / franqueado — métricas para **tomada de decisão**.

---

## Diretrizes

- Tooltip = como **interpretar** o indicador (não descrever o gráfico)
- Linguagem comercial: **venda** (não “atendimento”)
- Manter termos: CMV, Lucro bruto, Margem, Resultado operacional, Margem op.
- `?` só quando o título sozinho não basta; Formas de Pagamento sem `?`
- Preferir clareza e ação a jargão de BI

---

## 1. Cabeçalho

| Item | Texto |
|---|---|
| Título | `Financeiro` |
| Breadcrumb | `Dashboard` › `Financeiro` |
| Subtítulo | `Receita, custos e margem da operação.` |
| Atualização | `Atualizado agora` / `Atualizado há {N} min` |
| Botões | `Atualizar` · `Exportar` |
| Marcas | `Todas as marcas` · `WEPINK` · `WPINK` |

---

## 2. KPIs

| Label | Sub | Tooltip (?) |
|---|---|---|
| `Faturamento` | — | sem `?` |
| `CMV` | `CMV {N}%` | `Mostra quanto do faturamento foi consumido pelo custo dos produtos vendidos. Quanto maior o percentual de CMV, maior a pressão sobre a margem.` |
| `Lucro bruto` | — | `O que sobra do faturamento após descontar o custo dos produtos vendidos.` |
| `Margem` | — | `Percentual de lucro sobre o faturamento, antes das despesas fixas.` |

**Badge de delta (tooltip):** `Comparado a {rótulo}: acima/abaixo`

---

## 3. CMV, Lucro e Margem

| Elemento | Texto |
|---|---|
| Título | `CMV, Lucro e Margem` |
| Subtítulo | `{período} · por hora` / `· por dia` / `· por mês` |
| Tooltip | `Acompanhe se o lucro bruto acompanha o faturamento ou se o CMV está pressionando a margem ao longo do período.` |
| Legendas (header) | `Lucro bruto` · `CMV` · `Margem` |

---

## 4. Resultado operacional

| Elemento | Texto |
|---|---|
| Título | `Resultado operacional` |
| Subtítulo | mesmo do card ao lado (`{período} · por hora/dia/mês`) |
| Tooltip (eixo mês) | `O que sobra do lucro bruto depois de aluguel, royalties e marketing — e se esse resultado está melhorando ou piorando ao longo dos meses.` |
| Tooltip (hora/dia, rateado) | `O que sobra do lucro bruto depois de aluguel, royalties e marketing. Em períodos curtos, os custos fixos mensais são rateados no eixo (por dia ou por hora).` |
| Legendas (header) | `Lucro bruto` · `Resultado` · `Margem op.` |

---

## 5. Formas de Pagamento

| Elemento | Texto |
|---|---|
| Título | `Formas de Pagamento` |
| Tooltip | **sem `?`** |
| Centro do donut | `Total` |
| Empty | `Sem dados no período selecionado.` |

---

## 6. Custos Fixos e Franquia

| Elemento | Texto |
|---|---|
| Título | `Custos Fixos e Franquia` |
| Tooltip | `O que sobra do lucro bruto depois de aluguel, royalties e taxa de marketing — o resultado operacional do período.` |

**Linhas:**

- `Lucro bruto`
- `Aluguel fixo`
- `Aluguel % shopping (5%)`
- `Royalties WEPINK (5%)`
- `Royalties WPINK (5%)`
- `Taxa de marketing WEPINK (2%)`
- `Taxa de marketing WPINK (2%)`
- `Total custos fixos`
- `Resultado operacional`

---

## 7. Evolução Mensal

| Elemento | Texto |
|---|---|
| Título | `Evolução Mensal` |
| Subtítulo | `Últimos 6 meses` |
| Tooltip | `Resumo mensal de faturamento, CMV, lucro bruto, margem e ticket médio. Sempre mostra os últimos 6 meses — não segue o filtro de período curto.` |
| Colunas | `Mês` · `Faturamento` · `CMV` · `Lucro bruto` · `Margem` · `Ticket Médio` |
| Empty | `Sem dados no período selecionado.` |

---

## 8. Granularidade (contexto, não é copy de UI)

| Período filtrado | Eixo | Subtítulo dos cards de série |
|---|---|---|
| 1 dia | hora | `{rótulo} · por hora` |
| 2–31 dias | dia | `{rótulo} · por dia` |
| > 31 dias | mês | `{rótulo} · por mês` |

- Séries (CMV/Lucro, Resultado): seguem o eixo + subtítulo
- Snapshots (KPIs, Formas, Custos): sem subtítulo de eixo
- Evolução Mensal: sempre `Últimos 6 meses`

---

## 9. Glossário (contexto para revisão — não aparece na tela)

| Termo | Significado |
|---|---|
| **CMV** | Custo da Mercadoria Vendida |
| **Lucro bruto** | Faturamento − CMV |
| **Margem** | Lucro bruto ÷ Faturamento |
| **Ticket Médio** | Valor médio **por venda** |
| **Resultado operacional** | Lucro bruto − custos fixos/franquia |
| **Margem op.** | Resultado operacional ÷ Faturamento |

---

## Removidos (não reintroduzir nesta tela)

- Faturamento vs Ticket Médio
- Itens vs Preço Médio → fica para Produtos
