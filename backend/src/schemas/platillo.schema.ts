import { z } from "zod";

export const crearPlatilloSchema = z.object({
  nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100),
  categoria: z.string().trim().max(50).optional().nullable(),
  descripcion: z.string().trim().max(1000).optional().nullable(),
});

export const actualizarPlatilloSchema = z
  .object({
    nombre: z.string().trim().min(2, "El nombre es obligatorio").max(100).optional(),
    categoria: z.string().trim().max(50).optional().nullable(),
    descripcion: z.string().trim().max(1000).optional().nullable(),
    activo: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No se enviaron campos para actualizar",
  });
