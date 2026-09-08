# Aba Loja — Especificação (redesenho)

## Problem Statement

O gestor é multi-loja, programa de um lado e opera lojas do outro, com pouco tempo. A aba Loja atual é um mosaico de KPIs, meta, desempenho, hora e lucro, sem uma resposta clara. O gestor precisa saber, em segundos, se o mês está no trilho e, quando não está, onde e como agir. Esta spec redesenha a aba Loja como o **painel de controle do dia**, centrado na pergunta: *"o ritmo de venda atual é suficiente para fechar a meta do mês?"*

## Goals

- [ ] O gestor responde "estou no trilho?" em segundos ao abrir a aba Loja
- [ ] Quando não está no trilho, a tela mostra quanto falta e a venda necessária hoje
- [ ] A tela mostra se o déficit vem de fluxo ou ticket
- [ ] A tela mostra mix separadamente como leitura de margem/categoria
- [ ] O ritmo considera curvas de receita e de atendimentos, com pesos por dia da semana
- [ ] O redesenho usa apenas componentes existentes do template Vela (`src/components/ui`, `src/components/charts`)

## Out of Scope

| Feature | Reason |
| --- | --- |
| Abas Financeiro/Equipe/Produtos | Fora do escopo desta rodada |
| Detalhamento por loja e categoria (P3) | Postergado; esta rodada fecha apenas o diagnóstico agregado da operação |
| Backend / persistência | Fase de validação em mock; dados mockados determinísticos |
| Metas separadas de ticket, fluxo ou mix | A meta continua sendo mensal em faturamento |
| Mix como parcela da lacuna de receita | Mix é leitura separada de margem, não fator independente de faturamento |
| Recursos de edição | Fase sem backend, leitura pura |
| Lucro líquido / margem de contribuição | Assunto da futura aba Financeiro |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Estrutura | Tratar o mosaico atual como protótipo descartável; nova estrutura por propósito | Redesenho escolhido pelo usuário | y |
| Filtro | Período, Loja e Marca valem para todas as abas e vivem na URL | Filtro global confirmado | y |
| Foco inicial | A aba abre em todas as lojas; tocar uma loja aprofunda | Primeiro localizar, depois investigar | y |
| Data de referência | "Hoje" = 15/09/2026 | O mock congela o presente | y |
| Curva de receita | `curvaReceita` é um conjunto de pesos diários normalizados, com soma 1 nos dias abertos da competência; os pesos vêm da média dos quatro dias anteriores equivalentes por dia da semana | Uma única curva governa o rateio da meta, o status, a projeção e o gap do diagnóstico | y |
| Curva de atendimentos | `curvaAtendimentos` é usada somente para estimar o total mensal de atendimentos esperados e calcular o `ticketMeta`; não rateia o gap do status | Mantém a unidade correta sem criar dois rateios incompatíveis | y |
| Limitação sazonal | O mock não modela feriados ou datas especiais; Dia das Mães, Black Friday e Natal ficam como limitação conhecida | A média de quatro semanas pode errar em datas sazonais | y |
| Histórico insuficiente | Quando não houver quatro ocorrências anteriores do mesmo dia da semana, usar a média das ocorrências disponíveis; quando não houver nenhuma, distribuir o peso uniformemente entre os dias abertos | O início da série do mock não pode produzir divisão indefinida nem depender de parâmetro não definido | y |
| Status | Comparar realizado acumulado com a meta acumulada distribuída pela soma da `curvaReceita` até a data de referência; >=98% = no trilho, >=90% e <98% = atenção, <90% = abaixo | A pergunta é capacidade de fechar a meta, com uma base única | y |
| Exibição do diagnóstico | Exibir o diagnóstico de fluxo/ticket somente quando o percentual do trilho for menor que 90% (status "Abaixo do trilho") | Evita mostrar uma lacuna de ação enquanto o status ainda diz no trilho ou atenção | y |
| Mês da meta | Usar o mês do período quando o período cabe inteiramente em um mês; usar o mês corrente quando o período cruza meses | Permite consultar meses fechados e mantém o bloco ativo | y |
| Projeção | A partir do dia 7, aplicar aos pesos restantes da `curvaReceita` o índice de desempenho da competência até hoje; o percentual projetado é o mesmo percentual do trilho e não deve ser calculado ou apresentado como uma segunda leitura independente | Extrapolar em reais amplifica o ruído; o status existe desde o primeiro dia | y |
| Ticket-meta | Meta mensal ÷ atendimentos esperados do mês, calculados pelo total mensal da `curvaAtendimentos` | Define a fonte sem inventar meta extra | y |
| Janelas do diagnóstico | Atendimentos realizados e atendimentos esperados são acumulados desde o primeiro dia da competência até a data de referência; o esperado até hoje é o total mensal de atendimentos esperados multiplicado pela fração acumulada da `curvaReceita`; ticketMeta continua mensal | Faz o gap do diagnóstico fechar exatamente com o gap do status | y |
| Gap de receita | Decomposto em efeito fluxo e efeito ticket; a interação já está contida no efeito fluxo e não é somada separadamente | Atribuição fechada e interpretável | y |
| Alavanca dominante | Considerar apenas efeitos positivos para o déficit; apontar a maior somente quando ela representar pelo menos 60% da soma dos efeitos positivos | Evita apontar como problema uma alavanca que está ajudando | y |
| P3 postergado | Detalhamento por loja e categoria não entra nesta rodada; fica explicitamente fora do escopo | O MVP prioriza status, venda necessária, projeção e diagnóstico agregado | y |
| Venda necessária hoje | Dias restantes incluem hoje; usar o peso de hoje; descontar o realizado de hoje; se hoje estiver fechado, mostrar o próximo dia aberto | Um único número operacional, sem taxa linear concorrente | y |
| Estados de leitura | Dados disponíveis renderizam a visão; ausência de dados mostra `EmptyState`; carregamento assíncrono mostra `Skeleton` | Ausência não pode parecer resultado zero | y |

