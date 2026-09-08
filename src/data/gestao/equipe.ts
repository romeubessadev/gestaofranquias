import { cpfDeBase } from "@/lib/cpf";

export type Papel = "ADMIN_GLOBAL" | "GESTOR" | "GERENTE" | "VENDEDOR";
export type TipoColaborador = "VENDEDOR" | "CENTRAL";
export type MotivoInatividade = "FERIAS" | "LICENCA" | "DESLIGAMENTO" | "OUTRO";

export interface Colaborador {
  id: string;
  filialId: string;
  milleniumFuncionario: number;
  codFuncionario: string;
  nome: string;
  cargo: "VENDEDOR";
  dataAdmissao: string;
  tipo: TipoColaborador;
  turnoId: string | null;
  emailApp: string | null;
  celular: string | null;
  dataAniversario: string | null;
  excluirDeRanking: boolean;
  inativoNoErp: boolean;
  motivoInatividade: MotivoInatividade | null;
  dataInatividade: string | null;
  /** Peso relativo de venda usado pelo gerador de mocks. */
  pesoVenda: number;
  /** Tem vínculo (usa o app)? */
  usaApp: boolean;
}

export const colaboradores: Colaborador[] = [
  // Shopping Campo Grande
  { id: "c01", filialId: "f1", milleniumFuncionario: 343, codFuncionario: "0343", nome: "Ana Paula Ferreira", cargo: "VENDEDOR", dataAdmissao: "2024-03-14", tipo: "VENDEDOR", turnoId: "t-f1-manha", emailApp: "ana.ferreira@gmail.com", celular: "67991230001", dataAniversario: "1996-09-22", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 1.35, usaApp: true },
  { id: "c02", filialId: "f1", milleniumFuncionario: 351, codFuncionario: "0351", nome: "Bruna Martins", cargo: "VENDEDOR", dataAdmissao: "2024-05-02", tipo: "VENDEDOR", turnoId: "t-f1-tarde", emailApp: "bruna.martins@gmail.com", celular: "67991230002", dataAniversario: "1999-02-11", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 1.2, usaApp: true },
  { id: "c03", filialId: "f1", milleniumFuncionario: 366, codFuncionario: "0366", nome: "Camila Souza", cargo: "VENDEDOR", dataAdmissao: "2024-08-19", tipo: "VENDEDOR", turnoId: "t-f1-tarde", emailApp: "camila.souza@gmail.com", celular: "67991230003", dataAniversario: "2000-09-05", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 1.1, usaApp: true },
  { id: "c04", filialId: "f1", milleniumFuncionario: 372, codFuncionario: "0372", nome: "Daniela Rocha", cargo: "VENDEDOR", dataAdmissao: "2024-11-04", tipo: "VENDEDOR", turnoId: "t-f1-manha", emailApp: "dani.rocha@hotmail.com", celular: "67991230004", dataAniversario: "1994-12-30", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.95, usaApp: true },
  { id: "c05", filialId: "f1", milleniumFuncionario: 388, codFuncionario: "0388", nome: "Eduarda Lima", cargo: "VENDEDOR", dataAdmissao: "2025-02-10", tipo: "VENDEDOR", turnoId: "t-f1-tarde", emailApp: "duda.lima@gmail.com", celular: "67991230005", dataAniversario: "2001-06-18", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.9, usaApp: true },
  { id: "c06", filialId: "f1", milleniumFuncionario: 401, codFuncionario: "0401", nome: "Fernanda Alves", cargo: "VENDEDOR", dataAdmissao: "2025-04-22", tipo: "VENDEDOR", turnoId: "t-f1-manha", emailApp: null, celular: "67991230006", dataAniversario: "1998-03-09", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: "FERIAS", dataInatividade: "2026-09-10", pesoVenda: 0.85, usaApp: false },
  { id: "c07", filialId: "f1", milleniumFuncionario: 415, codFuncionario: "0415", nome: "Gabriela Costa", cargo: "VENDEDOR", dataAdmissao: "2025-07-01", tipo: "VENDEDOR", turnoId: "t-f1-tarde", emailApp: "gabi.costa@gmail.com", celular: "67991230007", dataAniversario: "1997-09-27", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.8, usaApp: true },
  { id: "c08", filialId: "f1", milleniumFuncionario: 430, codFuncionario: "0430", nome: "Helena Ribeiro", cargo: "VENDEDOR", dataAdmissao: "2026-01-12", tipo: "VENDEDOR", turnoId: "t-f1-manha", emailApp: "helena.rib@gmail.com", celular: null, dataAniversario: "2002-11-02", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.7, usaApp: true },
  { id: "c09", filialId: "f1", milleniumFuncionario: 300, codFuncionario: "0300", nome: "CAIXA LOJA CG", cargo: "VENDEDOR", dataAdmissao: "2024-03-14", tipo: "CENTRAL", turnoId: null, emailApp: null, celular: null, dataAniversario: null, excluirDeRanking: true, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.45, usaApp: false },
  // Shopping Três Lagoas
  { id: "c11", filialId: "f2", milleniumFuncionario: 1009, codFuncionario: "1009", nome: "Isabela Nunes", cargo: "VENDEDOR", dataAdmissao: "2025-06-02", tipo: "VENDEDOR", turnoId: "t-f2-manha", emailApp: "isa.nunes@gmail.com", celular: "67992340001", dataAniversario: "1995-04-14", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 1.3, usaApp: true },
  { id: "c12", filialId: "f2", milleniumFuncionario: 1012, codFuncionario: "1012", nome: "Juliana Prado", cargo: "VENDEDOR", dataAdmissao: "2025-06-02", tipo: "VENDEDOR", turnoId: "t-f2-tarde", emailApp: "ju.prado@gmail.com", celular: "67992340002", dataAniversario: "1993-09-12", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 1.15, usaApp: true },
  { id: "c13", filialId: "f2", milleniumFuncionario: 1018, codFuncionario: "1018", nome: "Karina Mendes", cargo: "VENDEDOR", dataAdmissao: "2025-08-11", tipo: "VENDEDOR", turnoId: "t-f2-manha", emailApp: "karina.m@gmail.com", celular: "67992340003", dataAniversario: "1999-07-30", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 1.0, usaApp: true },
  { id: "c14", filialId: "f2", milleniumFuncionario: 1023, codFuncionario: "1023", nome: "Larissa Teixeira", cargo: "VENDEDOR", dataAdmissao: "2025-10-06", tipo: "VENDEDOR", turnoId: "t-f2-tarde", emailApp: "lari.teixeira@gmail.com", celular: "67992340004", dataAniversario: "2000-01-25", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.95, usaApp: true },
  { id: "c15", filialId: "f2", milleniumFuncionario: 1031, codFuncionario: "1031", nome: "Mariana Duarte", cargo: "VENDEDOR", dataAdmissao: "2026-01-19", tipo: "VENDEDOR", turnoId: "t-f2-manha", emailApp: "mari.duarte@gmail.com", celular: "67992340005", dataAniversario: "1998-10-08", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.85, usaApp: true },
  { id: "c16", filialId: "f2", milleniumFuncionario: 1037, codFuncionario: "1037", nome: "Natália Barros", cargo: "VENDEDOR", dataAdmissao: "2026-03-02", tipo: "VENDEDOR", turnoId: "t-f2-tarde", emailApp: null, celular: "67992340006", dataAniversario: "2001-09-19", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.8, usaApp: false },
  { id: "c17", filialId: "f2", milleniumFuncionario: 1042, codFuncionario: "1042", nome: "Patrícia Moraes", cargo: "VENDEDOR", dataAdmissao: "2026-05-18", tipo: "VENDEDOR", turnoId: "t-f2-manha", emailApp: "paty.moraes@gmail.com", celular: "67992340007", dataAniversario: "1996-02-03", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.75, usaApp: true },
  { id: "c18", filialId: "f2", milleniumFuncionario: 1055, codFuncionario: "1055", nome: "Rafaela Cardoso", cargo: "VENDEDOR", dataAdmissao: "2026-09-08", tipo: "VENDEDOR", turnoId: "t-f2-tarde", emailApp: "rafa.cardoso@gmail.com", celular: "67992340008", dataAniversario: "2003-05-21", excluirDeRanking: false, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.6, usaApp: true },
  { id: "c19", filialId: "f2", milleniumFuncionario: 1000, codFuncionario: "1000", nome: "CAIXA CENTRAL TL", cargo: "VENDEDOR", dataAdmissao: "2025-06-02", tipo: "CENTRAL", turnoId: null, emailApp: null, celular: null, dataAniversario: null, excluirDeRanking: true, inativoNoErp: false, motivoInatividade: null, dataInatividade: null, pesoVenda: 0.4, usaApp: false },
];

