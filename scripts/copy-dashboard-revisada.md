# Copy revisada — Dashboard de gestão WEPINK / WPINK

> **Base da revisão:** inventário do código de 19/09/2026.  
> **Escopo:** chrome global, Visão Geral, Financeiro, Produtos, Equipe, Ao Vivo e Metas.  
> **Objetivo:** reduzir poluição, aumentar clareza gerencial e padronizar a linguagem sem alterar funcionalidades ou arquitetura.

---

## Direção editorial

1. Usar títulos curtos, com maiúscula apenas na primeira palavra: `Faturamento por categoria`, não `Faturamento por Categoria`.
2. Usar `venda` para transações e `itens vendidos` para unidades. Não usar `atendimento` como sinônimo de venda.
3. Manter subtítulos de KPI somente quando acrescentarem uma segunda leitura útil.
4. Usar tooltip apenas quando houver conceito técnico, regra de cálculo ou risco de interpretação errada.
5. Não usar tooltip para descrever literalmente o gráfico.
6. Padronizar `P.A.` em todas as telas.
7. Escrever nomes completos quando houver espaço: `Margem operacional`, não `Margem op.`.
8. Usar `premiação` para escadas e desafios. Percentuais da faixa podem continuar visíveis quando fizerem parte da regra vigente.
9. Encerrar mensagens e avisos completos com ponto; deixar labels, títulos, botões e estados muito curtos sem ponto.
10. Fazer o texto orientar leitura e decisão, sem prometer análises que a tela não entrega.

---

# 1. Chrome global

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Menu | `Dashboard` | Manter | `Dashboard` | Nome consolidado e claro. |
| Menu | `Visão Geral` | Reescrever | `Visão geral` | Padronização de caixa. |
| Menu | `Financeiro` | Manter | `Financeiro` | Claro. |
| Menu | `Produtos` | Manter | `Produtos` | Claro. |
| Menu | `Equipe` | Manter | `Equipe` | Claro. |
| Menu | `Ao Vivo` | Reescrever | `Ao vivo` | Padronização de caixa. |
| Menu | `Metas` | Manter | `Metas` | Claro. |
| Seletor de loja | `Todas as lojas` | Manter | `Todas as lojas` | Opção de rede direta. |
| Seletor de loja | `Rede consolidada` | Manter | `Rede consolidada` | Explica que os dados serão somados. |
| Seletor de loja | `{fantasia}` + `{CNPJ}` | Manter | Sem alteração | Ajuda a diferenciar unidades com nomes próximos. |
| Período | `Período personalizado` | Manter | `Período personalizado` | Claro. |
| Período | `Períodos rápidos` | Reescrever | `Períodos` | “Rápidos” não acrescenta informação. |
| Preset | `Últimos 7 dias` | Manter | `Últimos 7 dias` | Claro. |
| Preset | `Últimos 30 dias` | Manter | `Últimos 30 dias` | Claro. |
| Calendário | `Clique no dia inicial, depois no final.` | Reescrever | `Selecione o primeiro e o último dia.` | Mais curto e natural. |
| Calendário | `Selecione o dia final do intervalo.` | Reescrever | `Agora selecione o último dia.` | Orientação direta. |
| Sincronização | `Atualizado agora` / `Atualizado há {N} min` | Manter | Sem alteração | Informação operacional útil. |
| Ação | `Atualizar` | Manter | `Atualizar` | Claro. |
| Ação | `Exportar` | Manter | `Exportar` | Claro. |
| Delta | `Comparação com {vs}` | Reescrever | `Em relação a {vs}` | Mais curto e natural. Ex.: “Em relação ao mês passado”. |
| Filtro | `Todas as marcas` | Manter | `Todas as marcas` | Claro. |
| Empty state | `Sem dados no período selecionado.` | Manter | `Sem dados no período selecionado.` | Padrão neutro e reutilizável. |

### Padrão final para comparativos

- Valor do delta: `+8,4%`, `−3,1%` ou `+2,4 p.p.`
- Tooltip: `Em relação ao mês passado.` / `Em relação aos 7 dias anteriores.`
- Não repetir “comparação” no card e no tooltip.

---

# 2. Visão geral

## Cabeçalho

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Título | `Visão Geral` | Reescrever | `Visão geral` | Padronização de caixa. |
| Subtítulo | `Principais indicadores, metas e desempenho da operação.` | Reescrever | `Indicadores, metas e desempenho da operação.` | “Principais” é implícito. |