**Open questions:** none — todas resolvidas ou registradas acima.

**Limitação conhecida:** as curvas baseadas em quatro ocorrências do mesmo dia da semana não representam sazonalidade de feriados, campanhas ou datas comerciais especiais. Isso será tratado quando houver dados e modelagem para essas datas.

---

## User Stories

### P1: Status do trilho do mês ⭐ MVP

**User Story**: Como gestor, quero ver em segundos se o mês está no trilho para bater a meta, para saber se preciso agir ou só acompanhar.

**Why P1**: É a pergunta central da aba; tudo deriva da comparação real com a meta distribuída pela curva esperada.

**Acceptance Criteria**:

1. QUANDO a aba Loja abrir, o sistema SHALL mostrar em destaque o status do mês: "No trilho", "Atenção", "Abaixo do trilho", "Meta batida" ou "Meta não batida".
2. QUANDO o mês estiver em andamento, o sistema SHALL calcular o percentual do trilho como `realizado acumulado ÷ (meta mensal × fração acumulada da curvaReceita até a data de referência)`.
3. QUANDO o percentual do trilho for maior ou igual a 98%, o sistema SHALL mostrar "No trilho".
4. QUANDO o percentual do trilho for maior ou igual a 90% e menor que 98%, o sistema SHALL mostrar "Atenção".
5. QUANDO o percentual do trilho for menor que 90%, o sistema SHALL mostrar "Abaixo do trilho".
6. QUANDO a competência estiver encerrada, o sistema SHALL mostrar "Meta batida" se o realizado fechado for maior ou igual à meta e "Meta não batida" caso contrário.
7. O sistema SHALL distribuir a meta mensal entre os dias abertos proporcionalmente aos pesos normalizados da `curvaReceita`, sem dividir a meta igualmente por calendário.

**Independent Test**: Abrir a aba com "Este mês" e conferir o status; alterar o realizado para cruzar 98% e 90% da meta acumulada distribuída; conferir as transições.

---

### P1: Venda necessária hoje ⭐ MVP

**User Story**: Como gestor, quero saber quanto preciso vender hoje para continuar capaz de fechar a meta, para agir durante o dia sem acompanhar uma taxa linear enganosa.

**Why P1**: É o número operacional que transforma o status em ação imediata.

**Acceptance Criteria**:

1. QUANDO a competência estiver em andamento, o realizado for menor que a meta e existir um dia aberto na janela restante, o sistema SHALL calcular `faltaRestante = meta - realizado acumulado`.
2. O sistema SHALL considerar hoje na janela de dias restantes e SHALL calcular `necessárioHoje = (faltaRestante × pesoReceitaHoje ÷ soma dos pesosReceita dos dias restantes) - realizadoHoje`.
3. O sistema SHALL recalcular o valor durante o dia conforme o realizado de hoje aumentar, sem recalcular os pesos da janela restante.
4. QUANDO `necessárioHoje` for menor ou igual a zero, o sistema SHALL mostrar que a venda necessária de hoje foi cumprida, sem criar uma segunda taxa diária nem manter estado de excedente.
5. QUANDO hoje estiver fechado, o sistema SHALL mostrar o próximo dia aberto e a venda necessária calculada para esse dia, em vez de mostrar R$ 0.
6. O sistema SHALL mostrar também o contexto absoluto `Faltam R$ X em N dias abertos`, sem apresentar uma segunda taxa diária.
7. QUANDO não houver meta para a competência, o sistema SHALL mostrar um aviso claro e não SHALL mostrar venda necessária nem projeção.
8. QUANDO a meta for atingida antes do fim da competência, o sistema SHALL mostrar "Meta batida" em vez da venda necessária.

