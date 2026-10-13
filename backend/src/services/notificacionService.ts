import * as notificacionRepo from "../db/notificacionRepository.js";
import { getMailer, type Mailer } from "./mail/index.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";
import { formatoFechaHora } from "../utils/fecha.js";
import type { DbExecutor } from "../db/pool.js";
import type { Notificacion } from "../types/notificacion.js";

const TIPO_PEDIDO_LISTO = "pedido_listo";

interface PedidoNotificable {
  id: number;
  numero: string;
  tipo: string;
  usuario_id: number | null;
}

export async function crearParaPedidoListo(
  conn: DbExecutor,
  pedido: PedidoNotificable,
): Promise<number | null> {
  if (pedido.tipo !== "anticipado" || pedido.usuario_id === null) {
    return null;
  }
  const mensaje = `Tu pedido ${pedido.numero} está listo para recoger`;
  return notificacionRepo.crearSiNoExiste(conn, {
    usuarioId: pedido.usuario_id,
    pedidoId: pedido.id,
    tipo: TIPO_PEDIDO_LISTO,
    mensaje,
  });
}

export async function enviarPendientes(
  mailer: Mailer = getMailer(),
): Promise<{ enviadas: number; fallidas: number }> {
  const pendientes = await notificacionRepo.listarPendientes(
    env.NOTIFICACION_MAX_INTENTOS,
  );

  let enviadas = 0;
  let fallidas = 0;

  for (const notificacion of pendientes) {
    if (!notificacion.correo) {
      await notificacionRepo.marcarResultado(
        notificacion.id,
        "fallida",
        "El cliente no tiene correo registrado",
      );
      fallidas += 1;
      continue;
    }

    try {
      await mailer.enviar({
        para: notificacion.correo,
        asunto: "Tu pedido está listo",
        cuerpo:
          notificacion.mensaje ?? "Tu pedido está listo para recoger",
      });
      await notificacionRepo.marcarResultado(notificacion.id, "enviada", null);
      enviadas += 1;
    } catch (error) {
      const detalle = error instanceof Error ? error.message : "Error desconocido";
      await notificacionRepo.marcarResultado(
        notificacion.id,
        "fallida",
        detalle,
      );
      fallidas += 1;
      logger.warn(
        `No se pudo enviar la notificación ${notificacion.id}`,
        detalle,
      );
    }
  }

  return { enviadas, fallidas };
}

function mapNotificacion(
  row: notificacionRepo.NotificacionRow,
): Notificacion {
  return {
    id: row.id,
    usuario_id: row.usuario_id,
    pedido_id: row.pedido_id,
    tipo: row.tipo,
    mensaje: row.mensaje,
    estado_envio: row.estado_envio,
    intentos: row.intentos,
    leida: Boolean(row.leida),
    creado_en: formatoFechaHora(row.fecha),
  };
}

export async function listar(usuarioId: number): Promise<Notificacion[]> {
  const rows = await notificacionRepo.listarPorUsuario(usuarioId);
  return rows.map(mapNotificacion);
}

export async function marcarLeida(
  usuarioId: number,
  notificacionId: number,
): Promise<{ id: number; leida: boolean }> {
  const notificacion = await notificacionRepo.obtenerPorId(notificacionId);
  if (!notificacion) {
    throw HttpError.notFound("Notificación no encontrada");
  }
  if (notificacion.usuario_id !== usuarioId) {
    throw HttpError.forbidden("No tienes acceso a esta notificación");
  }
  await notificacionRepo.marcarLeida(notificacionId, usuarioId);
  return { id: notificacionId, leida: true };
}