## KPIs

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| KPI | `Faturamento` | Manter | `Faturamento` | Termo central e conhecido. |
| Sub do faturamento | `Meta: {R$}` | Manter | `Meta: {R$}` | Dá contexto imediato ao valor realizado. |
| KPI | `CMV` | Manter | `CMV` | Termo já adotado pelo público. |
| Sub do CMV | `CMV {N}%` | Reescrever | `{N}% do faturamento` | Evita repetir o nome do KPI e interpreta o percentual. |
| Tooltip do CMV | `Custo dos produtos vendidos. Quanto maior o CMV %, maior a pressão sobre a margem.` | Reescrever | `Percentual do faturamento consumido pelo custo dos produtos vendidos.` | Unifica o conceito e evita julgamento genérico. |
| KPI | `Nº de vendas` | Manter | `Nº de vendas` | Termo correto para transações. |
| Sub de vendas | `{N} itens vendidos` | Manter | `{N} itens vendidos` | Acrescenta volume sem duplicar o KPI. |
| KPI | `Ticket médio` | Manter | `Ticket médio` | Termo conhecido. |
| Sub do ticket | `P.A. {N}` | Manter | `P.A. {N}` | Boa leitura combinada de valor e itens por venda. |

**Decisão de densidade:** os subtítulos permanecem na Visão geral porque formam pares úteis: faturamento/meta, CMV/CMV%, vendas/itens e ticket/P.A. Eles não devem ganhar novos tooltips, com exceção do CMV.

## Cards

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Card | `Atingimento da Meta` | Reescrever | `Atingimento da meta` | Padronização de caixa. |
| Tooltip | `Quanto da meta do mês já foi atingido e quanto ainda falta.` | Remover | — | O gauge e as linhas `Meta`/`Faltam` já tornam a leitura evidente. |
| Gauge | `da meta` | Manter | `da meta` | Completa o percentual. |
| Linha | `Meta do mês` | Manter | `Meta do mês` | Distingue a meta mensal do período filtrado. |
| Linha | `Faltam` | Manter | `Faltam` | Direto e orientado à ação. |
| Linha | `Projeção` | Manter | `Projeção` | Claro. |
| Status | `Meta atingida` | Manter | `Meta atingida` | Positivo e objetivo. |
| Projeção | `~{R$} ({N}% da meta)` | Reescrever | `{R$} · {N}% da meta` | Retira o `~`, que parece imprecisão visual; “Projeção” já sinaliza estimativa. |
| Empty | `Nenhuma meta cadastrada para o período.` | Reescrever | `Nenhuma meta cadastrada para este período.` | Leitura mais natural. |
| Card | `Faturamento vs Meta` | Reescrever | `Faturamento x meta` | Curto, comercial e consistente. |
| Tooltip | Texto longo iniciado por `Compare o ritmo...` | Reescrever | `Mostra se o faturamento acompanha o ritmo necessário para atingir a meta.` | Orienta a interpretação sem narrar o gráfico. |
| Série | `{período} · por hora\|dia\|mês` | Manter | Sem alteração | Contextualiza a granularidade. |
| Legendas | `Realizado` / `Meta` | Manter | Sem alteração | Claras. |
| Card | `Categorias vs Meta` | Reescrever | `Categorias x meta` | Mais curto e consistente. |
| Tooltip | Texto longo iniciado por `Compare o faturamento...` | Reescrever | `Evidencia as categorias acima ou abaixo da meta no período.` | Foca no insight. |
| Card | `Dia da Semana vs Meta` | Reescrever | `Dias da semana x meta` | Mais natural e curto. |
| Tooltip | Texto longo iniciado por `Compare o faturamento médio...` | Reescrever | `Revela em quais dias o faturamento médio supera ou fica abaixo da meta diária.` | Explica a decisão possível. |
| Card | `Ranking de Lojas` | Reescrever | `Ranking de lojas` | Padronização de caixa. |
| Badge | `Total {R$}` | Reescrever | `Rede: {R$}` | Evita repetir `Total` no badge e no donut. |
| Donut | `Total` | Manter | `Total` | Funciona como centro do gráfico. |
| Loja | `{N}% da meta` | Manter | Sem alteração | Indicador essencial. |
| Card | `Formas de Pagamento` | Reescrever | `Formas de pagamento` | Padronização de caixa. |
| Card | `Top Vendedoras` | Reescrever | `Top vendedoras` | Padronização de caixa. |
| Métrica | `Ticket {R$}` | Reescrever | `Ticket médio {R$}` | Evita abreviação conceitual. |
| Card | `Top Produtos` | Reescrever | `Top produtos` | Padronização de caixa. |
| Coluna | `Variação` | Manter | `Variação` | Clara se o tooltip do delta estiver disponível. |

