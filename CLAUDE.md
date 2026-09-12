# Projeto Gestão — Rede de Franquias (Wepink / Wpink)

## Identidade do produto
Sistema de gestão analítica para rede de franquias de cosméticos (marcas **Wepink** e **Wpink**).
Público-alvo principal: **gestor sênior / franqueado / dono da rede**, que precisa de dados para **tomada de decisão**, não apenas visualização.

## Tema visual
- Seguir **estritamente** o tema **Vela** (paleta, componentes, tokens).
- **Não reinventar componentes** — reutilizar os primitives do Vela antes de criar novos.
- Paleta rosa/magenta das referências é apenas inspiração de layout; a execução usa Vela.

## Referências visuais
- Concorrente / BI atual: `docs/referencias/referencia01.png` … `referencia16.jpeg`
- CRUD de Metas (reaproveitar do BI): `docs/referencias/metas01.png`, `metas02.png`, `metas03.png`
- Listagem de Metas no dashboard: `docs/referencias/dashboard-metas01.png`
- Listagem de Desafios no dashboard: `docs/referencias/dashboard-desafios01.png`

---

## Arquitetura de navegação (DECIDIDO)

### 1. DASHBOARD — analítico, read-only, para tomada de decisão
Submenus:
- **Visão Geral** — resumo executivo dos KPIs das demais telas. É a "capa" do dashboard.
- **Financeiro** — DRE, margem, fluxo, evolução de receita, contas.
- **Equipe** — performance individual de vendedores, escada de comissão, ranking, desafios. Foco no INDIVÍDUO.
- **Turnos** — tela SEPARADA (não é toggle dentro de Equipe). Análise operacional por período do dia (manhã/tarde/noite), comparação entre turnos, cobertura de staff, intensidade horária. Foco na OPERAÇÃO TEMPORAL. Turnos são cadastrados em Configurações com horários definidos.
- **Produtos** — top sellers, curva ABC, margem por SKU, dias de cobertura, produtos em queda.

Princípios do Dashboard:
- **100% leitura** — zero botões de ação/CRUD dentro do dashboard.
- Cada subtela tem **filtros próprios internos**: período (data) e marca (Wepink / Wpink).
- A **marca** não muda os KPIs/cards — muda apenas a **granularidade temporal** da exibição (por hora vs. por dia).
- O filtro de **filial/loja** é **externo** (combo na barra superior global), aplicável a todas as telas. Pode ser 1 ou N lojas.
- O filtro de **período** aceita 1 dia ou mais.
- **Visão Geral = resumo** das outras 3 telas. Não duplica gráficos inteiros; traz os números-chave e aponta para onde drillar.

### 2. FORA DO DASHBOARD — operacional / ações
Módulos (ordem de prioridade a definir depois):
- **Ao Vivo (Real Time)** — o que está acontecendo agora nas lojas. Justifica sair do dashboard por ser "tempo real", não analítico histórico.
- **Vendedores** — gestão ativa da equipe (CRUD, metas individuais, comissões).
- **Metas** — CRUD de metas de faturamento/comissão por loja/período/equipe. Reaproveitar layout do BI (ver referências metas01-03).
- **Desafios** — gamificação (ver `dashboard-desafios01.png`: desafio, progresso, engajadas, prêmio).
- **Estoque** — separado do dashboard porque o usuário olha o estoque para **tomar ação** (ex.: gerar pedido de compra).
- **Compras** — pedido, cotação, recebimento.
- **Configurações** — lojas, turnos, permissões, integrações, marcas.

---

## Filtros — modelo mental (DECIDIDO)

| Filtro | Escopo | Onde vive | Multi-select |
|---|---|---|---|
| Filial / Loja | Global (todas as telas) | Barra superior (combo externo) | Sim (1..N) |
| Período (data) | Por subtela do Dashboard | Dentro de cada subtela | Range (1 dia ou +) |
| Marca (Wepink/Wpink) | Por subtela do Dashboard | Dentro de cada subtela | Single (muda granularidade) |

Regra da marca:
- Wepink → exibição agregada por **dia** (operação maior, múltiplas lojas).
- Wpink → exibição por **hora** (operação menor, foco intraday).
- Os KPIs e cards são **os mesmos**; só muda o eixo temporal dos gráficos/tabelas.

---

## Princípios de design analítico (gestor sênior de franquias)

Cada tela do dashboard deve responder a perguntas de decisão, não só mostrar números:

**Visão Geral** responde:
- "Minha rede está batendo a meta este mês?"
- "Qual loja está puxando / segurando o resultado?"
- "Estamos melhor ou pior que o mês passado / ano passado?"

**Financeiro** responde:
- "Onde está indo minha margem? Qual categoria/SKU está corroendo lucro?"
- "Tenho caixa para X? Quando vencem minhas contas?"
- "Meu ticket médio está subindo ou caindo, e por quê?"

**Equipe** responde:
- "Quem está batendo meta e quem precisa de intervenção?"
- "Qual turno produz mais? Estou com gente demais/pouco em qual horário?"
- "Quanto vou pagar de comissão se o mês fechar assim?"

**Produtos** responde:
- "Quais SKUs são meus 80/20? Estou perdendo venda por ruptura?"
- "Quais produtos estão em queda e preciso promocionar/descontinuar?"
- "Meu mix está saudável por loja?"

Toda métrica deve ter:
1. **Valor atual**
2. **Comparativo** (vs. meta, vs. período anterior, vs. média da rede)
3. **Tendência** (sparkline / seta / variação %)
4. **Drill-down** (clicar leva ao detalhe — mesmo que o detalhe seja outra subtela)

Sem esses 4 elementos, o número é "dado jogado na tela" — não serve para decisão.

---

## Inventário de componentes Vela disponíveis (mapeado em src/)

### Primitives UI (`src/components/ui/`)
- `Card`, `CardHeader`, `CardTitle` — container padrão de widgets
- `StatCard` — KPI card com ícone, valor animado, delta (↗/↘), sparkline opcional. **Já tem os 4 elementos de decisão** (valor + comparativo + tendência + espaço para drill).
- `AnimatedNumber` — anima transição de valores numéricos
- `Badge` — status pills (ok/bad/neutral/etc.)
- `Button` (primary/secondary/ghost/sm)
- `DataTable` + `DataTableColumn` — tabela com render custom por coluna, align, hideBelow responsivo
- `ProgressBar` (linear) + `RadialProgress` (circular %) 
- `Gauge` — medidor half-circle (bom para "meta atingida %")
- `Tabs` / `TabNav` — navegação por abas (TabNav é route-driven, bom para os 4 submenus do Dashboard)
- `PageHeader` — título + subtitle + breadcrumbs + actions slot
- `Breadcrumbs`, `Tooltip`, `Popover`, `Dropdown`, `Modal`, `Drawer`
- `EmptyState`, `Skeleton`, `Toast`, `Pagination`, `Accordion`, `Timeline`, `Rating`, `Kanban`, `form`

### Charts (`src/components/charts/`) — todos SVG puro, sem libs externas
- `Sparkline` — mini-tendência dentro de StatCard
- `AreaLineChart` — linha suave com área, **suporta `compareData`** (período anterior sobreposto tracejado) + tooltip hover. Perfeito para evolução de receita com comparativo.
- `BarChart` + `StackedBarChart` — barras verticais, stacked com totais
- `DonutChart` — rosca com legenda e centro custom (label+value)
- `Gauge` — medidor radial
- `Heatmap` — mapa de calor (bom para vendas por dia-da-semana × hora)
- `FunnelChart` — funil de conversão
- `GanttChart` — cronograma
- `MapPins` — mapa com pinos (bom para visão multi-loja geográfica)

### Layout (`src/layout/`)
- `Sidebar` + `SidebarContent` — menu lateral colapsável (76px / 258px)
- `MobileDrawer` — sidebar mobile

### Específicos de gestão já existentes (`src/components/gestao/`)
- `Marca` — componente de marca (Wepink/Wpink?) — verificar
- `Avisos` — painel de avisos
- `ChatIA` — chat com IA

### Stack
- React 19 + Vite 8 + Tailwind 4 + react-router-dom 7
- **Sem biblioteca de charts externa** (tudo SVG próprio) — decisão consciente: manter assim, não adicionar recharts/apexcharts.

### Regra de legibilidade dos gráficos (DECIDIDO — ref: referencia11.jpeg)
- **Valores em R$ visíveis DIRETO no gráfico**, não só no hover. No BI atual, cada barra já traz o número (`13K / 26K`, `73K / 10K`). Isso é leitura instantânea.
- Implementação: adicionar prop `showValues?: boolean` (default `true`) em `BarChart`, `StackedBarChart` e `AreaLineChart`. Renderiza o rótulo do valor fixo no topo da barra / acima do ponto da linha, usando `formatValue`. O hover/tooltip continua existindo para detalhe.
- É **melhoria nos componentes Vela existentes**, não componente novo. Aplica a todas as telas do dashboard.
- Em barras muito juntas ou valores óbvios, o rótulo pode ser opcional por série — mas o default é mostrar.

---

## Checagem de componentes Vela (CONFIRMADO NO CÓDIGO — varredura completa)
> Varridas: todas as páginas (`src/pages/**`), `src/components/ui/index.ts`, dashboards (Analytics/Ecommerce/Finance/Sales/CRM/BI/Logistics/Projects/SaaS) e páginas de forms (DatePickersPage, SelectComponentsPage).
### ✅ Já existem e são reutilizáveis (confirmado)
`StatCard`, `Sparkline`, `AreaLineChart`, `BarChart`+`StackedBarChart`, `DonutChart`, `Gauge`, `Heatmap`, `DataTable`, `ProgressBar`+`RadialProgress`, `Accordion`, `Badge`, `Card`/`CardHeader`/`CardTitle`/`CardSubtitle`, `Tooltip`, `Popover`, `Dropdown`, `Select`/`Input`/`Checkbox`/`Radio`/`Switch`/`FormField` (em `form.tsx`), `Tabs`, `TabNav`, `Pagination`, `Modal`, `Drawer`, `Avatar`/`AvatarGroup`, `Timeline`, `Rating`, `EmptyState`, `Skeleton`/`Spinner`, `Button`, `Breadcrumbs`, `PageHeader`, `Toast`/`useToast`, `KanbanBoard`/`KanbanColumn`/`KanbanCard`, `AnimatedNumber`.
### 🟡 Existe como MARKUP INLINE (não é componente exportado) — extrair, não reinventar
- **Calendário + Date range + Quick ranges**: já está todo montado em `src/pages/forms/DatePickersPage.tsx` (calendário mensal, input "Single date", input "Date range", botões de quick range "Today/Last 7 days/..."). **Não é um componente exportado** — está inline na página. → Ação: **extrair para `ui/DatePicker.tsx` + `ui/DateRangePicker.tsx`** copiando esse markup (já validado visualmente no tema). NÃO criar do zero.
- **Segmented / toggle de opções (WEPINK|WPINK)**: **NÃO existe** em lugar nenhum (grep `Segmented|ToggleGroup|btn-group` = 0 resultados). Mas o padrão visual já existe nos botões de "Quick ranges" da DatePickersPage (`border-acc bg-acc-soft text-acc` quando ativo). → Ação: **criar `ui/Segmented.tsx`** reusando exatamente esse estilo de botão ativo/inativo. É o único componente "novo" de verdade, e é trivial.
### 🔨 Realmente precisam ser criados (mínimo possível)
| Componente | Origem / como construir | Onde entra |
|---|---|---|
| `DateRangePicker` | **Extrair** do markup de `DatePickersPage.tsx` (calendário + range + quick ranges já prontos) | filtro de período das telas |
| `Segmented` | Copiar o estilo dos botões "Quick ranges" (ativo=`border-acc bg-acc-soft text-acc`) | filtro WEPINK/WPINK + seletor de turno |
| `CommissionLadder` | Compor `ProgressBar` (degraus discretos) + `Badge` dourado — o `ProgressBar` atual é contínuo; aqui é por faixa | Escada de Premiação (Equipe) |
### 🟡 Opcional
- `WaterfallChart` (DRE em cascata, Financeiro) — não existe; hoje resolvido com `StackedBarChart` + `DataTable`. Plus visual, não bloqueante.
### ⚠️ Melhoria em componentes existentes (não é novo)
- `showValues?: boolean` (default `true`) em `BarChart`/`StackedBarChart`/`AreaLineChart` — R$ direto na barra/linha. Evolução dos que já existem.
- ⓘ nos títulos = `CardTitle` + `Tooltip` (Tooltip **já existe**). Só compor.
### Padrão de grade dos dashboards Vela (confirmado no código — replicar nas nossas telas)
- **AnalyticsDashboard**: KPIs `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; blocos de gráfico `lg:grid-cols-3` com card principal `lg:col-span-2`.
- **EcommerceDashboard**: KPIs `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; gráficos `lg:grid-cols-[1.5fr_1fr]` e `lg:grid-cols-[1fr_1.7fr]` (proporções assimétricas, não só 50/50).
- → Nossas telas já seguem isso (KPIs 4/linha desktop, pares de gráfico em 2 colunas, widget central/tabela em largura total). **Alinhado com o template.**

