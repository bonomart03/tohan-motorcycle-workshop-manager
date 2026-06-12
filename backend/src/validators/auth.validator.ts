import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido.").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "Contraseña demasiado larga."),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida."),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres.")
    .max(128, "Contraseña demasiado larga.")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula.")
    .regex(/[0-9]/, "Debe contener al menos un número."),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