export function colaboradoresDaFilial(filialId: string): Colaborador[] {
  return colaboradores.filter((c) => c.filialId === filialId);
}

/** Vendedora elegível para ranking, meta e comissão. */
export function vendedorElegivel(c: Colaborador): boolean {
  return c.cargo === "VENDEDOR" && c.tipo === "VENDEDOR" && !c.inativoNoErp && !c.excluirDeRanking;
}

/** Identidade + vínculo mockados. O CPF é o login. */
export interface Usuario {
  vinculoId: string;
  identidadeId: string;
  nome: string;
  cpf: string;
  email: string;
  papel: Papel;
  proprietario: boolean;
  /** Filiais do escopo. Vazio para gestor = todas. */
  filiais: string[];
  colaboradorId: string | null;
  /** null = onboarding concluído. */
  onboardingEtapa: number | null;
}

export const usuarios: Usuario[] = [
  {
    vinculoId: "v-renata",
    identidadeId: "i-renata",
    nome: "Renata Albuquerque",
    cpf: cpfDeBase("111444777"),
    email: "renata@velafranquias.com.br",
    papel: "GESTOR",
    proprietario: true,
    filiais: [],
    colaboradorId: null,
    onboardingEtapa: null,
  },
  {
    vinculoId: "v-marcos",
    identidadeId: "i-marcos",
    nome: "Marcos Vieira",
    cpf: cpfDeBase("529982247"),
    email: "marcos.vieira@gmail.com",
    papel: "GERENTE",
    proprietario: false,
    filiais: ["f2"],
    colaboradorId: null,
    onboardingEtapa: null,
  },
  {
    vinculoId: "v-camila",
    identidadeId: "i-camila",
    nome: "Camila Souza",
    cpf: cpfDeBase("123456789"),
    email: "camila.souza@gmail.com",
    papel: "VENDEDOR",
    proprietario: false,
    filiais: ["f1"],
    colaboradorId: "c03",
    onboardingEtapa: null,
  },
  {
    vinculoId: "v-novo",
    identidadeId: "i-novo",
    nome: "Paulo Henrique Sá",
    cpf: cpfDeBase("987654321"),
    email: "paulo.sa@gmail.com",
    papel: "GESTOR",
    proprietario: true,
    filiais: [],
    colaboradorId: null,
    onboardingEtapa: 1,
  },
];

export function usuarioPorCpf(cpfDigitos: string): Usuario | undefined {
  return usuarios.find((u) => u.cpf === cpfDigitos);
}
