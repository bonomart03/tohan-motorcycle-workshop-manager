import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { FormField, inputStyle, inputErrorStyle } from "../ui/FormField";
import { vehiculosApi } from "../../api/vehiculos.api";

const schema = z.object({
  vehiculoId: z.string().uuid("Selecciona un vehículo"),
  descripcion: z.string().min(10, "Describí el motivo del ingreso (mín. 10 caracteres)").max(2000).trim(),
  kmIngreso: z.coerce.number({ invalid_type_error: "Ingresá el kilometraje" }).int().min(0).max(9_999_999),
});

export type ServicioFormValues = z.infer<typeof schema>;

interface ServicioFormProps {
  lockedVehiculoId?: string;
  onSubmit: (data: ServicioFormValues) => Promise<void>;
  onCancel: () => void;
}

export function ServicioForm({ lockedVehiculoId, onSubmit, onCancel }: ServicioFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServicioFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehiculoId: lockedVehiculoId ?? "",
      descripcion: "",
      kmIngreso: 0,
    },
  });

  const { data: vehiculosData } = useQuery({
    queryKey: ["vehiculos-selector"],
    queryFn: () => vehiculosApi.list(1, 100),
    staleTime: 60_000,
    enabled: !lockedVehiculoId,
  });
  const vehiculos = vehiculosData?.data.data ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {!lockedVehiculoId && (
        <FormField label="Vehículo" error={errors.vehiculoId?.message} required>
          <select
            {...register("vehiculoId")}
            style={{ ...inputStyle, background: "#fff" }}
            defaultValue=""
          >
            <option value="" disabled>
              — Seleccionar vehículo —
            </option>
            {vehiculos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.marca} {v.modelo} — {v.dominio}
                {v.cliente ? ` (${v.cliente.apellido}, ${v.cliente.nombre})` : ""}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Motivo de ingreso / descripción" error={errors.descripcion?.message} required>
        <textarea
          {...register("descripcion")}
          rows={4}
          placeholder="Ej: Cliente reporta ruido en motor, solicita revisión general..."
          style={{
            ...(errors.descripcion ? inputErrorStyle : inputStyle),
            resize: "vertical",
            minHeight: 80,
          }}
          autoFocus
        />
      </FormField>

      <FormField label="Kilometraje al ingreso" error={errors.kmIngreso?.message} required>
        <input
          {...register("kmIngreso")}
          type="number"
          min={0}
          style={errors.kmIngreso ? inputErrorStyle : inputStyle}
        />
      </FormField>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ padding: "0.55rem 1.1rem", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer" }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ padding: "0.55rem 1.2rem", background: isSubmitting ? "#95a5a6" : "#27ae60", color: "#fff", border: "none", borderRadius: 4, cursor: isSubmitting ? "not-allowed" : "pointer" }}
        >
          {isSubmitting ? "Registrando..." : "Registrar ingreso"}
        </button>
      </div>
    </form>
  );
}
