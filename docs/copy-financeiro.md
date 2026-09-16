# Copy refinada — Dashboard → Financeiro

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
