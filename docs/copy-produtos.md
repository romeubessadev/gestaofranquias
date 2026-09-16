# Copy refinada — Dashboard → Produtos

> **Aplicado no código** (com 3 ajustes de julgamento):
> 1. Tooltip de delta **não** mudou — permanece o padrão global do `StatCard` (`Comparado a {rótulo}: acima/abaixo`).
> 2. Coluna do **Top Produtos** ficou `Itens` (curta); select e tabela principal usam `Itens vendidos`.
> 3. Rodapé da tabela: `Total do filtro` + `?` explicando que soma o filtro inteiro (não a página).

## Diretriz da tela

A tela de Produtos deve ajudar o gestor a entender rapidamente:

* quais categorias, linhas e produtos puxam o faturamento;
* quais produtos combinam volume e margem;
* onde existe concentração do mix;
* quais produtos merecem uma análise mais profunda.

A linguagem deve separar claramente:

**Venda** = uma compra/transação
**Item vendido** = uma unidade de produto

---

# 1. Cabeçalho

| Original                                         | Proposto                                              | Motivo                                        |
| ------------------------------------------------ | ----------------------------------------------------- | --------------------------------------------- |
| `Dashboard › Produtos`                           | **manter**                                            | Hierarquia clara.                             |
| `Produtos`                                       | **manter**                                            | Direto.                                       |
| `Mix de produtos, categorias e margens da loja.` | `Desempenho, margem e composição do mix de produtos.` | Explica melhor o propósito analítico da tela. |
| `Atualizado agora`                               | **manter**                                            | Padrão das demais telas.                      |
| `Atualizado há {N} min`                          | **manter**                                            | Padrão das demais telas.                      |
| `Atualizar`                                      | **manter**                                            | —                                             |
| `Exportar`                                       | **manter**                                            | —                                             |
| `Todas as marcas`                                | **manter**                                            | —                                             |
| `WEPINK` / `WPINK`                               | **manter**                                            | Dados do negócio.                             |

### Subtítulo final

`Desempenho, margem e composição do mix de produtos.`

---

# 2. KPIs

## Faturamento

### Label

`Faturamento`

**Manter.**

### Tooltip

**Sem `?`.**

Assim como no Financeiro, é um indicador autoexplicativo.

---

## Lucro bruto

### Label

`Lucro bruto`

**Manter.**

### Tooltip atual

`O que sobra do faturamento após descontar o custo dos produtos vendidos.`

### Proposto

`Quanto sobra do faturamento após descontar o CMV.`

### Motivo

Mantém exatamente a mesma definição utilizada no Financeiro.

---

## Margem

### Label

`Margem`

**Manter.**

### Tooltip atual

`Percentual de lucro sobre o faturamento. Quanto maior, melhor.`

### Proposto

`Percentual do faturamento que permanece como lucro bruto após o CMV.`

### Motivo

Mais preciso. “Quanto maior, melhor” é uma conclusão simplificada demais e não acrescenta informação para um gestor sênior.

---

## Itens vendidos

### Label

`Itens vendidos`

**Manter.**

### Tooltip

**Sem `?`.**

O título já explica claramente a métrica.

---

## Deltas

### Badge

`+{X}%` / `−{X}%`

**Manter.**

### Tooltip atual

`Comparado a {rótulo}`

### Proposto

`Variação em relação a {rótulo}`

### Exemplos

`Variação em relação ao mês passado`

`Variação em relação aos 7 dias anteriores`

### Motivo

Como o percentual e o sinal já aparecem no badge, não precisamos repetir “acima/abaixo” no tooltip.

---

# 3. Faturamento por Categoria

## Título

`Faturamento por Categoria`

**Manter.**

É exatamente o que está sendo analisado.

### Tooltip atual

`Quanto cada categoria faturou no período. A % margem de cada uma está na tabela abaixo.`

### Proposto

`Identifique quais categorias mais contribuem para o faturamento e como o mix está distribuído entre elas.`

### Motivo

O atual descreve o gráfico e ainda depende de “tabela abaixo”, o que é frágil em layouts responsivos.

O novo responde à pergunta gerencial:

**Onde está concentrado meu faturamento?**

### `?`

**Manter.**

Aqui o tooltip agrega interpretação, não apenas definição.

---

# 4. Top Linhas de Produto

## Título

`Top Linhas de Produto`

**Manter.**

“Linha de produto” já é um conceito do negócio.

### Tooltip atual

