import { useState, useCallback } from "react";
import type { PaginationMeta } from "../types";

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  const goToPage = useCallback((p: number) => setPage(p), []);
  const nextPage = useCallback((meta: PaginationMeta) => {
    if (meta.hasNextPage) setPage((p) => p + 1);
  }, []);
  const prevPage = useCallback((meta: PaginationMeta) => {
    if (meta.hasPrevPage) setPage((p) => p - 1);
  }, []);

  return { page, limit, goToPage, nextPage, prevPage };
}
