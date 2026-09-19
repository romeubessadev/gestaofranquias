# Inventário de copy + prompt de revisão (GPT)

> **Fonte:** código atual (2026-09-19).  
> **Escopo:** telas de produto do gestor — Dashboard (Visão Geral, Financeiro, Produtos, Equipe), Ao Vivo, Metas + chrome global (nav, SeletorLoja, DateRangePicker).  
> **Fora:** demos do template Vela, Configurações (CRUD), app da vendedora.  
> **Objetivo deste arquivo:** colar no ChatGPT/Claude para auditar poluição de informação e melhorar a copy.

---

## Prompt para colar no GPT

```
Você é um editor de produto / UX writing para um app de gestão analítica de rede de franquias de cosméticos (marcas WEPINK e WPINK).

PÚBLICO
- Gestor sênior / franqueado / dono da rede.
- Precisa de dados para TOMADA DE DECISÃO, não “dados jogados na tela”.

OBJETIVO DO APP
- Dashboard = 100% leitura (zero CRUD).
- Cada métrica idealmente tem: valor atual + comparativo + tendência + caminho de drill.
- Linguagem comercial: preferir “venda” a “atendimento”; “premiação” a “comissão” (quando for escada/desafio).
- Tooltip (?) = 1 frase sobre COMO INTERPRETAR o indicador — não explicar o gráfico, não repetir o título.

GLOSSÁRIO (não reinventar sem motivo)
- Faturamento = valor bruto vendido
- CMV / CMV% = custo dos produtos vendidos / % do faturamento
- Lucro bruto = Faturamento − CMV
- Margem = Lucro bruto ÷ Faturamento
- Nº de vendas = quantidade de vendas (transações)
- Itens vendidos = unidades
- Ticket médio = R$ por venda
- P.A. / PA = itens por venda
- Competência = mês da meta / escada / desafios
- Meta / Super Meta / Hiper Meta / Meta Desafio = degraus da escada de premiação

TAREFA
1) Leia o inventário abaixo (textos reais do produto).
2) Para CADA tela, diga o que:
   a) MANTER (claro e útil para decisão)
   b) REMOVER ou ESCONDER (poluição / redundância / jargão sem tip)
   c) ENCURTAR ou REESCREVER (proposta de texto final)
3) Foque especialmente em:
   - Subtítulos de KPI (Meta, CMV%, itens, P.A.) — estão ajudando ou poluindo?
   - Tooltips (?) — quais são necessários vs óbvios?
   - Títulos de card longos (“X vs Meta”, “Desempenho…”)
   - Consistência entre telas (ex.: “Nº de vendas” vs “Atendimentos” no Ao Vivo)
   - Empty states e avisos
4) Entregue em tabelas por tela:
   | Local | Texto atual | Decisão (manter/remover/reescrever) | Texto proposto | Motivo |
5) No final: top 10 mudanças de maior impacto + lista de inconsistências transversais.

NÃO invente features novas. NÃO mude a arquitetura das telas. Só copy e o que cortar/manter.
```

---

## Contexto rápido do produto

| Tela | Pergunta que responde |
|---|---|
| **Visão Geral** | A rede está saudável? Onde agir? |
| **Financeiro** | Estou ganhando ou perdendo? Onde vaza margem? |
| **Produtos** | Quais são os 80/20? Mix saudável? |
| **Equipe** | Quem bate meta? Quanto pago de premiação? Desafios engajam? |
| **Ao Vivo** | Como está a competência do mês + pulso de hoje? |
| **Metas** | Cadastro/listagem de metas (CRUD — esqueleto) |

---

## Chrome global (todas as telas)

### Menu lateral (`nav-gestao.ts`)
| Texto | Refere-se a |
|---|---|
| Dashboard | Grupo de analytics |
| Visão Geral / Financeiro / Produtos / Equipe | Subtelas do Dashboard |
| Ao Vivo | Tempo real / competência |
| Metas | CRUD de metas |
| Configurações → Desafios, Colaboradores, Grupos e tarefas, Mensagens, Documentos, Custos, Marca, Integração ERP, Usuários | Operacional (fora deste inventário detalhado) |

