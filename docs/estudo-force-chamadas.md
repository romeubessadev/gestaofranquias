# Estudo — Atualizar (FORCE): chamadas ao ERP antes × depois

> Data: 2026-09-25 · Base: testes com a loja 205 (API, 24/09) e planilhas de agosto das lojas 010 e 114.
> O **Atualizar** (FORCE) é o mesmo fluxo que vai rodar na **atualização automática** (padrão 30 em 30 min) e no fechamento do dia.

## Exemplo usado nas contas

- **3 lojas** com "Todas as lojas" selecionado.
- A loja **205** vende WPINK (36 cupons no dia 24/09); as outras só WEPINK.
- Automático de **30 em 30 min**, loja aberta ~12h → **25 rodadas por dia** (24 + a rodada do fechamento).
- Equipe: ~30 pessoas por loja no ERP (ativas + inativas).

---

## 1. Como é o Atualizar hoje

| Chamada | Quando | Quantidade |
|---|---|---|
| Mapa filial → gerador (`filial.GERADOR.gerador`) | toda rodada | 1 |
| `VENDAS.Lista` do dia | por loja | 1 |
| Margem (`RELATORIOMARGEM`) — marca/CMV | por loja | 1 |
| Categorias `{2C46ADF5}` | por loja | 1 |
| Top produtos `{E7A5C5C7}` | por loja | 1 |
| Detalhe da movimentação (`ConsultaDetMov`) | por **cupom novo**, só em loja com WPINK (cupom já detalhado fica em cache) | 1 por cupom |
| Sync da equipe (`FUNCIONARIOS.Lista` + `Consulta` por pessoa) | nome desconhecido **ou** > 24h | 1 + 1 por pessoa (~31/loja) |

## 2. Descobertas do estudo

| # | Descoberta | O que elimina | Status |
|---|---|---|---|
| 1 | **Relatório de cupom** — WE PINK - PRODUTOS POR CUPOM E VENDEDOR `{52DE7BBC}`: itens de todos os cupons do dia em 1 chamada, com nota, `COD_OPERACAO`, código do produto e código da vendedora | Detalhe por cupom, top produtos `{E7A5C5C7}`, cache de cupons | ✅ Validado (205: 16/16 cupons idênticos; 010 ago: 3.165/3.165) |
| 2 | **Vendedora pelo código de gerador** (vem no relatório de cupom) | Sync diário da equipe; ligação pelo nome (quebra com troca de nome) | ✅ Validado (confirmar o campo do gerador na Consulta na implementação) |
| 3 | **Bloco mensal** — relatório de cupom + margem 1× por mês (custo unitário estável no mês) | 30 margens + 30 relatórios de produto por loja/mês | ✅ Validado (custo não mudou dentro de set/26); teste de 2 chamadas pendente |
| 4 | **Catálogo de produtos** (código → tipo) | Relatório de categorias por loja/rodada | 🔲 Aguardando suporte (plano B testado com lookups) |
| 5 | **Gerador salvo no banco** | Lookup filial → gerador a cada rodada | 🟡 Proposta |
| 6 | **Automático + recuperação de dias** | Job noturno fixo de fechamento (D-1) | ✅ Decidido |
| — | Status de NFe no lugar da Lista | — | ❌ Descartado (sem forma de pagamento, sem venda sem nota, hora de processamento) |

**Fallback:** venda sem vendedora não sai no relatório de cupom → 1 detalhe da movimentação só dela (~1 a cada 3.000 vendas).

---

## 3. Ganho por descoberta

### Atualizar (3 lojas, automático 30 min — chamadas por dia)

| Descoberta | Redução por dia |
|---|---|
| 1. Relatório de cupom | **−36** (detalhes dos cupons do dia da 205) |
| 2. Vendedora pelo código de gerador | **−90** (sync diário da equipe) |
| 4. Catálogo de produtos | **−75** (categorias: 3 lojas × 25 rodadas) |
| 5. Gerador salvo | **−25** (1 por rodada) |
| 6. Automático + recuperação | **−13 a −49** por noite (job noturno só roda se sobrar dia pendente) |