## Gaps identificados (componentes que NÃO existem e precisamos discutir se criamos)

1. **Filtro de período (DateRangePicker)** — não existe. Precisa de: presets (Hoje, Ontem, 7d, 30d, Este mês, Mês passado, Personalizado) + calendário range. Componente novo necessário.
2. **Seletor de marca (Wepink/Wpink)** — pode ser um `SegmentedControl` simples (2 opções). Verificar se `Tabs` serve ou se criamos um `Segmented` dedicado. O AnalyticsDashboard já tem um segmented inline (linhas 100-114) que pode virar componente.
3. **Seletor de filial multi-select no header global** — existe um combo hoje (mencionado pelo usuário), precisa ser melhorado para multi-select com chips. Verificar estado atual.
4. **KPI Card comparativo rico** — o `StatCard` atual tem delta simples. Para gestor sênior queremos às vezes: valor atual + vs meta + vs período anterior + sparkline. Pode precisar de uma variante `StatCardRich` ou composição.
5. **Tabela com barra de progresso inline** (ex.: "avanço na escada" das metas — ver dashboard-metas01.png) — DataTable + ProgressBar compostos. Não é componente novo, é padrão de composição.
6. **Card de meta com escada/faixas** (dashboard-metas01.png mostra "Avanço na escada" com segmentos) — componente novo: `GoalLadder` ou similar. Mostrar faixas de comissão atingidas.
7. **Indicador de tendência textual** ("subindo"/"caindo"/"estável" com mini-spark — ver dashboard-metas01.png) — pode ser composição de Sparkline + Badge.
8. **Ponto de atenção / alerta inline** ("PA 1,63 · 4% abaixo", "Preço R$ 64,44 · 5% abaixo") — Badge variante warning/danger com métrica. Composição.

---

## Proposta de arquitetura de componentes por subtela (DISCUSSÃO — não implementar)

### Princípio reitor
Cada widget do dashboard = **Card** contendo: título + (opcional) ação de drill + corpo (chart/tabela/KPIs). Reusar `Card`/`CardHeader`/`CardTitle`. Nunca criar wrapper novo se `Card` resolve.

### Submenu 1 — Visão Geral (resumo executivo)
Widgets propostos:
- **KPI row** (4 `StatCard`): Faturamento, Lucro Bruto, Ticket Médio, Margem %. Cada um com delta vs mês anterior + sparkline 30d. → 100% reusa `StatCard` + `Sparkline`.
- **Meta da rede** (1 card grande): `Gauge` ou `RadialProgress` mostrando % da meta mensal + valor atual/target + projeção de fechamento. → reusa `Gauge`/`RadialProgress`. Gap: projeção de fechamento (precisa de cálculo, não de componente).
- **Evolução faturamento** (`AreaLineChart` com `compareData` = mês/ano anterior). → reusa direto.
- **Ranking de lojas** (`DataTable` simplificada ou lista com `ProgressBar`): loja, faturamento, % da meta, tendência. → composição `DataTable` + `ProgressBar`.
- **Alertas / Pontos de atenção** (card com lista): lojas abaixo do ritmo, produtos em ruptura, vendedores atrás da meta. → `Timeline` ou lista com `Badge` danger. Responde "onde preciso agir?".

Pergunta de decisão que esta tela responde: "Minha rede está saudável hoje? Onde está o problema?"

### Submenu 2 — Financeiro
Widgets propostos:
- **KPI row**: Receita, CMV, Lucro Bruto, Margem %, Ticket Médio, Nº de vendas. → `StatCard`.
- **DRE simplificado** (card): tabela vertical Receita → (-) CMV → (=) Lucro Bruto → (-) Despesas → (=) Lucro Líquido, com % sobre receita. → `DataTable` ou composição custom. Gap: talvez um componente `WaterfallChart` (cascata) seria ideal para DRE — **não existe**. Discutir se vale criar ou usar `StackedBarChart` adaptado.
- **Evolução receita vs despesas** (`AreaLineChart` 2 séries). → reusa.
- **Margem por categoria** (`DonutChart` ou `BarChart` horizontal). → reusa.
- **Fluxo de caixa projetado** (`AreaLineChart` com linha de saldo). → reusa.
- **Contas a vencer** (lista/tabela com badges de vencimento). → `DataTable` + `Badge`.

Pergunta: "Estou ganhando ou perdendo dinheiro? Onde vaza margem? Tenho caixa?"

### Submenu 3 — Equipe
Widgets propostos (com toggle Equipe geral ↔ Por turno):
- **KPI row**: Vendas totais, Comissão projetada, Meta atingida %, Produtividade (R$/vendedor). → `StatCard`.
- **Ranking de vendedores** (`DataTable` rica — inspirada em dashboard-metas01.png): vendedor, dias trabalhados, avanço na escada (`ProgressBar` segmentada), ponto de atenção (`Badge`), comissão atual + próximo degrau. → composição `DataTable` + `ProgressBar` + `Badge`. **Este é o widget mais importante da tela** — replica a referência dashboard-metas01.png.
- **Distribuição por faixa de comissão** (`DonutChart` ou `BarChart`): quantos vendedores em cada faixa. → reusa.
- **Por turno** (quando toggle ativado): `Heatmap` vendas por dia-da-semana × hora, ou `StackedBarChart` por turno. → reusa `Heatmap`/`StackedBarChart`.
- **Projeção de comissão** (card numérico): quanto vou pagar se fechar assim. → `StatCard` grande ou card custom.

Pergunta: "Quem bate meta? Quem precisa de ajuda? Quanto vou pagar de comissão? Qual turno produz mais?"

### Submenu 4 — Produtos
Widgets propostos:
- **KPI row**: SKUs ativos, Ruptura %, Dias médios de cobertura, Giro de estoque. → `StatCard`.
- **Top sellers** (`DataTable`): produto, qty, receita, margem, tendência. → reusa (idêntico ao pattern do AnalyticsDashboard).
- **Curva ABC** (`DonutChart` ou `AreaLineChart` cumulativo): A/B/C por participação. → reusa.
- **Produtos em ruptura / estoque baixo** (tabela com badge danger + dias de cobertura). → `DataTable` + `Badge` + `ProgressBar`. Responde "vou perder venda por falta?".
- **Produtos em queda** (lista com delta negativo). → composição.
- **Margem por SKU/produto** (`BarChart` horizontal ordenado). → reusa.

Pergunta: "Quais são meus 80/20? Estou perdendo venda por ruptura? O que descontinuar?"

---

### Padrões de composição reutilizáveis (criar como snippets, não componentes novos)
- **KPI Row** = grid de `StatCard` (já visto em AnalyticsDashboard).
- **Widget Card** = `Card` > `CardHeader`(`CardTitle` + ação) > corpo.
- **Tabela com progresso** = `DataTable` cuja coluna renderiza `ProgressBar`.
- **Alerta inline** = `Badge` variant danger/warning + texto + métrica.

---

## Estado atual dos filtros (mapeado no código)

### Já existe e funciona:
- **`useEscopo()`** (`src/pages/dashboard/useEscopo.ts`) — hook que centraliza o escopo (filial, período, divisão/marca) e **persiste na URL** via `useSearchParams`. Perfeito: estado compartilhável, bookmarkable, sobrevive a reload.
  - `filialId`: "todas" ou id específico (single-select hoje)
  - `periodo`: presets `hoje | ontem | 7dias | esteMes | mesPassado | personalizado` (com `inicio`/`fim` quando personalizado)
  - `divisao`: `WEPINK | WPINK | null` (a "marca" que o usuário mencionou)
- **`SeletorLoja`** (`src/pages/dashboard/SeletorLoja.tsx`) — `<Select>` nativo simples, single-select ("Todas as lojas" + lista). Mora no **Topbar**, substitui o "Buscar telas" quando está no Dashboard/Equipe.
- **`Topbar`** (`src/layout/Topbar.tsx`) — já tem a lógica: se `noDashboard` (pathname === dashboard ou equipe) E tem >1 filial → mostra `SeletorLoja`; senão mostra botão de busca (Ctrl+K).
- **`nav-gestao.ts`** — navegação atual do GESTOR é só: `Dashboard` (com activePaths incluindo equipe) + `Configurações` (Metas, Desafios, Colaboradores, Turnos, Mensagens, Documentos, Custos, Marca, ERP, Usuários). **Ainda não reflete a nova arquitetura decidida** (Dashboard com 4 submenus + módulos operacionais separados).

### Gaps reais nos filtros (confirmados no código):
1. **Filial é single-select** (`filialId: string`). O usuário pediu **multi-select** (1 ou N lojas). Precisa virar `filialIds: string[]` no `Escopo` + UI de chips/multi-dropdown. Impacta `useEscopo`, `SeletorLoja`, serialização URL.
2. **Não há UI de período/divisão dentro das subtelas ainda** — o `useEscopo` suporta, mas não vi um componente `FiltroPeriodo` / `SeletorMarca` renderizado dentro das páginas do dashboard. O `SeletorLoja` está no Topbar (correto, é o filtro global), mas período e marca precisam de controles **dentro de cada subtela** (como o usuário pediu).
3. **Período "personalizado"** existe no tipo mas **não há DateRangePicker** implementado — só o preset. Precisa do componente de calendário range.
4. **Divisão/Marca (WEPINK/WPINK)** existe no escopo mas **não há SegmentedControl** visível nas telas para alternar. Precisa do componente + wiring.

---

## Decisões VALIDADAS pelo dono do produto (2026-09-12)

1. ✅ **DateRangePicker** — CRIAR componente Vela (`src/components/ui/DateRangePicker.tsx`) com presets + calendário range custom.
2. ✅ **Segmented (WEPINK/WPINK)** — CRIAR componente `Segmented` reutilizável (extrair pattern do AnalyticsDashboard).
3. ✅ **SeletorLoja → multi-select** — EVOLUIR para multi-select com chips. Motivo: comparar filiais dentro da mesma cidade. Exige `Escopo.filialId: string` → `filialIds: string[]` + serialização URL.
4. ✅ **WaterfallChart (DRE)** — CRIAR chart em cascata (`src/components/charts/WaterfallChart.tsx`).
5. ✅ **CommissionLadder (escada de faixas)** — CRIAR componente dedicado (`src/components/charts/CommissionLadder.tsx`). É o core da tela Equipe.
6. ✅ **Granularidade temporal — REGRA CORRIGIDA**: NÃO é a marca que define o eixo. **É o PERÍODO**:
   - Período de **1 dia** (Hoje / Ontem / personalizado de 1 dia) → eixo por **HORA**.
   - Período de **> 1 dia** → eixo por **DIA**.
   - WEPINK e WPINK têm a **mesma lógica**; só muda o mix de produtos. Os KPIs/cards são idênticos.
   - Isso simplifica: a camada de agregação olha `escopo.periodo`, não `escopo.divisao`.