### Seletor de loja — Topbar (`SeletorLoja.tsx`)
| Texto | Papel |
|---|---|
| `Todas as lojas` | Opção rede |
| `Rede consolidada` | Sub da opção “Todas” |
| `{fantasia}` + `{CNPJ}` | Loja selecionada / lista |

### DateRangePicker (`DateRangePicker.tsx`) — filtros de período
| Texto | Papel |
|---|---|
| `Período personalizado` | Placeholder do trigger |
| `Períodos rápidos` | Título dos presets |
| `Hoje` / `Ontem` / `Últimos 7 dias` / `Últimos 30 dias` / `Este mês` / `Mês passado` | Presets |
| `D S T Q Q S S` | Cabeçalho do calendário |
| `Clique no dia inicial, depois no final.` / `Selecione o dia final do intervalo.` | Hints |
| `Mês anterior` / `Próximo mês` | Aria das setas |

### Padrões transversais
| Texto | Onde |
|---|---|
| `Atualizado agora` / `Atualizado há {N} min` | Status de sync |
| `Atualizar` / `Exportar` | Ações do header (Dashboard) |
| `Comparação com {vs}` | Tooltip do delta (StatCard / BadgeVsAnterior) — `{vs}` = `o mês passado` \| `os N dias anteriores` \| `{dia} passada` |
| `Todas as marcas` / `WEPINK` / `WPINK` | Filtro de marca |
| `Sem dados no período selecionado.` | Empty padrão (vários cards) |

---

# 1. Visão Geral

**Arquivos:** `VisaoGeralPage.tsx`, `montarVisaoGeralView` (`dashboard.ts`)

### Cabeçalho
| Texto | Papel | Componente |
|---|---|---|
| `Dashboard` › `Visão Geral` | Breadcrumb | PageHeader |
| `Visão Geral` | Título | PageHeader |
| `Principais indicadores, metas e desempenho da operação.` | Subtítulo | PageHeader |

### KPI — Faturamento
| Texto | Papel | Componente |
|---|---|---|
| `Faturamento` | Nome do KPI | StatCard via view |
| `Meta: {R$}` | Meta de faturamento do período (sub) | view → StatCard |
| `{↗\|↘} {N%}` | Delta vs período anterior | StatCard |
| `Comparação com {vs}` | Tooltip do delta | StatCard |
| *(sem tip `?` no label)* | — | — |

### KPI — CMV
| Texto | Papel | Componente |
|---|---|---|
| `CMV` | Nome do KPI | StatCard |
| `CMV {N}%` | % do faturamento que é custo (sub) | view |
| `Custo dos produtos vendidos. Quanto maior o CMV %, maior a pressão sobre a margem.` | Tooltip `?` | StatCard |
| Delta + `Comparação com {vs}` | Comparativo | StatCard |

### KPI — Nº de vendas
| Texto | Papel | Componente |
|---|---|---|
| `Nº de vendas` | Nome do KPI | StatCard |
| `{N} itens vendidos` | Volume de unidades (sub) | view |
| Delta + tip vs | Comparativo | StatCard |
| *(sem tip `?`)* | — | — |

### KPI — Ticket médio
| Texto | Papel | Componente |
|---|---|---|
| `Ticket médio` | Nome do KPI | StatCard |
| `P.A. {N}` | Itens médios por venda (sub) | view |
| Delta + tip vs | Comparativo | StatCard |
| *(sem tip `?`)* | — | — |

### Card — Atingimento da Meta
| Texto | Papel | Componente |
|---|---|---|
| `Atingimento da Meta` | Título | CardTitle |
| `Quanto da meta do mês já foi atingido e quanto ainda falta.` | Tooltip `?` | Tooltip |
| `da meta` | Rótulo sob o % do gauge | RadialProgress |
| `Faturamento` / `Meta do mês` / `Faltam` / `Projeção` | Linhas de detalhe | VisaoGeralPage |
| `Meta atingida` | Quando faltam = 0 | VisaoGeralPage |
| `~{R$} ({N}% da meta)` | Valor da projeção | view |
| `Nenhuma meta cadastrada para o período.` | Empty | VisaoGeralPage |

