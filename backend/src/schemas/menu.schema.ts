import { z } from "zod";

const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

export const fechaQuerySchema = z.object({
  fecha: z
    .string()
    .regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)")
    .optional(),
});

export const crearMenuSchema = z.object({
  fecha: z.string().regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)"),
  platillo_id: z.coerce.number().int().positive("platillo_id inválido"),
  precio: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  disponible: z.boolean().optional().default(true),
  especial: z.boolean().optional().default(false),
});

export const actualizarMenuSchema = z
  .object({
    precio: z.coerce.number().nonnegative("El precio no puede ser negativo").optional(),
    disponible: z.boolean().optional(),
    especial: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No se enviaron campos para actualizar",
  });