7. ✅ **Ordem de execução** — (a) refinar em texto + mock ASCII no CLAUDE.md primeiro; (b) começar pela tela **EQUIPE**; (c) depois Financeiro e Produtos; (d) **Visão Geral por último** (é o resumo de todas). Nav+router como esqueleto antes dos componentes.

---

## Ordem de construção das subtelas (DECIDIDO)
1. **Equipe** ← começamos aqui
2. Financeiro
3. Produtos
4. Visão Geral (por último — resume as 3 acima)

---

## Próximo passo concreto (aguardando seu OK nas decisões acima)

Fase atual = **refinamento de componentes, zero implementação de feature**. Quando você validar as 7 decisões, o plano de execução será:
1. Reestruturar `nav-gestao.ts` + `router/paths` para a nova arquitetura (Dashboard/{visao-geral,financeiro,equipe,produtos} + módulos operacionais).
2. Criar os 3 componentes novos do Vela: `DateRangePicker`, `Segmented`, `CommissionLadder` (+ opcional `WaterfallChart`).
3. Evoluir `SeletorLoja` para multi-select (se decidido) + criar `FiltroPeriodo` e `SeletorMarca` para usar dentro das subtelas.
4. Definir o contrato de dados (tipos) de cada subtela com a regra de granularidade por marca.
5. Só então montar as 4 subtelas compostas dos widgets mapeados acima.

---

## Estado atual do trabalho

- [x] Análise das 16 referências do concorrente
- [x] Análise das 3 referências de CRUD de metas
- [x] Análise das 2 referências de listagem (metas + desafios)
- [x] Definição da arquitetura de navegação
- [x] Definição do modelo de filtros
- [x] Registro das decisões neste CLAUDE.md
- [x] Inventário de componentes Vela disponíveis
- [x] Mapeamento de gaps de componentes
- [x] Proposta de widgets por subtela (Visão Geral, Financeiro, Equipe, Produtos)
- [ ] **Próximo passo:** validar as 6 decisões em aberto acima com o dono do produto.
- [ ] Depois: inspecionar `SidebarContent` e o combo de filial atual para propor melhoria do filtro global.
- [ ] Depois: telas operacionais (Ao Vivo, Vendedores, Metas, Desafios, Estoque, Compras, Configurações).

## Regras de trabalho
- **Não implementar nada agora.** Fase atual = refinamento e discussão de componentes.
- Registrar decisões importantes aqui para não perder contexto entre sessões.
- Tratar o usuário como dono da rede de franquias; pensar como gestor sênior ao propor métricas e layouts.

---

## Mock ASCII — Tela EQUIPE (Dashboard > Equipe)

> **Status:** PROPOSTA PARA VALIDAÇÃO — zero código escrito.
> **Foco:** performance INDIVIDUAL de vendedores (escada, ranking, desafios).
> **Filtros internos:** Período (DateRangePicker) + Marca (Segmented WEPINK/WPINK).
> **Granularidade:** 1 dia → eixo por HORA; >1 dia → eixo por DIA (independente da marca).
> **Nota:** Turnos são tela SEPARADA (Dashboard > Turnos), não toggle aqui.

### Layout — Equipe

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard > Equipe                                                 │
│  [Período: Este mês ▾]  [Marca: WEPINK | WPINK]                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────────────┐  │
│  │ Faturamentoⓘ │ │ Premiação  ⓘ │ │ Meta do mêsⓘ │ │ Venda média   │  │
│  │ R$ 284 mil │ │ R$ 18,2 mil│ │    72%       │ │ p/ vendedoraⓘ│  │
│  │ ↗ +8% vs   │ │ ↗ +12% vs  │ │ ↘ -3% vs     │ │ R$ 12,4 mil  │  │
│  │ mês passado│ │ mês passado│ │ mês passado  │ │ ↗ +5% vs     │  │
│  │ ▁▃▅▇▆▅▇█ │ │ ▁▂▃▅▆▇▇█ │ │ ▇▆▅▃▃▂▁▁   │ │ ▁▂▃▃▅▅▆▇        │  │
│  └──────────┘ └──────────┘ └──────────────┘ └───────────────────┘  │
│   StatCard      StatCard      StatCard+Gauge     StatCard           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Escada de Premiação ⓘ  (core da tela)           [drill →]  │  │
│  │ ┌────────────┬──────────────┬────────────┬──────────────────┐ │  │
│  │ │ VENDEDORA  │ AVANÇO       │ PONTO ATEN.│ PREMIAÇÃO/PRÓX.  │ │  │
│  │ ├────────────┼──────────────┼────────────┼──────────────────┤ │  │
│  │ │ Ana Clara  │ ████░░ 4/6   │ PA 1,63 ↓  │ R$ 2.840         │ │  │
│  │ │            │ ▁▃▅▇ subindo │ 4% abaixo  │ próx: Super Meta │ │  │
│  │ ├────────────┼──────────────┼────────────┼──────────────────┤ │  │
│  │ │ Beatriz    │ █████░ 5/6   │ ✓ OK       │ R$ 3.420         │ │  │
│  │ │            │ ▅▆▇▇ estável │            │ próx: Elite      │ │  │
│  │ ├────────────┼──────────────┼────────────┼──────────────────┤ │  │
│  │ │ Carla      │ ██░░░░ 2/6   │ PA 1,41 ↓  │ R$ 1.280         │ │  │
│  │ │            │ ▃▂▁▁ caindo  │ 9% abaixo  │ próx: Meta       │ │  │
│  │ ├────────────┼──────────────┼────────────┼──────────────────┤ │  │
│  │ │ Fernanda   │ ██████ 6/6 ★ │ ✓ OK       │ R$ 4.800         │ │  │
│  │ │            │ ▇▇▇▇ MÁXIMO  │            │ 🏆 Faixa Elite   │ │  │
│  │ └────────────┴──────────────┴────────────┴──────────────────┘ │  │
│  │  CommissionLadder   Sparkline+Badge   Badge     Texto+link     │  │
│  │  ★ = faixa máxima: barra cheia + badge dourado "MÁXIMO"       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Evolução do Faturamento     │ │ Vendedoras por Faixa ⓘ       │   │
│  │ (AreaLineChart + compare)   │ │ (DonutChart)                 │   │
│  │                             │ │                              │   │
│  │  ╱╲    ╱╲                   │ │   ╭────╮                    │   │
│  │ ╱  ╲╱╱╱  ╲___               │ │  │ A 45%│ ● Abaixo Meta    │   │
│  │╱              ╲──            │ │  │ B 30%│ ● Na Meta        │   │
│  │ ─ ─ ─ ─ ─ ─ ─ ─ ─           │ │  │ C 25%│ ● Super Meta     │   │
│  │  período anterior (tracej.)  │ │   ╰────╯                    │   │
│  │                             │ │                              │   │
│  │ Eixo: DIA (>1d) / HORA (1d) │ │  Centro: "12 vendedoras"    │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Desafios Ativos ⓘ  (Accordion — ref: dashboard-desafios02)   │  │
│  │                                                               │  │
│  │ ▾ Body Cream — acima de 15 un                                │  │
│  │   produto        [████░░░░░░] 16/90 un·18%  2/6 ating. R$ 50 │  │
│  │                  projeta 72 un até o fim do período           │  │
│  │   ┌────────────────────┬───────────┬──────────┬────────────┐ │  │
│  │   │ VENDEDORA          │ PROGRESSO │ UNIDADES │ PREMIAÇÃO  │ │  │
│  │   ├────────────────────┼───────────┼──────────────────────┤ │  │
│  │   │ Bruna Teixeira     │ ██████████│ 14/15 un │ +R$ 50 ✓  │ │  │
│  │   │                    │ ▇▇▇▇ acel.│          │            │ │  │
│  │   ├────────────────────┼───────────┼──────────────────────┤ │  │
│  │   │ Ana Beatriz        │ █░░░░░░░░░│  2/15 un │ —    ↘    │ │  │
│  │   │                    │ ▁▁▂ des. │          │            │ │  │
│  │   ├────────────────────┼───────────┼──────────┼────────────┤ │  │
│  │   │ Camila, Juliana,   │           │ não      │ —    ○    │ │  │
│  │   │ Patrícia e Larissa │           │ começaram│            │ │  │
│  │   └────────────────────┴───────────┴──────────────────────┘ │  │
│  │                                                               │  │
│  │ ▸ Combo Mãe&Filha  [██░░░░] 8/40·20%  1/6 ating.  Vale R$200 │  │
│  │   (colapsado — clique para expandir)                          │  │
│  │                                                               │  │
│  │  Header: barra agregada + un/total·% + N/M atingiram + prêmio │  │
│  │  + projeção de fechamento ("projeta X un até o fim")          │  │
│  │  Linha individual: barra + un/meta + premiação(+R$ ou —)      │  │
│  │  + mini-spark tendência (acel./desacel.) + badge status       │  │
│  │  Status: ✓ atingiu · ↗ quase(>80%) · ↘ abaixo · ○ não começou│  │
│  │  Agrupa "não começaram" numa linha só (como a referência)     │  │
│  │  Ordenação: atingiu → quase → abaixo → não começou            │  │
│  │  Drill: clicar na vendedora → detalhe (produtos/dias)         │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Mock ASCII — Tela TURNOS (Dashboard > Turnos)

> **Status:** PROPOSTA PARA VALIDAÇÃO — zero código escrito.
> **Foco:** análise OPERACIONAL por período do dia (manhã/tarde/noite). Comparação entre turnos cadastrados em Configurações.
> **Filtros internos:** Período (DateRangePicker) + Marca (Segmented WEPINK/WPINK) + Seletor de Turno (dropdown com turnos cadastrados; padrão = "Todos").
> **Granularidade:** mesma regra da Equipe (1 dia → HORA; >1 dia → DIA).
> **Nota:** tela SEPARADA de Equipe. KPIs próprios, comparativos entre turnos.

### Extraído do BI atual (referencia11.jpeg — "Dashboard Gerencial")
A referência tem 6 blocos; mapeamos os relevantes para esta tela:
| Bloco no BI | Como entra na nossa tela de Turnos |
|---|---|
| **R$ Faturamento por Turno - Geral** (donut: Turno 1 vs Turno 2 com % e R$) | → vira o **DonutChart** de participação por turno (já previsto como comparativo). Mostra R$ e % de cada turno no total. |
| **R$ Faturamento por Turno - Dia da Semana** (barras horizontais por dia, T1 vs T2, com R$ em cada barra) | → vira o **StackedBarChart / BarChart** "Faturamento por Dia da Semana × Turno". **Valores em R$ direto na barra** (regra `showValues`). |
| **R$ Faturamento, Vendas e T.M por Turno** (cards Turno 1 / Turno 2 com Faturamento, Vendas, T. Médio) | → vira os **KPIs por turno** (Faturamento por Turno, Ticket Médio por Turno) + card resumo por turno. Confirma a estrutura de KPIs multi-turno que já definimos. |
| **Indicadores por Hora** (tabela: Hora, R$ Fat, Vendas, Ticket Médio, % Fat por Hora, Fat. ACM, % Fat. ACM) | → vira a **DataTable "Indicadores por Hora"** (já no mock). Adicionamos as colunas **% do faturamento do dia** e **acumulado (%)** que o BI tem — respondem "que horas concentram a venda?". |
| **R$ Faturamento por Turno - Vendedora** (ranking horizontal por vendedora, com R$ ao lado da barra, filtrado por turno) | → vira o **ranking de vendedoras por turno** (BarChart horizontal com `showValues`). Responde "quem puxou o resultado neste turno?". |

