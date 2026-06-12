import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, inputStyle, inputErrorStyle } from "../ui/FormField";
import type { Cliente } from "../../types";

const schema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100).trim(),
  apellido: z.string().min(2, "Mínimo 2 caracteres").max(100).trim(),
  dni: z
    .string()
    .regex(/^\d{7,9}$/, "DNI inválido: entre 7 y 9 dígitos, sin puntos")
    .trim(),
  domicilio: z.string().min(5, "Domicilio muy corto").max(500).trim(),
  cedulaDigital: z.string().max(255).trim().optional().or(z.literal("")),
});

export type ClienteFormValues = z.infer<typeof schema>;

interface ClienteFormProps {
  defaultValues?: Partial<Cliente>;
  onSubmit: (data: ClienteFormValues) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function ClienteForm({
  defaultValues,
  onSubmit,
  onCancel,
  isEdit,
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      apellido: defaultValues?.apellido ?? "",
      dni: defaultValues?.dni ?? "",
      domicilio: defaultValues?.domicilio ?? "",
      cedulaDigital: defaultValues?.cedulaDigital ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
        <FormField label="Nombre" error={errors.nombre?.message} required>
          <input
            {...register("nombre")}
            style={errors.nombre ? inputErrorStyle : inputStyle}
            autoFocus
          />
        </FormField>
        <FormField label="Apellido" error={errors.apellido?.message} required>
          <input
            {...register("apellido")}
            style={errors.apellido ? inputErrorStyle : inputStyle}
          />
        </FormField>
      </div>

      <FormField label="DNI" error={errors.dni?.message} required>
        <input
          {...register("dni")}
          style={errors.dni ? inputErrorStyle : inputStyle}
          placeholder="Sin puntos ni espacios"
          maxLength={9}
          disabled={isEdit}
          title={isEdit ? "El DNI no se puede modificar" : undefined}
        />
      </FormField>

      <FormField label="Domicilio" error={errors.domicilio?.message} required>
        <input
          {...register("domicilio")}
          style={errors.domicilio ? inputErrorStyle : inputStyle}
          placeholder="Calle, número, ciudad"
        />
      </FormField>

      <FormField label="Cédula digital" error={errors.cedulaDigital?.message}>
        <input
          {...register("cedulaDigital")}
          style={errors.cedulaDigital ? inputErrorStyle : inputStyle}
          placeholder="N° de trámite o referencia (opcional)"
        />
      </FormField>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "0.55rem 1.1rem",
            border: "1px solid #ccc",
            borderRadius: 4,
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "0.55rem 1.2rem",
            background: isSubmitting ? "#95a5a6" : "#2980b9",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </form>
  );
}
