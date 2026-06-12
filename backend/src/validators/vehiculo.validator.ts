import { z } from "zod";

// Dominio argentino: AAA000 o AA000AA (nuevo formato)
const dominioRegex = /^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/;

export const createVehiculoSchema = z.object({
  clienteId: z.string().uuid("ID de cliente inválido."),
  marca: z.string().min(2).max(100).trim(),
  modelo: z.string().min(1).max(100).trim(),
  dominio: z
    .string()
    .toUpperCase()
    .regex(dominioRegex, "Dominio/patente inválido.")
    .trim(),
  nroChasis: z.string().min(5).max(50).trim().toUpperCase(),
  nroCuadro: z.string().min(5).max(50).trim().toUpperCase(),
  kilometraje: z.number().int().min(0).max(9_999_999),
});

export const updateVehiculoSchema = createVehiculoSchema
  .omit({ clienteId: true })
  .partial();

export type CreateVehiculoDto = z.infer<typeof createVehiculoSchema>;
export type UpdateVehiculoDto = z.infer<typeof updateVehiculoSchema>;
