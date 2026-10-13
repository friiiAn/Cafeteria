export const ESTADOS_PEDIDO = [
  "Pendiente",
  "Pagado",
  "En preparación",
  "Listo",
  "Entregado",
  "Cancelado",
] as const;

export type EstadoPedidoNombre = (typeof ESTADOS_PEDIDO)[number];

export interface ItemPedido {
  menu_dia_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface HistorialEstado {
  estado_anterior: string | null;
  estado_nuevo: string;
  fecha: string;
}

export interface PedidoResumen {
  id: number;
  numero: string;
  estado: string;
  total: number;
  fecha_recoleccion: string;
}

export interface PedidoDetalle extends PedidoResumen {
  items: ItemPedido[];
  historial: HistorialEstado[];
}

export interface PagoInfo {
  metodo: string;
  monto: number;
  referencia: string | null;
  estado: string;
}

export interface PagoConfirmado {
  pedido_id: number;
  estado: string;
  pago: PagoInfo;
}