### Copy final — Visão geral

```text
Visão geral
Indicadores, metas e desempenho da operação.

Faturamento
Meta: {R$}

CMV
{N}% do faturamento
Tooltip: Percentual do faturamento consumido pelo custo dos produtos vendidos.

Nº de vendas
{N} itens vendidos

Ticket médio
P.A. {N}

Atingimento da meta
Faturamento · Meta do mês · Faltam · Projeção

Faturamento x meta
Tooltip: Mostra se o faturamento acompanha o ritmo necessário para atingir a meta.

Categorias x meta
Tooltip: Evidencia as categorias acima ou abaixo da meta no período.

Dias da semana x meta
Tooltip: Revela em quais dias o faturamento médio supera ou fica abaixo da meta diária.

Ranking de lojas
Formas de pagamento
Top vendedoras
Top produtos
```

---

# 3. Financeiro

## Cabeçalho e KPIs

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Subtítulo | `Receita, custos, lucro e margem da operação.` | Reescrever | `Receita, custos e margem da operação.` | “Lucro” já aparece nos indicadores e se sobrepõe a resultado/margem. |
| KPI | `Faturamento` | Manter | `Faturamento` | Claro. |
| KPI | `CMV` | Manter | `CMV` | Claro para o público. |
| Sub do CMV | `CMV {N}%` | Reescrever | `{N}% do faturamento` | Mesmo padrão da Visão geral. |
| Tooltip do CMV | Redação diferente da Visão geral | Reescrever | `Percentual do faturamento consumido pelo custo dos produtos vendidos.` | Uma definição única em todo o app. |
| KPI | `Lucro bruto` | Manter | `Lucro bruto` | Conceito financeiro correto. |
| KPI | `Margem` | Manter | `Margem` | Claro no contexto. |
| Tooltip da margem | `Percentual do faturamento que permanece como lucro bruto após o CMV.` | Manter | Sem alteração | Definição correta e útil. |

## Cards

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Card | `CMV, Lucro e Margem` | Reescrever | `CMV, lucro e margem` | Padronização de caixa. |
| Tooltip | `Veja se o CMV está pressionando...` | Reescrever | `Mostra quanto do faturamento vira custo, lucro bruto e margem.` | Mais curto e objetivo. |
| Legenda | `Lucro bruto` · `CMV` · `Margem` | Manter | Sem alteração | Clara. |
| Card | `Resultado operacional` | Manter | `Resultado operacional` | Nome correto. |
| Tooltip curto | Texto sobre custos rateados | Reescrever | `Em períodos curtos, os custos mensais são rateados por dia ou por hora.` | Mantém apenas a regra não óbvia. |
| Tooltip normal | `Veja quanto sobra após os custos...` | Reescrever | `Valor que permanece após descontar os custos da operação do lucro bruto.` | Define o indicador sem linguagem vaga. |
| Legenda | `Resultado` | Reescrever | `Resultado operacional` | Evita ambiguidade. |
| Legenda | `Margem op.` | Reescrever | `Margem operacional` | Prioriza clareza; abreviar apenas se o gráfico não comportar. |
| Card | `Custos da Operação` | Reescrever | `Custos da operação` | Padronização de caixa. |
| Tooltip | `Desconta do lucro bruto os custos...` | Reescrever | `Detalha os custos descontados do lucro bruto para chegar ao resultado operacional.` | Mais preciso e não limita os custos aos exemplos. |
| Linha | `Total de custos` | Manter | `Total de custos` | Clara. |
| Card | `Formas de Pagamento` | Reescrever | `Formas de pagamento` | Padronização de caixa. |
| Card | `Faturamento por Marca` | Reescrever | `Faturamento por marca` | Padronização de caixa. |
| Card | `Evolução Mensal` | Reescrever | `Evolução mensal` | Padronização de caixa. |
| Tooltip | `Compare a evolução mensal... Este quadro sempre...` | Remover | — | O título, subtítulo `Últimos 6 meses` e as colunas já explicam o quadro. |
| Sub | `Últimos 6 meses` | Manter | `Últimos 6 meses` | Expõe o recorte fixo. |
| Empty | `Sem dados nos últimos 6 meses.` | Manter | Sem alteração | Específico e útil. |

