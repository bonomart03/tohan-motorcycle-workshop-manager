import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { serviciosApi } from "../api/servicios.api";
import { Pagination } from "../components/ui/Pagination";
import { Modal } from "../components/ui/Modal";
import { ServicioForm, type ServicioFormValues } from "../components/forms/ServicioForm";
import { usePagination } from "../hooks/usePagination";
import type { EstadoServicio } from "../types";

const ESTADO_LABELS: Record<EstadoServicio, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COMPLETADO: "Completado",
  ENTREGADO: "Entregado",
};

const ESTADO_COLORS: Record<EstadoServicio, string> = {
  PENDIENTE: "#e67e22",
  EN_PROCESO: "#2980b9",
  COMPLETADO: "#27ae60",
  ENTREGADO: "#95a5a6",
};

export default function ServiciosPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { page, limit, goToPage } = usePagination(20);

  const [estadoFiltro, setEstadoFiltro] = useState<EstadoServicio | undefined>();
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Si viene de VehiculosPage con ?vehiculoId=xxx, pre-seleccionar
  const lockedVehiculoId = searchParams.get("vehiculoId") ?? undefined;

  const queryKey = ["servicios", page, limit, estadoFiltro, fechaDesde, fechaHasta];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => serviciosApi.list(page, limit, estadoFiltro, fechaDesde || undefined, fechaHasta || undefined),
    placeholderData: (prev) => prev,
  });

  const servicios = useMemo(() => data?.data.data ?? [], [data]);
  const meta = data?.data.meta;

  const createMutation = useMutation({
    mutationFn: (dto: ServicioFormValues) => serviciosApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
      setModalOpen(false);
    },
  });

  const handleFormSubmit = useCallback(
    async (data: ServicioFormValues) => {
      await createMutation.mutateAsync(data);
    },
    [createMutation]
  );

  return (
    <div className="page-content">
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>Servicios</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
        >
          + Registrar ingreso
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-bar" style={{ marginBottom: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        {/* Chips de estado */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            onClick={() => { setEstadoFiltro(undefined); goToPage(1); }}
            style={{ padding: "0.4rem 0.9rem", background: !estadoFiltro ? "#0e1311" : "#eee", color: !estadoFiltro ? "#fff" : "#444", border: "none", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem", fontWeight: !estadoFiltro ? 600 : 400 }}
          >
            Todos {!estadoFiltro && meta ? `(${meta.total})` : ""}
          </button>
          {(Object.keys(ESTADO_LABELS) as EstadoServicio[]).map((e) => (
            <button
              key={e}
              onClick={() => { setEstadoFiltro(e); goToPage(1); }}
              style={{ padding: "0.4rem 0.9rem", background: estadoFiltro === e ? ESTADO_COLORS[e] : "#eee", color: estadoFiltro === e ? "#fff" : "#444", border: "none", borderRadius: 20, cursor: "pointer", fontSize: "0.85rem", fontWeight: estadoFiltro === e ? 600 : 400 }}
            >
              {ESTADO_LABELS[e]}
            </button>
          ))}
        </div>

        {/* Separador */}
        <div className="filters-divider" style={{ width: 1, height: 28, background: "#ddd" }} />

        {/* Rango de fechas */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}>
          <span style={{ color: "#666" }}>Desde</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => { setFechaDesde(e.target.value); goToPage(1); }}
            style={{ padding: "0.35rem 0.5rem", border: "1px solid #ccc", borderRadius: 4, fontSize: "0.85rem" }}
          />
          <span style={{ color: "#666" }}>hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => { setFechaHasta(e.target.value); goToPage(1); }}
            style={{ padding: "0.35rem 0.5rem", border: "1px solid #ccc", borderRadius: 4, fontSize: "0.85rem" }}
          />
          {(fechaDesde || fechaHasta) && (
            <button
              onClick={() => { setFechaDesde(""); setFechaHasta(""); goToPage(1); }}
              style={{ padding: "0.3rem 0.6rem", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: "0.8rem", color: "#888" }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {createMutation.error && (
        <div style={{ background: "#fde8e8", color: "#c0392b", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem" }}>
          {(createMutation.error as any)?.response?.data?.message ?? "Ocurrió un error."}
        </div>
      )}

      {isLoading && <p style={{ color: "#888" }}>Cargando servicios...</p>}

      <div className="table-scroll" style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              {["Fecha ingreso", "Vehículo", "Cliente", "KM", "Estado", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "0.75rem 1rem", borderBottom: "2px solid #dee2e6", textAlign: "left", fontSize: "0.85rem", color: "#555", fontWeight: 600 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {servicios.length === 0 && !isLoading && (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                  No hay servicios{estadoFiltro ? ` con estado "${ESTADO_LABELS[estadoFiltro]}"` : ""}.
                </td>
              </tr>
            )}
            {servicios.map((s) => (
              <tr
                key={s.id}
                style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}
                onClick={() => navigate(`/servicios/${s.id}`)}
              >
                <td style={{ padding: "0.75rem 1rem" }}>
                  {new Date(s.fechaIngreso).toLocaleDateString("es-AR")}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{ fontWeight: 500 }}>{s.vehiculo?.marca} {s.vehiculo?.modelo}</span>
                  <br />
                  <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#555" }}>
                    {s.vehiculo?.dominio}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", color: "#555" }}>
                  {s.vehiculo?.cliente?.apellido}, {s.vehiculo?.cliente?.nombre}
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  {s.kmIngreso.toLocaleString("es-AR")} km
                </td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{
                    padding: "0.2rem 0.65rem",
                    borderRadius: 12,
                    background: ESTADO_COLORS[s.estado] + "22",
                    color: ESTADO_COLORS[s.estado],
                    fontWeight: 600,
                    fontSize: "0.8rem",
                  }}>
                    {ESTADO_LABELS[s.estado]}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/servicios/${s.id}`)}
                    style={{ padding: "0.3rem 0.7rem", border: "1px solid #ccc", borderRadius: 8, color: "#444", background: "#fff", cursor: "pointer", fontSize: "0.85rem" }}
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && <Pagination meta={meta} onPageChange={goToPage} />}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar ingreso de vehículo"
        width={580}
      >
        <ServicioForm
          lockedVehiculoId={lockedVehiculoId}
          onSubmit={handleFormSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