`Ranking das linhas de produto por faturamento no período.`

### Proposto

**Remover o `?`.**

### Motivo

Título + colunas `Faturamento` e `Participação` já deixam claro o que está sendo mostrado.

O tooltip atual apenas descreve a tabela.

---

## Colunas

### `#`

**Manter.**

### `Linha`

**Manter.**

### `Faturamento`

**Manter.**

### `Participação`

**Manter.**

É uma informação importante porque mostra concentração do mix.

### Empty

`Sem dados no período selecionado.`

**Manter.**

---

# 5. Top Produtos

## Título

`Top Produtos`

**Manter.**

---

## Tooltip atual

`Ranking dos produtos mais vendidos. Escolha a métrica de ordenação.`

### Proposto

**Remover o `?`.**

### Motivo

O próprio seletor comunica que o ranking pode ser alterado. Além disso, “mais vendidos” fica incorreto quando a ordenação selecionada é Margem.

---

## Select de ordenação

### Atual

`Faturamento`

`Qtd Vendida`

`Margem`

### Proposto

`Faturamento`

`Itens vendidos`

`Margem`

### Motivo

`Qtd Vendida` é ambíguo. Estamos padronizando unidades de produto como **Itens vendidos**.

---

## Colunas

| Original      | Proposto         |
| ------------- | ---------------- |
| `#`           | **manter**       |
| `Produto`     | **manter**       |
| `Itens`       | `Itens vendidos` |
| `Faturamento` | **manter**       |
| `Margem`      | **manter**       |

### Motivo para `Itens vendidos`

A tabela fica autoexplicativa e consistente com o KPI e com o seletor.

---

## Empty

`Sem dados no período selecionado.`

**Manter.**

---

# 6. Tabela de Produtos

Aqui eu faria uma mudança maior.

## Título atual

`Tabela de Produtos`

### Proposto

`Desempenho por Produto`

### Motivo

“Tabela de Produtos” descreve o componente.

`Desempenho por Produto` explica o que o gestor vai analisar ali.

É mais coerente com uma ferramenta gerencial.

---

## Tooltip atual

`Lista de produtos com busca, filtro por categoria e ordenação. O Total soma todos os produtos do filtro atual — não só a página.`

O problema é que esse texto explica **como usar uma tabela**, e não como interpretar os dados.

### Proposto

`Compare faturamento, custo, margem e volume para entender o desempenho de cada produto no mix.`

### Motivo

Responde à função gerencial do card.

### `?`

**Manter.**

Aqui faz sentido porque existem várias métricas financeiras e comerciais combinadas.

---

## Observação sobre o total

A informação:

`O Total soma todos os produtos do filtro atual — não só a página.`

é importante, mas não deveria estar no tooltip analítico do título.

Se houver risco real de o usuário interpretar errado o rodapé, essa informação deveria estar próxima do próprio total, por exemplo:

`Total do filtro`

ou em um tooltip específico ao lado de `Total`.

---

## Busca

### Atual

`Pesquisar produto…`

### Proposto

`Buscar produto…`

### Motivo

Mais curto e natural em interface.

---

## Categoria

`Todas as categorias`

**Manter.**

---

## Exportação

`Exportar CSV`

**Manter.**

É melhor do que apenas “Exportar” porque informa o formato.

---

# Colunas da tabela

Hoje existe uma mistura de nomenclaturas que eu padronizaria.

## Estrutura final recomendada

| Atual          | Proposto         | Motivo                                                                  |
| -------------- | ---------------- | ----------------------------------------------------------------------- |
| `Produto`      | **manter**       | —                                                                       |
| `Categoria`    | **manter**       | —                                                                       |
| `Faturamento`  | **manter**       | —                                                                       |
| `CMV`          | **manter**       | Valor absoluto do custo.                                                |
| `Lucro bruto`  | **manter**       | Padrão do Financeiro.                                                   |
| `% Margem`     | `Margem`         | O valor já será exibido em percentual; o `%` no título é desnecessário. |
| `CMV %`        | `CMV %`          | Precisa diferenciar do CMV em R$.                                       |
| `Qtd vendas`   | `Nº de vendas`   | Mais claro e mantém linguagem comercial.                                |
| `Ticket médio` | **manter**       | Valor médio por venda.                                                  |
| `Qtd itens`    | `Itens vendidos` | Padroniza unidades vendidas.                                            |

### Resultado

`Produto`

`Categoria`