### Copy final — Financeiro

```text
Financeiro
Receita, custos e margem da operação.

CMV
{N}% do faturamento
Tooltip: Percentual do faturamento consumido pelo custo dos produtos vendidos.

Margem
Tooltip: Percentual do faturamento que permanece como lucro bruto após o CMV.

CMV, lucro e margem
Tooltip: Mostra quanto do faturamento vira custo, lucro bruto e margem.

Resultado operacional
Tooltip padrão: Valor que permanece após descontar os custos da operação do lucro bruto.
Tooltip em período curto: Em períodos curtos, os custos mensais são rateados por dia ou por hora.

Custos da operação
Tooltip: Detalha os custos descontados do lucro bruto para chegar ao resultado operacional.

Formas de pagamento
Faturamento por marca
Evolução mensal
Últimos 6 meses
```

---

# 4. Produtos

## Cabeçalho e KPIs

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Subtítulo | `Desempenho, margem e composição do mix de produtos.` | Manter | Sem alteração | Define bem o propósito da tela. |
| KPIs | `Faturamento` · `Lucro bruto` · `Margem` · `Itens vendidos` | Manter | Sem alteração | Conjunto enxuto e coerente. |
| Tooltip margem | Definição atual | Manter | `Percentual do faturamento que permanece como lucro bruto após o CMV.` | Padronização com Financeiro. |

## Cards e tabela

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Card | `Faturamento por Categoria` | Reescrever | `Faturamento por categoria` | Padronização de caixa. |
| Card | `Curva ABC de Categorias` | Reescrever | `Curva ABC por categoria` | Mais natural e mantém o conceito. |
| Tooltip Curva ABC | Definição longa com Pareto e limites | Reescrever | `Classifica as categorias pela participação acumulada no faturamento: A até 80%, B até 95% e C no restante.` | Preserva a regra e elimina explicação excessiva. |
| Classes | `Classe A` / `Classe B` / `Classe C` | Manter | Sem alteração | Necessárias para leitura. |
| Card | `Top Linhas de Produto` | Reescrever | `Top linhas de produto` | Padronização de caixa. |
| Card | `Top Produtos` | Reescrever | `Top produtos` | Padronização de caixa. |
| Coluna | `Itens` | Reescrever | `Itens vendidos` | Mesma nomenclatura dos KPIs. |
| Card | `Desempenho por Produto` | Reescrever | `Desempenho por produto` | Padronização de caixa. |
| Busca | `Buscar produto…` | Manter | Sem alteração | Direto. |
| Filtro | `Todas as categorias` | Manter | Sem alteração | Claro. |
| Ação | `Exportar CSV` | Manter | Sem alteração | Específica e útil. |
| Coluna | `% Margem` | Reescrever | `Margem` | O formato percentual já aparece nos valores. |
| Coluna | `Qtd vendas` | Reescrever | `Nº de vendas` | Padrão global. |
| Coluna | `Qtd itens` | Reescrever | `Itens vendidos` | Padrão global. |
| Total | `Total do filtro` | Manter | `Total do filtro` | Distingue o total da página. |
| Tooltip total | `Soma todos os produtos...` | Reescrever | `Soma todos os produtos do filtro, inclusive os que não aparecem nesta página.` | Mais direto. |
| Paginação | `Mostrando {a} de {b} produtos` | Manter | Sem alteração | Clara. |
| Empty | `Nenhum produto encontrado.` | Manter | Sem alteração | Correto para busca/filtro sem resultado. |

### Cabeçalhos finais da tabela e do CSV

```text
Produto;Categoria;Faturamento;CMV;Lucro bruto;Margem;CMV %;Nº de vendas;Ticket médio;Itens vendidos
```

### Copy final — Produtos

```text
Produtos
Desempenho, margem e composição do mix de produtos.

Faturamento por categoria
Curva ABC por categoria
Tooltip: Classifica as categorias pela participação acumulada no faturamento: A até 80%, B até 95% e C no restante.

Top linhas de produto
Top produtos
Desempenho por produto
```

---

# 5. Equipe

