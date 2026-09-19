# Ao vivo — Context

**Gathered:** 2026-09-18
**Spec:** `.specs/features/ao-vivo/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Tela **Ao vivo** no app do gestor (menu abaixo de Dashboard, antes de Configurações — ao lado de Metas): acompanhar o andamento da **competência do mês** (ranking, desafios, metas) com **pulso do dia** nos indicadores de volume. Visual 100% Vela. Cabeçalho com **Atualizar** e **Compartilhar**; a visão externa (TV) completa é o feature seguinte.

---

## Implementation Decisions

### Hierarquia / header
- Não mostrar empresa (ex.: SB Empreendimentos) no header.
- Título da página: **Ao Vivo**; loja via SeletorLoja do Topbar (1 loja ou Todas).

### Periodicidade (travado — opção 1)
- **Sem** toggle global Hoje|Mês.
- **Sem** períodos Semestre/Ano no Ranking (histórico fora do Ao vivo).
- **Indicadores principais:** competência do **mês**.
- **Strip do dia:** pulso de hoje (vendas, fat., ticket, itens) abaixo dos KPIs.
- **Ranking / Desafios / Metas:** sempre competência do **mês** (desafios = janela do próprio desafio).
- **Evolução do vendedor:** removida da tela (histórico fora do Ao vivo).

### KPIs (Indicadores)
- **Principais (mês):** Faturamento · Nº de vendas · Meta Mensal · Atingimento — mesma prioridade do Dashboard (faturamento primeiro).
- **Strip do dia** (padrão Sales quick stats): Faturamento hoje · Nº de vendas hoje · Ticket médio hoje · Itens hoje.
- Sem “Hoje …” no subtítulo dos KPIs principais (pulso do dia vive no strip).

### Abas principais
- Card principal (**Andamento da competência**): tabs accent **Ranking** (pódio) | **Desafios** | **Metas**.
- Desafios e Metas reusam os blocos da Equipe (`BlocoDesafios`, `FaixaMetaGlobal`, `CardVendedoras` embedded).
- Metas: mesmo Progresso da Meta + Escada de Premiação da Equipe (escopo 1 loja ou Todas somada).
- **Desafios no Ao vivo e na Equipe:** só `statusLabel === "Ativo"` (sem encerrados nem a começar).

### Aba Metas — card por meta (DECIDIDO 2026-09-19 — mock)
- Cada meta ativa vira **um card** com **título = só o nome da meta** (sem sufixo "Loja"/"Mix" — isso vai nos badges).
- Badges abaixo do título (contexto, não KPI), ordem: tipo → loja → marcas → contagens:
  - Tipo: **Individual** | **Coletiva**
  - Loja (fantasia)
  - Marcas: WEPINK · WPINK | só WEPINK | só WPINK
  - Qtd de grupos · Qtd de vendedoras · Qtd de níveis
- Corpo do card: barra de progresso (realizado/alvo + % + projeção) + escada/lista daquela meta.
- N metas = N cards empilhados; 1 meta = 1 card (mesmo padrão, sem caso especial).
- Escada/vendedoras ficam **dentro** do card da meta (não misturar atingimentos de metas diferentes).

### Evolução + IA + Formas
- Evolução por Vendedor: **removida** da tela.
- IA Insights: **fora por enquanto** (P2).
- Formas de Pagamento: **fora do Ao vivo** (fica na Visão Geral / Financeiro).
- Cards abaixo do andamento: Ranking de Lojas → Ranking Vendedoras (par `lg:grid-cols-2`, ambos `max-h-[min(520px,70vh)]` com scroll — mesmo teto dos Desafios embedded).
- Escada de Premiação (aba Metas e tela Equipe): lista com o mesmo `max-h` + scroll quando há muitas vendedoras.

### Cabeçalho (ações)
- **Atualizar** = primary; **Compartilhar** = secondary.
- Breadcrumb `Ao vivo` no PageHeader (igual às filhas Compartilhar / Modo TV).
- Sem botão Modo TV no header (rota TV permanece para o feature de visão externa).
- Navegação Compartilhar → `/ao-vivo/compartilhar` (shell).

### Filtro de loja / tema
- SeletorLoja no Topbar.
- Só componentes Vela.

### Agent's Discretion
- Layout KPI: grid 4 colunas no padrão das outras telas.
- Botão Atualizar + “Atualizado há X min” (padrão Equipe).

### Declined / Undiscussed → Assumptions
- Página compartilhamento/TV **completa**: feature seguinte; neste corte: rotas + shell para os botões funcionarem.
- Ordenação ranking P1: por faturamento.
- “Por quantidade” e Ranking `Mês|Hoje`: fora do 1º corte.

---

## Specific References

- Screenshots SAAS (pódio, desafios, metas, evolução, IA) — extrair informação, não o dark.
- Menu: `nav-gestao.ts`; escopo: `useEscopo` / SeletorLoja.

---

## Deferred Ideas

- Visão externa completa (layout TV/notebook) — próximo feature após Ao vivo.
- Toggle Ranking Mês|Hoje (alternativa 2, rejeitada por ora).
- Semestre/Ano no Ranking.
- Skin dark TV · IA real · header empresa.
