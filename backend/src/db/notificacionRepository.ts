import type { RowDataPacket } from "mysql2";
import { e, q, query, execute, type DbExecutor } from "./pool.js";

export interface NotificacionRow extends RowDataPacket {
  id: number;
  usuario_id: number | null;
  pedido_id: number;
  tipo: string;
  mensaje: string | null;
  canal: string;
  estado_envio: string;
  intentos: number;
  leida: number;
  fecha: Date | string;
}

export interface NotificacionPendienteRow extends NotificacionRow {
  correo: string | null;
}

export async function crearSiNoExiste(
  conn: DbExecutor,
  params: {
    usuarioId: number;
    pedidoId: number;
    tipo: string;
    mensaje: string;
  },
): Promise<number> {
  await e(
    conn,
    `INSERT IGNORE INTO notificacion
       (usuario_id, pedido_id, tipo, mensaje, canal, estado_envio, intentos)
     VALUES (?, ?, ?, ?, 'correo', 'pendiente', 0)`,
    [params.usuarioId, params.pedidoId, params.tipo, params.mensaje],
  );
  const rows = await q<RowDataPacket[]>(
    conn,
    "SELECT id FROM notificacion WHERE pedido_id = ? AND tipo = ? LIMIT 1",
    [params.pedidoId, params.tipo],
  );
  return Number(rows[0]?.id ?? 0);
}

export async function listarPorUsuario(
  usuarioId: number,
): Promise<NotificacionRow[]> {
  return query<NotificacionRow[]>(
    `SELECT id, usuario_id, pedido_id, tipo, mensaje, canal, estado_envio,
            intentos, leida, fecha
     FROM notificacion
     WHERE usuario_id = ?
     ORDER BY fecha DESC, id DESC`,
    [usuarioId],
  );
}

export async function obtenerPorId(id: number): Promise<NotificacionRow | null> {
  const rows = await query<NotificacionRow[]>(
    `SELECT id, usuario_id, pedido_id, tipo, mensaje, canal, estado_envio,
            intentos, leida, fecha
     FROM notificacion WHERE id = ? LIMIT 1`,
    [id],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function listarPendientes(
  maxIntentos: number,
  limite = 50,
): Promise<NotificacionPendienteRow[]> {
  return query<NotificacionPendienteRow[]>(
    `SELECT n.id, n.usuario_id, n.pedido_id, n.tipo, n.mensaje, n.canal,
            n.estado_envio, n.intentos, n.leida, n.fecha, u.correo AS correo
     FROM notificacion n
     LEFT JOIN usuario u ON u.id = n.usuario_id
     WHERE n.estado_envio IN ('pendiente', 'fallida') AND n.intentos < ?
     ORDER BY n.fecha ASC
     LIMIT ${limite}`,
    [maxIntentos],
  );
}

export async function marcarResultado(
  id: number,
  estado: "enviada" | "fallida",
  detalleError: string | null,
): Promise<void> {
  await execute(
    `UPDATE notificacion
     SET estado_envio = ?, intentos = intentos + 1, detalle_error = ?
     WHERE id = ?`,
    [estado, detalleError, id],
  );
}

export async function marcarLeida(
  id: number,
  usuarioId: number,
): Promise<number> {
  const result = await execute(
    "UPDATE notificacion SET leida = 1 WHERE id = ? AND usuario_id = ?",
    [id, usuarioId],
  );
  return result.affectedRows;
}
