import { z } from "zod";
import { ROLES_OPERATIVOS } from "../types/usuario.js";

export const crearUsuarioSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  correo: z.string().trim().toLowerCase().email("Correo inválido").max(150),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100),
  rol: z.enum(ROLES_OPERATIVOS, {
    errorMap: () => ({
      message: `Rol inválido. Válidos: ${ROLES_OPERATIVOS.join(", ")}`,
    }),
  }),
});

export const actualizarUsuarioSchema = z
  .object({
    nombre: z.string().trim().min(2).max(100).optional(),
    correo: z.string().trim().toLowerCase().email("Correo inválido").max(150).optional(),
    rol: z.enum(ROLES_OPERATIVOS).optional(),
    activo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No se enviaron campos para actualizar",
  });
