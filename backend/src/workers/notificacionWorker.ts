import { env } from "../config/env.js";
import * as notificacionService from "../services/notificacionService.js";
import { logger } from "../utils/logger.js";

export function iniciarNotificacionWorker(): () => void {
  if (env.NOTIFICACION_POLL_MS <= 0) {
    return () => {
      /* worker desactivado */
    };
  }

  const timer = setInterval(() => {
    notificacionService.enviarPendientes().catch((error) => {
      logger.warn("El worker de notificaciones falló al procesar la cola", error);
    });
  }, env.NOTIFICACION_POLL_MS);

  timer.unref?.();

  return () => clearInterval(timer);
}
