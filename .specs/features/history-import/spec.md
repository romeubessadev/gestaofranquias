# Importação de histórico por planilha — Specification

## Problem Statement

Hoje o histórico de vendas vem do Millennium, dia a dia. Puxar períodos longos derrubou o ERP (timeout com o mês inteiro × 3 lojas) e arrisca bloquear o usuário ERP; por isso o HISTORY está desligado e a tenant nova nasce sem comparativos, sem curva de meta e sem evolução mensal. A proposta é trazer o passado por planilha exportada do Millennium (qualquer período, zero chamada ao ERP) e deixar o sync do ERP responsável só do dia de entrada em diante.

## Goals

- [ ] Um dono de rede importa N meses de histórico de todas as lojas em um único envio, sem nenhuma chamada ao ERP.
- [ ] Após a importação, Visão Geral / Financeiro / Produtos mostram comparativos e evolução mensal dos meses importados sem estimar nada.
- [ ] O sync do ERP nunca busca dias anteriores ao dia de entrada da tenant.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Importar estoque, compras ou cadastro de produtos | Esta feature cobre só vendas (as telas atuais dependem só de vendas). |
| Mapeamento manual de colunas pelo usuário (arrastar coluna → campo) | MVP aceita apenas o(s) layout(s) de relatório suportado(s); layout diferente é recusado com a lista de colunas faltantes. |
| Importar dias a partir da data de entrada | Esses dias são do ERP (fonte única por dia). |
| Editar linhas importadas na tela | Correção = reimportar o arquivo corrigido. |
| Estimar campos ausentes (ex.: hora, custo) | Regra do produto "nada estimado": campo ausente vira "—". |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Relatórios-fonte do Millennium | **3 planilhas**, todas com filtro só de Data inicial · Data final · Filial: (1) **Listar Movimentações de Venda** (Consulta Movimentações) — 1 linha por venda: Data H, NFs, Documento, Filial, Evento, Valor Final, Qtd. Itens, Condição de Pgto, Vendedor Millennium; (2) **WEPINK - VENDAS POR PRODUTOS** — 1 linha por item: Data, Nfs, Produto, Descrição, Quantidade vendida, Receita (sem filial); (3) **Margem de Produtos** (RELATORIOMARGEM) — 1 linha por produto no período: Cod Produto, Qtde Vendida, Custo Franquias, Custo Total, Totalvenda (sem data nem filial). | Nenhum relatório sozinho traz venda + item + custo. Teste agosto/26 (lojas 00010 e 00114): os 3 fecham ao centavo por loja; exportação rápida. | y (2026-09-25) |
| Filtro de evento | O usuário **não** filtra evento. A WeDash aceita só linhas da Consulta cujo Evento corresponde a S-X, S-03 ou S-{código da loja}, pela descrição sincronizada do cadastro de eventos (HIST-06). | Sem filtro vieram só +16 linhas em agosto na 00010: BAIXA DE PRODUTO (R$ 0), SAÍDA PARA TRANSFERÊNCIA (R$ 155 mil), VENDA REF CUPOM (R$ 762,90). Nenhuma aparece no Vendas por Produtos nem na Margem. | y (2026-09-25) |
| Margem por loja | Margem exportada **uma loja por arquivo**; a WeDash identifica a loja comparando produto a produto com o Vendas por Produtos. | Custo de franquia varia por loja (agosto: 14 de 167 produtos com custo diferente entre 00010 e 00114). | y (2026-09-25) |
| Categoria nos dias importados | Cadastro produto → tipo buscado **pela API** 1× no onboarding e guardado na WeDash; na importação, produto que não está no cadastro dispara **1 atualização** do cadastro; se continuar faltando, entra como **"Indefinido"**. Categoria do dia = Σ receita do Vendas por Produtos por tipo. Fonte na API (lookup ou relatório) a confirmar. | Zero chamada por dia para categoria; conferível contra o Faturamento por Tipo de Produto do mês. | y (2026-09-25) |
| Custo (CMV) nos dias importados | WeDash busca o RELATORIOMARGEM pela API **1 chamada por loja por mês-calendário** coberto pela importação (ex.: 15/07–10/09 → 15–31/07, 01–31/08, 01–10/09). CMV do dia = quantidade do dia × custo unitário do mês. A mesma resposta confere quantidade e receita por produto com o Vendas por Produtos. Chamadas espaçadas, 1 por vez, por trás. | Custo unitário não mudou dentro do mês em nenhum dos 527 loja × produto de setembro/26; custo muda entre lojas. | y (2026-09-25) |
| Só dias fechados | A importação usa só dias anteriores à data de entrada; linhas do dia de entrada em diante são descartadas em silêncio (sem aviso), antes das conferências. | Dia aberto muda entre uma exportação e outra (teste 24/09: Margem exportada depois tinha +1 venda). | y (2026-09-25) |
| Data de entrada | Dia (fuso da 1ª loja) em que o SEED do onboarding rodou; gravado na tenant e imutável. | Fronteira única entre planilha e ERP. | y |
| Dias do mês atual antes da entrada | Vêm só pela planilha; o ERP não os busca (a carga do mês por trás sai). | Decisão do dono (2026-09-24): ERP só do dia atual pra frente. | y |
| Onboarding | Etapa opcional "Importar histórico" com "Pular, importo depois". | Não bloquear a ativação. | y |
| Quem pode importar | OWNER e ADMIN_GLOBAL. | Import substitui dados da rede inteira. | n |
| Formatos e limite | `.xlsx` (Consulta, Margem) e `.xls` XML/SpreadsheetML (Vendas por Produtos), até 20 MB por arquivo, vários arquivos por envio. Colunas lidas pelo nome do cabeçalho. | Formatos reais do Millennium. Vendas por Produtos ≈ 2,5 MB por loja × mês. | n |
| Reimportar período já importado | Substitui os dados das lojas × dias cobertos pelo arquivo novo. | Idempotente; corrigir = reimportar. | n |
| Loja não cadastrada na planilha | Linhas ignoradas e listadas na prévia; o resto é importado. | Rede pode ter filiais fechadas no ERP. | n |
| Campos ausentes no arquivo | Agregado correspondente fica sem dado ("—" na tela), sem bloquear a importação. | Nada estimado. | y |