### Card — Faturamento vs Meta
| Texto | Papel | Componente |
|---|---|---|
| `Faturamento vs Meta` | Título | CardTitle |
| `Compare o ritmo do faturamento com a meta acumulada e identifique se a operação está acima ou abaixo do esperado.` | Tooltip `?` | Tooltip |
| `{período} · por hora\|dia\|mês` | Granularidade do eixo (sub) | rotuloEixoSerie |
| `Realizado` / `Meta` | Legendas | VisaoGeralPage |
| Badge `+N%` / `−N%` + tip vs | Delta | BadgeVsAnterior |

### Card — Categorias vs Meta
| Texto | Papel | Componente |
|---|---|---|
| `Categorias vs Meta` | Título | CardTitle |
| `Compare o faturamento de cada categoria com sua meta no período e identifique onde estão os maiores desvios.` | Tooltip `?` | Tooltip |
| `Realizado` / `Meta` | Legendas | VisaoGeralPage |

### Card — Dia da Semana vs Meta
*(oculto em período de 1 dia)*
| Texto | Papel | Componente |
|---|---|---|
| `Dia da Semana vs Meta` | Título | CardTitle |
| `Compare o faturamento médio de cada dia da semana com a meta diária e identifique os dias de maior e menor desempenho.` | Tooltip `?` | Tooltip |
| `Realizado` / `Meta` | Legendas | VisaoGeralPage |
| `Seg`…`Dom` | Eixo | view |

### Card — Ranking de Lojas
| Texto | Papel | Componente |
|---|---|---|
| `Ranking de Lojas` | Título | CardTitle |
| `Total {R$}` | Badge do total | Badge |
| `Total` | Centro do donut | DonutChart |
| `{N}% da meta` | Progresso por loja | VisaoGeralPage |
| *(sem tip `?`)* | — | — |

### Card — Formas de Pagamento
| Texto | Papel | Componente |
|---|---|---|
| `Formas de Pagamento` | Título | CardTitle |
| `Total` | Centro donut | DonutChart |
| `Pix` / `Cartão de crédito` / `Cartão de débito` / `Dinheiro` | Formas (dados) | fixture |
| `{N}%` | Participação | VisaoGeralPage |
| *(sem tip `?`)* | — | — |

### Card — Top Vendedoras
| Texto | Papel | Componente |
|---|---|---|
| `Top Vendedoras` | Título | CardTitle |
| `{N} vendas` | Volume | view |
| `Ticket {R$}` | Ticket da vendedora | VisaoGeralPage |
| `{N}% da meta` | Atingimento | VisaoGeralPage |
| *(sem tip `?`)* | — | — |

### Card — Top Produtos
| Texto | Papel | Componente |
|---|---|---|
| `Top Produtos` | Título | CardTitle |
| Colunas: `#` · `Produto` · `Itens vendidos` · `Faturamento` · `Variação` | Cabeçalhos | tabela |
| `{+|−}{N}%` / `—` | Variação vs período | VisaoGeralPage |

---

# 2. Financeiro

**Arquivos:** `FinanceiroPage.tsx`, `montarFinanceiroView`

### Cabeçalho
| Texto | Papel |
|---|---|
| `Dashboard` › `Financeiro` | Breadcrumb |
| `Financeiro` | Título |
| `Receita, custos, lucro e margem da operação.` | Subtítulo |

### KPIs
| KPI | Nome | Sub | Tip `?` |
|---|---|---|---|
| Faturamento | `Faturamento` | — | *(nenhum)* |
| CMV | `CMV` | `CMV {N}%` | `Custo dos produtos vendidos. Quanto maior o CMV %, menor tende a ser a margem.` |
| Lucro bruto | `Lucro bruto` | — | *(nenhum)* |
| Margem | `Margem` | — | `Percentual do faturamento que permanece como lucro bruto após o CMV.` |

