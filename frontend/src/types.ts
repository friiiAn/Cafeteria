export const ROLES = ["administrador", "cajero", "cocinero", "usuario"] as const;

export type Rol = (typeof ROLES)[number];

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Platillo {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: boolean;
}

export interface MenuEntrada {
  id: number;
  fecha: string;
  platillo_id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
  especial: boolean;
}

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
  creado_en: string;
}

export interface PedidoDetalle extends PedidoResumen {
  tipo: string;
  items: ItemPedido[];
  historial: HistorialEstado[];
}

export interface PedidoEntrega {
  id: number;
  numero: string;
  tipo: string;
  cliente_nombre: string | null;
  total: number;
  fecha_recoleccion: string;
}

export interface Notificacion {
  id: number;
  usuario_id: number | null;
  pedido_id: number;
  tipo: string;
  mensaje: string | null;
  estado_envio: string;
  intentos: number;
  leida: boolean;
  creado_en: string;
}

export interface PagoConfirmado {
  pedido_id: number;
  estado: string;
  pago: {
    metodo: string;
    monto: number;
    referencia: string | null;
    estado: string;
  };
}

export interface ItemCocina {
  cantidad: number;
  nombre: string;
}

export interface PedidoCocina {
  id: number;
  numero: string;
  tipo: string;
  estado: string;
  fecha_recoleccion: string;
  items: ItemCocina[];
}

export const RUTA_POR_ROL: Record<Rol, string> = {
  administrador: "/admin",
  cajero: "/caja",
  cocinero: "/cocina",
  usuario: "/menu",
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: "Administrador",
  cajero: "Cajero",
  cocinero: "Cocinero",
  usuario: "Cliente",
};
