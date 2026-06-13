import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { clientesApi } from "../api/clientes.api";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { ClienteForm, type ClienteFormValues } from "../components/forms/ClienteForm";
import { usePagination } from "../hooks/usePagination";
import type { Cliente } from "../types";

export default function ClientesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { page, limit, goToPage } = usePagination(20);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Debounce búsqueda
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const t = setTimeout(() => setDebouncedSearch(value), 400);
    return () => clearTimeout(t);
  }, []);

  const queryKey = ["clientes", page, limit, debouncedSearch];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => clientesApi.list(page, limit, debouncedSearch || undefined),
    placeholderData: (prev) => prev,
  });

  const clientes = useMemo(() => data?.data.data ?? [], [data]);
  const meta = data?.data.meta;

  // ─── Mutaciones ───────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (dto: ClienteFormValues) => clientesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<ClienteFormValues> }) =>
      clientesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setModalOpen(false);
      setEditingCliente(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      setDeletingId(null);
    },
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingCliente(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((c: Cliente) => {
    setEditingCliente(c);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingCliente(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: ClienteFormValues) => {
      if (editingCliente) {
        await updateMutation.mutateAsync({ id: editingCliente.id, dto: data });
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [editingCliente, updateMutation, createMutation]
  );

  const mutationError =
    createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <div className="page-content">
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Clientes</h2>
        <button
          onClick={openCreate}
          className="btn-primary"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Búsqueda */}
      <input
        type="search"
        placeholder="Buscar por nombre, apellido o DNI..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="search-input"
      />

      {/* Error de mutación */}
      {mutationError && (
        <div style={{ background: "#fde8e8", color: "#c0392b", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem" }}>
          {(mutationError as any)?.response?.data?.message ?? "Ocurrió un error."}
        </div>
      )}

      {isLoading && <p style={{ color: "#888" }}>Cargando clientes...</p>}
      {isError && <p style={{ color: "#c0392b" }}>Error al cargar los clientes.</p>}

      {!isLoading && (
        <>
          <div className="table-scroll" style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Apellido y nombre", "DNI", "Domicilio", "Vehículos", "Acciones", "Historial"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #dee2e6", textAlign: "left", fontSize: "0.85rem", color: "#555", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                      No se encontraron clientes.
                    </td>
                  </tr>
                )}
                {clientes.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>
                      {c.apellido}, {c.nombre}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace" }}>{c.dni}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#555" }}>{c.domicilio}</td>
                    <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                      <span style={{ background: "#f0f0f0", color: "#333", padding: "0.15rem 0.5rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600 }}>
                        {c.vehiculos?.length ?? 0}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => openEdit(c)}
                        style={{ marginRight: 8, padding: "0.3rem 0.7rem", border: "1px solid #ccc", borderRadius: 8, color: "#444", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeletingId(c.id)}
                        style={{ padding: "0.3rem 0.7rem", border: "1px solid #e0b0b0", borderRadius: 8, color: "#c0392b", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Eliminar
                      </button>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => navigate(`/clientes/${c.id}`)}
                        style={{ padding: "0.3rem 0.7rem", border: "1px solid #ccc", borderRadius: 8, color: "#444", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && <Pagination meta={meta} onPageChange={goToPage} />}
        </>
      )}

      {/* Modal crear / editar */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingCliente ? "Editar cliente" : "Nuevo cliente"}
      >
        <ClienteForm
          defaultValues={editingCliente ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isEdit={!!editingCliente}
        />
      </Modal>

      {/* Confirmar eliminación */}
      <ConfirmDialog
        open={!!deletingId}
        title="Eliminar cliente"
        message="¿Estás seguro? Esta acción no se puede deshacer. Se eliminarán también los vehículos y servicios asociados."
        confirmLabel="Eliminar"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
