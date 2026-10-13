import { logger } from "../../utils/logger.js";
import type { Mailer, MensajeCorreo } from "./Mailer.js";

export class ConsoleMailer implements Mailer {
  async enviar(mensaje: MensajeCorreo): Promise<void> {
    logger.info(`[mail:console] Para ${mensaje.para} — ${mensaje.asunto}`);
  }
}
