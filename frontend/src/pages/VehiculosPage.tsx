import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { vehiculosApi } from "../api/vehiculos.api";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import { VehiculoForm, type VehiculoFormValues } from "../components/forms/VehiculoForm";
import { usePagination } from "../hooks/usePagination";
import type { Vehiculo } from "../types";

export default function VehiculosPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { page, limit, goToPage } = usePagination(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);

  const queryKey = ["vehiculos", page, limit];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => vehiculosApi.list(page, limit),
    placeholderData: (prev) => prev,
  });

  const vehiculos = useMemo(() => data?.data.data ?? [], [data]);
  const meta = data?.data.meta;

  const createMutation = useMutation({
    mutationFn: (dto: VehiculoFormValues) => vehiculosApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<VehiculoFormValues> }) =>
      vehiculosApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      setModalOpen(false);
      setEditingVehiculo(null);
    },
  });

  const openCreate = useCallback(() => {
    setEditingVehiculo(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((v: Vehiculo) => {
    setEditingVehiculo(v);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingVehiculo(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: VehiculoFormValues) => {
      if (editingVehiculo) {
        const { clienteId: _omit, ...updateData } = data;
        await updateMutation.mutateAsync({ id: editingVehiculo.id, dto: updateData });
      } else {
        await createMutation.mutateAsync(data);
      }
    },
    [editingVehiculo, updateMutation, createMutation]
  );

  const mutationError = createMutation.error || updateMutation.error;

  return (
    <div className="page-content">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Vehículos</h2>
        <button
          onClick={openCreate}
          style={{ padding: "0.6rem 1.2rem", background: "#2980b9", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 500 }}
        >
          + Registrar vehículo
        </button>
      </div>

      {mutationError && (
        <div style={{ background: "#fde8e8", color: "#c0392b", padding: "0.75rem 1rem", borderRadius: 4, marginBottom: "1rem" }}>
          {(mutationError as any)?.response?.data?.message ?? "Ocurrió un error."}
        </div>
      )}

      {isLoading && <p style={{ color: "#888" }}>Cargando vehículos...</p>}
      {isError && <p style={{ color: "#c0392b" }}>Error al cargar los vehículos.</p>}

      {!isLoading && (
        <>
          <div className="table-scroll" style={{ background: "#fff", borderRadius: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Vehículo", "Dominio", "Cliente", "Chasis / Cuadro", "KM", "Acciones"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #dee2e6", textAlign: "left", fontSize: "0.85rem", color: "#555", fontWeight: 600 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vehiculos.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                      No hay vehículos registrados.
                    </td>
                  </tr>
                )}
                {vehiculos.map((v) => (
                  <tr key={v.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>
                      {v.marca} {v.modelo}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, letterSpacing: 1 }}>
                        {v.dominio}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#555" }}>
                      {v.cliente
                        ? `${v.cliente.apellido}, ${v.cliente.nombre}`
                        : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", color: "#666" }}>
                      <div>Ch: {v.nroChasis}</div>
                      <div>Cu: {v.nroCuadro}</div>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {v.kilometraje.toLocaleString("es-AR")} km
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => navigate(`/servicios?vehiculoId=${v.id}`)}
                        style={{ marginRight: 8, padding: "0.3rem 0.7rem", border: "1px solid #27ae60", borderRadius: 4, color: "#27ae60", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Servicios
                      </button>
                      <button
                        onClick={() => openEdit(v)}
                        style={{ padding: "0.3rem 0.7rem", border: "1px solid #2980b9", borderRadius: 4, color: "#2980b9", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                      >
                        Editar
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

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingVehiculo ? "Editar vehículo" : "Registrar vehículo"}
        width={620}
      >
        <VehiculoForm
          defaultValues={editingVehiculo ?? undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isEdit={!!editingVehiculo}
        />
      </Modal>
    </div>
  );
}