> Os valores em R$ aparecem **direto nas barras/linhas** em todos esses blocos no BI — isso virou a regra `showValues` registrada acima.

### Layout — Turnos

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard > Turnos                                                │
│  [Período: Este mês ▾] [Marca: WEPINK|WPINK] [Turno: Todos ▾]    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────────────┐  │
│  │ Faturamento   │ │ Vendas      │ │ Ticket Médio  │ │ Meta do período         │  │
│  │ por Turno   ⓘ │ │ por Turno ⓘ │ │ por Turno   ⓘ │ │ por Turno             ⓘ │  │
│  │               │ │             │ │               │ │                         │  │
│  │ Manhã:R$168mil│ │ Manhã:2.154 │ │ Manhã: R$ 78  │ │   ╭───╮                 │  │
│  │ Tarde:R$116mil│ │ Tarde:1.812 │ │ Tarde:  R$ 64 │ │  │68%│ Manhã           │  │
│  │ Noite:R$82mil │ │ Noite:1.410 │ │ Noite:  R$ 58 │ │   ╰───╯                 │  │
│  │ ▁▃▅▆▅▇█      │ │ ▃▅▅▃▂      │ │ ▅▆▇▆▅▂      │ │ vs Tarde: ↗ +22%        │  │
│  └───────────────┘ └───────────────┘ └───────────────┘ └─────────────────────────┘  │
│   StatCard(multi)   StatCard(multi)   StatCard(multi)   Gauge+comparativo           │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Faturamento por Dia × Turno ⓘ  (StackedBarChart)             │  │
│  │                                                               │  │
│  │  Seg  Ter  Qua  Qui  Sex  Sáb  Dom                            │  │
│  │  ██   ██   ██   ██   ██   ██   ░░   ← Manhã                 │  │
│  │  ▓▓   ▓▓   ▓▓   ▓▓   ▓▓   ▓▓   ▓▓   ← Tarde                 │  │
│  │  ░░   ░░   ░░   ░░   ░░   ░░   ░░   ← Noite                 │  │
│  │                                                               │  │
│  │  Legenda: ██ Manhã  ▓▓ Tarde  ░░ Noite                       │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Mapa de Calor por Hora ⓘ  (Heatmap dia × hora)               │  │
│  │ (filtrado pelo turno selecionado ou todos)                    │  │
│  │                                                               │  │
│  │       08  09  10  11  12  13  14  15  16  17  18  19  20     │  │
│  │  Seg  ░░  ▒▒  ██  ██  ▓▓  ░░  ▒▒  ██  ██  ▓▓  ░░  ░░  ░░   │  │
│  │  Ter  ░░  ▒▒  ██  ▓▓  ▓▓  ░░  ▒▒  ▓▓  ██  ██  ▓▓  ░░  ░░   │  │
│  │  Qua  ░░  ▒▒  ▒▒  ██  ██  ▓▓  ██  ██  ▓▓  ▓▓  ░░  ░░  ░░   │  │
│  │  ...                                                          │  │
│  │  ░=baixo ▒=médio ▓=alto █=pico                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Indicadores por Hora ⓘ  (condicional: período = 1 dia)       │  │
│  │ ┌────────┬──────────┬──────────┬──────────┬────────────────┐ │  │
│  │ │ Hora   │ Faturam. │ Atendim. │ Ticket   │ Vs. mesmo hor. │ │  │
│  │ ├────────┼──────────┼──────────┼──────────┼────────────────┤ │  │
│  │ │ 09:00  │ R$ 2.4k  │   18     │ R$ 133   │ ↗ +12%         │ │  │
│  │ │ 10:00  │ R$ 3.8k  │   24     │ R$ 158   │ ↗ +8%          │ │  │
│  │ │ 11:00  │ R$ 4.2k  │   31     │ R$ 135   │ ↘ -3%          │ │  │
│  │ └────────┴──────────┴──────────┴──────────┴────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Vendedoras por Hora ⓘ  (BarChart: reais vs. mínimo ideal)    │  │
│  │ Quantas vendedoras ativas em cada hora vs. mínimo ideal      │  │
│  │                                                               │  │
│  │  08  09  10  11  12  13  14  15  16  17  18  19  20          │  │
│  │  ██  ██  ██  ██  ▓▓  ██  ██  ██  ▓▓  ██  ██  ░░  ░░          │  │
│  │  ──  ──  ──  ──  ──  ──  ──  ──  ──  ──  ──  ──  ──  (meta) │  │
│  │                                                               │  │
│  │  ██ = staff real   ── = meta mínima                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Componentes Vela mapeados para Turnos

| Widget | Componente existente | Gap / Novo |
|---|---|---|
| KPIs multi-turno | `StatCard` (multi-linha via composição) | ✅ Composição |
| Gauge comparativo | `Gauge` + texto | ✅ Reusa |
| Comparativo turnos | `StackedBarChart` | ✅ Reusa |
| Heatmap hora×dia | `Heatmap` | ✅ Reusa |
| Indicadores por hora | `DataTable` | ✅ Reusa |
| Cobertura de staff | `BarChart` | ✅ Reusa |
| Seletor de turno | — | 🔨 Criar `Select` custom ou reusar `Dropdown` |

### Perguntas de decisão que esta tela responde

1. **"Qual turno vende mais?"** → KPIs comparativos + StackedBar.
2. **"Tem gente suficiente em cada horário?"** → Heatmap + Vendedoras por Hora.
3. **"O turno da manhã está batendo a meta?"** → Gauge com comparativo entre turnos.
4. **"Quais horários vendem mais no meu turno?"** → Heatmap filtrado por turno.
5. **"O valor por venda muda muito entre turnos?"** → StatCard Ticket Médio + drill para Indicadores por Hora.

### Grade responsiva — quantos cards por linha (Turnos)
Regra geral: **KPIs em 4 colunas no desktop** (padronizado com as demais telas — Faturamento, Vendas, Ticket Médio e Meta do período, todos por turno). Os cards de gráfico/tabela **não ficam todos 1 por linha** — agrupamos em pares de 2 colunas no desktop onde o conteúdo permite, e reservamos largura total só para o que realmente exige espaço horizontal (barras por dia da semana, heatmap, tabela com muitas colunas). Tablet = 2 KPIs/linha e cards 1/linha; Mobile = 1 por linha com scroll-x onde necessário.
| Bloco | Desktop (lg ≥1024px) | Tablet (md ≥768px) | Mobile (<768px) |
|---|---|---|---|
| KPI row (4 StatCards multi-turno) | **4 por linha** (`sm:grid-cols-2 lg:grid-cols-4`) | 2 por linha | 1 por linha |
| Faturamento por Dia × Turno | **1 por linha** (largura total — 7 dias em barras horizontais precisam de espaço) | 1 por linha | 1 por linha (scroll-x) |
| Mapa de Calor por Hora + Vendedoras por Hora | **2 por linha** (`lg:grid-cols-2`) — ambos são "intensidade por hora", cabem lado a lado | 1 por linha | 1 por linha (scroll-x no heatmap) |
| Indicadores por Hora | **1 por linha** (largura total — tabela com várias colunas) | 1 por linha | 1 por linha (scroll-x) |

> Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5` para os KPIs (padronizado com as demais telas); `lg:grid-cols-2` para o par (Mapa de Calor + Vendedoras por Hora); largura total (`lg:col-span-full`) para Faturamento por Dia e Indicadores por Hora. Tabelas e heatmap ganham `overflow-x-auto` no mobile.
> **Por que não tudo 1 por linha:** deixar cada card ocupando a linha inteira no desktop desperdiça espaço lateral e obriga o gestor a rolar muito. O par "Mapa de Calor + Vendedoras por Hora" divide bem a tela porque os dois respondem à mesma pergunta ("como foi cada hora?") e têm altura compatível. Só o gráfico de 7 dias e a tabela horária justificam largura total.
> **Critério usado (vale para todas as telas):** um card fica em largura total quando (a) tem muitas categorias no eixo horizontal (7 dias, 10+ produtos), (b) é uma tabela com ≥5 colunas, ou (c) é o widget central da tela. Caso contrário, agrupa em par de 2 colunas no desktop.

---

## Glossário — termos usados nos mocks (só os não óbvios)

> Objetivo: qualquer gestor, independente de senioridade, entende o que cada card mostra.
> Termos como "faturamento", "vendas", "meta" não entram aqui — são do dia a dia.

| Termo no mock | O que significa, em linguagem simples |
|---|---|
| **Valor médio por venda** | Quanto, em média, cada cliente gasta numa compra. Se vender R$ 1.000 em 10 vendas, o valor médio é R$ 100. Ajuda a saber se o cliente está comprando mais ou menos por vez. |
| **Batemos a meta?** | Percentual do quanto já vendemos frente ao que era esperado vender no período. 72% = faltam 28% pra fechar a meta. |
| **Cada uma vendeu** | Quanto, em média, cada vendedora trouxe de venda no período. Útil pra saber se o resultado veio de poucas pessoas ou se a equipe toda está produzindo. |
| **Vou pagar de premiação?** | Quanto a loja vai desembolsar em prêmios/comissões se o mês fechar como está agora. Ajuda a projetar o custo com a equipe. |
| **Escada de premiação** | As faixas de prêmio que a vendedora sobe conforme vende mais (ex.: Meta → Super Meta → Elite). A barra mostra em que degrau ela está. |
| **Ponto de atenção (PA)** | Sinal de que aquela vendedora está vendendo abaixo do ritmo esperado pro preço médio dela. "PA 1,63 ↓ · 4% abaixo" = ela precisa vender um pouco mais por cliente pra não cair de faixa. |
| **Faixa máxima (★ MÁXIMO)** | A vendedora já chegou no topo da escada de premiação. Não há próximo degrau — ela atingiu o prêmio máximo. |
| **Projeta X até o fim** | Estimativa de onde o número vai chegar se o ritmo atual se mantiver até o fim do período. Responde "vamos bater ou não?". |
| **Cobertura de staff** | Quantas vendedoras estão trabalhando em cada hora, comparado com o mínimo ideal. Se a barra está abaixo da linha de meta naquele horário, falta gente. |
| **Heatmap (mapa de calor)** | Grade que mostra, por cor, onde vendeu mais: dias da semana × horas. Cor forte = pico de venda; cor fraca = horário parado. |
| **Acelerando / desacelerando** | Mini-gráfico ao lado da vendedora no desafio: mostra se ela está ganhando ritmo (acelerando) ou perdendo (desacelerando) rumo à meta do desafio. |

### Componentes Vela mapeados para este mock

| Widget | Componente existente | Gap / Novo |
|---|---|---|
| KPI row (4 cards) | `StatCard` + `Sparkline` | ✅ Reusa |
| Filtro período interno | — | 🔨 Criar `DateRangePicker` |
| Filtro marca interno | — | 🔨 Criar `Segmented` (WEPINK/WPINK) |
| Escada de premiação | — | 🔨 Criar `CommissionLadder` (renomeado p/ Premiação) |
| Faixa máxima (★ MÁXIMO) | `CommissionLadder` + `Badge` dourado | ✅ Composição |
| Ponto de atenção badge | `Badge` variant warning | ✅ Composição |
| Tendência textual + spark | `Sparkline` + `Badge` | ✅ Composição |
| Evolução faturamento | `AreaLineChart` (compareData) | ✅ Reusa |
| Distribuição faixas | `DonutChart` | ✅ Reusa |
| Desafios ativos (expandível) | `Accordion` + `DataTable` interna + `ProgressBar` | ✅ Composição |

### Perguntas de decisão que esta tela responde

1. **"Quem está batendo meta e quem precisa de intervenção?"** → Escada de comissão com PA e tendência.
2. **"Quanto vou pagar de comissão se o mês fechar assim?"** → StatCard comissão projetada + próximo degrau na tabela.
3. **"Os desafios estão engajando a equipe?"** → Tabela de desafios com progresso e engajadas.
4. **"Estamos melhor ou pior que o mês passado?"** → Delta em todos os StatCards + linha tracejada no AreaLineChart.
5. **"Como evoluiu o faturamento da equipe no período?"** → AreaLineChart com comparativo.

### Notas de design

- **Escada de premiação é o widget central** — ocupa largura total, acima dos gráficos. É o diferencial analítico vs. concorrente.
- **Faixa máxima**: quando a vendedora atinge o topo da escada, a barra fica cheia (6/6) + badge dourado "★ MÁXIMO" + texto "🏆 Faixa Elite". Não há "próximo degrau" — ela já chegou.
- **Desafios usam Accordion**: cada desafio é um item colapsável. O header mostra progresso agregado + engajadas + prêmio. Ao expandir, revela `DataTable` com desempenho individual (vendedora, vendas, % meta, status). Permite ver quem está puxando o resultado sem poluir a visão geral.
- **Turnos são tela SEPARADA** (Dashboard > Turnos) — esta tela foca exclusivamente no indivíduo.
- **Tabela de indicadores por hora é condicional** — só renderiza quando `escopo.periodo` resulta em granularidade horária.
- **Todos os números têm os 4 elementos**: valor + comparativo + tendência + drill-down (link ou tooltip).
- **Zero botões de ação CRUD** dentro desta tela. Tudo é leitura analítica.

### Grade responsiva — quantos cards por linha (Equipe)
**Critério unificado (vale para TODAS as telas):** um card fica em **largura total** quando (a) tem muitas categorias no eixo horizontal (7 dias, 10+ produtos), (b) é tabela com ≥5 colunas, ou (c) é o widget central da tela. Caso contrário, **agrupa em par de 2 colunas** no desktop. KPIs sempre em linha cheia (4 no desktop). Tablet = 2 KPIs/linha e cards 1/linha; Mobile = tudo 1/linha com scroll-x onde necessário.
| Bloco | Desktop (lg ≥1024px) | Tablet (md ≥768px) | Mobile (<768px) |
|---|---|---|---|
| KPI row (4 StatCards) | **4 por linha** (`sm:grid-cols-2 lg:grid-cols-4`) | 2 por linha | 1 por linha |
| Escada de Premiação | **1 por linha** (largura total — widget central, critério c) | 1 por linha | 1 por linha |
| Evolução do Faturamento + Vendedoras por Faixa | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
| Desafios Ativos | **1 por linha** (largura total — Accordion com tabela interna, critério b) | 1 por linha | 1 por linha |

> Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5` para os KPIs; `lg:grid-cols-2` para o par de gráficos; largura total (`lg:col-span-full`) para Escada e Desafios. Tabelas ganham `overflow-x-auto` no mobile.