Delta de margem usa `{N} p.p.` (pontos percentuais) + tip `Comparação com {vs}`.

### Card — CMV, Lucro e Margem
| Texto | Papel |
|---|---|
| `CMV, Lucro e Margem` | Título |
| `Veja se o CMV está pressionando a margem e quanto do faturamento está se convertendo em lucro bruto.` | Tip `?` |
| `{período} · por hora\|dia\|mês` | Sub da série |
| Legendás: `Lucro bruto` · `CMV` · `Margem` | Resumo / legenda |

### Card — Resultado operacional
| Texto | Papel |
|---|---|
| `Resultado operacional` | Título |
| Tip (rateado hora/dia): `Veja quanto sobra após os custos da operação. Em períodos curtos, os custos mensais são rateados por dia ou por hora.` | Tip `?` |
| Tip (senão): `Veja quanto sobra após os custos da operação e se o resultado operacional está melhorando ou piorando.` | Tip `?` |
| Legendás: `Lucro bruto` · `Resultado` · `Margem op.` | Legenda |

### Card — Custos da Operação
| Texto | Papel |
|---|---|
| `Custos da Operação` | Título |
| `Desconta do lucro bruto os custos da operação (aluguel, royalties e marketing). O que sobra é o resultado operacional.` | Tip `?` |
| Linhas: `Lucro bruto` · `Aluguel fixo` · `Aluguel variável shopping ({N}%)` · `Royalties WEPINK/WPINK ({N}%)` · `Marketing WEPINK/WPINK ({N}%)` · `Total de custos` · `Resultado operacional` | Mini-DRE |

### Card — Formas de Pagamento
| Texto | Papel |
|---|---|
| `Formas de Pagamento` | Título *(sem tip)* |
| `Total` | Centro donut |
| Mesmas formas da Visão Geral | Legendás |

### Card — Faturamento por Marca
*(só com “Todas as marcas”)*
| Texto | Papel |
|---|---|
| `Faturamento por Marca` | Título *(sem tip)* |
| `WEPINK` / `WPINK` | Segmentos |

### Card — Evolução Mensal
| Texto | Papel |
|---|---|
| `Evolução Mensal` | Título |
| `Compare a evolução mensal dos principais indicadores financeiros. Este quadro sempre considera os últimos 6 meses.` | Tip `?` |
| `Últimos 6 meses` | Sub |
| Colunas: `Mês` · `Faturamento` · `CMV` · `Lucro bruto` · `Margem` · `Ticket médio` | Tabela |
| `Sem dados nos últimos 6 meses.` | Empty |

---

# 3. Produtos

**Arquivos:** `ProdutosPage.tsx`, `montarProdutosView`

### Cabeçalho
| Texto | Papel |
|---|---|
| `Dashboard` › `Produtos` | Breadcrumb |
| `Produtos` | Título |
| `Desempenho, margem e composição do mix de produtos.` | Subtítulo |

### KPIs
| KPI | Nome | Tip `?` |
|---|---|---|
| Faturamento | `Faturamento` | *(nenhum)* |
| Lucro bruto | `Lucro bruto` | *(nenhum)* |
| Margem | `Margem` | `Percentual do faturamento que permanece como lucro bruto após o CMV.` |
| Itens vendidos | `Itens vendidos` | *(nenhum)* |

### Cards
| Card | Título | Tip `?` | Outros textos |
|---|---|---|---|
| Faturamento por Categoria | `Faturamento por Categoria` | *(nenhum)* | Eixo = categorias (Perfumaria, Body Splash, …) |
| Curva ABC | `Curva ABC de Categorias` | `Análise de Pareto: ordena as categorias pelo faturamento e classifica em A (até 80% acumulado), B (até 95%) e C (restante). Mostra se o resultado depende demais de poucas categorias.` | `Classe A/B/C` · centro `Total` |
| Top Linhas | `Top Linhas de Produto` | *(nenhum)* | Colunas `#` · `Linha` · `Faturamento` · `Participação` |
| Top Produtos | `Top Produtos` | *(nenhum)* | Ordenar: `Faturamento` / `Itens vendidos` / `Margem` · Colunas `#` · `Produto` · `Itens` · `Faturamento` · `Margem` |
| Desempenho por Produto | `Desempenho por Produto` | *(nenhum no título)* | Busca `Buscar produto…` · `Todas as categorias` · `Exportar CSV` · colunas longas (Produto, Categoria, Fat, CMV, Lucro, Margem, CMV%, Nº de vendas, Ticket, Itens) · `Total do filtro` + tip `Soma todos os produtos do filtro atual, não apenas os exibidos nesta página.` · `Mostrando {a} de {b} produtos` · `Nenhum produto encontrado.` |