**Open questions:** (a) o payload de `EVENTOS.ListaTodos` traz a descrição do evento? (confirmar na 1ª chamada do HIST-06); (b) categoria (tipo do produto) não vem em nenhuma das 3 planilhas — fica sem dado nos dias importados até definir fonte; (c) venda cancelada/devolvida: não apareceu em agosto (só tipo S, CFOP 5.405) — confirmar com um dia que tenha cancelamento.

---

## User Stories

### P1: Importar histórico no onboarding ⭐ MVP

**User Story**: Como dono da rede, quero enviar planilhas de vendas do Millennium na entrada da WeDash para ver comparativos e evolução desde o primeiro acesso.

**Why P1**: Sem isso a tenant nasce vazia e o valor analítico demora semanas.

**Acceptance Criteria**:

1. WHEN o usuário conclui a etapa Lojas do onboarding THEN o sistema SHALL exibir a etapa "Importar histórico" com as ações "Enviar planilhas" e "Pular, importo depois".
2. WHEN o usuário escolhe "Pular, importo depois" THEN o sistema SHALL concluir o onboarding sem gravar dado de planilha.
3. WHEN o usuário envia arquivo(s) válidos THEN o sistema SHALL exibir uma prévia com lojas, período (primeiro e último dia), faturamento total e nº de vendas por loja antes de gravar.
4. WHEN o usuário confirma a prévia THEN o sistema SHALL gravar os agregados diários (loja × dia × hora; marca WEPINK/WPINK pelo código WP*, CMV, formas, vendedor e produto) de todos os dias do arquivo anteriores à data de entrada.
5. IF o arquivo não tem uma coluna obrigatória do seu tipo THEN o sistema SHALL recusar o arquivo, listar as colunas faltantes e não gravar nada.
6. The sistema SHALL identificar a loja de cada venda pela coluna Filial da Consulta e bloquear a importação IF a filial não está cadastrada na tenant.
7. The sistema SHALL ligar cada nota do Vendas por Produtos a exatamente uma venda da Consulta com mesmo número de nota, mesmo dia, mesmo valor total (tolerância R$ 0,02) e mesma quantidade de itens; IF alguma nota fica sem par ou com mais de um par THEN o sistema SHALL bloquear a importação e listar as notas.
8. The sistema SHALL identificar a loja de cada Margem comparando, produto a produto, quantidade e receita com o Vendas por Produtos de cada loja (tolerância R$ 0,05 por produto); IF a Margem não bate com nenhuma loja THEN o sistema SHALL bloquear e orientar "exporte a Margem de uma loja por vez, no mesmo período das vendas".
9. IF os dias da Consulta e do Vendas por Produtos de uma loja não são os mesmos THEN o sistema SHALL bloquear e mostrar os dois períodos.
10. The sistema SHALL descartar da Consulta as linhas cujo Evento não corresponde aos eventos de venda da loja (HIST-06) e, junto, os itens do Vendas por Produtos dessas notas; a prévia SHALL mostrar quantas linhas foram descartadas por evento.
11. The sistema SHALL calcular o CMV do dia como Σ (quantidade do produto no dia × Custo Franquias da Margem daquela loja); produto sem custo na Margem SHALL ficar sem CMV ("—").
12. IF a gravação falha no meio THEN o sistema SHALL desfazer toda a importação daquele envio e mostrar a mensagem de erro com "Tentar novamente".
13. The sistema SHALL não fazer nenhuma chamada ao ERP durante a importação.