## Cabeçalho, avisos e KPIs

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Subtítulo | `Desempenho individual, metas, premiações e desafios da equipe.` | Manter | Sem alteração | Resume bem a tela. |
| Filtro | `Todos os grupos` | Manter | Sem alteração | Claro. |
| Aviso de marca | Texto atual | Reescrever | `O filtro de marca altera os resultados, mas as metas individuais continuam considerando toda a loja.` | Mais curto e natural. |
| Aviso de competência, caso 1 | `Os KPIs seguem...` | Reescrever | `Os indicadores seguem o período selecionado. Metas, premiações e desafios consideram a competência {mês}.` | Evita sigla desnecessária no aviso. |
| Aviso de competência, caso 2 | `Metas e premiações exibidas são da competência...` | Reescrever | `Metas e premiações referentes à competência {mês}.` | Mais curto. |
| CTA | `Ver este mês` | Manter | Sem alteração | Ação clara. |
| KPI | `Faturamento` + `Meta: {R$}` | Manter | Sem alteração | Par útil. |
| KPI | `Nº de vendas` + `média {N}/dia` | Manter | `Nº de vendas` + `Média de {N}/dia` | Melhor legibilidade e caixa consistente. |
| KPI | `Ticket médio` + `P.A. {x}` | Reescrever | `Ticket médio` sem subtítulo | O P.A. já possui um KPI próprio ao lado; aqui seria duplicação. |
| KPI | `P.A.` | Manter | `P.A.` | Indicador próprio e relevante para gestão comercial. |
| Tooltip P.A. | `Quantidade média de itens vendidos por venda.` | Manter | Sem alteração | Explica uma sigla não óbvia. |

## Cards

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Card | `Faturamento vs Meta` | Reescrever | `Faturamento x meta` | Padrão da Visão geral. |
| Card | `Progresso da Meta` | Reescrever | `Projeção da meta` | O conteúdo principal é o avanço projetado até o fechamento. |
| Tooltip | `Acompanhe o avanço...` | Reescrever | `Projeta o nível de premiação esperado para o fechamento da competência.` | Foco no insight, não na ação de “acompanhar”. |
| Badge | `Projeção: {N}% da meta` | Reescrever | `Projeção: {N}%` | O título e a escada já dão o contexto. |
| Prazo | `{N}d` | Reescrever | `{N} dias` | Mais legível. Usar `1 dia` no singular. |
| Prazo | `Encerrado` | Manter | Sem alteração | Claro. |
| Degraus | `N1 · Meta...` até `N4 · Desafio...` | Manter com dados dinâmicos | `{nível} · {nome} ({percentual})` | A estrutura é boa, mas nomes e percentuais devem vir da competência vigente. |
| Card | `Escada de Premiação` | Reescrever | `Escada de premiação` | Padronização de caixa. |
| Tooltip | `Veja quem já atingiu...` | Reescrever | `Mostra o nível atual, quanto falta para o próximo e a premiação estimada de cada vendedora.` | Mais específico. |
| Coluna | `% Meta individual` | Reescrever | `% da meta individual` | Leitura natural. |
| Coluna | `% Meta geral` | Reescrever | `% da meta da loja` | “Geral” é ambíguo. |
| Coluna | `Faltam p/ próximo nível` | Reescrever | `Faltam para o próximo nível` | Evita abreviação. |
| Célula | `p/ {próximo}` | Reescrever | `para {próximo}` | Evita abreviação. |
| Empty | `Sem dados para o período selecionado` | Reescrever | `Sem dados no período selecionado.` | Padrão global. |
| Card | `Desempenho nos Desafios` | Reescrever | `Desafios da equipe` | Mais curto e direto. |
| Tooltip | `Acompanhe o progresso...` | Reescrever | `Mostra o progresso, o prazo e a premiação de cada desafio.` | Mais conciso. |
| Labels | `Meta:` · `Mínimo:` · `Prêmio:` · `Gerente:` | Manter | Sem alteração | Necessárias para entender as regras. |
| Prazo | `Em {N}d` | Reescrever | `Em {N} dias` | Mais legível. |
| Empty | `Nenhum desafio nesta competência` | Reescrever | `Nenhum desafio nesta competência.` | Pontuação consistente para frase completa. |
| Empty interno | `Nenhuma participante no escopo atual.` | Reescrever | `Nenhuma participante nos filtros atuais.` | “Escopo” soa técnico e vago. |

### Copy final — Equipe

