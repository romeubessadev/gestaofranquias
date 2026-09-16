# Copy — Dashboard → Financeiro (fase 1)

Alinhamento visual e de copy compartilhada com a Visão Geral.
Cards exclusivos do Financeiro (Custo/Lucro/Margem, etc.) ficam para a fase 2.

---

## Diretriz

- Mesmo chrome da Visão Geral (filtros `sm`, Atualizar primary, `?` no lugar de `ⓘ`)
- KPIs compartilhados usam a mesma nomenclatura da Visão Geral
- Linguagem comercial: **venda** (não “atendimento”)

---

## 1. Cabeçalho

| Item | Final |
|---|---|
| Subtítulo | `Receita, custos e margem da operação.` |
| Atualização | `Atualizado há {N} min` |
| Atualizar | primary `sm` + label |
| Exportar | secondary `sm` |
| DateRangePicker | `size="sm"` |
| Marcas | select `h-8` / `text-xs` |

---

## 2. KPI cards

| Label | Sub | Tooltip |
|---|---|---|
| Faturamento | — | sem `?` |
| CMV | `CMV {N}%` | igual Visão Geral (pressão sobre margem) |
| Lucro bruto | — | “O que sobra do faturamento após descontar o custo dos produtos vendidos.” |
| Margem | — | “Percentual de lucro sobre o faturamento, antes das despesas fixas.” |

---

## 3. Cards compartilhados / chrome

| Card | Título | `?` |
|---|---|---|
| Formas de Pagamento | `Formas de Pagamento` (plural, como VG) | sem |
| Demais cards exclusivos | mantém título | `?` com TipHelp (fase 1 só chrome) |

Tabela Evolução Mensal: coluna `Custo` → `CMV`.
