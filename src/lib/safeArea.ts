import type { CSSProperties } from "react";

/**
 * Espaçamento que respeita as áreas ocupadas pelo sistema no celular:
 * barra de status no topo e barra de gestos na base.
 *
 * Usar junto das classes `pad-topo`, `pad-base` ou `pos-base` (definidas em
 * index.css). O valor informado aqui é o espaçamento normal do elemento; o
 * acréscimo da área do sistema é somado pelo CSS, e só onde o navegador
 * suporta env(). Onde não suporta, fica o espaçamento normal.
 */
export function padTopo(base: string): CSSProperties {
  return { "--pad-topo": base } as CSSProperties;
}

export function padBase(base: string): CSSProperties {
  return { "--pad-base": base } as CSSProperties;
}

export function posBase(base: string): CSSProperties {
  return { "--pos-base": base } as CSSProperties;
}

/** Combina espaçamento de topo e base num único objeto de estilo. */
export function padTopoEBase(topo: string, base: string): CSSProperties {
  return { "--pad-topo": topo, "--pad-base": base } as CSSProperties;
}
