import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Email inválido.").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres.")
    .max(128)
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula.")
    .regex(/[0-9]/, "Debe incluir al menos un número."),
  nombre: z.string().min(2).max(100).trim(),
  rol: z.enum(["ADMIN", "MECANICO"]).default("MECANICO"),
});

export const updateUserSchema = z.object({
  activo: z.boolean(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
