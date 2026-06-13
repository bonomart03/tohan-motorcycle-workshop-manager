import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { clientesApi } from "../api/clientes.api";
import type { ClienteDetail, EstadoServicio } from "../types";

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

function Badge({ estado }: { estado: EstadoServicio }) {
  return (
    <span style={{
      padding: "0.2rem 0.65rem",
      borderRadius: 12,
      background: ESTADO_COLORS[estado] + "22",
      color: ESTADO_COLORS[estado],
      fontWeight: 600,
      fontSize: "0.8rem",
      whiteSpace: "nowrap",
    }}>
      {ESTADO_LABELS[estado]}
    </span>
  );
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cliente", id],
    queryFn: () => clientesApi.get(id!),
    enabled: !!id,
  });

  const cliente = data?.data.data as ClienteDetail | undefined;

  if (isLoading) return <div style={{ padding: "2rem", color: "#888" }}>Cargando historial...</div>;
  if (isError || !cliente) return <div style={{ padding: "2rem", color: "#c0392b" }}>Cliente no encontrado.</div>;

  const totalServicios = cliente.vehiculos?.reduce((sum, v) => sum + (v.servicios?.length ?? 0), 0) ?? 0;

  return (
    <div className="page-content" style={{ maxWidth: 1000 }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => navigate("/clientes")}
          style={{ padding: "0.4rem 0.8rem", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: "0.9rem" }}
        >
          ← Volver
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>
          Historial — {cliente.apellido}, {cliente.nombre}
        </h2>
        <span style={{ fontSize: "0.85rem", color: "#888" }}>
          {totalServicios} servicio{totalServicios !== 1 ? "s" : ""} en total
        </span>
      </div>

      {/* Info cliente */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem 2rem" }}>
        <div>
          <span style={{ fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>DNI</span>
          <p style={{ margin: "0.1rem 0 0", fontFamily: "monospace", fontWeight: 600 }}>{cliente.dni}</p>
        </div>
        <div>
          <span style={{ fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Domicilio</span>
          <p style={{ margin: "0.1rem 0 0" }}>{cliente.domicilio}</p>
        </div>
        {cliente.cedulaDigital && (
          <div>
            <span style={{ fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Cédula digital</span>
            <p style={{ margin: "0.1rem 0 0", fontFamily: "monospace" }}>{cliente.cedulaDigital}</p>
          </div>
        )}
        <div>
          <span style={{ fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>Vehículos</span>
          <p style={{ margin: "0.1rem 0 0", fontWeight: 600, color: "#000" }}>{cliente.vehiculos?.length ?? 0}</p>
        </div>
      </div>

      {/* Foto cédula */}
      {cliente.cedulaFoto && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem 1.5rem", marginBottom: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: "0.75rem" }}>Foto de cédula</span>
          <a href={cliente.cedulaFoto} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block" }}>
            <img
              src={cliente.cedulaFoto}
              alt="Cédula de identidad"
              style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 8, objectFit: "contain", display: "block", cursor: "zoom-in", border: "1px solid rgba(0,0,0,0.08)" }}
            />
          </a>
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#aaa" }}>Tocá la imagen para verla completa</p>
        </div>
      )}

      {/* Sin vehículos */}
      {(!cliente.vehiculos || cliente.vehiculos.length === 0) && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "2rem", textAlign: "center", color: "#888", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
          Este cliente no tiene vehículos registrados.
        </div>
      )}

      {/* Vehículos con historial de servicios */}
      {cliente.vehiculos?.map((v) => (
        <div
          key={v.id}
          style={{ background: "#fff", borderRadius: 14, marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}
        >
          {/* Encabezado vehículo */}
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>{v.marca} {v.modelo}</span>
              <span style={{ marginLeft: 10, fontFamily: "monospace", color: "#555", fontSize: "0.95rem" }}>{v.dominio}</span>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.82rem", color: "#888" }}>
              {v.nroChasis && <span>Chasis: <strong style={{ color: "#444" }}>{v.nroChasis}</strong></span>}
              {v.nroCuadro && <span>Cuadro: <strong style={{ color: "#444" }}>{v.nroCuadro}</strong></span>}
              <span>KM: <strong style={{ color: "#444" }}>{v.kilometraje.toLocaleString("es-AR")}</strong></span>
            </div>
            <span style={{ background: "#f0f0f0", color: "#333", padding: "0.2rem 0.6rem", borderRadius: 12, fontSize: "0.82rem", fontWeight: 600 }}>
              {v.servicios?.length ?? 0} servicio{(v.servicios?.length ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Tabla de servicios */}
          {(!v.servicios || v.servicios.length === 0) ? (
            <p style={{ padding: "1rem 1.5rem", color: "#aaa", margin: 0, fontSize: "0.9rem" }}>Sin servicios registrados.</p>
          ) : (
            <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Fecha ingreso", "Descripción", "KM ing.", "KM eg.", "Estado", "Costo total", ""].map((h) => (
                    <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontSize: "0.8rem", color: "#666", fontWeight: 600, borderBottom: "1px solid #eee" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.servicios.map((s) => {
                  const costo = (Number(s.costoManoObra) || 0) + (Number(s.costoRepuestos) || 0);
                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "0.65rem 1rem", fontSize: "0.88rem", whiteSpace: "nowrap" }}>
                        {new Date(s.fechaIngreso).toLocaleDateString("es-AR")}
                      </td>
                      <td style={{ padding: "0.65rem 1rem", fontSize: "0.88rem", maxWidth: 280 }}>
                        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                          {s.descripcion}
                        </span>
                      </td>
                      <td style={{ padding: "0.65rem 1rem", fontSize: "0.88rem", color: "#555" }}>
                        {s.kmIngreso.toLocaleString("es-AR")}
                      </td>
                      <td style={{ padding: "0.65rem 1rem", fontSize: "0.88rem", color: "#555" }}>
                        {s.kmEgreso ? s.kmEgreso.toLocaleString("es-AR") : "—"}
                      </td>
                      <td style={{ padding: "0.65rem 1rem" }}>
                        <Badge estado={s.estado} />
                      </td>
                      <td style={{ padding: "0.65rem 1rem", fontSize: "0.88rem", fontWeight: costo > 0 ? 600 : 400, color: costo > 0 ? "#27ae60" : "#aaa" }}>
                        {costo > 0 ? `$${costo.toLocaleString("es-AR", { minimumFractionDigits: 2 })}` : "—"}
                      </td>
                      <td style={{ padding: "0.65rem 1rem" }}>
                        <Link
                          to={`/servicios/${s.id}`}
                          style={{ color: "#444", fontSize: "0.82rem", textDecoration: "none", border: "1px solid #ccc", padding: "0.2rem 0.55rem", borderRadius: 8 }}
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>
      ))}
    </div>
  );
}
