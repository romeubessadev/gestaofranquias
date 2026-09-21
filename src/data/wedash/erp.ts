/**
 * Simulação das chamadas ao ERP Millenium feitas em tempo real durante o
 * onboarding. Nada sai da máquina: tudo responde com atraso artificial.
 */
import { filiais, type Filial } from "./filiais";
import { colaboradores } from "./equipe";
import { cpfDeBase } from "@/lib/cpf";

function esperar(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export type ResultadoLoginErp = { ok: true } | { ok: false; motivo: "senha" | "ocupado" | "outro" };

/**
 * Testa o login no ERP. Para a demonstração, a senha decide o resultado:
 *  - "errada"  → senha inválida
 *  - "ocupado" → usuário já conectado ao ERP
 *  - "falha"   → não foi possível conectar
 *  - qualquer outra → sucesso
 */
export async function testarLoginErp(usuario: string, senha: string): Promise<ResultadoLoginErp> {
  await esperar(1400);
  if (!usuario.trim()) return { ok: false, motivo: "senha" };
  const s = senha.trim().toLowerCase();
  if (s === "errada") return { ok: false, motivo: "senha" };
  if (s === "ocupado") return { ok: false, motivo: "ocupado" };
  if (s === "falha") return { ok: false, motivo: "outro" };
  return { ok: true };
}

export interface FilialErp {
  filial: number;
  codFilial: string;
  nome: string;
  fantasia: string;
  cgc: string;
  cidade: string;
  estado: string;
  franquia: string;
  tipo: "M" | "F";
  wpink: boolean;
  dataInauguracao: string;
}

export async function listarFiliaisErp(): Promise<FilialErp[]> {
  await esperar(900);
  return filiais.map(
    (f: Filial): FilialErp => ({
      filial: f.milleniumFilial,
      codFilial: f.codFilial,
      nome: f.nome,
      fantasia: f.fantasia,
      cgc: f.cnpj,
      cidade: f.cidade,
      estado: f.uf,
      franquia: "WEPINK",
      tipo: f.tipo,
      wpink: f.temWpink,
      dataInauguracao: f.dataInauguracao,
    }),
  );
}

export interface FuncionarioErpLista {
  funcionario: number;
  codFuncionario: string;
  nome: string;
  filial: number;
  cargo: "VENDEDOR";
}

export interface FuncionarioErpDetalhe {
  funcionario: number;
  cpf: string;
  email: string | null;
  dataAdmissao: string;
  inativo: boolean;
  desativado: boolean;
  afastado: boolean;
  naoMostrarNoEvento: boolean;
}

/** FUNCIONARIOS.Lista: rápido, devolve só nome e código. */
export async function listarFuncionariosErp(filial: number): Promise<FuncionarioErpLista[]> {
  await esperar(500);
  const filialId = filiais.find((f) => f.milleniumFilial === filial)?.id;
  const lista = colaboradores
    .filter((c) => c.filialId === filialId)
    .map((c) => ({ funcionario: c.milleniumFuncionario, codFuncionario: c.codFuncionario, nome: c.nome.toUpperCase(), filial, cargo: "VENDEDOR" as const }));
  // Uma desligada que continua com cargo VENDEDOR por erro de cadastro.
  if (filialId === "f1") lista.push({ funcionario: 320, codFuncionario: "0320", nome: "JESSICA TAVARES", filial, cargo: "VENDEDOR" });
  return lista;
}

const falhasSimuladas = new Set<number>();

/** FUNCIONARIOS.Consulta: um por funcionário, lento. Falha de propósito na primeira tentativa de um deles. */
export async function consultarFuncionarioErp(funcionario: number): Promise<FuncionarioErpDetalhe> {
  await esperar(350 + (funcionario % 7) * 180);
  if (funcionario === 1037 && !falhasSimuladas.has(funcionario)) {
    falhasSimuladas.add(funcionario);
    throw new Error("timeout");
  }
  const c = colaboradores.find((x) => x.milleniumFuncionario === funcionario);
  if (funcionario === 320) {
    return { funcionario, cpf: cpfDeBase("320111222"), email: null, dataAdmissao: "2024-09-02", inativo: false, desativado: true, afastado: false, naoMostrarNoEvento: true };
  }
  if (!c) throw new Error("não encontrado");
  return {
    funcionario,
    cpf: cpfDeBase(String(funcionario).padStart(3, "0") + "455612"),
    email: c.emailApp,
    dataAdmissao: c.dataAdmissao,
    inativo: false,
    desativado: false,
    afastado: false,
    naoMostrarNoEvento: false,
  };
}

/** Slugs já ocupados ou reservados, para a checagem ao digitar. */
const SLUGS_OCUPADOS = ["wepink", "vela", "perfumaria", "loja"];
const SLUGS_RESERVADOS = ["www", "api", "app", "admin", "static", "assets", "cdn", "mail", "ftp", "status", "suporte", "painel"];

export type SituacaoSlug = "disponivel" | "ocupado" | "reservado" | "invalido" | "vazio";

export function validarSlug(slug: string): SituacaoSlug {
  if (!slug) return "vazio";
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])?$/.test(slug)) return "invalido";
  if (SLUGS_RESERVADOS.includes(slug)) return "reservado";
  if (SLUGS_OCUPADOS.includes(slug)) return "ocupado";
  return "disponivel";
}

export async function verificarSlug(slug: string): Promise<SituacaoSlug> {
  await esperar(450);
  return validarSlug(slug);
}