`Faturamento`

`CMV`

`Lucro bruto`

`Margem`

`CMV %`

`Nº de vendas`

`Ticket médio`

`Itens vendidos`

---

# Por que não usar apenas “Vendas”?

Porque nessa mesma tabela existem:

**Nº de vendas**
e
**Itens vendidos**

Assim eliminamos qualquer dúvida entre:

> quantas compras aconteceram?

e

> quantas unidades desse produto foram vendidas?

---

# 7. Rodapé / Totais

## `Total`

**Manter.**

---

## Contagem desktop

Atual:

`({N} produto)`
`({N} produtos)`

### Manter.

Exemplo:

`Total (184 produtos)`

Funciona bem.

---

## Mobile

`Total · {N} produtos`

**Manter.**

---

## Paginação

### Atual

`Mostrando {n} de {N} produtos`

**Manter.**

### Botões

`Anterior`

`Próxima`

**Manter.**

---

# 8. Empty states

## Cards analíticos

`Sem dados no período selecionado.`

**Manter.**

Esse texto funciona bem quando a ausência de informação é causada pelo período.

---

## Tabela / busca

`Nenhum produto encontrado.`

**Manter.**

Não unificaria os dois empty states.

Eles representam situações diferentes:

`Sem dados no período selecionado.`
→ não há informação no recorte temporal.

`Nenhum produto encontrado.`
→ busca/filtros não encontraram produto correspondente.

Essa distinção é boa.

---

# 9. Mobile

Usar exatamente os mesmos nomes da tabela desktop:

`Faturamento`

`CMV`

`Lucro bruto`

`Margem`

`CMV %`

`Nº de vendas`

`Ticket médio`

`Itens vendidos`

Não criaria abreviações diferentes apenas no mobile, salvo se houver problema real de espaço.

---

# 10. CSV

Eu faria o CSV acompanhar exatamente a nomenclatura visual da tabela.

### Atual

`Produto;Categoria;Faturamento;CMV;Lucro bruto;% Margem;CMV %;Qtd vendas;Ticket médio;Qtd itens`

### Proposto

`Produto;Categoria;Faturamento;CMV;Lucro bruto;Margem;CMV %;Nº de vendas;Ticket médio;Itens vendidos`

### Nome do arquivo

`tabela-produtos.csv`

**Manter.**

O nome do arquivo não precisa acompanhar o novo título do card.

---

# Copy final consolidada

## Cabeçalho

### Produtos

`Desempenho, margem e composição do mix de produtos.`

---

# KPIs

### Faturamento

Sem tooltip.

### Lucro bruto

`Quanto sobra do faturamento após descontar o CMV.`

### Margem

`Percentual do faturamento que permanece como lucro bruto após o CMV.`

### Itens vendidos

Sem tooltip.

### Delta

`Variação em relação a {período}`

---

# Faturamento por Categoria

### Tooltip

`Identifique quais categorias mais contribuem para o faturamento e como o mix está distribuído entre elas.`

---

# Top Linhas de Produto

Sem tooltip.

Colunas:

`# · Linha · Faturamento · Participação`

---

# Top Produtos

Sem tooltip.

### Ordenar por

`Faturamento`

`Itens vendidos`

`Margem`

### Colunas

`# · Produto · Itens vendidos · Faturamento · Margem`

---

# Desempenho por Produto

### Tooltip

`Compare faturamento, custo, margem e volume para entender o desempenho de cada produto no mix.`

### Busca

`Buscar produto…`

### Categoria

`Todas as categorias`

### Exportação

`Exportar CSV`

### Colunas

`Produto`

`Categoria`

`Faturamento`

`CMV`

`Lucro bruto`

`Margem`

`CMV %`

`Nº de vendas`

`Ticket médio`

`Itens vendidos`

### Empty

`Nenhum produto encontrado.`

---

# Padrão conceitual definitivo

**Faturamento**
Valor vendido em R$.

**CMV**
Custo dos produtos vendidos em R$.

**CMV %**
Percentual do faturamento consumido pelo CMV.

**Lucro bruto**
Faturamento − CMV.

**Margem**
Lucro bruto ÷ faturamento.

**Nº de vendas**
Quantidade de vendas realizadas.

**Itens vendidos**
Quantidade de unidades vendidas.

**Ticket médio**
Faturamento ÷ número de vendas.

**Participação**
Percentual do faturamento representado pela linha dentro do recorte analisado (card Top Linhas).
