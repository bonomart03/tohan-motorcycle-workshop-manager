import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { serviciosApi } from "../api/servicios.api";
import { FormField, inputStyle, inputErrorStyle } from "../components/ui/FormField";
import type { EstadoServicio } from "../types";

// ─── Esquema del formulario de trabajo ────────────────────────────────────────
const trabajoSchema = z.object({
  diagnostico: z.string().max(2000).trim().optional().or(z.literal("")),
  trabajosRealizados: z.string().max(2000).trim().optional().or(z.literal("")),
  repuestosUtilizados: z.string().max(2000).trim().optional().or(z.literal("")),
  costoManoObra: z.coerce.number().min(0).optional(),
  costoRepuestos: z.coerce.number().min(0).optional(),
  kmEgreso: z.coerce.number().int().min(0).optional(),
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "ENTREGADO"]),
});
type TrabajoFormValues = z.infer<typeof trabajoSchema>;

// ─── Colores por estado ────────────────────────────────────────────────────────
const ESTADO_COLOR: Record<EstadoServicio, string> = {
  PENDIENTE: "#e67e22",
  EN_PROCESO: "#2980b9",
  COMPLETADO: "#27ae60",
  ENTREGADO: "#95a5a6",
};
const ESTADO_LABEL: Record<EstadoServicio, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COMPLETADO: "Completado",
  ENTREGADO: "Entregado",
};

