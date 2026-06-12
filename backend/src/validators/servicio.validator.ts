import { z } from "zod";

export const createServicioSchema = z.object({
  vehiculoId: z.string().uuid("ID de vehículo inválido."),
  descripcion: z.string().min(10, "Descripción muy corta.").max(2000).trim(),
  kmIngreso: z.number().int().min(0).max(9_999_999),
});

export const updateServicioSchema = z.object({
  diagnostico: z.string().max(2000).trim().optional(),
  trabajosRealizados: z.string().max(2000).trim().optional(),
  repuestosUtilizados: z.string().max(2000).trim().optional(),
  costoManoObra: z.number().min(0).max(99_999_999).optional(),
  costoRepuestos: z.number().min(0).max(99_999_999).optional(),
  kmEgreso: z.number().int().min(0).max(9_999_999).optional(),
  estado: z
    .enum(["PENDIENTE", "EN_PROCESO", "COMPLETADO", "ENTREGADO"])
    .optional(),
  fechaSalida: z.string().datetime().optional(),
});

export type CreateServicioDto = z.infer<typeof createServicioSchema>;
export type UpdateServicioDto = z.infer<typeof updateServicioSchema>;
