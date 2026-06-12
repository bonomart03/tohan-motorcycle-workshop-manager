import React from "react";
import type { PaginationMeta } from "../../types";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

// ✅ React.memo: evita re-renders si meta no cambia
export const Pagination = React.memo(function Pagination({
  meta,
  onPageChange,
}: PaginationProps) {
  const { page, totalPages, total, hasNextPage, hasPrevPage } = meta;

  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginTop: "1rem",
      }}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        style={{ padding: "0.4rem 0.8rem", cursor: hasPrevPage ? "pointer" : "not-allowed" }}
      >
        ← Anterior
      </button>

      <span style={{ fontSize: "0.9rem", color: "#555" }}>
        Página {page} de {totalPages} ({total} registros)
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        style={{ padding: "0.4rem 0.8rem", cursor: hasNextPage ? "pointer" : "not-allowed" }}
      >
        Siguiente →
      </button>
    </div>
  );
});