// ─── Utilidades UI ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", marginBottom: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.06)" }}>
      <h4 style={{ margin: "0 0 1rem", color: "#333", borderBottom: "1px solid #f0f0f0", paddingBottom: "0.6rem" }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
      <span style={{ color: "#888", minWidth: 160 }}>{label}:</span>
      <span style={{ color: "#222", fontWeight: 500 }}>{value ?? "—"}</span>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ServicioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["servicio", id],
    queryFn: () => serviciosApi.get(id!),
    enabled: !!id,
  });

  const servicio = data?.data.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<TrabajoFormValues>({
    resolver: zodResolver(trabajoSchema),
    values: servicio
      ? {
          diagnostico: servicio.diagnostico ?? "",
          trabajosRealizados: servicio.trabajosRealizados ?? "",
          repuestosUtilizados: servicio.repuestosUtilizados ?? "",
          costoManoObra: servicio.costoManoObra ?? undefined,
          costoRepuestos: servicio.costoRepuestos ?? undefined,
          kmEgreso: servicio.kmEgreso ?? undefined,
          estado: servicio.estado,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (dto: Partial<TrabajoFormValues>) =>
      serviciosApi.update(id!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servicio", id] });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
      setSaveSuccess(true);
      reset(undefined, { keepValues: true });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const onSubmit = useCallback(
    async (data: TrabajoFormValues) => {
      await updateMutation.mutateAsync(data);
    },
    [updateMutation]
  );

  // ─── Acción rápida: avanzar estado ────────────────────────────────────────
  const advanceEstado = useCallback(async () => {
    if (!servicio) return;
    const next: Record<EstadoServicio, EstadoServicio | null> = {
      PENDIENTE: "EN_PROCESO",
      EN_PROCESO: "COMPLETADO",
      COMPLETADO: "ENTREGADO",
      ENTREGADO: null,
    };
    const nextEstado = next[servicio.estado];
    if (!nextEstado) return;
    const payload: any = { estado: nextEstado };
    if (nextEstado === "ENTREGADO" && !servicio.fechaSalida) {
      payload.fechaSalida = new Date().toISOString();
    }
    await updateMutation.mutateAsync(payload);
  }, [servicio, updateMutation]);

  if (isLoading) return <div style={{ padding: "2rem", color: "#888" }}>Cargando servicio...</div>;
  if (isError || !servicio)
    return <div style={{ padding: "2rem", color: "#c0392b" }}>Servicio no encontrado.</div>;

  const costoTotal =
    (Number(servicio.costoManoObra) || 0) + (Number(servicio.costoRepuestos) || 0);

  return (
    <div className="page-content" style={{ maxWidth: 900 }}>
      {/* Encabezado solo visible al imprimir */}
      <div className="print-header">
        <h2 style={{ margin: "0 0 0.25rem" }}>Taller Tohan — Orden de Servicio</h2>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
          Impreso el {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <button
          className="no-print"
          onClick={() => navigate(-1)}
          style={{ padding: "0.4rem 0.8rem", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: "0.9rem" }}
        >
          ← Volver
        </button>
        <h2 style={{ margin: 0, flex: 1 }}>
          Servicio — {servicio.vehiculo?.marca} {servicio.vehiculo?.modelo}
          <span style={{ marginLeft: 12, fontFamily: "monospace", fontSize: "1rem", color: "#555" }}>
            {servicio.vehiculo?.dominio}
          </span>
        </h2>
        <span style={{
          padding: "0.35rem 0.9rem",
          borderRadius: 20,
          background: ESTADO_COLOR[servicio.estado] + "22",
          color: ESTADO_COLOR[servicio.estado],
          fontWeight: 700,
          fontSize: "0.9rem",
        }}>
          {ESTADO_LABEL[servicio.estado]}
        </span>
        {servicio.estado !== "ENTREGADO" && (
          <button
            className="no-print"
            onClick={advanceEstado}
            disabled={updateMutation.isPending}
            style={{ padding: "0.4rem 0.9rem", border: "none", borderRadius: 8, background: "#27ae60", color: "#fff", cursor: "pointer", fontWeight: 500 }}
          >
            {updateMutation.isPending ? "..." : `→ Marcar ${ESTADO_LABEL[{ PENDIENTE: "EN_PROCESO", EN_PROCESO: "COMPLETADO", COMPLETADO: "ENTREGADO", ENTREGADO: "ENTREGADO" }[servicio.estado] as EstadoServicio]}`}
          </button>
        )}
        <button
          className="no-print"
          onClick={() => window.print()}
          style={{ padding: "0.4rem 0.9rem", border: "1px solid #ccc", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: "0.9rem", color: "#333" }}
        >
          Imprimir
        </button>
      </div>

      {/* Info cliente y vehículo */}
      <div className="grid-2">
        <Section title="Cliente">
          <DataRow label="Nombre" value={`${servicio.vehiculo?.cliente?.apellido}, ${servicio.vehiculo?.cliente?.nombre}`} />
          <DataRow label="DNI" value={servicio.vehiculo?.cliente?.dni} />
          <DataRow label="Domicilio" value={servicio.vehiculo?.cliente?.domicilio} />
        </Section>
        <Section title="Vehículo">
          <DataRow label="Marca / Modelo" value={`${servicio.vehiculo?.marca} ${servicio.vehiculo?.modelo}`} />
          <DataRow label="Dominio" value={servicio.vehiculo?.dominio} />
          <DataRow label="Chasis" value={servicio.vehiculo?.nroChasis} />
          <DataRow label="Cuadro" value={servicio.vehiculo?.nroCuadro} />
        </Section>
      </div>

      {/* Fechas y km */}
      <Section title="Datos del servicio">
        <div className="grid-4">
          <DataRow label="Fecha ingreso" value={new Date(servicio.fechaIngreso).toLocaleDateString("es-AR")} />
          <DataRow label="Fecha salida" value={servicio.fechaSalida ? new Date(servicio.fechaSalida).toLocaleDateString("es-AR") : "En taller"} />
          <DataRow label="KM ingreso" value={`${servicio.kmIngreso.toLocaleString("es-AR")} km`} />
          <DataRow label="KM egreso" value={servicio.kmEgreso ? `${servicio.kmEgreso.toLocaleString("es-AR")} km` : "—"} />
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <DataRow label="Descripción inicial" value={servicio.descripcion} />
          <DataRow label="Mecánico asignado" value={servicio.mecanico?.nombre} />
        </div>
      </Section>

      {/* Formulario de trabajo */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Section title="Diagnóstico y trabajos">
          <FormField label="Diagnóstico" error={errors.diagnostico?.message}>
            <textarea
              {...register("diagnostico")}
              rows={3}
              placeholder="Falla detectada, causa..."
              style={{ ...(errors.diagnostico ? inputErrorStyle : inputStyle), resize: "vertical" }}
            />
          </FormField>
          <FormField label="Trabajos realizados" error={errors.trabajosRealizados?.message}>
            <textarea
              {...register("trabajosRealizados")}
              rows={3}
              placeholder="Descripción de la reparación efectuada..."
              style={{ ...(errors.trabajosRealizados ? inputErrorStyle : inputStyle), resize: "vertical" }}
            />
          </FormField>
          <FormField label="Repuestos utilizados" error={errors.repuestosUtilizados?.message}>
            <textarea
              {...register("repuestosUtilizados")}
              rows={2}
              placeholder="Lista de repuestos, referencias, etc..."
              style={{ ...(errors.repuestosUtilizados ? inputErrorStyle : inputStyle), resize: "vertical" }}
            />
          </FormField>
        </Section>

        <Section title="Costos y egreso">
          <div className="grid-3">
            <FormField label="Costo mano de obra ($)" error={errors.costoManoObra?.message}>
              <input
                {...register("costoManoObra")}
                type="number"
                min={0}
                step={0.01}
                style={errors.costoManoObra ? inputErrorStyle : inputStyle}
              />
            </FormField>
            <FormField label="Costo repuestos ($)" error={errors.costoRepuestos?.message}>
              <input
                {...register("costoRepuestos")}
                type="number"
                min={0}
                step={0.01}
                style={errors.costoRepuestos ? inputErrorStyle : inputStyle}
              />
            </FormField>
            <FormField label="KM al egreso" error={errors.kmEgreso?.message}>
              <input
                {...register("kmEgreso")}
                type="number"
                min={0}
                style={errors.kmEgreso ? inputErrorStyle : inputStyle}
              />
            </FormField>
          </div>

          {costoTotal > 0 && (
            <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "#f8f9fa", borderRadius: 4, display: "flex", gap: "2rem" }}>
              <span style={{ fontSize: "0.9rem", color: "#555" }}>
                Total: <strong style={{ color: "#27ae60", fontSize: "1.1rem" }}>
                  ${costoTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>
          )}

          <FormField label="Estado" error={errors.estado?.message}>
            <select
              {...register("estado")}
              style={{ ...inputStyle, background: "#fff" }}
            >
              {(Object.keys(ESTADO_LABEL) as EstadoServicio[]).map((e) => (
                <option key={e} value={e}>{ESTADO_LABEL[e]}</option>
              ))}
            </select>
          </FormField>
        </Section>

        {/* Feedback y botón */}
        {updateMutation.error && (
          <div style={{ background: "#fde8e8", color: "#c0392b", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem" }}>
            {(updateMutation.error as any)?.response?.data?.message ?? "Error al guardar."}
          </div>
        )}
        {saveSuccess && (
          <div style={{ background: "#d5f5e3", color: "#196f3d", padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem" }}>
            Cambios guardados correctamente.
          </div>
        )}

        <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => reset()}
            disabled={!isDirty || isSubmitting}
            style={{ padding: "0.6rem 1.1rem", border: "1px solid #ccc", borderRadius: 10, background: "#fff", cursor: isDirty ? "pointer" : "not-allowed", opacity: isDirty ? 1 : 0.5 }}
          >
            Descartar cambios
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            style={{ padding: "0.6rem 1.4rem", background: !isDirty || isSubmitting ? "#95a5a6" : "#000", color: "#fff", border: "none", borderRadius: 10, cursor: !isDirty || isSubmitting ? "not-allowed" : "pointer", fontWeight: 600 }}
          >
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
