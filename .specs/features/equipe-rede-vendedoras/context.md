# Contexto — equipe-rede-vendedoras

Decisões do usuário capturadas nas rodadas de discussão (2026-09-08).

## Rodada 1 — estrutura do card

| Pergunta | Decisão |
| -------- | ------- |
| Destino dos cards de resumo por loja atuais | **Substituir**: a visão "Todas" passa a ser a tabela de vendedoras da rede; resumo por loja sai |
| Formato da meta global | **Faixa no topo do card** (formato do print): `META DE [MÊS] · R$ atingido DE R$ total · %` + barra de progresso + link "ver escada" |
| Premiação e Próximo degrau | **Mescladas numa coluna** (valor + gancho "+R$ X" + veredito), como no print |
| Período sem meta na rede | **Só desempenho do período** (Vendedora, Shopping, Faturamento, Ticket, P.A.) — segue AD-040 |

## Rodada 2 — exemplos anexados de outro sistema

O usuário anexou 3 prints de uma aplicação anterior (metas por vendedor/grupo) e pediu extrair o que for útil; destacou "é legal que ele tem visão por grupo e vendedor".

| Pergunta | Decisão |
| -------- | ------- |
| Visão agrupada por loja | **Sim, as duas abas nesta rodada**: `Vendedoras | Lojas` — flat com Shopping + agrupada por loja com meta global e tabela aninhada |
| Cabeçalho enriquecido | **Faixa + badges**: "Meta será atingida" / "Projeção abaixo da meta" e "N dias restantes" |
| Medalhas de ranking (top 3) | **Não** |

## Extrações dos prints que entram

- Cabeçalho global com % grande à direita e `R$ atingido / R$ total` (print 1)
- Bloco por grupo com `% da meta global` no título, barra própria e `atingido / meta do grupo` (print 2)
- Badges de status no cabeçalho: projeção e tempo restante (print 1)

## Extrações que NÃO entram (já cobertas ou recusadas)

- FAIXA ("Abaixo da meta · Próx: Meta — faltam R$ X") → nossa coluna de premiação já é mais rica (gancho + veredito, AD-041)
- Colunas COMISSÃO/BÔNUS/TOTAL separadas → verba única "Premiação" (AD-041)
- Medalhas 🥇🥈🥉 → recusado pelo usuário
- "Necessário/dia" e "Média diária" → pertencem à Visão geral (AD-017); não duplicar aqui
