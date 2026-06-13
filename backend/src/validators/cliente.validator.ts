import { z } from "zod";

const dniRegex = /^\d{7,9}$/;

export const createClienteSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(100)
    .trim(),
  apellido: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(100)
    .trim(),
  dni: z
    .string()
    .regex(dniRegex, "DNI inválido. Debe contener entre 7 y 9 dígitos.")
    .trim(),
  domicilio: z
    .string()
    .min(5, "Domicilio demasiado corto.")
    .max(500)
    .trim(),
  cedulaDigital: z.string().max(255).trim().optional(),
  cedulaFoto: z
    .string()
    .regex(/^data:image\//, "Formato de imagen inválido")
    .nullable()
    .optional(),
});

export const updateClienteSchema = createClienteSchema.partial();

export type CreateClienteDto = z.infer<typeof createClienteSchema>;
export type UpdateClienteDto = z.infer<typeof updateClienteSchema>;
