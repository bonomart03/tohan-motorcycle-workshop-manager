import { useRef, useState } from "react";
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
  cedulaFoto: z
    .string()
    .regex(/^data:image\//, "Formato de imagen inválido")
    .nullable()
    .optional(),
});

export type ClienteFormValues = z.infer<typeof schema>;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1200;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ClienteFormProps {
  defaultValues?: Partial<Cliente>;
  onSubmit: (data: ClienteFormValues) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const btnSecondaryStyle: React.CSSProperties = {
  padding: "0.35rem 0.8rem",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 8,
  background: "#fff",
  cursor: "pointer",
  fontSize: "0.85rem",
  color: "#333",
};

export function ClienteForm({
  defaultValues,
  onSubmit,
  onCancel,
  isEdit,
}: ClienteFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.cedulaFoto ?? null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
      setValue("cedulaFoto", compressed);
    } catch {
      // compression failure: silently ignore
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setValue("cedulaFoto", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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

      <FormField label="Foto de cédula" error={errors.cedulaFoto?.message}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        {photoPreview ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <img
              src={photoPreview}
              alt="Foto cédula"
              style={{
                maxWidth: "100%",
                maxHeight: 200,
                borderRadius: 8,
                objectFit: "contain",
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#f8f8f8",
              }}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={btnSecondaryStyle}
              >
                Cambiar foto
              </button>
              <button
                type="button"
                onClick={removePhoto}
                style={{ ...btnSecondaryStyle, color: "#c0392b", borderColor: "#e0a0a0" }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "0.75rem 1rem",
              border: "2px dashed rgba(0,0,0,0.15)",
              borderRadius: 10,
              background: "rgba(0,0,0,0.02)",
              cursor: "pointer",
              color: "#666",
              fontSize: "0.9rem",
              width: "100%",
              textAlign: "center",
            }}
          >
            Subir foto de cédula (opcional)
          </button>
        )}
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
