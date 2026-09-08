# Design — equipe-rede-vendedoras

Princípio: a visão rede passa a REUSAR a mesma anatomia de linha da visão loja (barra de escada, atenção, célula de premiação). Nada de segunda implementação — só acrescentamos a dimensão "de qual loja" e o contexto global.

## Camada de dados (`equipeVisoes.ts`)

1. **`VendedoraLinha` ganha `filialId` e `filialNome`** — preenchidos em `visaoVendedoras` (já recebe `filialId`; `filialNome = filialPorId(filialId).fantasia`). Visão loja única também emite (inofensivo) — assim a mesma linha serve às duas visões.
2. **Nova interface `RedeMetaGlobal`** dentro de `EquipeView` (campo `metaGlobal: RedeMetaGlobal | null`, null quando `!metaAtiva`):
   ```ts
   interface RedeMetaGlobal {
     competTexto: string;      // "Setembro 2026"
     realizado: number;        // faturamento da rede na competência
     total: number;            // soma das metas das lojas do escopo com meta
     pct: number;              // realizado/total*100
     projetadoPct: number;     // projeção da rede (mesma fórmula do KPI de premiação: índice de desempenho acumulado)
     diasRestantes: number;    // dias abertos da competência a partir de hoje
   }
   ```
   - `realizado` = soma dos `agregadoLoja` das filiais do escopo na janela da competência (competência, não período do filtro).
   - `total` = soma de `metaDaFilial(f).valorLoja` apenas das lojas com meta (REDE-08).
   - `projetadoPct` = (realizado / fraçãoAcumDaCurvaRede) / total * 100 — mesma técnica de `premiacaoEscada` (índice de desempenho acumulado, AD-021). Curva da rede = `curvaReceita(filiais, competencia)`.
   - `diasRestantes` = dias abertos (por `lojaAberta` da rede) entre hoje e o fim da competência, inclusive hoje (AD-019).
3. **`visaoRede` passa a devolver `vendedoras`** (flat, todas as lojas) além de `lojas`: concatena os resultados de `visaoVendedoras` por filial, reordena pela regra da loja (atingimento com meta; faturamento sem).
4. **`LojaEquipeResumo` ganha `metaValor`, `realizadoValor`, `pctMetaGlobal`** para a aba Lojas (bloco por loja com barra e % da meta global). `pctMetaGlobal` = meta da loja / meta global * 100.

## UI (`src/pages/equipe/blocos.tsx`)

5. **`BlocoVendedoras` vira reutilizável**: props `{ lista, metaAtiva, mostrarShopping? }`. Com `mostrarShopping`, insere a coluna "Shopping" (texto `filialNome`, `hideBelow: "sm"`) logo após "Vendedora". Células existentes (`BarraEscada`, `PremiacaoCelula`, atenção) não mudam — REDE-03/16 de graça.
6. **Novo `FaixaMetaGlobal({ metaGlobal })`**: faixa no topo do card — `META DE SETEMBRO · R$ 97.450 DE R$ 283.000 · 34,4%` + `ProgressBar` + badges à direita: "Meta será atingida" (success, se `projetadoPct >= 100`) / "Projeção abaixo da meta" (warning) e "N dias restantes" (neutral, com ícone de relógio). Formato: % grande à direita como no print 1.
7. **Novo `BlocoVendedorasRede`**: card "Desempenho por vendedora" com estado interno `abaRede: "vendedoras" | "lojas"` (estado local do componente, default "vendedoras"; some quando `!metaAtiva` — REDE-15):
   - Aba **Vendedoras**: `<BlocoVendedoras mostrarShopping />`.
   - Aba **Lojas**: para cada `LojaEquipeResumo`, bloco com título `fantasia (X% da meta global)`, `ProgressBar` do atingimento da loja, linha `R$ atingido / R$ meta`, e `<BlocoVendedoras lista={daLoja} />` aninhada SEM coluna Shopping (REDE-13). Tabelas aninhadas reutilizam as linhas flat filtradas por `filialId`.
8. **`CardVendedoras` (loja única) não muda** — continua sem Shopping (REDE-05).

## Página (`EquipePage.tsx`)

9. Na visão rede: `<FaixaMetaGlobal>` acima do card; `<BlocoVendedorasRede>` substitui `<BlocoResumoRede>` (removido do arquivo — decisão "substituir"). `BlocoResumoRede` e `LojaEquipeResumo.melhor/pior` saem junto (código morto).

## Testes (`equipeVisoes.test.ts`)

- Rede flat: todas as linhas têm `filialNome` não-vazio; soma de linhas = soma das lojas.
- `metaGlobal.total` = soma das metas das filiais com meta; `pct` fecha com realizado/total.
- `metaGlobal` null fora da competência; badges derivam de `projetadoPct`.
- Aba Lojas: `pctMetaGlobal` das lojas soma 100 (±0,1) quando todas têm meta.
- Regressão: visão loja única inalterada.

## Riscos

- `BlocoResumoRede` é clicável hoje (troca o filtro para a loja). A substituição remove esse atalho — assumido na spec (clique na linha = nenhum). O filtro de loja no topo cobre o caso.
- Duas tabelas (aba Lojas) em telas pequenas: blocos empilham verticalmente; colunas ocultas por breakpoint já cuidam da densidade.
