import { z } from "zod";

export const crearPedidoMostradorSchema = z.object({
  cliente_nombre: z.string().trim().max(100).optional(),
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

export const cobroSchema = z.object({
  metodo: z.enum(["efectivo", "tarjeta"], {
    message: 'El método de pago debe ser "efectivo" o "tarjeta"',
  }),
});
