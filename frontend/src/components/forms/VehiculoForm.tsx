import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { FormField, inputStyle, inputErrorStyle } from "../ui/FormField";
import { clientesApi } from "../../api/clientes.api";
import type { Vehiculo } from "../../types";

const schema = z.object({
  clienteId: z.string().uuid("Selecciona un cliente"),
  marca: z.string().min(2, "Mínimo 2 caracteres").max(100).trim(),
  modelo: z.string().min(1, "Requerido").max(100).trim(),
  dominio: z
    .string()
    .toUpperCase()
    .regex(/^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/, "Formato: AAA123 o AB123CD")
    .trim(),
  nroChasis: z.string().min(5, "Mínimo 5 caracteres").max(50).trim().toUpperCase(),
  nroCuadro: z.string().min(5, "Mínimo 5 caracteres").max(50).trim().toUpperCase(),
  kilometraje: z.coerce.number({ invalid_type_error: "Ingresá un número" }).int().min(0).max(9_999_999),
});

export type VehiculoFormValues = z.infer<typeof schema>;

interface VehiculoFormProps {
  defaultValues?: Partial<Vehiculo>;
  lockedClienteId?: string;
  onSubmit: (data: VehiculoFormValues) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function VehiculoForm({
  defaultValues,
  lockedClienteId,
  onSubmit,
  onCancel,
  isEdit,
}: VehiculoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VehiculoFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clienteId: lockedClienteId ?? defaultValues?.clienteId ?? "",
      marca: defaultValues?.marca ?? "",
      modelo: defaultValues?.modelo ?? "",
      dominio: defaultValues?.dominio ?? "",
      nroChasis: defaultValues?.nroChasis ?? "",
      nroCuadro: defaultValues?.nroCuadro ?? "",
      kilometraje: defaultValues?.kilometraje ?? 0,
    },
  });

  // Carga clientes para el selector (solo 100 primeros; suficiente para selector)
  const { data: clientesData } = useQuery({
    queryKey: ["clientes-selector"],
    queryFn: () => clientesApi.list(1, 100),
    staleTime: 60_000,
    enabled: !lockedClienteId,
  });
  const clientes = clientesData?.data.data ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Selector de cliente */}
      {!lockedClienteId && (
        <FormField label="Cliente" error={errors.clienteId?.message} required>
          <select
            {...register("clienteId")}
            style={{ ...inputStyle, background: "#fff" }}
            defaultValue=""
          >
            <option value="" disabled>
              — Seleccionar cliente —
            </option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.apellido}, {c.nombre} — DNI {c.dni}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
        <FormField label="Marca" error={errors.marca?.message} required>
          <input {...register("marca")} style={errors.marca ? inputErrorStyle : inputStyle} autoFocus />
        </FormField>
        <FormField label="Modelo" error={errors.modelo?.message} required>
          <input {...register("modelo")} style={errors.modelo ? inputErrorStyle : inputStyle} />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
        <FormField label="Dominio / Patente" error={errors.dominio?.message} required>
          <input
            {...register("dominio")}
            style={errors.dominio ? inputErrorStyle : inputStyle}
            placeholder="AAA123 o AB123CD"
            disabled={isEdit}
          />
        </FormField>
        <FormField label="Kilometraje actual" error={errors.kilometraje?.message} required>
          <input
            {...register("kilometraje")}
            type="number"
            min={0}
            style={errors.kilometraje ? inputErrorStyle : inputStyle}
          />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
        <FormField label="N° de chasis" error={errors.nroChasis?.message} required>
          <input
            {...register("nroChasis")}
            style={errors.nroChasis ? inputErrorStyle : inputStyle}
            disabled={isEdit}
          />
        </FormField>
        <FormField label="N° de cuadro" error={errors.nroCuadro?.message} required>
          <input
            {...register("nroCuadro")}
            style={errors.nroCuadro ? inputErrorStyle : inputStyle}
            disabled={isEdit}
          />
        </FormField>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button type="button" onClick={onCancel} style={{ padding: "0.55rem 1.1rem", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer" }}>
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: "0.55rem 1.2rem", background: isSubmitting ? "#95a5a6" : "#2980b9", color: "#fff", border: "none", borderRadius: 4, cursor: isSubmitting ? "not-allowed" : "pointer" }}
        >
          {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar vehículo"}
        </button>
      </div>
    </form>
  );
}
