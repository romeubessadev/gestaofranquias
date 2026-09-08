import { useState } from "react";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/pages/auth/authKit";
import { tenant } from "@/data/gestao/tenant";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

export interface MarcaProps {
  size?: number;
  nome?: string;
  logoUrl?: string | null;
  /**
   * O que mostrar sem logo do tenant. "simbolo" usa o BrandMark do template,
   * a mesma marca da demo; "iniciais" usa as letras do nome, para prévias
   * onde a marca ainda está sendo criada.
   */
  fallback?: "simbolo" | "iniciais";
  className?: string;
}

/** Marca do tenant: logo próprio se existir, senão a marca do template. */
export function Marca({ size = 34, nome = tenant.nomeExibicao, logoUrl = tenant.logoUrl, fallback = "simbolo", className }: MarcaProps) {
  const [falhou, setFalhou] = useState(false);

  if (logoUrl && !falhou) {
    return (
      <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-[10px]", className)} style={{ width: size, height: size }}>
        <img src={logoUrl} alt={nome} className="h-full w-full object-contain" onError={() => setFalhou(true)} />
      </span>
    );
  }

  if (fallback === "simbolo") {
    return (
      <span className={cn("flex shrink-0", className)}>
        <BrandMark size={size} />
      </span>
    );
  }

  return (
    <span
      className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] font-extrabold text-white", className)}
      style={{ width: size, height: size, background: "linear-gradient(135deg,var(--acc),var(--acc-2))", fontSize: size * 0.38 }}
      aria-label={nome}
    >
      {iniciais(nome)}
    </span>
  );
}

/** Marca com o nome ao lado, no formato da demo: nome seguido de ponto em destaque. */
export function MarcaComNome({ size = 34, nome = tenant.nomeExibicao, logoUrl = tenant.logoUrl, fallback = "simbolo", claro = false, ponto = true }: MarcaProps & { claro?: boolean; ponto?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Marca size={size} nome={nome} logoUrl={logoUrl} fallback={fallback} />
      {nome && (
        <span className={cn("truncate text-[17px] font-extrabold tracking-tight", claro ? "text-white" : "text-t0")}>
          {nome}
          {ponto && <span className={claro ? "text-acc-2" : "text-acc"}>.</span>}
        </span>
      )}
    </span>
  );
}