```text
Equipe
Desempenho individual, metas, premiações e desafios da equipe.

Faturamento x meta

Projeção da meta
Tooltip: Projeta o nível de premiação esperado para o fechamento da competência.

Escada de premiação
Tooltip: Mostra o nível atual, quanto falta para o próximo e a premiação estimada de cada vendedora.

Desafios da equipe
Tooltip: Mostra o progresso, o prazo e a premiação de cada desafio.
```

---

# 6. Ao vivo

## Cabeçalho e KPIs do mês

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Título | `Ao Vivo` | Reescrever | `Ao vivo` | Padronização de caixa. |
| Subtítulo | `Andamento de {MM}/{AAAA} · pulso do dia nos indicadores` | Reescrever | `Resultado do mês e desempenho de hoje.` | Mais humano e fácil de escanear. A competência já aparece nos KPIs. |
| Ações | `Atualizar` / `Compartilhar` | Manter | Sem alteração | Claras. |
| Sub KPI | `Competência do mês` | Reescrever | `{mês de AAAA}` | Expõe a competência concreta em vez de repetir conceito. |
| KPI | `Meta Mensal` | Reescrever | `Meta mensal` | Padronização de caixa. |
| KPI | `Atingimento` | Manter | `Atingimento` | Claro. |
| Sub atingimento | `{fat} / {meta}` | Reescrever | `{fat} de {meta}` | Leitura mais natural que uma barra. |
| Sem meta | `Sem meta na competência` | Reescrever | `Sem meta para este mês` | Linguagem simples no KPI. |

## Pulso do dia

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| KPI | `Faturamento hoje` | Manter | `Faturamento hoje` | Claro. |
| Sub | `Caixa do dia` | Remover | — | Ambíguo e redundante. |
| KPI | `Nº de vendas hoje` | Manter | `Nº de vendas hoje` | Padrão global. |
| Sub | `Atendimentos` | Remover | — | Inconsistente: atendimento não é necessariamente venda. |
| KPI | `Ticket médio hoje` | Manter | `Ticket médio hoje` | Claro. |
| Sub | `Por venda` | Remover | — | O conceito de ticket médio já está consolidado. |
| KPI | `Itens hoje` | Reescrever | `Itens vendidos hoje` | Elimina ambiguidade. |
| Sub | `Unidades` | Remover | — | Passa a ser redundante após reescrever o título. |

## Competência e rankings

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Card | `Andamento da competência` | Reescrever | `Desempenho do mês` | Mais simples para leitura frequente. |
| Abas | `Ranking` · `Desafios` · `Metas` | Manter | Sem alteração | Claras. |
| Empty ranking | `Nenhuma venda no mês` | Reescrever | `Nenhuma venda registrada neste mês.` | Frase completa. |
| Apoio do empty | `Lance vendas para ver...` | Reescrever | `O ranking aparecerá após o registro das primeiras vendas.` | Não pressupõe que o gestor lança vendas manualmente. |
| Empty meta | `Sem meta na competência` | Reescrever | `Nenhuma meta cadastrada para este mês.` | Consistente e claro. |
| Apoio meta | `Cadastre a meta da loja em Metas…` | Reescrever | `Cadastre a meta da loja em Metas.` | Direto, sem reticências. |
| Card | `Ranking de Lojas` | Reescrever | `Ranking de lojas` | Padronização de caixa. |
| Badge | `Total {R$}` | Reescrever | `Rede: {R$}` | Mesmo padrão da Visão geral. |
| Empty | `Sem dados na competência.` | Reescrever | `Sem dados para este mês.` | Mais simples. |
| Card | `Ranking Vendedoras` | Reescrever | `Ranking de vendedoras` | Correção gramatical. |
| Métrica | `Ticket {R$}` | Reescrever | `Ticket médio {R$}` | Precisão conceitual. |

## Compartilhar e Modo TV

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Compartilhar — sub | `Link e layout para notebook/TV da loja.` | Reescrever | `Link para compartilhar o painel da loja.` | Descreve a finalidade sem limitar o dispositivo. |
| Modo TV — sub | `Exibição em tela cheia para a loja.` | Manter | Sem alteração | Claro. |
| Status | `Em construção` | Reescrever | `Em breve` | Mais adequado em interface para usuário final. |
| Texto de próximo corte | Texto técnico de implementação | Remover | — | Informação de roadmap interno não deve aparecer no produto. |

### Copy final — Ao vivo

