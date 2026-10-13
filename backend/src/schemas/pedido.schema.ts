import { z } from "zod";

const fechaHoraRegex = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/;
const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

export const crearPedidoSchema = z.object({
  fecha_recoleccion: z
    .string()
    .regex(
      fechaHoraRegex,
      "Formato de fecha/hora inválido (YYYY-MM-DDTHH:MM)",
    ),
  items: z
    .array(
      z.object({
        menu_dia_id: z.coerce.number().int().positive("menu_dia_id inválido"),
        cantidad: z.coerce
          .number()
          .int()
          .positive("La cantidad debe ser mayor a 0"),
      }),
    )
    .min(1, "El pedido debe incluir al menos un platillo"),
});

export const pagoSchema = z.object({
  token_pago: z.string().trim().min(1, "El token de pago es obligatorio"),
});

export const listarPedidosQuerySchema = z.object({
  estado: z.string().trim().min(1).optional(),
  desde: z
    .string()
    .regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)")
    .optional(),
  hasta: z
    .string()
    .regex(fechaRegex, "Formato de fecha inválido (YYYY-MM-DD)")
    .optional(),
});