**Independent Test**: Usar uma competência em andamento; conferir o valor de hoje com a fórmula ponderada, incluindo hoje; aumentar o realizado de hoje; testar hoje fechado, valor zerado e meta atingida.

---

### P1: Projeção de fechamento ⭐ MVP

**User Story**: Como gestor, quero ver onde a loja tende a fechar a competência se o desempenho atual continuar, para decidir se preciso acelerar.

**Why P1**: É o "para onde estou indo" que transforma o status em decisão.

**Acceptance Criteria**:

1. QUANDO houver meta e a data de referência for igual ou posterior ao dia 7, o sistema SHALL calcular o índice de desempenho da competência como `realizado acumulado ÷ (meta mensal × fração acumulada da curvaReceita até a data de referência)`.
2. QUANDO a data de referência for igual ou posterior ao dia 7, o sistema SHALL calcular a projeção como `realizado acumulado + (meta mensal × fração restante da curvaReceita × índice de desempenho da competência)`; esta projeção SHALL usar o mesmo índice do status e não SHALL criar um segundo percentual de desempenho.
3. QUANDO a projeção estiver abaixo da meta, o sistema SHALL mostrar a projeção em reais e, se exibir percentual, SHALL reutilizar o mesmo percentual do trilho sem criar outro cálculo.
4. QUANDO a projeção for igual ou maior que a meta, o sistema SHALL mostrar que a projeção alcança a meta usando o mesmo índice já calculado para o trilho.
5. QUANDO a data de referência for anterior ao dia 7, o sistema SHALL mostrar "Projeção disponível a partir do dia 7" em vez de um número.
6. QUANDO a competência estiver encerrada, o sistema SHALL mostrar o realizado fechado em vez de uma projeção.

**Independent Test**: Rodar o mock em 06/09 e 07/09; conferir a mensagem no primeiro caso e a projeção escalada pelo desempenho corrente no segundo; consultar competência encerrada e conferir o valor fechado.

---

### P1: Lacuna de receita por fluxo e ticket, com mix separado ⭐ MVP

**User Story**: Como gestor, quero saber se a lacuna de receita vem de fluxo ou de ticket e ver o mix como leitura de margem, para agir na causa sem misturar conceitos.

**Why P1**: Receita é uma identidade de dois fatores; o diagnóstico precisa fechar matematicamente.

**Acceptance Criteria**:

1. QUANDO o percentual do trilho for menor que 90%, o sistema SHALL mostrar os efeitos de fluxo e ticket em reais, com fórmula e sinal.
2. O sistema SHALL calcular `ticketMeta` como `meta mensal ÷ atendimentos esperados no mês`, usando o total mensal da curvaAtendimentos.
3. O sistema SHALL calcular `atendimentosEsperadosAtéHoje` como `atendimentos esperados do mês × fração acumulada da curvaReceita até a data de referência`.
4. O sistema SHALL calcular `atendimentosRealizadosAtéHoje` usando a janela da competência desde o primeiro dia até a data de referência.
5. O sistema SHALL calcular o efeito fluxo como `(atendimentosEsperadosAtéHoje - atendimentosRealizadosAtéHoje) × ticketMeta`.
6. O sistema SHALL calcular o efeito ticket como `(ticketMeta - ticketRealAtéHoje) × atendimentosRealizadosAtéHoje`.
7. O sistema SHALL considerar como efeitos positivos para o déficit somente os efeitos com valor maior que zero.
8. QUANDO o maior efeito positivo representar pelo menos 60% da soma dos efeitos positivos, o sistema SHALL identificá-lo como a alavanca dominante.
9. QUANDO nenhum efeito positivo representar pelo menos 60% da soma dos efeitos positivos, o sistema SHALL informar que não há uma alavanca dominante.
10. O sistema SHALL mostrar o mix do período e da marca selecionados em um `DonutChart`, exibindo a participação de faturamento por categoria e a margem correspondente na legenda ou no detalhe da categoria.

**Nota de atribuição**: o termo de interação `(atendimentosEsperadosAtéHoje - atendimentosRealizadosAtéHoje) × (ticketMeta - ticketRealAtéHoje)` já está contido no efeito fluxo porque esse efeito usa `ticketMeta`; ele não é somado novamente e não aparece como um terceiro bloco.

**Independent Test**: Usar um mock com déficit conhecido; conferir as janelas iguais, as duas fórmulas, a regra de 60% e a ausência de soma adicional da interação; alterar categorias e verificar que o mix muda sem ser tratado como efeito de receita.

---

### P2: Foco inicial em todas as lojas

**User Story**: Como gestor, quero abrir a aba Loja vendo o grupo inteiro, para localizar rapidamente onde está o problema.

**Why P2**: É o padrão de entrada; ajuda a triagem antes de aprofundar.