---

## Mock ASCII — Tela FINANCEIRO (Dashboard > Financeiro)

> **Status:** PROPOSTA PARA VALIDAÇÃO — zero código escrito.
> **Foco:** saúde financeira da loja/rede — quanto entra, quanto custa, quanto sobra, e onde vaza margem.
> **Filtros internos:** Período (DateRangePicker) + Marca (Segmented WEPINK/WPINK).
> **Granularidade:** mesma regra (1 dia → HORA; >1 dia → DIA).
> **Nota:** 100% leitura analítica. Zero CRUD. Ações financeiras (pagar conta, gerar DRE exportável) ficam fora do dashboard.

### Extraído do BI atual (referencia02/03/04.jpeg — blocos financeiros)
| Bloco no BI | Como entra na nossa tela Financeiro |
|---|---|
| **CMV, Lucro Bruto e % Margem - Mensal** (barras empilhadas CMV+Lucro com linha de % margem; valores `92K/138K` direto nas barras; tooltip com CMV, % Margem, Faturamento, CMV Médio) | → vira o card **Custo, Lucro e Margem** (StackedBarChart CMV+Lucro Bruto + AreaLine de % Margem sobreposto). **Valores em R$ direto nas barras** (`showValues`). É o widget central da tela. |
| **Qtd Itens Vendidos vs PA - Mensal** (barras de quantidade com linha de PA; valores `1.903 / 1,57` direto) | → vira o card **Itens Vendidos vs Preço Médio** (BarChart de qty + AreaLine de PA/Ticket). Responde "estou vendendo mais unidades ou só mais caro?". |
| **Vendas vs Ticket Médio - Mensal** (linha de vendas + linha de ticket) | → vira o card **Faturamento vs Ticket Médio** (AreaLineChart 2 séries com `compareData`). |
| **R$ Faturamento por Forma de Pagamento** (donut: Crédito R$66mil 43%, Débito R$39mil 26%, Pix, Dinheiro R$16mil...) | → vira o card **Faturamento por Forma de Pagamento** (DonutChart com R$ e % por forma). Responde "como o cliente está pagando?" (impacta taxa da maquininha/prazo de recebimento). |
| Tooltip do BI (Mês, CMV, % Margem, Faturamento, CMV Médio) | → vira o **tooltip rico** dos gráficos + as colunas da tabela de evolução mensal. |
| **(NOVO — pedido do gestor, não estava no BI)** Custos fixos + franquia: Aluguel (Fixo + % se shopping), Royalties, Taxa de Marketing (WEPINK e WPINK) | → vira o card **Custos Fixos e Franquia** (DataTable tipo mini-DRE: lista cada custo, soma, e desconta do Lucro Bruto → **Resultado Operacional**). É a ponte entre Lucro Bruto e o futuro Lucro Líquido. |

> **Escopo financeiro decidido:** esta tela vai do **Faturamento → CMV → Lucro Bruto → (− Custos Fixos/Franquia) → Resultado Operacional**. Os custos extras restantes (folha completa, utilities, depreciação, impostos sobre lucro etc.) e o **Lucro Líquido** ficam para a **futura aba DRE** (fora deste dashboard). O card "Custos Fixos e Franquia" já deixa o gancho visual para essa evolução.

### Layout — Financeiro

```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard > Financeiro                                             │
│  [Período: Este mês ▾]  [Marca: WEPINK | WPINK]                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ Faturamentoⓘ │ │ Custo dos    │ │ Lucro        │ │ Margem       ││
│  │              │ │ produtos   ⓘ │ │ bruto      ⓘ │ │            ⓘ ││
│  │ R$ 284 mil   │ │ R$ 114 mil   │ │ R$ 170 mil   │ │   60%        ││
│  │ ↗ +8% vs     │ │ ↗ +5% vs     │ │ ↗ +11% vs    │ │ ↗ +2 p.p. vs ││
│  │ mês passado  │ │ mês passado  │ │ mês passado  │ │ mês passado  ││
│  │ ▁▃▅▇▆▅▇█     │ │ ▁▂▃▃▅▅▆▇     │ │ ▁▃▅▆▇▇██     │ │ ▃▅▅▆▆▇▇█     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│   StatCard        StatCard        StatCard        StatCard          │
│   (ⓘ = tooltip com explicação simples do KPI)                       │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Custo, Lucro e Margem ⓘ  (widget central)                    │  │
│  │ (StackedBarChart CMV+Lucro Bruto + AreaLine % Margem)         │  │
│  │                                                               │  │
│  │  %margem: 53% ··· 49% ··· 50% ··· 49% ··· 48% ··· 51% ··· 54% │  │
│  │           ╭──────────────────────────────────────────────╮    │  │
│  │  mar abr mai jun jul ago set out nov dez                  │    │
│  │  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░  ░░   ← Lucro Bruto  │    │
│  │  ██  ██  ██  ██  ██  ██  ██  ██  ██  ██   ← Custo (CMV)   │    │
│  │  92K 138K 109K ... 221K  (R$ direto em cada barra)         │    │
│  │                                                               │  │
│  │  Legenda: ██ Custo  ░░ Lucro  ┄ % Margem                    │  │
│  │  Tooltip: Mês · Custo · % Margem · Faturamento · Custo médio│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Faturamento vs Ticket Médio │ │ Itens Vendidos vs Preço Médio│   │
│  │ (AreaLineChart 2 séries)    │ │ (BarChart qty + AreaLine PA) │   │
│  │                             │ │                              │   │
│  │  ╱╲    ╱╲  ← faturamento    │ │  1,97                        │   │
│  │ ╱  ╲╱╱╱  ╲  ┄ ticket médio  │ │   ·  1,57 · 1,61 ··· 1,59   │   │
│  │                             │ │  █   █   █   █   █   █   █   │   │
│  │  R$ direto nos pontos       │ │ 1903 3723 5655 ... 6826      │   │
│  │                             │ │  (qty direto em cada barra)  │   │
│  │                             │ │  Legenda: █ Itens  · Preço   │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Faturamento por Forma de    │ │ Custos Fixos e Franquia ⓘ    │   │
│  │ Pagamento ⓘ  (DonutChart)   │ │ (mini-DRE: Lucro Bruto       │   │
│  │                             │ │  − custos fixos/franquia     │   │
│  │   ╭────╮  ● Crédito  43%    │ │  = Resultado Operacional)    │   │
│  │  │66mil│  ● Débito   26%    │ │                              │   │
│  │  │     │  ● Pix      16%    │ │  Lucro Bruto        R$ 170 mil│   │
│  │   ╰────╯  ● Dinheiro 11%    │ │  (−) Aluguel fixo    R$  18 mil│   │
│  │         ● Outros      4%    │ │  (−) Aluguel % shopp R$   9 mil│   │
│  │  R$ e % por forma de pgto   │ │  (−) Royalties       R$  12 mil│   │
│  │  (ref: referencia04.jpeg)   │ │  (−) Taxa Mkt WEPINK R$   6 mil│   │
│  │                             │ │  (−) Taxa Mkt WPINK  R$   4 mil│   │
│  │                             │ │  ─────────────────────────────│   │
│  │                             │ │  = Resultado Operac. R$ 121 mil│   │
│  │                             │ │  (custos extras/lucro líquido  │   │
│  │                             │ │   → futura aba DRE)           │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Evolução Mensal ⓘ  (DataTable — resumo tipo DRE simplificado)│  │
│  │ ┌────────┬──────────┬──────────┬──────────┬────────┬────────┐ │  │
│  │ │ Mês    │ Faturam. │ Custo    │ Lucro    │ Margem │ Ticket │ │  │
│  │ ├────────┼──────────┼──────────┼──────────┼────────┼────────┤ │  │
│  │ │ jul    │ R$ 220k  │ R$ 114k  │ R$ 106k  │  48%   │ R$ 24  │ │  │
│  │ │ ago    │ R$ 235k  │ R$ 118k  │ R$ 117k  │  50%   │ R$ 25  │ │  │
│  │ │ ...    │          │          │          │        │        │ │  │
│  │ └────────┴──────────┴──────────┴──────────┴────────┴────────┘ │  │
│  │  DataTable com valores em R$ + variação vs mês anterior       │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Componentes Vela mapeados para Financeiro

| Widget | Componente existente | Gap / Novo |
|---|---|---|
| KPI row (4 cards) | `StatCard` + `Sparkline` | ✅ Reusa |
| Filtro período interno | — | 🔨 Criar `DateRangePicker` (já previsto) |
| Filtro marca interno | — | 🔨 Criar `Segmented` (já previsto) |
| Custo, Lucro e Margem | `StackedBarChart` + `AreaLineChart` (% margem) | ✅ Composição (+ `showValues`) |
| Faturamento vs Ticket Médio | `AreaLineChart` (2 séries) | ✅ Reusa (+ `showValues`) |
| Itens Vendidos vs Preço Médio | `BarChart` + `AreaLineChart` (PA) | ✅ Composição (+ `showValues`) |
| Faturamento por Forma de Pagamento | `DonutChart` | ✅ Reusa (R$ e % por forma) |
| Custos Fixos e Franquia (mini-DRE) | `DataTable` (linhas de custo + total) ou composição simples de linhas | ✅ Reusa (`DataTable`/lista) — desconta do Lucro Bruto → Resultado Operacional |
| Evolução Mensal (DRE simplif.) | `DataTable` | ✅ Reusa |
| WaterfallChart (DRE em cascata) | — | 🟡 Opcional (decisão #4). Se criado, substitui/complementa a tabela de evolução |

### Perguntas de decisão que esta tela responde

1. **"Estou ganhando ou perdendo dinheiro?"** → KPI Lucro Bruto + Margem, e o widget central Custo/Lucro/Margem.
2. **"Onde está vazando minha margem?"** → StackedBar mostrando Custo vs Lucro ao longo dos meses + % Margem em queda/subida.
3. **"Estou vendendo mais unidades ou só mais caro?"** → Itens Vendidos vs Preço Médio (qty sobe mas PA cai = vendendo mais barato).
4. **"Meu ticket médio está subindo ou caindo, e por quê?"** → Faturamento vs Ticket Médio + drill para a tabela mensal.
5. **"Estamos melhor ou pior que o mês passado?"** → Delta em todos os KPIs + comparativo na tabela mensal.

### Grade responsiva — quantos cards por linha (Financeiro)

Regra geral: **KPIs em 4 colunas no desktop**, widget central em largura total, par de gráficos em 2 colunas, tabela em largura total. Mobile empilha tudo em 1 coluna.

| Bloco | Desktop (lg ≥1024px) | Tablet (md ≥768px) | Mobile (<768px) |
|---|---|---|---|
**Critério unificado (vale para TODAS as telas):** um card fica em **largura total** quando (a) tem muitas categorias no eixo horizontal, (b) é tabela com ≥5 colunas, ou (c) é o widget central da tela. Caso contrário, **agrupa em par de 2 colunas** no desktop. KPIs sempre em linha cheia (4 no desktop). Tablet = 2 KPIs/linha e cards 1/linha; Mobile = tudo 1/linha com scroll-x onde necessário.
| KPI row (4 StatCards) | **4 por linha** (`sm:grid-cols-2 lg:grid-cols-4`) | 2 por linha | 1 por linha |
| Custo, Lucro e Margem | **1 por linha** (largura total — widget central, critério c) | 1 por linha | 1 por linha (scroll-x) |
| Faturamento vs Ticket + Itens vs Preço | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
| Forma de Pagamento + Custos Fixos/Franquia | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
| Evolução Mensal | **1 por linha** (largura total — tabela ≥5 colunas, critério b) | 1 por linha | 1 por linha (scroll-x) |

> Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5` para os KPIs; `lg:grid-cols-2` para os dois pares de gráficos (Faturamento/Ticket + Itens/Preço, e Forma de Pagamento + Custos Fixos); largura total (`lg:col-span-full`) para o widget central e a tabela. Tabelas ganham `overflow-x-auto` no mobile.

