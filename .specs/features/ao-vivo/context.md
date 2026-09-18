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
- **Indicadores:** sempre as duas leituras — valor principal = **mês**; subtítulo = **hoje** (ex.: Faturamento do mês + `Hoje R$ X · N vendas`).
- **Ranking / Desafios / Metas:** sempre competência do **mês** (desafios = janela do próprio desafio).
- **Evolução do vendedor:** histórico multi-mês (P2), separado do “ao vivo”.

### KPIs (Indicadores)
- Total de Vendas (mês + hoje no sub)
- Faturamento (mês + hoje no sub)
- Meta Mensal (meta da competência)
- Atingimento (% do mês até agora)

### Abas principais
- Card principal (**Andamento da competência**): tabs accent **Ranking** (pódio) | **Desafios** | **Metas**.
- Desafios e Metas reusam os blocos da Equipe (`BlocoDesafios`, `FaixaMetaGlobal`, `CardVendedoras` embedded).
- Metas: mesmo Progresso da Meta + Escada de Premiação da Equipe (escopo 1 loja ou Todas somada).
- **Desafios no Ao vivo e na Equipe:** só `statusLabel === "Ativo"` (sem encerrados nem a começar).

### Evolução + IA
- Evolução: tabela + AreaLineChart (P2).
- IA Insights: banner só no app gestor; mock ao clicar (P2). Sem IA na futura TV.

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
