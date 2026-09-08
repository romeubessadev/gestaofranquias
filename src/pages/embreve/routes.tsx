import { Navigate, type RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
import { lazyPage } from "@/lib/lazyPage";
import { EmBreve } from "./EmBreve";

const Perfil = lazyPage(() => import("./Perfil"), "Perfil");

const FASE2 = "Fase 2 · em construção";
const FASE3 = "Fase 3 · em construção";

export const emBreveRoutes: RouteObject[] = [
  // Análise sai de cena por enquanto: quem tiver o link antigo cai na Loja.
  { path: paths.analise, element: <Navigate to={paths.loja} replace /> },
  // Equipe virou aba do Dashboard, com filtro compartilhado: ver src/pages/equipe/routes.tsx.
  { path: paths.configuracoes.metas, element: <EmBreve titulo="Metas" fase={FASE2} descricao="Meta mensal em reais, uma por mês, com degraus configuráveis. A soma das individuais precisa fechar com a loja." itens={["Escada de degraus: nome, atingimento, comissão e bônus", "Distribuição individual proposta pelo plano do mês, com ajuste manual e validação da soma", "Período parcial com meta proporcional por peso de dia", "Plano do mês: retrospecto, metas propostas, desafios propostos, revisar e ativar"]} /> },
  { path: paths.configuracoes.desafios, element: <EmBreve titulo="Desafios" fase={FASE2} descricao="Objetivos pontuais em produto, quantidade ou índice. Nunca em reais." itens={["Nome, tipo, critério, meta por pessoa, prêmio, período e participantes", "Produtos por categoria, não SKU a SKU", "Aviso de quantos já estão ativos ao criar", "Candidatos: compra bloqueada com estoque, cobertura alta com ticket acima da média"]} /> },
  { path: paths.configuracoes.colaboradores, element: <EmBreve titulo="Colaboradores" fase={FASE2} descricao="Quem vem do ERP e o que é só nosso: e-mail, celular, aniversário, turno, tipo e inatividade." itens={["Lista por filial com status no ERP e no app", "Convidar e reenviar convite", "Marcar como inativo com motivo e data, aceitando retroativo", "Marcar como caixa central e configurar rateio"]} /> },
  { path: paths.configuracoes.turnos, element: <EmBreve titulo="Turnos e tarefas" fase={FASE3} descricao="Turno tem nome e horário. Tarefa é da loja, por turno, e reseta na virada." itens={["Turnos por filial cobrindo as pontas do dia", "Tarefas por turno com ordem", "Painel de conclusão por turno, nunca nominal"]} /> },
  { path: paths.configuracoes.mensagens, element: <EmBreve titulo="Mensagens" fase={FASE2} descricao="Aviso vai por push, gesto vai por WhatsApp com envio humano." itens={["Fila de rascunhos: aniversário, férias, retorno, desligamento", "Botão que abre o WhatsApp com o texto pronto", "Modelos por grupo e por filial, com herança", "Degrau por push automático, uma vez por competência"]} /> },
  { path: paths.configuracoes.documentos, element: <EmBreve titulo="Documentos" fase={FASE3} descricao="Termos e regras versionados. Nova versão exige novo aceite de todos." itens={["Por filial ou grupo", "Registro de quem aceitou, versão, data e IP", "Versão anterior nunca é sobrescrita"]} /> },
  { path: paths.configuracoes.custos, element: <EmBreve titulo="Custos" fase={FASE3} descricao="Parâmetros por filial que alimentam lucro bruto e, na v2, margem de contribuição." itens={["Imposto sobre custo de mercadoria", "Margem mínima aceitável", "Royalties e marketing por divisão (v2)", "Aluguel: percentual com mínimo em shopping, fixo em rua (v2)", "Custo fixo mensal (v2)"]} /> },
  { path: paths.configuracoes.marca, element: <EmBreve titulo="Marca" fase={FASE3} descricao="Nome de exibição, endereço, logo e cor principal. O mesmo formulário da etapa 1 do onboarding." itens={["Mudar o endereço mantém o anterior como redirecionamento", "Checagem de contraste e distância dos semânticos"]} /> },
  { path: paths.configuracoes.erp, element: <EmBreve titulo="Integração ERP" fase={FASE3} descricao="Credencial do Millenium, só o proprietário. Estado do sync e histórico." itens={["Trocar ou remover credencial, com teste real de login", "Usuário dedicado ou compartilhado: define o intervalo", "Último sucesso, último erro, próximo sync", "Log de acessos do suporte"]} /> },
  { path: paths.configuracoes.usuarios, element: <EmBreve titulo="Usuários" fase={FASE3} descricao="Gestores e gerentes não existem no ERP. Cadastro manual e convite por e-mail." itens={["CPF, nome, e-mail, papel e filiais do escopo", "Pendente até ativar ou aceitar", "Reenviar convite"]} /> },
  { path: paths.vendedora.minhaMeta, element: <EmBreve titulo="Minha meta" fase={FASE2} descricao="A tela que a vendedora abre todo dia. Do que ela mais quer saber para o que menos quer." itens={["Realizado contra a meta, com os degraus marcados na barra", "Próximo degrau: quanto ganha a mais, quanto falta em reais e por dia, veredito honesto", "Comissão até agora, com percentual, bônus e a parcela do caixa central separada", "Meu dia: faturamento, atendimentos, ticket e PA contra o mesmo dia da semana anterior", "Ponto de atenção como orientação", "Turno atual e tarefas, desafios que participo, ranking da loja", "Seletor de mês para conferir meses anteriores"]} /> },
  { path: paths.vendedora.tarefas, element: <EmBreve titulo="Tarefas" fase={FASE3} descricao="Checklist do turno atual. Qualquer colaboradora marca, o sistema registra quem." itens={["Turno atual com horário e progresso", "Checkbox grande por tarefa, na ordem configurada", "Turnos anteriores do dia recolhidos, somente leitura", "Reseta na virada do turno"]} /> },
  { path: paths.vendedora.ranking, element: <EmBreve titulo="Ranking" fase={FASE2} descricao="Ranking completo da loja, ordenado por atingimento." itens={["Posição e percentual de atingimento de cada colega", "O próprio valor em reais; das colegas só o percentual", "Rótulo de período parcial"]} /> },
  { path: paths.perfil, element: <Perfil /> },
];