### Glossário — termos financeiros (só os não óbvios)

| Termo no mock | O que significa, em linguagem simples |
|---|---|
| **Custo dos produtos (CMV)** | Quanto a loja gastou para comprar os produtos que vendeu no período. Se vendeu R$ 284 mil e o custo foi R$ 114 mil, sobraram R$ 170 mil antes das outras despesas. |
| **Lucro bruto** | O que sobra da venda depois de tirar o custo dos produtos (Faturamento − Custo). Ainda não desconta aluguel, salário etc. — é o "lucro da venda em si". |
| **Margem (%)** | Quantos centavos de lucro cada R$ 1 vendido deixa. Margem 60% = de cada R$ 100 vendidos, R$ 60 sobram (antes das despesas). Se a margem cai, ou o custo subiu, ou você está dando mais desconto. |
| **Preço Médio (PA)** | Valor médio de cada item vendido (Faturamento ÷ Qtd de itens). Diferente do Ticket Médio: o PA é por ITEM, o Ticket é por COMPRA. |
| **Ticket Médio** | Valor médio de cada compra/atendimento (Faturamento ÷ Nº de vendas). Mostra se o cliente está levando mais ou menos por vez. |
| **p.p. (pontos percentuais)** | Variação absoluta de uma porcentagem. Margem foi de 58% para 60% = "+2 p.p." (não é "+2%", que seria relativo). |
| **Resultado Operacional** | O que sobra do Lucro Bruto depois de tirar os custos fixos e da franquia (aluguel, royalties, taxa de marketing). É o "lucro do dia a dia da loja", antes dos custos extras e impostos. |
| **Aluguel (% shopping)** | Em shoppings, além do aluguel fixo você paga um percentual do faturamento (ex.: 5% das vendas). Os dois juntos (fixo + %) são o custo total de ocupação. |
| **Royalties** | Percentual do faturamento pago à franqueadora (WEPINK/WPINK) pelo uso da marca. É um custo fixo da franquia, independente de a loja lucrar ou não. |
| **Taxa de Marketing (Franquia)** | Percentual do faturamento destinado ao fundo de propaganda da marca (campanhas nacionais/regionais). Geralmente há uma taxa para WEPINK e outra para WPINK. |
| **Forma de Pagamento** | Como o cliente pagou (Crédito, Débito, Pix, Dinheiro). Importa porque cada forma tem um custo/prazo diferente: crédito demora pra cair e tem taxa da maquininha; Pix cai na hora e é mais barato. |
| **DRE / Lucro Líquido (futura aba)** | Demonstrativo completo que parte do Resultado Operacional e desconta o resto (folha completa, luz/água, depreciação, impostos sobre lucro) até o Lucro Líquido final. Fica fora deste dashboard, numa aba dedicada futura. |

---
## Mock ASCII — Tela PRODUTOS (Dashboard > Produtos)
> **Status:** PROPOSTA PARA VALIDAÇÃO — zero código escrito.
> **Foco:** desempenho do mix de produtos — o que vende, o que dá margem, o que está parado ou em ruptura.
> **Filtros internos:** Período (DateRangePicker — extrair de `DatePickersPage.tsx`) + Marca (Segmented WEPINK/WPINK) + Categoria (Dropdown/Select).
> **Granularidade:** mesma regra (1 dia → HORA; >1 dia → DIA).
> **Nota:** 100% leitura analítica. Zero CRUD. Cadastro/edição de produto fica fora do dashboard.
> **Base:** `referencia08.jpeg` (BI atual: R$ Produtos por Categoria, R$ Linha Produto, Ranking por Produto, Tabela de Produtos). Melhorias aplicadas abaixo.

### Extraído do BI atual (referencia08.jpeg — blocos de produtos)
| Bloco no BI | Como entra na nossa tela Produtos | Melhoria vs. BI |
|---|---|---|
| **R$ Produtos por Categoria** (barras por categoria BODY/PERF/HAIR/MAKE/SKIN/BATH + linha de % Margem; valores `178K/159K` direto nas barras) | → card **Faturamento por Categoria** (BarChart + AreaLine % Margem sobreposto, `showValues`). | Adicionamos delta vs período anterior por categoria + clique na barra filtra a tabela abaixo. |
| **R$ Linha Produto** (ranking horizontal: OBSESSED 36K, GOLDEN 31K, HEAVEN 30K...) | → card **Top Linhas de Produto** (BarChart horizontal, `showValues`). | Drill: clicar numa linha filtra a tabela por aquela linha. |
| **Ranking por Produto** (ranking horizontal com seletor "Faturamento" no topo; DESOD COL VF GOLDEN 19K...) | → card **Top Produtos** (BarChart horizontal + `Segmented`/`Select` para ordenar por Faturamento / Qtd Vendida / Margem). | O BI só ordena por faturamento; nós deixamos o gestor escolher a métrica do ranking. |
| **Tabela de Produtos** (Categoria, Faturamento, CMV, Lucro Bruto, % Margem, CMV%, Qtd Vendas, Ticket Médio, Qtd Itens Vendidos, T.M por Itens) | → card **Tabela de Produtos** (DataTable com as mesmas colunas + busca "Pesquisar Produto" + botão "Ver Tabela Completa"). | Adicionamos coluna de tendência (↗/↘) + dias de cobertura/estoque + badge de ruptura. Responde "vou perder venda por falta?". |

