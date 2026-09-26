# Importação de histórico por planilha — Context

**Gathered:** 2026-09-24
**Spec:** `.specs/features/history-import/spec.md`
**Status:** Relatórios-fonte definidos e validados com agosto/26 (2026-09-25) — pronto para Design

---

## Feature Boundary

Passado de vendas entra por planilha exportada do Millennium (qualquer período, zero chamada ao ERP); o sync do ERP cobre só da data de entrada em diante.

---

## Implementation Decisions

### Onboarding

- Etapa "Importar histórico" opcional depois da etapa Lojas, com "Pular, importo depois".
- A mesma importação fica disponível depois em Configurações.

### Fronteira planilha × ERP

- ERP busca só do dia de entrada (dia do SEED) em diante — inclusive no mês atual.
- A carga automática dos dias anteriores do mês (cadeia de CLOSE com `fillUntil`, CLAUDE.md #23c) sai.
- Dias anteriores à entrada = só planilha. Um dia nunca tem as duas fontes.

### Planilhas e validação (2026-09-25)

- 3 planilhas por loja: Listar Movimentações de Venda, WEPINK - VENDAS POR PRODUTOS, Margem de Produtos. Usuário só preenche Data inicial, Data final e Filial.
- Evento **não** é filtro do usuário: a WeDash sincroniza o cadastro de eventos junto com as lojas e descarta o que não é S-X / S-03 / S-{loja}.
- Loja validada em cada planilha: Consulta pela coluna Filial; Vendas por Produtos pelo cruzamento de nota (nº + dia + valor + itens); Margem produto a produto contra o Vendas por Produtos.
- Margem uma loja por arquivo (custo varia por loja).
- Qualquer divergência entre as 3 bloqueia a importação ("nada de salada de fruta").

### Agent's Discretion

- Aviso de mês incompleto nas telas (reaproveita o espaço do `MonthFillNotice`).
- Defaults de permissão, formatos, limite de tamanho e reimportação (ver Assumptions na spec).

### Declined / Undiscussed Gray Areas → Assumptions

- Quem importa, formatos/limite, reimportação e loja desconhecida: defaults registrados na spec, pendentes de confirmação.

---

## Specific References

- CLAUDE.md #23: "Meses mais antigos → importação por planilha (fase futura, zero chamada ao ERP)".
- Teste real 2026-09-24: setembro inteiro (4 lojas) via ERP levou ~9 min; histórico longo via ERP derrubou o Millennium.
- Amostras em `docs/relatorios/` (agosto/26, lojas 00010 e 00114 + Consulta 00010 sem evento). Resultado: 5.252/5.252 notas na loja certa às cegas; totais iguais ao centavo nas 3 planilhas; 2 produtos com diferença de R$ 0,02 na Margem (arredondamento).

---

## Deferred Ideas

- Mapeamento manual de colunas para layouts diferentes do suportado.
- Importar estoque/compras.
