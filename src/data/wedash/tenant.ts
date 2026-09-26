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
  id: "t-wedash",
  slug: "wedash",
  nome: "WeDash Demo Ltda",
  nomeExibicao: "WeDash",
  // Sem logo próprio ainda: a UI usa BrandMark “WE”.
  // Para usar logo real, coloque em public/ e aponte o caminho aqui.
  logoUrl: null,
  corMarca: null,
};

/** Marca padrão do produto, exibida quando o slug não existe. */
export const marcaPadrao = {
  nomeExibicao: "WeDash",
  logoUrl: null as string | null,
  corMarca: null as string | null,
};