**Independent Test**: Criar tenant de teste, enviar um xlsx de 2 lojas × 2 meses, confirmar e ver os KPIs de "Mês passado" na Visão Geral com os totais da planilha.

---

### P1: Sync do ERP só a partir do dia de entrada ⭐ MVP

**User Story**: Como dono da rede, quero que a WeDash só consulte o ERP do dia em que entrei em diante, para não sobrecarregar nem arriscar bloqueio do usuário ERP.

**Why P1**: É a outra metade da troca: passado = planilha, presente = ERP.

**Acceptance Criteria**:

1. WHEN o SEED do onboarding termina com sucesso THEN o sistema SHALL gravar a data de entrada da tenant (dia do SEED no fuso da 1ª loja).
2. WHEN o SEED do onboarding termina THEN o sistema SHALL não enfileirar a carga dos dias anteriores do mês (cadeia de CLOSE com `fillUntil`).
3. IF um job do ERP (FORCE, CLOSE, RANGE, HISTORY) pede um dia anterior à data de entrada THEN o worker SHALL descartar esse dia sem chamar o ERP.
4. The fechamento noturno SHALL continuar rodando para "ontem" quando ontem ≥ data de entrada.

**Independent Test**: Tenant com data de entrada = hoje; enfileirar RANGE de ontem e verificar no log do worker que nenhum dia é consultado.

---

### P1: Eventos de venda por loja sincronizados ⭐ MVP

**User Story**: Como dono da rede, quero que a WeDash saiba quais eventos do Millennium são venda em cada loja, para exportar a Consulta sem filtro de evento.

**Why P1**: Sem isso o usuário teria de filtrar S-X / S-03 / S-{loja} na mão, e errar (ex.: incluir S-100) infla o faturamento.

**Acceptance Criteria**:

1. WHEN as lojas são sincronizadas (etapa Lojas do onboarding e Configurações > Lojas) THEN o sistema SHALL buscar o cadastro de eventos do Millennium (`EVENTOS.ListaTodos`) e gravar, por tenant, código, id e descrição de cada evento.
2. The sistema SHALL considerar eventos de venda da loja: S-X, S-03 e S-{código da filial sem zeros à esquerda}; nunca S-100.
3. IF duas descrições iguais pertencem a um evento de venda e a um evento fora da lista THEN a importação SHALL bloquear as linhas com essa descrição e explicar o conflito.
4. IF a busca de eventos falha THEN a sincronização das lojas SHALL seguir e a importação SHALL avisar que os eventos ainda não foram carregados.

**Independent Test**: Sincronizar lojas de uma tenant de teste e ver `erp_sales_evento` com descrições; importar a Consulta "sem evento" de agosto/00010 e ver 16 linhas descartadas (baixa, transferência, venda ref. cupom).

---

### P2: Importar depois em Configurações

**User Story**: Como dono da rede, quero importar (ou reimportar) histórico a qualquer momento em Configurações.

**Why P2**: Quem pulou no onboarding ou quer estender o período precisa de uma segunda chance.

**Acceptance Criteria**:

1. WHERE o usuário tem papel OWNER ou ADMIN_GLOBAL the sistema SHALL mostrar "Importar histórico" em Configurações com o mesmo fluxo do onboarding (envio → prévia → confirmação).
2. WHEN a importação confirmada cobre loja × dia que já tem dado de planilha THEN o sistema SHALL substituir esses dias pelos dados do arquivo novo.
3. IF o usuário tem papel MANAGER ou SELLER THEN o sistema SHALL não exibir a opção de importar.
4. WHEN o arquivo contém dias ≥ data de entrada THEN o sistema SHALL descartar essas linhas em silêncio (sem aviso), antes de qualquer conferência entre as planilhas.

**Independent Test**: Reimportar o mesmo arquivo 2× e verificar que os totais não dobram.

---

### P2: Aviso de mês incompleto

**User Story**: Como dono da rede, quero ser avisado quando o mês atual está sem os dias anteriores à minha entrada, para saber que a meta e os totais estão parciais.

**Why P2**: Com o ERP só a partir de hoje, quem pula a importação vê o mês subestimado.

