# Copy consolidada — Dashboard

Documento único com a copy das telas que já mexemos: **Visão Geral**, **Financeiro**, **Produtos** e **Equipe**.

Público: gestor sênior / franqueado · telas 100% leitura (zero CRUD).

| Tela | Arquivo de origem | Status |
|---|---|---|
| Visão Geral | `docs/copy-visao-geral.md` | Copy final (decisões fechadas) |
| Financeiro | `docs/copy-financeiro.md` | Copy refinada (propostas + motivos) |
| Produtos | `docs/copy-produtos.md` | Copy refinada (já aplicada no código, c/ ajustes) |
| Equipe | `docs/copy-equipe.md` | Inventário atual — **pendente refino** (priorizar títulos Metas / Desafios) |

---

## Índice

1. [Glossário compartilhado](#glossário-compartilhado)
2. [Visão Geral](#visão-geral)
3. [Financeiro](#financeiro)
4. [Produtos](#produtos)
5. [Equipe](#equipe)
6. [Prompt sugerido (ChatGPT)](#prompt-sugerido-chatgpt)

---

## Glossário compartilhado

| Termo | Significado |
|---|---|
| **Faturamento** | Valor bruto vendido no período |
| **CMV** | Custo da Mercadoria Vendida |
| **CMV%** | Parte do faturamento consumida pelo custo |
| **Lucro bruto** | Faturamento − CMV |
| **Margem** | Lucro bruto ÷ Faturamento (antes das despesas fixas) |
| **Nº de vendas / Venda** | Quantidade de compras/transações concluídas |
| **Itens vendidos** | Unidades de produto |
| **Ticket Médio** | Valor médio faturado **por venda** |
| **PA / P.A.** | Quantidade média de itens **por venda** |
| **Meta / Super Meta / Hiper Meta / Meta Desafio** | Degraus da escada de premiação (Equipe) |
| **Premiação** | Prêmio da escada + desafios (não “comissão”) |
| **Grupo 1 / Grupo 2** | Grupos de vendedoras na Equipe |
| **Competência** | Mês da meta/escada/desafios |

### Regras transversais de linguagem

- Preferir **venda** a “atendimento” (exceto se a Equipe mantiver “Atendimentos” de propósito).
- Tooltip (`?`) = como interpretar o indicador (1 frase), não explicar o gráfico.
- Delta nos chips: só `+X%` / `−X%`; base no tooltip `Comparado a {rótulo}: acima/abaixo`.
- Empty padrão: `Sem dados no período selecionado.`

---

## Visão Geral

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
| Tooltip | `Total faturado no período selecionado.` |

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
| Tooltip | `Quantidade de vendas realizadas no período selecionado.` |

### Ticket Médio
| Elemento | Final |
|---|---|
| Label | `Ticket Médio` |
| Sub | `PA {N}` |
| Tooltip | `Valor médio faturado por venda no período selecionado.` |

### Layout (linha meta)
- **Atingimento da Meta** (esquerda, `1fr`) → **Faturamento vs Meta** (direita, `1.6fr`)
- Sem `?` em Ranking de Lojas

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
| Tooltip | `Quanto da meta do mês já foi atingido e quanto ainda falta.` |
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

---

## Financeiro

## 1. Cabeçalho

| Original                                | Proposto                                       | Motivo                                                              |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| `Financeiro`                            | **manter**                                     | Direto e suficiente.                                                |
| `Dashboard › Financeiro`                | **manter**                                     | Hierarquia clara.                                                   |
| `Receita, custos e margem da operação.` | `Receita, custos, lucro e margem da operação.` | “Lucro” é uma dimensão central da tela e merece aparecer no resumo. |
| `Atualizado agora`                      | **manter**                                     | Claro.                                                              |
| `Atualizado há {N} min`                 | **manter**                                     | Compacto.                                                           |
| `Atualizar`                             | **manter**                                     | Ação direta.                                                        |
| `Exportar`                              | **manter**                                     | Padrão conhecido.                                                   |
| `Todas as marcas` / `WEPINK` / `WPINK`  | **manter**                                     | Filtros de negócio.                                                 |

### Subtítulo final recomendado

`Receita, custos, lucro e margem da operação.`

---

# 2. KPIs

## Faturamento

### Label

`Faturamento`

**Manter.**

Sem tooltip.

O indicador é autoexplicativo para esse público e não precisa de `?`.

---

## CMV

### Label

`CMV`

**Manter.**

### Sub

`CMV {N}%`

**Manter.**

### Tooltip atual

`Mostra quanto do faturamento foi consumido pelo custo dos produtos vendidos. Quanto maior o percentual de CMV, maior a pressão sobre a margem.`

### Proposto

`Quanto do faturamento foi consumido pelo custo dos produtos vendidos. Quanto maior o CMV, menor tende a ser a margem.`

### Motivo

Mais curto e mais diretamente ligado à decisão.

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

Mais compacto e conecta diretamente os dois indicadores da tela.

---

## Margem

### Label

`Margem`

**Manter.**

### Tooltip atual

`Percentual de lucro sobre o faturamento, antes das despesas fixas.`

### Proposto

`Percentual do faturamento que permanece como lucro bruto após o CMV.`

### Motivo

Evita a expressão genérica “lucro”, que pode ser confundida com resultado operacional.

---

## Delta dos KPIs

### Atual

`Comparado a {rótulo}: acima/abaixo`

Eu mudaria.

### Proposto

`{X}% acima de {período}`

ou

`{X}% abaixo de {período}`

### Exemplos

`12,4% acima do mês passado`

`3,8% abaixo dos 7 dias anteriores`

`8,1% acima de terça passada`

### Motivo

O tooltip fica mais natural e já entrega valor + direção + referência.

Se o percentual já estiver visível no badge, o tooltip pode ser ainda mais curto:

`Acima de {período}`

`Abaixo de {período}`

---

# 3. CMV, Lucro e Margem

## Título

`CMV, Lucro e Margem`

**Manter.**

O título já explica muito bem a relação que será analisada.

---

## Subtítulo

Atual:

`{período} · por hora`

`{período} · por dia`

`{período} · por mês`

### Manter

Está claro e ajuda o usuário a entender a granularidade sem precisar interpretar o eixo.

---

## Tooltip

### Atual

`Acompanhe se o lucro bruto acompanha o faturamento ou se o CMV está pressionando a margem ao longo do período.`

### Proposto

`Veja se o CMV está pressionando a margem e quanto do faturamento está se convertendo em lucro bruto.`

### Motivo

Traz exatamente as duas perguntas relevantes:

* o custo está pressionando?
* quanto está virando lucro?

Além disso, evita “lucro acompanha faturamento”, que pode ser interpretado de formas diferentes.

---

## Legendas

`Lucro bruto`
`CMV`
`Margem`

**Manter.**

---

# 4. Resultado operacional

## Título

`Resultado operacional`

**Manter.**

---

## Subtítulo

`{período} · por hora/dia/mês`

**Manter.**

---

## Tooltip — visão mensal

### Atual

`O que sobra do lucro bruto depois de aluguel, royalties e marketing — e se esse resultado está melhorando ou piorando ao longo dos meses.`

### Proposto

`Veja quanto sobra após os custos fixos e de franquia e se o resultado operacional está melhorando ou piorando.`

### Motivo

Mais curto, evita listar custos específicos toda vez e se conecta diretamente ao conceito de Resultado operacional.

---

## Tooltip — hora/dia com rateio

### Atual

`O que sobra do lucro bruto depois de aluguel, royalties e marketing. Em períodos curtos, os custos fixos mensais são rateados no eixo (por dia ou por hora).`

### Proposto

`Veja quanto sobra após os custos fixos e de franquia. Em períodos curtos, os custos mensais são rateados por dia ou por hora.`

### Motivo

Mantém a informação metodológica necessária, mas elimina excesso de texto.

---

## Legendas

`Lucro bruto`
`Resultado`
`Margem op.`

**Manter.**

Aqui eu manteria `Resultado` na legenda, mesmo com o título `Resultado operacional`, porque economiza espaço sem perder contexto.

---

# 5. Formas de Pagamento

## Título

`Formas de Pagamento`

**Manter.**

## Tooltip

**Sem `?`.**

Concordo com a decisão. O gráfico é autoexplicativo.

## Centro do donut

`Total`

**Manter.**

## Empty state

`Sem dados no período selecionado.`

**Manter.**

---

# 6. Custos Fixos e Franquia

Aqui eu faria o principal ajuste da tela.

## Título atual

`Custos Fixos e Franquia`

### Proposto

`Custos da Operação`

### Motivo

O card mistura:

* aluguel fixo;
* aluguel variável;
* royalties;
* marketing;
* resultado operacional.

Nem tudo ali é literalmente “custo fixo”, e “Franquia” também não engloba aluguel.

`Custos da Operação` representa melhor o conteúdo.

### Alternativa, se quiser ser mais explícito

`Custos Operacionais e Franquia`

Também funciona, mas eu prefiro **Custos da Operação** pela simplicidade.

---

## Tooltip atual

`O que sobra do lucro bruto depois de aluguel, royalties e taxa de marketing — o resultado operacional do período.`

### Proposto

`Veja quanto os custos da operação consomem do lucro bruto e quanto sobra como resultado operacional.`

### Motivo

Melhor orientação para decisão: custo consumido → resultado restante.

---

## Linhas

### `Lucro bruto`

**Manter.**

### `Aluguel fixo`

**Manter.**

### `Aluguel % shopping (5%)`

Eu ajustaria para:

`Aluguel variável shopping (5%)`

### Motivo

“Aluguel %” soa técnico demais. “Variável” explica melhor a natureza do custo.

Se o percentual for realmente configurável no sistema:

`Aluguel variável shopping ({N}%)`

---

### `Royalties WEPINK (5%)`

Manter estrutura, mas usar percentual dinâmico:

`Royalties WEPINK ({N}%)`

### `Royalties WPINK (5%)`

`Royalties WPINK ({N}%)`

---

### `Taxa de marketing WEPINK (2%)`

`Marketing WEPINK ({N}%)`

### `Taxa de marketing WPINK (2%)`

`Marketing WPINK ({N}%)`

### Motivo

Dentro de uma tabela financeira, “Taxa de” é redundante. O percentual já deixa evidente que é uma cobrança.

Se juridicamente ou no cadastro o nome oficial for “Taxa de marketing”, aí manteria o original.

---

### `Total custos fixos`

Eu mudaria para:

`Total de custos`

### Motivo

Há componentes variáveis dentro do cálculo.

Se a regra contábil do sistema classifica todos esses itens internamente como fixos, pode manter `Total custos fixos`, mas pela copy exibida ao gestor **Total de custos** é mais correto.

---

### `Resultado operacional`

**Manter.**

---

## Estrutura final sugerida

`Lucro bruto`

`Aluguel fixo`

`Aluguel variável shopping ({N}%)`

`Royalties WEPINK ({N}%)`

`Royalties WPINK ({N}%)`

`Marketing WEPINK ({N}%)`

`Marketing WPINK ({N}%)`

`Total de custos`

`Resultado operacional`

---

# 7. Evolução Mensal

## Título

`Evolução Mensal`

**Manter.**

---

## Subtítulo

`Últimos 6 meses`

**Manter.**

Muito importante manter isso visível, já que esse card não segue necessariamente o filtro de período da tela.

---

## Tooltip atual

`Resumo mensal de faturamento, CMV, lucro bruto, margem e ticket médio. Sempre mostra os últimos 6 meses — não segue o filtro de período curto.`

### Proposto

`Compare a evolução mensal dos principais indicadores financeiros. Este quadro sempre considera os últimos 6 meses.`

### Motivo

Mais orientado à leitura e menos parecido com documentação técnica.

Eu evitaria:

`não segue o filtro de período curto`

porque transmite a sensação de exceção ou limitação.

Melhor dizer positivamente qual é a regra:

`sempre considera os últimos 6 meses.`

---

## Colunas

`Mês`
`Faturamento`
`CMV`
`Lucro bruto`
`Margem`
`Ticket Médio`

### Ajuste pequeno

Padronizaria:

`Ticket médio`

com “médio” em minúsculo, assim como `Lucro bruto`.

---

## Empty state

Aqui eu **não usaria**:

`Sem dados no período selecionado.`

porque esse card não depende diretamente do período selecionado.

### Proposto

`Sem dados nos últimos 6 meses.`

### Motivo

Reflete exatamente a janela de dados usada pelo card.

---

# 8. Granularidade

A lógica está boa e eu não mudaria.

### 1 dia

`{período} · por hora`

### 2–31 dias

`{período} · por dia`

### Acima de 31 dias

`{período} · por mês`

É importante manter essa informação no subtítulo dos gráficos porque a unidade muda de acordo com o filtro.

---

# 9. Glossário conceitual

Eu manteria estes conceitos internamente como regra de produto:

### CMV

Custo da Mercadoria Vendida.

### Lucro bruto

Faturamento − CMV.

### Margem

Lucro bruto ÷ Faturamento.

### Ticket médio

Valor médio por venda.

### Resultado operacional

Lucro bruto − custos da operação considerados pelo sistema.

### Margem op.

Resultado operacional ÷ Faturamento.

---

# Copy final recomendada

## Cabeçalho

**Financeiro**

`Receita, custos, lucro e margem da operação.`

---

## KPIs

### Faturamento

Sem tooltip.

### CMV

`CMV {N}%`

Tooltip:

`Quanto do faturamento foi consumido pelo custo dos produtos vendidos. Quanto maior o CMV, menor tende a ser a margem.`

### Lucro bruto

Tooltip:

`Quanto sobra do faturamento após descontar o CMV.`

### Margem

Tooltip:

`Percentual do faturamento que permanece como lucro bruto após o CMV.`

---

## CMV, Lucro e Margem

Tooltip:

`Veja se o CMV está pressionando a margem e quanto do faturamento está se convertendo em lucro bruto.`

---

## Resultado operacional

### Mensal

`Veja quanto sobra após os custos da operação e se o resultado operacional está melhorando ou piorando.`

### Períodos curtos

`Veja quanto sobra após os custos da operação. Em períodos curtos, os custos mensais são rateados por dia ou por hora.`

---

## Formas de Pagamento

Sem tooltip.

---

## Custos da Operação

Tooltip:

`Veja quanto os custos da operação consomem do lucro bruto e quanto sobra como resultado operacional.`

---

## Evolução Mensal

`Últimos 6 meses`

Tooltip:

`Compare a evolução mensal dos principais indicadores financeiros. Este quadro sempre considera os últimos 6 meses.`

Empty:

`Sem dados nos últimos 6 meses.`

---

## Produtos

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

---

## Equipe

> Inventário dos textos **como estão no código hoje**, para refinamento (ChatGPT / revisão).
> Público: gestor sênior / franqueado. Tela 100% leitura (zero CRUD).
>
> **Pedido em aberto:** títulos dos cards `Metas` e `Desafios` estão simples demais — priorizar nomes com mais peso analítico (ex.: mock original: “Escada de Premiação”, “Desafios Ativos”).

---

## Diretriz da tela (contexto)

A tela Equipe responde:

1. Quem está batendo meta e quem precisa de intervenção?
2. Quanto vou pagar de premiação se o mês fechar assim?
3. Os desafios estão engajando a equipe?
4. Estamos melhor ou pior que o período anterior?
5. Como evoluiu o faturamento vs a meta no período?

Vocabulário do negócio:

| Termo | Significado |
|---|---|
| **Meta / Super Meta / Hiper Meta / Meta Desafio** | Degraus da escada de premiação (100% / 120% / 150% / 180%) |
| **Premiação** | Prêmio pago pela escada + desafios (não “comissão” no produto) |
| **P.A.** | Itens por venda |
| **Ticket médio** | Valor médio por venda |
| **Grupo 1 / Grupo 2** | Grupos de vendedoras (ex-turnos Manhã/Tarde) |
| **Competência** | Mês da meta/escada/desafios (pode ser diferente do período filtrado nos KPIs) |

---

## 1. Cabeçalho

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Breadcrumb | `Dashboard` › `Equipe` | | |
| Título | `Equipe` | | |
| Subtítulo | `Performance individual · escada de premiação · desafios` | | |
| Status | `Atualizado agora` / `Atualizado há {N} min` | | |
| Botões | `Atualizar` · `Exportar` | | |
| Filtro marca | `Todas as marcas` · `WEPINK` · `WPINK` | | |
| Filtro grupo | `Todos os grupos` · `Grupo 1` · `Grupo 2` | | |

---

## 2. Avisos

| Situação | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Marca selecionada | `Com marca selecionada, as metas individuais continuam sendo da loja inteira.` | | |
| Período ≠ competência | `KPIs do topo seguem o período filtrado. Meta, escada e desafios são de {mês/ano}.` | | |
| Mês passado | `Meta e premiação valem para a competência {mês/ano}.` | | |
| CTA do aviso | `Ver este mês` | | |

---

## 3. KPIs (4 cards)

### Faturamento

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Label | `Faturamento` | | |
| Sub | `Meta: {R$}` (quando há meta) | | |
| Tooltip (?) | `Receita bruta total da equipe no período.` | | |

### Atendimentos

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Label | `Atendimentos` | | |
| Sub | `média {N}/dia` (quando período > 1 dia) | | |
| Tooltip (?) | `Total de vendas realizadas no período.` | | |

> Nota VG/Produtos: outras telas usam **“Nº de vendas”** em vez de “Atendimentos”. Avaliar alinhamento.

### Ticket médio

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Label | `Ticket médio` | | |
| Sub | `PA {N}` | | |
| Tooltip (?) | `Valor médio por venda (Faturamento ÷ Nº de vendas).` | | |

### P.A.

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Label | `P.A.` | | |
| Sub | _(vazio)_ | | |
| Tooltip (?) | `Itens por venda (Itens ÷ Nº de vendas).` | | |

### Delta (padrão global StatCard)

| Elemento | Texto atual |
|---|---|
| Chip | `+X%` / `−X%` |
| Tooltip do chip | `Comparado a {rótulo}: acima/abaixo` |

---

## 4. Card — Faturamento vs Meta

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Título | `Faturamento vs Meta` | | |
| Tooltip (?) | `Compare o ritmo do faturamento com a meta acumulada e identifique se a equipe está acima ou abaixo do esperado.` | | |
| Subtítulo eixo | `{rótulo do período} · por hora` / `· por dia` / `· por mês` | | |
| Legenda 1 | `Realizado` | | |
| Legenda 2 | `Meta` | | |

---

## 5. Card — Desempenho da meta

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| Título | `Desempenho da meta` | | |
| Tooltip (?) | `Progresso da meta da competência frente à escada de premiação (Meta, Super Meta, Hiper Meta e Meta Desafio).` | | |
| Marcos da barra | `N1 · Meta (1,5%)` · `N2 · Super (2,0%)` · `N3 · Hiper (2,5%)` · `N4 · Desafio (3,0%)` | | |
| Badge ok | `Meta será atingida` | | |
| Badge alerta | `Projeção abaixo da meta` | | |
| Badge dias | `{N}d restantes` | | |

---

## 6. Card — Metas ⚠️ (título prioridade de refino)

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| **Título** | `Metas` | | **Muito genérico** — mock sugeria “Escada de Premiação” |
| Tooltip (?) | `Ranking da escada de premiação: quem bateu Meta, Super, Hiper ou Meta Desafio, quanto falta pro próximo nível e quanto a loja paga de premiação.` | | |
| Empty título | `Sem vendedoras` | | |
| Empty descrição | `Nenhuma vendedora elegível no escopo para o período.` | | |
| Empty tabela | `Sem vendedoras elegíveis no período.` | | |

### Colunas da tabela (desktop)

| Header atual | Proposto | Motivo |
|---|---|---|
| `#` | | |
| `Vendedora` | | |
| `Faturamento` | | |
| `Meta` | | |
| `% Meta indiv.` | | |
| `% Meta geral` | | |
| `Nível atual` | | |
| `Faltam p/ próximo` | | |
| `Premiação` | | |
| `Ticket` _(sem meta ativa)_ | | |
| `P.A.` _(sem meta ativa)_ | | |

### Labels no card mobile (por vendedora)

| Label atual | Proposto | Motivo |
|---|---|---|
| `Faturamento` | | |
| `% Meta` | | |
| `Nível` | | |
| `Próximo` | | |
| `Premiação` | | |
| `{N} vendas · Ticket {R$}` | | |

### Subtítulo sob o nome da vendedora

| Texto atual | Proposto | Motivo |
|---|---|---|
| `{Grupo 1\|Grupo 2\|Sem grupo}` | | |
| `{Grupo} · {loja}` _(visão rede)_ | | |

---

## 7. Card — Desafios ⚠️ (título prioridade de refino)

| Elemento | Texto atual | Proposto | Motivo |
|---|---|---|---|
| **Título** | `Desafios` | | **Muito genérico** — mock sugeria “Desafios Ativos” |
| Tooltip (?) | `Campanhas com prêmio para quem bate a meta no período. Acompanhe progresso por vendedora, status e prazo.` | | |
| Empty título | `Sem desafios` | | |
| Empty descrição | `Nenhum desafio cadastrado para {mês/ano}.` | | |
| Empty lista | `Sem participantes no escopo.` | | |

### Status / badges do desafio

| Texto atual | Proposto | Motivo |
|---|---|---|
| `Ativo` | | |
| `A começar` | | |
| `Encerrado` | | |
| Prazo tipo `{N}d` / `Em {N}d` / `Encerrado` | | |

### Texto gerado do objetivo (template)

```
{objetivo} Meta: {meta}. Mínimo: {mínimo}. Prêmio: {R$}.
```
ou, sem mínimo:
```
{objetivo} Meta: {meta}. Prêmio: {R$}.
```

---

## 8. Nomes da escada (dados / mock)

| Nível | Nome atual | % min | Comissão | Proposto |
|---|---|---|---|---|
| N1 | `Meta` | 100% | 1,5% | |
| N2 | `Super Meta` | 120% | 2,0% | |
| N3 | `Hiper Meta` | 150% | 2,5% | |
| N4 | `Meta Desafio` | 180% | 3,0% | |

Rótulo curto na barra (remove prefixo “Meta ”): `Meta` · `Super` · `Hiper` · `Desafio`

---

## 9. Prompt sugerido para o ChatGPT

```
Você é copywriter de produto de BI para rede de franquias de cosméticos (WEPINK/WPINK).
Público: gestor sênior / franqueado — textos para tomada de decisão, não marketing.

Refine a copy da tela Dashboard → Equipe no arquivo abaixo.
Regras:
- Português do Brasil, claro e direto
- Títulos de card devem dizer O QUE o gestor lê ali (não genéricos)
- Tooltip (?) = como interpretar o indicador, 1 frase
- Prioridade: renomear cards "Metas" e "Desafios" (estão simples demais)
- Manter termos de negócio: Meta / Super Meta / Hiper Meta / Meta Desafio, Premiação, P.A., Ticket, Grupo
- Alinhar "Atendimentos" vs "Nº de vendas" com as outras telas do dashboard, se fizer sentido
- Devolver tabela Original | Proposto | Motivo para cada bloco
```

---

## Referência rápida — títulos de cards em outras telas

Para calibrar o tom:

- Visão Geral: `Atingimento da Meta`, `Faturamento vs Meta`, `Top Vendedoras`
- Financeiro: `CMV, Lucro e Margem`, `Custos da Operação`, `Evolução Mensal`
- Produtos: `Faturamento por Categoria`, `Desempenho por Produto`
- Turnos: `Faturamento por Dia × Turno`, `Mapa de Calor por Hora`

---

## Prompt sugerido (ChatGPT)

```
Você é copywriter de produto de BI para rede de franquias de cosméticos (WEPINK/WPINK).
Público: gestor sênior / franqueado — textos para tomada de decisão, não marketing.

Revise a copy consolidada do Dashboard (Visão Geral, Financeiro, Produtos, Equipe).
Regras:
- Português do Brasil, claro e direto
- Manter consistência de termos entre as 4 telas (glossário do documento)
- Títulos de card devem dizer O QUE o gestor lê ali
- Tooltip (?) = como interpretar o indicador, 1 frase
- Prioridade na Equipe: renomear cards "Metas" e "Desafios" (estão simples demais)
- Alinhar "Atendimentos" (Equipe) vs "Nº de vendas" (outras telas), se fizer sentido
- Não inventar widgets novos — só copy
- Devolver, por tela, tabela Original | Proposto | Motivo só onde houver mudança
```

---

## Arquivos por tela (fonte)

- `docs/copy-visao-geral.md`
- `docs/copy-financeiro.md`
- `docs/copy-produtos.md`
- `docs/copy-equipe.md`