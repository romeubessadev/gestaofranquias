/** Tenant fictício usado nos mocks. */
export interface Tenant {
  id: string;
  slug: string;
  nome: string;
  nomeExibicao: string;
  /** Caminho em public/. Se o arquivo não existir, a UI cai para a marca em iniciais. */
  logoUrl: string | null;
  corMarca: string | null;
}

export const tenant: Tenant = {
  id: "t-vela",
  slug: "vela",
  nome: "Vela Franquias Ltda",
  nomeExibicao: "Vela",
  // Sem logo próprio ainda: a UI usa a marca do template (o mesmo cubo da demo).
  // Para usar o logo real, coloque o arquivo em public/brand/ e aponte aqui.
  logoUrl: null,
  corMarca: null,
};

/** Marca padrão do produto, exibida quando o slug não existe. */
export const marcaPadrao = {
  nomeExibicao: "Gestão de Franquias",
  logoUrl: null as string | null,
  corMarca: null as string | null,
};