---

# 4. Equipe

**Arquivos:** `EquipePage.tsx`, `equipe/blocos.tsx`, `equipeVisoes.ts`

### Cabeçalho
| Texto | Papel |
|---|---|
| `Dashboard` › `Equipe` | Breadcrumb |
| `Equipe` | Título |
| `Desempenho individual, metas, premiações e desafios da equipe.` | Subtítulo |
| `Todos os grupos` (+ `Grupo 1` / `Grupo 2`) | Filtro |

### Avisos
| Texto | Papel |
|---|---|
| `O filtro de marca altera os resultados exibidos, mas as metas individuais continuam considerando a loja inteira.` | Aviso (condicional) |
| `Os KPIs seguem o período selecionado. Metas, premiação e desafios consideram a competência {mês}.` | Aviso competência |
| `Metas e premiações exibidas são da competência {mês}.` | Aviso competência |
| `Ver este mês` | CTA do aviso |

### KPIs
| KPI | Nome | Sub (templates) | Tip `?` |
|---|---|---|---|
| Faturamento | `Faturamento` | `Meta: {R$}` | *(nenhum)* |
| Nº de vendas | `Nº de vendas` | `média {N}/dia` | *(nenhum)* |
| Ticket médio | `Ticket médio` | `P.A. {x}` | *(nenhum)* |
| P.A. | `P.A.` | — | `Quantidade média de itens vendidos por venda.` |

### Card — Faturamento vs Meta
| Texto | Papel |
|---|---|
| `Faturamento vs Meta` | Título *(sem tip `?`)* |
| `{período} · por hora\|dia\|mês` | Sub |
| `Realizado` / `Meta` | Legendás |

### Card — Progresso da Meta
| Texto | Papel |
|---|---|
| `Progresso da Meta` | Título |
| `Acompanhe o avanço da equipe pelos níveis de premiação e a projeção para o fechamento da competência.` | TipHelp `?` |
| `Projeção: {N}% da meta` | Badge |
| `{N}d` / `Encerrado` | Badge prazo |
| `N1 · Meta (1,5%)` · `N2 · Super Meta (2,0%)` · `N3 · Hiper Meta (2,5%)` · `N4 · Desafio (3,0%)` | Rótulos da escada (fixture) |

### Card — Escada de Premiação
| Texto | Papel |
|---|---|
| `Escada de Premiação` | Título |
| `Veja quem já atingiu cada nível, quanto falta para o próximo e a premiação correspondente.` | TipHelp `?` |
| Colunas (c/ meta): `#` · `Vendedora` · `Faturamento` · `Meta` · `% Meta individual` · `% Meta geral` · `Nível` · `Faltam p/ próximo nível` · `Premiação` | Tabela |
| Colunas (s/ meta): `Ticket médio` · `P.A.` | Alternativa |
| Mobile: `Faturamento` · `% da meta` · `Nível` · `Faltam` · `Premiação` | Labels |
| Células: `{N} venda(s)` · `Nível {n} · {degrau}` · `Máximo` · `p/ {próximo}` | Conteúdo |
| Empty: `Nenhuma vendedora elegível para esta competência.` / `Sem dados para o período selecionado` | Empty |