```text
Ao vivo
Resultado do mês e desempenho de hoje.

Faturamento · {mês de AAAA}
Nº de vendas · {mês de AAAA}
Meta mensal · {mês de AAAA}
Atingimento · {faturamento} de {meta}

Faturamento hoje
Nº de vendas hoje
Ticket médio hoje
Itens vendidos hoje

Desempenho do mês
Ranking · Desafios · Metas

Ranking de lojas
Ranking de vendedoras
```

---

# 7. Metas

| Local | Texto atual | Decisão | Texto proposto | Motivo |
|---|---|---|---|---|
| Subtítulo | `Meta mensal por loja, escada de degraus e distribuição individual.` | Reescrever | `Metas mensais, níveis de premiação e distribuição por vendedora.` | Elimina a repetição “escada de degraus” e esclarece o destino individual. |
| Botão | `Nova meta` | Manter | `Nova meta` | Ação correta. |
| Estado do botão | `Em breve` | Manter temporariamente | `Em breve` | Adequado enquanto a ação estiver indisponível. |
| Card | `Metas cadastradas` | Manter | Sem alteração | Claro. |
| Sub | `Listagem a partir dos dados de demonstração. Edição e plano do mês entram na próxima etapa.` | Remover | — | Texto técnico e temporário não deve chegar ao usuário final. |
| Coluna | `Competência` | Manter | Sem alteração | Termo correto nessa tela de cadastro. |
| Coluna | `Meta da loja` | Manter | Sem alteração | Clara. |
| Coluna | `Degraus` | Reescrever | `Níveis de premiação` | Mais compreensível e consistente. |
| Contador | `{N} meta(s)` | Manter | `{N} meta` / `{N} metas` | Garantir flexão correta no código. |
| Empty | `Nenhuma meta cadastrada.` | Manter | Sem alteração | Claro. |

### Copy final — Metas

```text
Metas
Metas mensais, níveis de premiação e distribuição por vendedora.

Nova meta
Metas cadastradas

Competência · Loja · Nome · Meta da loja · Níveis de premiação
```

---

# 8. Tooltips finais aprovados

Esta é a lista completa recomendada. Tooltips que não aparecem aqui devem ser removidos.

| Tela | Local | Texto final |
|---|---|---|
| Global | Delta | `Em relação a {vs}.` |
| Visão geral / Financeiro | CMV | `Percentual do faturamento consumido pelo custo dos produtos vendidos.` |
| Visão geral | Faturamento x meta | `Mostra se o faturamento acompanha o ritmo necessário para atingir a meta.` |
| Visão geral | Categorias x meta | `Evidencia as categorias acima ou abaixo da meta no período.` |
| Visão geral | Dias da semana x meta | `Revela em quais dias o faturamento médio supera ou fica abaixo da meta diária.` |
| Financeiro / Produtos | Margem | `Percentual do faturamento que permanece como lucro bruto após o CMV.` |
| Financeiro | CMV, lucro e margem | `Mostra quanto do faturamento vira custo, lucro bruto e margem.` |
| Financeiro | Resultado operacional | `Valor que permanece após descontar os custos da operação do lucro bruto.` |
| Financeiro | Resultado em período curto | `Em períodos curtos, os custos mensais são rateados por dia ou por hora.` |
| Financeiro | Custos da operação | `Detalha os custos descontados do lucro bruto para chegar ao resultado operacional.` |
| Produtos | Curva ABC | `Classifica as categorias pela participação acumulada no faturamento: A até 80%, B até 95% e C no restante.` |
| Produtos | Total do filtro | `Soma todos os produtos do filtro, inclusive os que não aparecem nesta página.` |
| Equipe | P.A. | `Quantidade média de itens vendidos por venda.` |
| Equipe | Projeção da meta | `Projeta o nível de premiação esperado para o fechamento da competência.` |
| Equipe | Escada de premiação | `Mostra o nível atual, quanto falta para o próximo e a premiação estimada de cada vendedora.` |
| Equipe | Desafios da equipe | `Mostra o progresso, o prazo e a premiação de cada desafio.` |

## Tooltips removidos

- Atingimento da meta: o componente já se explica visualmente.
- Evolução mensal: título, recorte e colunas já explicam o conteúdo.
- KPIs autoexplicativos: Faturamento, Nº de vendas, Ticket médio, Lucro bruto e Itens vendidos.
- Formas de pagamento, rankings e tops: títulos e labels já são suficientes.

---

# 9. Inconsistências transversais a corrigir

