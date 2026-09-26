import { useEffect, useState } from "react";
import { MOBILE_QUERY, useMediaQuery } from "./useMediaQuery";

/** Padrão das tabelas da WeDash: 10 linhas por página no desktop, 5 no celular. */
export const TABLE_PAGE_SIZE = 10;
export const TABLE_PAGE_SIZE_MOBILE = 5;

/**
 * Pagina `rows` no padrão da WeDash. Volta para a página 1 quando `resetKey` muda
 * (filtro, busca, ordenação) ou quando troca desktop ↔ celular.
 */
export function usePagedRows<T>(rows: T[], resetKey?: string | number) {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const pageSize = isMobile ? TABLE_PAGE_SIZE_MOBILE : TABLE_PAGE_SIZE;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey, isMobile]);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);
  return { page: current, setPage, totalPages, pageRows, pageSize, total: rows.length };
}