### Card — Desempenho nos Desafios
| Texto | Papel |
|---|---|
| `Desempenho nos Desafios` | Título |
| `Acompanhe o progresso da equipe nos desafios, com prazo e premiação.` | TipHelp `?` |
| `Meta:` · `Mínimo:` · `Prêmio:` · `Gerente:` | Labels do card |
| Prazo: `Encerrado` / `Hoje` / `Em {N}d` / `{N}d` | Badge |
| Empty: `Nenhum desafio nesta competência` + desc | EmptyState |
| Ranking vazio: `Nenhuma participante no escopo atual.` | Empty interno |

---

# 5. Ao Vivo

**Arquivos:** `AoVivoPage.tsx`, `ao-vivo/blocos.tsx`, `aoVivo.ts` (+ reuso de blocos da Equipe)

### Cabeçalho
| Texto | Papel |
|---|---|
| `Ao Vivo` | Título + crumb |
| `Andamento de {MM}/{AAAA} · pulso do dia nos indicadores` | Subtítulo |
| `Atualizar` / `Compartilhar` | Ações |

### KPIs do mês (StatCards)
| Texto | Papel |
|---|---|
| `Faturamento` | Nome · sub `Competência do mês` |
| `Nº de vendas` | Nome · sub `Competência do mês` |
| `Meta Mensal` | Nome · sub `{mês de AAAA}` |
| `Atingimento` | Nome · sub `{fat} / {meta}` ou `Sem meta na competência` |

### Strip do dia (mini cards)
| Texto | Papel |
|---|---|
| `Faturamento hoje` · sub `Caixa do dia` | Pulso |
| `Nº de vendas hoje` · sub `Atendimentos` | ⚠️ inconsistente com “vendas” no Dashboard |
| `Ticket médio hoje` · sub `Por venda` | Pulso |
| `Itens hoje` · sub `Unidades` | Pulso |

### Card — Andamento da competência
| Texto | Papel |
|---|---|
| `Andamento da competência` | Título |
| Abas: `Ranking` · `Desafios` · `Metas` | Tabs |

**Aba Ranking (pódio):** empty `Nenhuma venda no mês` / `Lance vendas para ver o ranking ao vivo da competência.` · `{N} vendas` · `{pos}º`

**Aba Desafios:** reusa `BlocoDesafios` embedded (mesma copy dos cards; **sem** título/TipHelp do wrapper Equipe; só status Ativo).

**Aba Metas:** empty `Sem meta na competência` / `Cadastre a meta da loja em Metas…` · com meta: `FaixaMetaGlobal` + `CardVendedoras` (mesmos títulos/tips da Equipe).

### Cards abaixo
| Card | Textos |
|---|---|
| Ranking de Lojas | Título · `Total {R$}` · `{N}% da meta` · empty `Sem dados na competência.` |
| Ranking Vendedoras | Título · `{N} vendas` · `Ticket {R$}` · `{N}% da meta` · empty ranking geral |

### Shells
| Tela | Textos |
|---|---|
| Compartilhar | Título `Compartilhar` · sub `Link e layout para notebook/TV da loja.` · `Em construção` + texto de próximo corte |
| Modo TV | Título `Modo TV` · sub `Exibição em tela cheia para a loja.` · `Em construção` + texto de próximo corte |

---

# 6. Metas (CRUD — esqueleto)

**Arquivo:** `MetasPage.tsx`

| Texto | Papel |
|---|---|
| `Metas` | Título |
| `Meta mensal por loja, escada de degraus e distribuição individual.` | Subtítulo |
| `Nova meta` (`title="Em breve"`, disabled) | Botão |
| `Metas cadastradas` | CardTitle |
| `Listagem a partir dos dados de demonstração. Edição e plano do mês entram na próxima etapa.` | Sub |
| Colunas: `Competência` · `Loja` · `Nome` · `Meta da loja` · `Degraus` | Tabela |
| `{N} meta(s)` | Contador |
| `Nenhuma meta cadastrada.` | Empty |

---

## Lista consolidada de tooltips `?` (verbatim)

