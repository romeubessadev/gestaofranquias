# Copy atual — Dashboard → Equipe

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

### Ranking dentro do card de Desafio

| Elemento | Texto / UI |
|---|---|
| Sub da vendedora | `{Grupo} · {loja}` |
| Prêmio / Gerente | Mesmo tom dos outros valores (`text-t0`), sem verde |

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

Um único badge no canto superior direito (ícone de relógio + prazo curto). A cor carrega o status; sem datas de início/fim nem texto “Ativo”.

| Situação | Badge | Variant |
|---|---|---|
| Em andamento | `{N}d` | success |
| Ainda não começou | `Em {N}d` / `Hoje` | info |
| Já acabou | `Encerrado` | neutral |

Janela completa (`{dd/mm} – {dd/mm}`) só no `title` do badge (hover), não na face do card.

### Loja (visão rede)

Na visão **Todas as lojas**, o card mostra o nome curto da loja abaixo do título (`Campo Grande` · `Três Lagoas`). Com 1 loja selecionada, o rótulo some (redundante).

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
- Grupos: `Faturamento por Dia × Grupo`, `Mapa de Calor por Hora`