### Histórico (por loja, por mês)

| Descoberta | Redução |
|---|---|
| 1. Relatório de cupom | **−milhares** de detalhes de cupom (loja com WPINK) |
| 3. Bloco mensal | **−58** (margem e produtos de 30 → 1 cada) |
| 4. Catálogo de produtos | **−30** (categorias dia a dia) |

---

## 4. Comparativo por etapa

| Etapa | Hoje | Depois, sem catálogo | Depois, com catálogo |
|---|---|---|---|
| Atualizar, 3 lojas (1 rodada) | 13 + cupons novos (+~90 1×/dia) | **13** | **10** (9 com gerador salvo) |
| Automático 30 min, 3 lojas (por dia) | ~450 | **~325** | **~250** (~225 com gerador salvo) |
| Fechamento D-1 (por noite) | 13 + cupons do dia | **0** (só se sobrar dia pendente: 4/loja/dia) | **0** |
| Onboarding, 3 lojas (1× só) | ~110 + detalhe dos cupons de hoje | **~110** (quase tudo é a equipe) | **~110** |
| Histórico por loja/mês | ~120 + milhares | **~62** | **~32** |
| Histórico, 3 lojas × 2 meses | ~720 + milhares | **~370** | **~190** |

### Redução acumulada no automático (3 lojas, por dia)

| Etapa | Chamadas/dia | Redução |
|---|---|---|
| Hoje | ~450 | — |
| + Relatório de cupom e vendedora pelo código (descobertas 1 e 2) | **~325** | **−28%** |
| + Catálogo de produtos | ~250 | −44% |
| + Gerador salvo | ~225 | −50% |

### Ganhos além do número de chamadas

- **Custo fixo e previsível** por rodada — não depende de WPINK, nº de cupons nem horário.
- **Menos pontos de falha** — some a rajada de detalhes por cupom (onde o ERP mais dava "ocupado"/timeout).
- **Equipe correta** — troca de nome no ERP não quebra meta nem histórico.
- **Menos relatórios personalizados** para o franqueado liberar (1, com o catálogo).
- **Sem tabela de cache** de cupons.

---

## 5. Resultado final — chamadas a cada Atualizar (FORCE)

**N** = nº de lojas na rodada · **C** = cupons novos em lojas com WPINK desde a última rodada · **P** = pessoas da equipe na loja.

| Cenário | Fórmula por rodada | 1 loja | 3 lojas | 10 lojas |
|---|---|---|---|---|
| **Hoje** | 1 + 4N + C (+ N × (1 + P) 1×/dia) | 5 + C | 13 + C | 41 + C |
| **Hoje — rodada que dispara o sync da equipe** | 1 + 4N + C + N × (1 + P) | ~37 + C | ~109 + C | ~361 + C |
| **Depois, sem catálogo** | 1 + 4N | **5** | **13** | **41** |
| **Depois, com catálogo** | 1 + 3N | **4** | **10** | **31** |
| **Depois, com catálogo + gerador salvo** | 3N | **3** | **9** | **30** |

Extras raros (depois): venda sem vendedora +1 · vendedora nova +2 · (com catálogo) produto novo +~20 uma vez.

**Por dia no automático (25 rodadas):**

| Cenário | 1 loja | 3 lojas | 10 lojas |
|---|---|---|---|
| Hoje | ~125 + cupons do dia + ~31 equipe | ~450 | ~1.025 + cupons do dia + ~310 equipe |
| Depois, sem catálogo | **~125** | **~325** | **~1.025** |
| Depois, com catálogo | **~100** | **~250** | **~775** |
| Depois, com catálogo + gerador salvo | **~75** | **~225** | **~750** |