### Layout — Produtos
```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard > Produtos                                               │
│  [Período: Este mês ▾] [Marca: WEPINK|WPINK] [Categoria: Todas ▾]   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ Faturamentoⓘ │ │ Lucro        │ │ Margem       │ │ Itens        ││
│  │              │ │ bruto      ⓘ │ │            ⓘ │ │ vendidos   ⓘ ││
│  │ R$ 352 mil   │ │ R$ 199 mil   │ │   57%        │ │  5.778       ││
│  │ ↗ +6% vs     │ │ ↗ +9% vs     │ │ ↗ +1 p.p. vs │ │ ↗ +4% vs     ││
│  │ mês passado  │ │ mês passado  │ │ mês passado  │ │ mês passado  ││
│  │ ▁▃▅▇▆▅▇█     │ │ ▁▃▅▆▇▇██     │ │ ▃▅▆▆▇▇█     │ │ ▁▂▃▃▅▅▆▇     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│   StatCard        StatCard        StatCard        StatCard          │
│   (ⓘ = tooltip com explicação simples do KPI)                       │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Faturamento por Categoria ⓘ  (widget central)                │  │
│  │ (BarChart por categoria + AreaLine % Margem sobreposto)       │  │
│  │                                                               │  │
│  │  %margem: 62% ··· 50% ··· 60% ··· 67% ··· 67% ··· 100%        │  │
│  │           ╭──────────────────────────────────────────────╮    │  │
│  │  BODY PERF HAIR MAKE SKIN BATH                            │    │
│  │  ███  ███  ██   █    █    ▁                               │    │
│  │ 178K 159K  11K  2K   2K  766   (R$ direto em cada barra)  │    │
│  │                                                               │  │
│  │  Legenda: █ Faturamento  ┄ % Margem                          │  │
│  │  Clique numa barra → filtra a Tabela de Produtos abaixo      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Top Linhas de Produto       │ │ Top Produtos                 │   │
│  │ (BarChart horizontal)       │ │ (BarChart horizontal +       │   │
│  │                             │ │  ordenação: [Faturamento ▾]) │   │
│  │  OBSESSED  ████████████ 36K │ │  DESOD COL VF GOLDEN  ███ 19K│   │
│  │  GOLDEN    ██████████   31K │ │  BODY SPLASH VF GOLDEN ██ 10K│   │
│  │  HEAVEN    █████████    30K │ │  DESOD COL OBSESSED    ██ 10K│   │
│  │  LIBERTE   ███████      22K │ │  ...                         │   │
│  │  ...                        │ │  Ordenar por: Faturamento /  │   │
│  │  R$ direto em cada barra    │ │  Qtd Vendida / Margem        │   │
│  │  Clique → filtra a tabela   │ │  Clique → drill do produto   │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Tabela de Produtos ⓘ  [🔍 Pesquisar]      [Ver Tabela Completa →]│
│  │ ┌──────────┬─────────┬────────┬────────┬───────┬──────┬───────┬────────┬──────┬──────┐│
│  │ │Categoria │Faturam. │ CMV    │Lucro   │Margem │CMV%  │Qtd V. │Ticket  │Itens │T.M/it││
│  │ ├──────────┼─────────┼────────┼────────┼───────┼─────────────┼────────┼────────────┤│
│  │ │PERFUMARIA│R$158.734│R$79.183│R$79.550│  50%  │ 50%  │ 1.247 │R$127,29│1.549 │R$102 ││
│  │ │BODY SPL. │R$177.990│R$68.087│R$109.9 │  62%  │ 38%  │ 2.852 │R$ 62,41│3.933 │R$ 45 ││
│  │ │HAIR      │R$ 10.589│R$ 4.223│R$ 6.366│  60%  │ 40%  │   165 │R$ 64,18│  198 │R$ 53 ││
│  │ │...       │         │        │        │       │      │       │        │      │      ││
│  │ │Total     │R$352.008│R$152.78│R$199.2 │  57%  │ 43%  │ 3.883 │R$ 90,65│5.778 │R$ 60 ││
│  │ └──────────┴─────────┴────────┴────────┴───────┴─────────────┴──────────────┴──────│
│  │  DataTable + busca + badge de ruptura/estoque baixo + tendência ↗/↘ por linha         │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Componentes Vela mapeados para Produtos
| Widget | Componente existente | Gap / Novo |
|---|---|---|
| KPI row (4 cards) | `StatCard` + `Sparkline` | ✅ Reusa |
| Filtro período interno | markup de `DatePickersPage.tsx` | 🟡 Extrair → `DateRangePicker` (já decidido) |
| Filtro marca interno | estilo "Quick ranges" | 🟡 Criar `Segmented` (já decidido, trivial) |
| Filtro categoria | `Select` (`form.tsx`) / `Dropdown` | ✅ Reusa |
| Faturamento por Categoria | `BarChart` + `AreaLineChart` (% margem) | ✅ Composição (+ `showValues`) |
| Top Linhas de Produto | `BarChart` (horizontal) | ✅ Reusa (+ `showValues`) |
| Top Produtos + ordenação | `BarChart` (horizontal) + `Segmented`/`Select` | ✅ Composição (+ `showValues`) |
| Tabela de Produtos | `DataTable` + busca (`Input`) + `Badge` + `Button` | ✅ Reusa |
| Dias de cobertura / estoque | `ProgressBar` + `Badge` danger | ✅ Composição |

### Perguntas de decisão que esta tela responde
1. **"Quais categorias/produtos puxam meu faturamento?"** → Faturamento por Categoria + Top Linhas + Top Produtos.
2. **"O que vende muito mas dá pouca margem (ou vice-versa)?"** → linha de % Margem sobreposta nas barras + coluna Margem/CMV% na tabela.
3. **"Estou prestes a perder venda por falta de estoque?"** → badge de ruptura + dias de cobertura na Tabela de Produtos.
4. **"Meu mix está concentrado demais em poucos produtos?"** → Top Produtos (se 2-3 itens respondem por 80%, sinal de risco).
5. **"Qual produto merece promoção / qual merece ser descontinuado?"** → tendência ↗/↘ por linha + margem + giro (itens vendidos).

### Grade responsiva — quantos cards por linha (Produtos)
Regra geral: **KPIs em 4 colunas no desktop**, widget central em largura total, par de rankings em 2 colunas, tabela em largura total. Mobile empilha tudo em 1 coluna. (Alinhado com Analytics/Ecommerce do Vela.)
| Bloco | Desktop (lg ≥1024px) | Tablet (md ≥768px) | Mobile (<768px) |
|---|---|---|---|
**Critério unificado (vale para TODAS as telas):** um card fica em **largura total** quando (a) tem muitas categorias no eixo horizontal, (b) é tabela com ≥5 colunas, ou (c) é o widget central da tela. Caso contrário, **agrupa em par de 2 colunas** no desktop. KPIs sempre em linha cheia (4 no desktop). Tablet = 2 KPIs/linha e cards 1/linha; Mobile = tudo 1/linha com scroll-x onde necessário.
| KPI row (4 StatCards) | **4 por linha** (`sm:grid-cols-2 lg:grid-cols-4`) | 2 por linha | 1 por linha |
| Faturamento por Categoria | **1 por linha** (largura total — widget central, critério c) | 1 por linha | 1 por linha (scroll-x) |
| Top Linhas + Top Produtos | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
| Tabela de Produtos | **1 por linha** (largura total — tabela ≥5 colunas, critério b) | 1 por linha | 1 por linha (scroll-x) |
> Tailwind: mesmo padrão dos dashboards Vela — `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` para KPIs; `lg:grid-cols-2` para o par de rankings; largura total (`lg:col-span-full`) para o widget central e a tabela. Tabelas ganham `overflow-x-auto` no mobile.

### Glossário — termos de produtos (só os não óbvios)
| Termo no mock | O que significa, em linguagem simples |
|---|---|
| **CMV%** | Quanto do faturamento foi embora só pra comprar os produtos vendidos. CMV% 43% = de cada R$ 100 vendidos, R$ 43 foram o custo da mercadoria. Quanto menor, melhor a margem. |
| **T.M por Itens** | Ticket médio dividido pelos itens — valor médio de cada item dentro das compras. Ajuda a comparar com o Preço Médio (PA) e ver se o cliente leva itens baratos ou caros. |
| **Dias de cobertura** | Quantos dias o estoque atual aguenta no ritmo de venda de hoje. Baixo = risco de ficar sem o produto (ruptura). Alto = dinheiro parado em estoque. |
| **Ruptura** | Quando o produto acabou no estoque e a loja está perdendo venda por falta dele. Aparece como badge vermelho na tabela. |
| **Giro (itens vendidos)** | Quantidade de unidades vendidas no período. Produto com giro alto e margem boa = campeão. Giro alto e margem ruim = vende muito mas quase não lucra. |

---
## Mock ASCII — Tela VISÃO GERAL (Dashboard > Visão Geral)
> **Status:** PROPOSTA PARA VALIDAÇÃO — zero código escrito.
> **Foco:** a "capa" do dashboard — resumo executivo de TODA a operação numa tela só. O gestor bate o olho e sabe: vendi quanto, bati a meta, estou lucrando, e onde preciso agir. É o ponto de entrada; os detalhes vivem nas 4 subtelas (Equipe, Turnos, Financeiro, Produtos), acessíveis por drill-down.
> **Filtros internos:** Período (DateRangePicker — extrair de `DatePickersPage.tsx`) + Marca (Segmented WEPINK/WPINK).
> **Granularidade:** mesma regra (1 dia → HORA; >1 dia → DIA).
> **Nota:** 100% leitura analítica e consolidada. Zero CRUD. Cada card/KPI tem drill para a subtela correspondente.
> **Base:** imagem do "Dashboard Gerencial" enviada pelo gestor (Faturamento/CMV/Lucro Bruto/Vendas/Ticket Médio no topo; Categoria Meta×Fat; Dia da Semana Meta×Fat; % Atingido da Meta; Evolução Diária Fat×Meta; Faturamento por Forma de Pagamento).
### Extraído do BI atual (Dashboard Gerencial — imagem enviada)
| Bloco no BI | Como entra na nossa Visão Geral | Melhoria vs. BI |
|---|---|---|
| **KPIs do topo** (Faturamento R$152k c/ "8,20% Abaixo" da meta · CMV R$60k "CMV% 40%" · Lucro Bruto R$91k "60% de Margem" · Vendas 1.665 "2.495 itens · PA 1,50" · Ticket Médio R$91,30) | → vira os **4 KPIs financeiros** (padronizado): Faturamento · CMV · Lucro bruto · Ticket Médio. Cada um com delta vs meta/vs período anterior. "Vendas/itens" vira sub do card Faturamento. | Mantemos os 4 KPIs do padrão, mas agora são os 4 financeiros do BI (CMV e Ticket Médio sobem pra KPI próprio, como na referencia01 — são relevantes pro gestor bater o olho). "Meta do mês" desce pro widget central de Atingimento (onde já vivem as 3 metas). |
| **Top 3 Vendedoras** (ranking das 3 que mais venderam no período, com R$) | → card **Top 3 Vendedoras** (lista/BarChart horizontal compacto, `showValues`). | Responde "quem está puxando o resultado?". Drill → Equipe. (estava na referencia01, não pode faltar na capa) |
| **Top 3 Produtos** (ranking dos 3 produtos mais vendidos, com R$) | → card **Top 3 Produtos** (lista/BarChart horizontal compacto, `showValues`). | Responde "o que está vendendo mais?". Drill → Produtos. (estava na referencia01) |
| **Categoria - Meta Vs Faturamento** (barras BODY/PERF/HAIR/BATH/MAKE/SKIN: Meta cinza vs Realizado rosa, `80K/83K/64K...`) | → card **Faturamento por Categoria vs Meta** (StackedBarChart ou BarChart agrupado Meta×Realizado, `showValues`). | Clique numa categoria → drill para a tela Produtos filtrada. |
| **Dia da Semana - Meta Vs Faturamento** (barras horizontais por dia, Meta vs Realizado, `24K/20K/31K...`) | → card **Faturamento por Dia da Semana vs Meta** (BarChart horizontal agrupado, `showValues`). | Responde "qual dia da semana performa melhor?". Drill → Turnos. |
| **% Atingido da Meta de Faturamento** (3 gauges: Meta 79,68% R$190k · Super Meta 70,12% R$216k · Hiper Meta 58,43% R$260k) | → card **Atingimento da Meta** (3 Gauges: Meta / Super Meta / Hiper Meta, cada um com % e R$ alvo). | É o "termômetro" do mês. Já mapeado como `Gauge` (existe). |
| **Evolução Diária - Faturamento Vs Meta** (linha Realizado ACM + Meta ACM + Projeção tracejada; toggle "Vs Meta / Vs M-1") | → card **Evolução do Faturamento vs Meta** (AreaLineChart: realizado acumulado + meta acumulada + projeção; toggle Vs Meta / Vs Mês anterior). | A projeção responde "vou bater a meta até o fim do mês?". |
| **R$ Faturamento por Forma de Pagamento** (donut: Crédito 43% · Débito 26% · Pix · Dinheiro) | → card **Faturamento por Forma de Pagamento** (DonutChart). | Mesmo do Financeiro — aqui aparece como resumo. Drill → Financeiro. |
### Layout — Visão Geral
```
┌─────────────────────────────────────────────────────────────────────┐
│  Dashboard > Visão Geral                                            │
│  [Período: Este mês ▾]  [Marca: WEPINK | WPINK]                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ Faturamentoⓘ │ │ CMV (custo)ⓘ │ │ Lucro        │ │ Ticket Médio ││
│  │              │ │ bruto      ⓘ │ │              │ │            ⓘ ││
│  │ R$ 152 mil   │ │ R$ 60 mil    │ │ R$ 91 mil    │ │ R$ 91,30     ││
│  │ ↘ 8,2% abaixo│ │ CMV% 40%     │ │ 60% de margem│ │ 1.665 vendas ││
│  │ da meta      │ │ ↗ +5% vs     │ │ ↗ +11% vs    │ │ 2.495 itens  ││
│  │ ▁▃▅▇▆▅▇█     │ │ mês passado  │ │ ▇▆▃▃▂▁     │ │ ▁▂▃▅▅▆▇     ││
│  │  [→ Financeiro]│ │[→ Financeiro]│ │ [→ Equipe]   │ │ [→ Produtos] ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│   StatCard        StatCard        StatCard        StatCard          │
│   (cada KPI tem drill para a subtela correspondente)                │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ Atingimento da Meta ⓘ  (widget central — 3 Gauges)           │  │
│  │                                                               │  │
│  │   ╭───╮         ╭───╮         ╭───╮                          │  │
│  │  │79,7%│ Meta   │70,1%│ Super  │58,4%│ Hiper                  │  │
│  │   ╰───╯ R$190mil ╰─── R$216mil ───╯ R$260mil               │  │
│  │                                                               │  │
│  │  "Faltam R$ 38 mil pra bater a Meta do mês"                   │  │
│  │  Projeção: se manter o ritmo, fecha em ~R$ 188 mil (98%)      │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Faturamento por Categoria   │ │ Faturamento por Dia da       │   │
│  │ vs Meta ⓘ                   │ │ Semana vs Meta ⓘ             │   │
│  │ (BarChart agrupado          │ │ (BarChart horizontal         │   │
│  │  Meta × Realizado)          │ │  agrupado Meta × Realizado)  │   │
│  │                             │ │                              │   │
│  │  BODY PERF HAIR BATH MAKE   │ │  dom  ██░░ 24K/20K           │   │
│  │  ░█   ░█   ░█  ...          │ │  seg  ██░░ 22K/15K           │   │
│  │ 80K  83K  64K ...           │ │  ter  ██░░ 31K/20K           │   │
│  │ (R$ direto em cada barra)   │ │  ...                         │   │
│  │ Legenda: ░ Meta  █ Realiz.  │ │  R$ direto em cada barra     │   │
│  │ Clique → drill p/ Produtos  │ │  Clique → drill p/ Turnos    │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Evolução do Faturamento     │ │ Faturamento por Forma de     │   │
│  │ vs Meta ⓘ                   │ │ Pagamento ⓘ  (DonutChart)    │   │
│  │ (AreaLineChart: realizado   │ │                              │   │
│  │  acum. + meta acum. +       │ │   ╭────╮  ● Crédito  43%     │   │
│  │  projeção tracejada)        │ │  │    │  ● Débito   26%     │   │
│  │  [Vs Meta] [Vs Mês ant.]    │ │  │    │  ● Pix      16%     │   │
│  │                             │ │   ╰────╯  ● Dinheiro 11%     │   │
│  │  ╱···········╮ ← meta acum. │ │         ● Outros    4%      │   │
│  │ ╱─────────── ··· ← projeção │ │  R$ e % por forma de pgto    │   │
│  │ ╱___________  ← realizado  │ │  Clique → drill p/ Financeiro│   │
│  │  R$ direto nos pontos       │ │                              │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────┐ ┌──────────────────────────────┐   │
│  │ Top 3 Vendedoras ⓘ          │ │ Top 3 Produtos ⓘ             │   │
│  │ (lista/BarChart horizontal  │ │ (lista/BarChart horizontal   │   │
│  │  compacto, showValues)      │ │  compacto, showValues)       │   │
│  │                             │ │                              │   │
│  │  1. Ana Silva    ████ R$ 24k│ │  1. Body Splash VF  ███ R$ 19k│  │
│  │  2. Carla Mendes ███  R$ 21k│ │  2. Desod Col VF    ██  R$ 12k│  │
│  │  3. Juliana Reis ██   R$ 18k│ │  3. Obsessed Perf   ██  R$ 11k│  │
│  │                             │ │                              │   │
│  │  R$ direto em cada barra    │ │  R$ direto em cada barra     │   │
│  │  Clique → drill p/ Equipe   │ │  Clique → drill p/ Produtos  │   │
│  └─────────────────────────────┘ └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```
### Componentes Vela mapeados para Visão Geral
| Widget | Componente existente | Gap / Novo |
|---|---|---|
| KPI row (4 cards) | `StatCard` + `Sparkline` | ✅ Reusa (cada um com link de drill) |
| Filtro período interno | markup de `DatePickersPage.tsx` | 🟡 Extrair → `DateRangePicker` (já decidido) |
| Filtro marca interno | estilo "Quick ranges" | 🟡 Criar `Segmented` (já decidido, trivial) |
| Atingimento da Meta (3 gauges) | `Gauge` | ✅ Reusa (3 instâncias) |
| Faturamento por Categoria vs Meta | `BarChart`/`StackedBarChart` (agrupado) | ✅ Composição (+ `showValues`) |
| Faturamento por Dia da Semana vs Meta | `BarChart` (horizontal, agrupado) | ✅ Composição (+ `showValues`) |
| Evolução do Faturamento vs Meta | `AreaLineChart` (3 séries: realizado/meta/projeção) + toggle | ✅ Composição (+ `showValues`) |
| Faturamento por Forma de Pagamento | `DonutChart` | ✅ Reusa |
| Top 3 Vendedoras | `BarChart` (horizontal compacto) ou lista com `ProgressBar` | ✅ Composição (+ `showValues`) — drill p/ Equipe |
| Top 3 Produtos | `BarChart` (horizontal compacto) ou lista com `ProgressBar` | ✅ Composição (+ `showValues`) — drill p/ Produtos |
> **Nenhum componente novo além dos 3 já decididos** (`DateRangePicker`, `Segmented`, `CommissionLadder` — este último não entra aqui). Tudo é composição do que já existe no Vela.
### Perguntas de decisão que esta tela responde
1. **"Como está o mês num olhar só?"** → 4 KPIs + Atingimento da Meta (3 gauges) no topo.
2. **"Vou bater a meta até o fim do mês?"** → Evolução do Faturamento vs Meta com linha de projeção + "faltam R$ X".
3. **"Em que categoria/dia da semana estou ganhando ou perdendo pra meta?"** → os dois cards Meta × Realizado (Categoria e Dia da Semana).
4. **"Quem está puxando o resultado? O que está vendendo mais?"** → Top 3 Vendedoras (drill p/ Equipe) + Top 3 Produtos (drill p/ Produtos).
5. **"Onde vou clicar pra ver o detalhe?"** → cada KPI/card tem drill direto pra subtela (Financeiro, Equipe, Turnos, Produtos).
5. **"Como o cliente está pagando?"** → Forma de Pagamento (resumo do Financeiro).
### Grade responsiva — quantos cards por linha (Visão Geral)
**Critério unificado (vale para TODAS as telas):** um card fica em **largura total** quando (a) tem muitas categorias no eixo horizontal, (b) é tabela com ≥5 colunas, ou (c) é o widget central da tela. Caso contrário, **agrupa em par de 2 colunas** no desktop. KPIs sempre em linha cheia (4 no desktop). Tablet = 2 KPIs/linha e cards 1/linha; Mobile = tudo 1/linha com scroll-x onde necessário.
| Bloco | Desktop (lg ≥1024px) | Tablet (md ≥768px) | Mobile (<768px) |
|---|---|---|---|
| KPI row (4 StatCards) | **4 por linha** (`sm:grid-cols-2 lg:grid-cols-4`) | 2 por linha | 1 por linha |
| Atingimento da Meta (3 gauges) | **1 por linha** (largura total — widget central, critério c) | 1 por linha | 1 por linha |
| Categoria vs Meta + Dia da Semana vs Meta | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
| Evolução vs Meta + Forma de Pagamento | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
| Top 3 Vendedoras + Top 3 Produtos | **2 por linha** (`lg:grid-cols-2`) | 1 por linha | 1 por linha |
> Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5` para os KPIs; `lg:grid-cols-2` para os três pares de gráficos (Categoria/Dia, Evolução/Forma Pgto, Top 3 Vendedoras/Top 3 Produtos); largura total (`lg:col-span-full`) para o widget central (Atingimento da Meta). Sem tabelas nesta tela, então sem scroll-x exceto em gráficos muito largos no mobile.
### Glossário — termos da Visão Geral (só os não óbvios)
| Termo no mock | O que significa, em linguagem simples |
|---|---|
| **Meta / Super Meta / Hiper Meta** | As 3 faixas de objetivo do mês. Meta = alvo básico; Super Meta = alvo esticado; Hiper Meta = alvo máximo. Cada uma tem seu R$ e seu % atingido. Bater a Meta já é bom; chegar na Hiper é excepcional. |
| **Projeção (linha tracejada)** | Estimativa de onde o faturamento vai chegar no fim do mês se o ritmo dos últimos dias se mantiver. Responde "vou bater a meta ou não?" antes do mês acabar. |
| **Realizado acumulado (ACM)** | Soma de tudo vendido desde o dia 1 até hoje. Comparado com a Meta acumulada (quanto deveria ter vendido até hoje), mostra se está adiantado ou atrasado no mês. |
| **PA (Preço Médio / Itens por venda)** | Aqui "PA 1,50" = em média 1,5 item por venda. Mostra se o cliente está levando mais ou menos produtos por compra. |
| **Drill-down (→ subtela)** | Clicar num KPI/card leva à tela de detalhe correspondente (Financeiro, Equipe, Turnos ou Produtos) já filtrada no mesmo período/marca. A Visão Geral é o resumo; o detalhe está lá. |