**Acceptance Criteria**:

1. WHILE o período da tela inclui dias do mês da entrada anteriores à data de entrada sem dado THEN Visão Geral, Financeiro e Produtos SHALL exibir, abaixo dos filtros, o aviso "Faltam os dias DD a DD/MM — importe o histórico para completar o mês" com link para Importar histórico.
2. WHEN esses dias passam a ter dado THEN o sistema SHALL ocultar o aviso.

**Independent Test**: Tenant com entrada em 24/09 sem importação; abrir "Este mês" e ver o aviso "Faltam os dias 01 a 23/09".

---

### P3: Histórico de importações

**User Story**: Como dono da rede, quero ver as importações feitas (quando, quem, lojas, período) e desfazer uma.

**Why P3**: Auditoria e correção de envio errado.

**Acceptance Criteria**:

1. WHEN uma importação é confirmada THEN o sistema SHALL registrar data/hora, usuário, arquivos, lojas, período e totais.
2. WHEN o usuário desfaz uma importação THEN o sistema SHALL apagar os dias gravados por ela que não foram substituídos por importação posterior.

**Independent Test**: Importar, desfazer e ver os KPIs do período voltarem a vazio.

---

## Edge Cases

- IF a planilha tem linhas de venda cancelada THEN o sistema SHALL excluí-las dos totais.
- IF a planilha tem a mesma linha (NF + item) repetida em dois arquivos do mesmo envio THEN o sistema SHALL contá-la uma vez.
- IF o arquivo passa de 20 MB THEN o sistema SHALL recusá-lo com a mensagem "Arquivo acima de 20 MB — exporte períodos menores".
- IF o arquivo não tem hora da venda THEN o sistema SHALL gravar só agregados diários (comparativos por hora ficam sem badge).
- IF o arquivo não tem custo THEN CMV, lucro e margem dos dias importados SHALL aparecer como "—".
- WHEN a planilha tem dias sem venda dentro do período THEN o sistema SHALL gravar R$ 0 para as lojas presentes no arquivo nesses dias.
- WHEN uma venda da Consulta vem sem NFs e sem Data H (visto em "VENDA SMART NFCE", 1 por loja em agosto) THEN o sistema SHALL ligá-la ao item sem nota do mesmo dia, mesmo valor e mesmos itens, somá-la ao total do dia e deixá-la fora do gráfico por hora.
- The coluna "Data" da Consulta SHALL ser ignorada (vem deslocada, ex.: 23/09 23:00 para vendas de 24/09); o dia e a hora vêm de "Data H".
- WHEN a mesma nota aparece em duas lojas no mesmo dia THEN o desempate SHALL usar valor e quantidade de itens; persistindo o empate, a nota bloqueia a importação.

---

## Implicit-requirement sweep

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | P1-AC5, 20 MB edge case, colunas obrigatórias. |
| Failure / partial-failure | P1-AC6 (tudo ou nada por envio). |
| Idempotency / duplicates | P2-AC2 (substitui), edge case NF+item repetido. |
| Auth boundaries | P2-AC1/AC3 (OWNER/ADMIN_GLOBAL). |
| Concurrency / ordering | Fronteira por data de entrada (ERP ≥ entrada, planilha < entrada) evita duas fontes no mesmo dia; duas importações simultâneas da mesma tenant: a segunda aguarda (detalhar no Design). |
| Data lifecycle | Dados importados permanecem até reimportação/desfazer (P3). |
| Observability | Falha de importação vai para Configurações > Logs (origem "Importação de histórico"). |
| External-dependency failure | N/A because a importação não chama o ERP (P1-AC7). |
| State-transition integrity | Data de entrada imutável após gravada (Assumptions). |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| HIST-01 | P1: Importar histórico no onboarding | - | Pending |
| HIST-02 | P1: Sync do ERP só a partir do dia de entrada | - | Pending |
| HIST-03 | P2: Importar depois em Configurações | - | Pending |
| HIST-04 | P2: Aviso de mês incompleto | - | Pending |
| HIST-05 | P3: Histórico de importações | - | Pending |
| HIST-06 | P1: Eventos de venda por loja sincronizados | - | Pending |

**Coverage:** 6 total, 0 mapped to tasks, 6 unmapped ⚠️

---

## Success Criteria

- [ ] Importar 12 meses de 4 lojas leva menos de 2 minutos entre envio e dados na tela.
- [ ] Zero chamadas ao ERP para dias anteriores à data de entrada (verificado no log do worker).
- [ ] Totais mensais importados batem com o relatório do Millennium (diferença 0,00%).
