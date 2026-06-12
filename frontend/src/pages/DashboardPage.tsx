import { useQuery } from "@tanstack/react-query";
import { serviciosApi } from "../api/servicios.api";
import { clientesApi } from "../api/clientes.api";

export default function DashboardPage() {
  const { data: pendientes } = useQuery({
    queryKey: ["servicios", "PENDIENTE"],
    queryFn: () => serviciosApi.list(1, 5, "PENDIENTE"),
    staleTime: 30_000,
  });

  const { data: enProceso } = useQuery({
    queryKey: ["servicios", "EN_PROCESO"],
    queryFn: () => serviciosApi.list(1, 5, "EN_PROCESO"),
    staleTime: 30_000,
  });

  const { data: clientes } = useQuery({
    queryKey: ["clientes-total"],
    queryFn: () => clientesApi.list(1, 1),
    staleTime: 60_000,
  });

  const totalPendientes = pendientes?.data.meta.total ?? 0;
  const totalEnProceso = enProceso?.data.meta.total ?? 0;
  const totalClientes = clientes?.data.meta.total ?? 0;

  return (
    <div className="page-content">
      <h2 style={{ marginTop: 0 }}>Dashboard</h2>

      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        {[
          { label: "Clientes registrados", value: totalClientes, color: "#2980b9" },
          { label: "Servicios pendientes", value: totalPendientes, color: "#e67e22" },
          { label: "En proceso", value: totalEnProceso, color: "#27ae60" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              border: `1px solid #eee`,
              borderLeft: `4px solid ${color}`,
              borderRadius: 6,
              padding: "1.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            <p style={{ margin: 0, color: "#666", fontSize: "0.85rem" }}>{label}</p>
            <h3 style={{ margin: "0.5rem 0 0", fontSize: "2rem", color }}>{value}</h3>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 6, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ marginTop: 0 }}>Servicios recientes en proceso</h3>
        {enProceso?.data.data.length === 0 && (
          <p style={{ color: "#888" }}>No hay servicios en proceso.</p>
        )}
        {enProceso?.data.data.map((s) => (
          <div
            key={s.id}
            style={{ padding: "0.75rem 0", borderBottom: "1px solid #f0f0f0" }}
          >
            <strong>{s.vehiculo?.marca} {s.vehiculo?.modelo}</strong> — {s.vehiculo?.dominio}
            <span style={{ marginLeft: "1rem", color: "#888", fontSize: "0.85rem" }}>
              {s.vehiculo?.cliente?.nombre} {s.vehiculo?.cliente?.apellido}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