---

## Premissas de IMPLEMENTAÇÃO (ler antes de codar — decidido com o gestor)

> Estas regras valem para o início da fase de código. Não são mock — são decisões que evitam retrabalho.

### 1. O Dashboard atual será APAGADO
- Tudo que existe hoje em `src/pages/dashboards/` (Analytics/Sales/Ecommerce/Finance/CRM/BI/Logistics/Projects/SaaS etc.) é **template Vela de demonstração** — não é produto nosso.
- Na implementação, **substituímos** essas páginas pelas 5 telas mockadas (Visão Geral, Equipe, Turnos, Financeiro, Produtos). Não "adaptamos" o template por cima — construímos as nossas telas reusando os **componentes** do Vela (`src/components/ui` + `src/components/charts`), que são o que realmente aproveitamos.
- Os componentes Vela ficam; as páginas de demo saem.

### 2. Filtros de tela — rever antes de codar
- Cada subtela tem filtros internos (Período + Marca +, em Produtos, Categoria). Antes de implementar, **mapear quais filtros cada tela realmente precisa** e garantir que usem os componentes decididos:
  - Período → `DateRangePicker` (extrair de `src/pages/forms/DatePickersPage.tsx`).
  - Marca (WEPINK/WPINK) → `Segmented` (criar, estilo "Quick ranges").
  - Categoria / outros → `Select`/`Dropdown` (já existem).
- Os filtros devem alimentar um **escopo compartilhado** (hook `useEscopo` já previsto) para que drill-down entre telas preserve período/marca/loja.

### 3. Seletor de LOJA na barra superior (multi-select) — ref: `docs/referencias/lojas.png`
- **Onde:** no header/topbar, **no lugar do campo de Pesquisa** do template Vela (o gestor já posicionou a seleção de loja ali ao comparar `gestao` com `vela-react-admin-dashboard-template`).
- **Comportamento:** selecionar **1 loja, várias lojas, ou "Todas as lojas"** (multi-select com opção "Todas"). Exemplo da referência: "Todas as lojas / Loja de Camisetas / Loja de Calçados" com check na ativa.
- **Componente Vela a usar:** compor com o que já existe — `Dropdown`/`Popover` (já existem) + lista de itens com `Checkbox`/`Avatar` (já existem) + `Badge`/contador de selecionadas. **Não reinventar** — montar o seletor com esses blocos. Confirmar no código do header atual (`src/layout/**`) onde está o input de pesquisa para substituí-lo.
- **Escopo:** a seleção de loja é **global** (topbar) e filtra TODAS as 5 telas. Entra no `useEscopo` junto com período/marca. "Todas as lojas" = consolida; 1 ou N lojas = soma/filtra aquelas.
- **Dados:** lista de lojas vem de fixture/mock inicialmente (`src/data/**`), igual ao resto do template; depois pluga na API.

### 4. Ordem sugerida de construção (quando começar)
1. Componentes base que faltam: `DateRangePicker` (extrair), `Segmented` (criar), `CommissionLadder` (compor) + prop `showValues` nos charts.
2. Seletor de Loja no topbar (multi-select) + `useEscopo` compartilhado.
3. Subtelas na ordem: Financeiro → Produtos → Equipe → Turnos (mais componentes prontos primeiro).
4. Visão Geral por último (consolida as outras + drill-downs).