| Tema | Estado inconsistente | Padrão definitivo |
|---|---|---|
| Caixa dos títulos | `Visão Geral`, `Top Produtos`, `Custos da Operação` | Apenas a primeira palavra em maiúscula: `Visão geral`, `Top produtos`, `Custos da operação`. |
| Venda x atendimento | `Atendimentos` no Ao vivo | Usar `Nº de vendas` para transações. |
| Itens | `Itens`, `Qtd itens`, `Unidades` | Usar `Itens vendidos`. |
| Quantidade de vendas | `Qtd vendas` | Usar `Nº de vendas`. |
| P.A. | Possíveis ocorrências de `PA` | Usar sempre `P.A.`. |
| CMV tooltip | Duas redações | Usar uma única definição em todas as telas. |
| CMV subtítulo | `CMV {N}%` | Usar `{N}% do faturamento`. |
| Meta comparada | `vs Meta` | Usar `x meta` nos títulos. |
| Ticket | `Ticket {R$}` | Usar `Ticket médio {R$}`. |
| Margem operacional | `Margem op.` | Usar `Margem operacional` quando houver espaço. |
| Resultado | `Resultado` em legenda | Usar `Resultado operacional`. |
| Meta geral | `% Meta geral` | Usar `% da meta da loja`. |
| Prazo | `{N}d`, `Em {N}d` | Usar `{N} dias`, `Em {N} dias`; tratar singular. |
| Competência | Usada em áreas de leitura rápida | Em Ao vivo, preferir `este mês` ou o nome do mês; manter `competência` em Metas e Equipe, onde é regra de negócio. |
| Empty states | Com e sem ponto | Frases completas com ponto; labels curtas sem ponto. |
| Premiação | “Comissão” em documentos antigos | Usar `premiação` para escadas e desafios. |
| Degraus fixos | Percentuais divergentes entre fixture e documentação | Exibir nomes e percentuais vindos da configuração da competência, nunca hardcoded na copy. |

---

# 10. Top 10 mudanças de maior impacto

1. **Padronizar venda:** remover `Atendimentos` e usar `Nº de vendas` em todo o produto.
2. **Eliminar tooltips óbvios:** retirar explicações de Atingimento da meta e Evolução mensal.
3. **Encurtar os tooltips analíticos:** trocar instruções longas por uma frase sobre o insight que o indicador oferece.
4. **Unificar CMV:** usar `{N}% do faturamento` no subtítulo e uma única definição no tooltip.
5. **Retirar duplicação de P.A. na Equipe:** manter P.A. como KPI próprio e remover do subtítulo de Ticket médio nessa tela.
6. **Simplificar o Ao vivo:** retirar os quatro subtítulos redundantes do pulso do dia e usar nomes completos nos KPIs.
7. **Corrigir nomes ambíguos:** `Meta geral` vira `Meta da loja`; `Resultado` vira `Resultado operacional`.
8. **Padronizar títulos:** usar caixa de frase e `x meta` nos cards comparativos.
9. **Remover textos internos do produto:** retirar menções a dados de demonstração, próxima etapa, próximo corte e construção técnica.
10. **Tornar regras dinâmicas:** nomes e percentuais da escada devem refletir a competência cadastrada, evitando divergências entre tela e documentação.

---

# 11. Checklist de aplicação no código

- [x] Atualizar títulos e subtítulos conforme este documento.
- [x] Remover tooltips não listados na seção 8.
- [x] Aplicar a mesma definição de CMV em todos os componentes compartilhados.
- [x] Substituir `Atendimentos`, `Qtd vendas`, `Qtd itens` e `Unidades` pelos padrões finais (telas de produto).
- [x] Atualizar cabeçalhos do CSV de Produtos (já estavam no padrão).
- [x] Tratar singular/plural de `venda`, `meta` e `dia` (`rotuloDias`, contador de metas).
- [x] Garantir que níveis e percentuais da escada venham da configuração da competência.
- [x] Remover textos de roadmap e demonstração das telas visíveis ao usuário.
- [ ] Revisar responsivo para evitar abreviações diferentes no mobile.
- [ ] Regenerar o inventário de copy após a implementação (`docs/copy-inventario-revisao-gpt.md`).

> **Aplicado no código:** 2026-09-19.  
> **Nota:** `Progresso da Meta` → `Projeção da meta` — o % grande continua sendo o atingimento atual; a projeção vive no badge. Reverter só o título se a leitura confundir.

---

*Documento de revisão editorial. Não altera arquitetura, métricas, regras de negócio ou funcionalidades.*
