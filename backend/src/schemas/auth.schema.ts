import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  correo: z.string().trim().toLowerCase().email("Correo inválido").max(150),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100),
});

export const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});