**Acceptance Criteria**:

1. QUANDO a aba Loja abrir, o sistema SHALL mostrar a visão de todas as lojas.
2. QUANDO o gestor tocar numa loja da visão de grupo, o sistema SHALL abrir aquela loja mantendo o período e a marca selecionados.
3. O sistema SHALL permitir retornar a todas as lojas sem perder o período e a marca selecionados.

**Independent Test**: Abrir → ver grupo; tocar numa loja → ver só ela; retornar ao grupo → manter os filtros.

---

### P2: Comparação global por período

**User Story**: Como gestor, quero comparar o período selecionado com o período anterior equivalente de uma forma única e clara.

**Why P2**: A comparação contextualiza os KPIs sem repetir período em cada card.

**Acceptance Criteria**:

1. O sistema SHALL mostrar uma única comparação de período acima da área de KPIs.
2. QUANDO o período selecionado mudar, o sistema SHALL atualizar a comparação para o período anterior equivalente.
3. O sistema SHALL derivar os deltas dos KPIs dessa comparação única.
4. O sistema SHALL aplicar o período e a marca selecionados aos KPIs e ao mix, mantendo meta, ritmo e projeção na competência definida pela regra do mês da meta.

**Independent Test**: Trocar o período → conferir comparação e deltas; trocar a marca → conferir KPIs e mix; confirmar que o bloco de meta continua visível.

---

### P2: Estados de leitura

**User Story**: Como gestor, quero entender quando a tela está carregando ou não tem dados, para não interpretar ausência como resultado zero.

**Why P2**: Estados explícitos protegem a decisão operacional contra leitura falsa.

**Acceptance Criteria**:

1. ENQUANTO a visão de dados estiver carregando, o sistema SHALL mostrar componentes `Skeleton` do template nos locais do status, KPIs e blocos principais.
2. SE o escopo selecionado não tiver dados, ENTÃO o sistema SHALL mostrar um `EmptyState` explicando que não existem vendas para o período selecionado.
3. SE um bloco não tiver dados, mas o escopo tiver outros dados, ENTÃO o sistema SHALL mostrar um estado vazio nesse bloco sem ocultar os demais blocos.

**Independent Test**: Simular carregamento, escopo sem dados e bloco parcial sem dados; conferir que cada estado é distinguível de valor zero.

---

## Edge Cases

- SE não houver meta para a competência definida, ENTÃO o sistema SHALL mostrar aviso e ocultar projeção, venda necessária e lacuna de meta, mantendo KPIs do período.
- SE a competência estiver encerrada, ENTÃO o sistema SHALL mostrar meta batida ou não batida com o valor fechado, sem projeção.
- SE o período selecionado cruzar meses, ENTÃO o sistema SHALL usar o mês corrente para meta, ritmo e projeção e limitar KPIs e mix ao período selecionado.
- SE uma loja do grupo não tiver meta, ENTÃO o sistema SHALL mostrar essa loja sem meta sem impedir o status das demais lojas.
- QUANDO o intervalo personalizado tiver início após o fim, o sistema SHALL impedir ou ajustar para início menor ou igual ao fim e não permitir datas futuras.
- SE a soma dos pesos da curva restante for zero, ENTÃO o sistema SHALL mostrar estado sem dados suficientes e não dividir por zero.
- SE hoje estiver fechado, ENTÃO o sistema SHALL procurar o próximo dia aberto antes de mostrar a venda necessária.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| LOJA-01 | P1: Status do trilho do mês | Spec | Pending |
| LOJA-02 | P1: Venda necessária hoje | Spec | Pending |
| LOJA-03 | P1: Projeção de fechamento | Spec | Pending |
| LOJA-04 | P1: Lacuna por fluxo/ticket/mix | Spec | Pending |
| LOJA-05 | P2: Foco inicial em todas as lojas | Spec | Pending |
| LOJA-06 | P2: Comparação global por período | Spec | Pending |
| LOJA-07 | P2: Estados de leitura | Spec | Pending |

## Success Criteria

- [ ] Gestor responde "estou no trilho?" em segundos ao abrir a aba
- [ ] Fora do trilho, a tela mostra o gap absoluto e a venda necessária hoje
- [ ] O diagnóstico identifica fluxo ou ticket sem misturar mix como terceiro fator
- [ ] Mix aparece como leitura separada de margem/categoria
- [ ] Ritmo, venda necessária hoje e projeção usam curvas não lineares
- [ ] A projeção usa o índice de desempenho da competência
- [ ] Meta/ritmo/projeção seguem a competência correta ao trocar o filtro de período
- [ ] Estados de loading e ausência de dados não são confundidos com zero
- [ ] Redesenho usa apenas componentes existentes do template
- [ ] Build `tsc -b && vite build` passa sem erros
