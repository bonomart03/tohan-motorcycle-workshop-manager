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
  const totalEnProceso  = enProceso?.data.meta.total ?? 0;
  const totalClientes   = clientes?.data.meta.total ?? 0;

  const metrics = [
    { label: "Clientes registrados", value: totalClientes,  accent: "#000" },
    { label: "Servicios pendientes", value: totalPendientes, accent: "#e67e22" },
    { label: "En proceso",           value: totalEnProceso,  accent: "#27ae60" },
  ];

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{
          margin: 0,
          fontFamily: "'Fustat', sans-serif",
          fontSize: "clamp(24px, 3vw, 32px)",
          fontWeight: 700,
          letterSpacing: "-1px",
          color: "#000",
        }}>
          Dashboard
        </h2>
        <p style={{ margin: "0.3rem 0 0", color: "#888", fontSize: "0.88rem", fontFamily: "'Schibsted Grotesk', sans-serif" }}>
          Resumen general del taller
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        {metrics.map(({ label, value, accent }) => (
          <div
            key={label}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "1.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <p style={{ margin: 0, color: "#888", fontSize: "0.82rem", fontFamily: "'Schibsted Grotesk', sans-serif", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {label}
            </p>
            <span style={{
              fontFamily: "'Fustat', sans-serif",
              fontSize: "2.8rem",
              fontWeight: 700,
              color: accent,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Servicios en proceso */}
      <div style={{
        background: "#fff",
        borderRadius: 14,
        padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}>
        <h3 style={{
          marginTop: 0, marginBottom: "1rem",
          fontFamily: "'Schibsted Grotesk', sans-serif",
          fontSize: "0.95rem", fontWeight: 600,
          color: "#000", letterSpacing: "-0.2px",
        }}>
          Servicios en proceso
        </h3>
        {(!enProceso?.data.data.length) && (
          <p style={{ color: "#aaa", fontSize: "0.88rem", margin: 0 }}>No hay servicios en proceso.</p>
        )}
        {enProceso?.data.data.map((s) => (
          <div
            key={s.id}
            style={{
              padding: "0.75rem 0",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#000", fontFamily: "'Schibsted Grotesk', sans-serif" }}>
              {s.vehiculo?.marca} {s.vehiculo?.modelo}
              <span style={{ fontWeight: 400, color: "#888", marginLeft: 6 }}>
                {s.vehiculo?.dominio}
              </span>
            </span>
            <span style={{ color: "#aaa", fontSize: "0.82rem", fontFamily: "'Schibsted Grotesk', sans-serif" }}>
              {s.vehiculo?.cliente?.nombre} {s.vehiculo?.cliente?.apellido}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