### Visão Geral
1. CMV: `Custo dos produtos vendidos. Quanto maior o CMV %, maior a pressão sobre a margem.`
2. Atingimento da Meta: `Quanto da meta do mês já foi atingido e quanto ainda falta.`
3. Faturamento vs Meta: `Compare o ritmo do faturamento com a meta acumulada e identifique se a operação está acima ou abaixo do esperado.`
4. Categorias vs Meta: `Compare o faturamento de cada categoria com sua meta no período e identifique onde estão os maiores desvios.`
5. Dia da Semana vs Meta: `Compare o faturamento médio de cada dia da semana com a meta diária e identifique os dias de maior e menor desempenho.`

### Financeiro
1. CMV: `Custo dos produtos vendidos. Quanto maior o CMV %, menor tende a ser a margem.` ⚠️ redação diferente da VG
2. Margem: `Percentual do faturamento que permanece como lucro bruto após o CMV.`
3. CMV, Lucro e Margem: `Veja se o CMV está pressionando a margem e quanto do faturamento está se convertendo em lucro bruto.`
4. Resultado (rateado): `Veja quanto sobra após os custos da operação. Em períodos curtos, os custos mensais são rateados por dia ou por hora.`
5. Resultado (normal): `Veja quanto sobra após os custos da operação e se o resultado operacional está melhorando ou piorando.`
6. Custos: `Desconta do lucro bruto os custos da operação (aluguel, royalties e marketing). O que sobra é o resultado operacional.`
7. Evolução Mensal: `Compare a evolução mensal dos principais indicadores financeiros. Este quadro sempre considera os últimos 6 meses.`

### Produtos
1. Margem: *(igual Financeiro)*
2. Curva ABC: `Análise de Pareto: ordena as categorias pelo faturamento e classifica em A (até 80% acumulado), B (até 95%) e C (restante). Mostra se o resultado depende demais de poucas categorias.`
3. Total do filtro: `Soma todos os produtos do filtro atual, não apenas os exibidos nesta página.`

### Equipe (+ Ao Vivo Metas embedded)
1. P.A.: `Quantidade média de itens vendidos por venda.`
2. Progresso da Meta: `Acompanhe o avanço da equipe pelos níveis de premiação e a projeção para o fechamento da competência.`
3. Escada: `Veja quem já atingiu cada nível, quanto falta para o próximo e a premiação correspondente.`
4. Desafios (só Equipe): `Acompanhe o progresso da equipe nos desafios, com prazo e premiação.`

### Delta (transversal)
- `Comparação com {vs}`

---

## Inconsistências já detectadas (para o GPT priorizar)

1. **CMV tip** Visão Geral ≠ Financeiro (“maior pressão” vs “menor margem”).
2. **Ao Vivo** sub `Atendimentos` vs padrão `Nº de vendas` / “venda”.
3. **Tips longos** nos cards “vs Meta” (VG) — muitos começam com “Compare…” e explicam o gráfico.
4. **KPIs sem tip** em Faturamento / Nº de vendas / Ticket (VG) — decidido antes (título autoexplicativo); validar se ainda faz sentido.
5. **Sub do Ticket** mostra `P.A.` (outra métrica) — útil ou poluição?
6. **Sub do Nº de vendas** mostra `itens vendidos` — mesma dúvida.
7. **Equipe** subtítulo do header vs copy antiga em docs (já divergiu).
8. **Degraus** em docs antigos citavam % diferentes da fixture atual (50/75/100/110 de atingimento; comissão 1,5–3%).

---

## Arquivos relacionados

| Arquivo | Conteúdo |
|---|---|
| `docs/copy-visao-geral.md` | Copy final VG (decisões fechadas — pode divergir levemente do código) |
| `docs/copy-financeiro.md` | Refinos Financeiro |
| `docs/copy-produtos.md` | Refinos Produtos |
| `docs/copy-equipe.md` | Inventário Equipe (parcialmente desatualizado) |
| `docs/copy-dashboard.md` | Consolidado antigo + prompt antigo |
| **Este arquivo** | Inventário **atual do código** + prompt de auditoria de poluição |

---

*Gerado a partir do código em 2026-09-19. Ao aplicar mudanças de copy, atualizar este inventário ou regenerar a partir das páginas.*
