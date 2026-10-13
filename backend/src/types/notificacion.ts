export const TIPOS_NOTIFICACION = ["pedido_listo"] as const;

export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[number];

export const ESTADOS_ENVIO = ["pendiente", "enviada", "fallida"] as const;

export type EstadoEnvio = (typeof ESTADOS_ENVIO)[number];

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
