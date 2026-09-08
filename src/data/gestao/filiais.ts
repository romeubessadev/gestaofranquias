export type TipoPonto = "SHOPPING" | "RUA";
export type Divisao = "WEPINK" | "WPINK";

export interface Filial {
  id: string;
  milleniumFilial: number;
  codFilial: string;
  nome: string;
  fantasia: string;
  cnpj: string;
  cidade: string;
  uf: string;
  tipo: "M" | "F";
  tipoPonto: TipoPonto;
  temWpink: boolean;
  fuso: string;
  /** Hora de abertura e fechamento (hora cheia). */
  abertura: number;
  fechamento: number;
  /** Dias da semana fechados (0 = domingo). */
  diasFechados: number[];
  dataInauguracao: string;
}

export const filiais: Filial[] = [
  {
    id: "f1",
    milleniumFilial: 8,
    codFilial: "00008",
    nome: "ESSENCIA PERFUMARIA CG SHOPPING",
    fantasia: "Shopping Campo Grande",
    cnpj: "45.812.330/0001-19",
    cidade: "Campo Grande",
    uf: "MS",
    tipo: "M",
    tipoPonto: "SHOPPING",
    temWpink: false,
    fuso: "America/Campo_Grande",
    abertura: 10,
    fechamento: 22,
    diasFechados: [],
    dataInauguracao: "2024-03-14",
  },
  {
    id: "f2",
    milleniumFilial: 10,
    codFilial: "00010",
    nome: "ESSENCIA PERFUMARIA TRES LAGOAS",
    fantasia: "Shopping Três Lagoas",
    cnpj: "45.812.330/0002-08",
    cidade: "Três Lagoas",
    uf: "MS",
    tipo: "F",
    tipoPonto: "RUA",
    temWpink: true,
    fuso: "America/Campo_Grande",
    abertura: 8,
    fechamento: 18,
    diasFechados: [0],
    dataInauguracao: "2025-06-02",
  },
];

export function filialPorId(id: string): Filial {
  const f = filiais.find((x) => x.id === id);
  if (!f) throw new Error(`Filial não encontrada: ${id}`);
  return f;
}

export interface Turno {
  id: string;
  filialId: string;
  nome: string;
  horaInicio: number;
  horaFim: number;
}

export const turnos: Turno[] = [
  { id: "t-f1-manha", filialId: "f1", nome: "Manhã", horaInicio: 0, horaFim: 16 },
  { id: "t-f1-tarde", filialId: "f1", nome: "Tarde", horaInicio: 16, horaFim: 24 },
  { id: "t-f2-manha", filialId: "f2", nome: "Manhã", horaInicio: 0, horaFim: 13 },
  { id: "t-f2-tarde", filialId: "f2", nome: "Tarde", horaInicio: 13, horaFim: 24 },
];

export interface Tarefa {
  id: string;
  filialId: string;
  turnoId: string;
  titulo: string;
  ordem: number;
}

export const tarefas: Tarefa[] = [
  { id: "tf1", filialId: "f1", turnoId: "t-f1-manha", titulo: "Abrir caixa e conferir fundo de troco", ordem: 1 },
  { id: "tf2", filialId: "f1", turnoId: "t-f1-manha", titulo: "Reposição da vitrine de perfumaria", ordem: 2 },
  { id: "tf3", filialId: "f1", turnoId: "t-f1-manha", titulo: "Testar provadores e repor blotters", ordem: 3 },
  { id: "tf4", filialId: "f1", turnoId: "t-f1-manha", titulo: "Conferir etiquetas de preço da promoção", ordem: 4 },
  { id: "tf5", filialId: "f1", turnoId: "t-f1-manha", titulo: "Limpeza das prateleiras de body splash", ordem: 5 },
  { id: "tf6", filialId: "f1", turnoId: "t-f1-tarde", titulo: "Passagem de turno: caixa e pendências", ordem: 1 },
  { id: "tf7", filialId: "f1", turnoId: "t-f1-tarde", titulo: "Reposição de estoque na loja", ordem: 2 },
  { id: "tf8", filialId: "f1", turnoId: "t-f1-tarde", titulo: "Organizar kits de presente", ordem: 3 },
  { id: "tf9", filialId: "f1", turnoId: "t-f1-tarde", titulo: "Fechamento de caixa e sangria", ordem: 4 },
  { id: "tf10", filialId: "f2", turnoId: "t-f2-manha", titulo: "Abrir loja e conferir fundo de troco", ordem: 1 },
  { id: "tf11", filialId: "f2", turnoId: "t-f2-manha", titulo: "Conferir vitrine externa", ordem: 2 },
  { id: "tf12", filialId: "f2", turnoId: "t-f2-manha", titulo: "Repor suplementos WPINK no expositor", ordem: 3 },
  { id: "tf13", filialId: "f2", turnoId: "t-f2-manha", titulo: "Registrar temperatura do estoque", ordem: 4 },
  { id: "tf14", filialId: "f2", turnoId: "t-f2-tarde", titulo: "Passagem de turno", ordem: 1 },
  { id: "tf15", filialId: "f2", turnoId: "t-f2-tarde", titulo: "Reposição de perfumaria", ordem: 2 },
  { id: "tf16", filialId: "f2", turnoId: "t-f2-tarde", titulo: "Fechamento de caixa", ordem: 3 },
];

export interface Categoria {
  id: number;
  nome: string;
  divisao: Divisao;
  /** CMV como fração do preço de venda (custo de fábrica com imposto). */
  cmvPct: number;
}

/** Categorias por TIPO do ERP, agrupadas por id. */
export const categorias: Categoria[] = [
  { id: 1, nome: "Perfumaria", divisao: "WEPINK", cmvPct: 0.3 },
  { id: 2, nome: "Body Splash", divisao: "WEPINK", cmvPct: 0.27 },
  { id: 3, nome: "Body Cream", divisao: "WEPINK", cmvPct: 0.31 },
  { id: 4, nome: "Hair", divisao: "WEPINK", cmvPct: 0.34 },
  { id: 5, nome: "Skincare", divisao: "WEPINK", cmvPct: 0.36 },
  { id: 6, nome: "Make", divisao: "WEPINK", cmvPct: 0.38 },
  { id: 7, nome: "Kits e presentes", divisao: "WEPINK", cmvPct: 0.33 },
  { id: 8, nome: "Suplementos", divisao: "WPINK", cmvPct: 0.42 },
];

export const meiosPagamento = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"] as const;
export type MeioPagamento = (typeof meiosPagamento)[number];

export interface ConfigFilial {
  filialId: string;
  impostoSobreCustoPct: number;
  margemMinimaPct: number | null;
}

export const configFiliais: ConfigFilial[] = [
  { filialId: "f1", impostoSobreCustoPct: 4, margemMinimaPct: 55 },
  { filialId: "f2", impostoSobreCustoPct: 4, margemMinimaPct: null },
];
