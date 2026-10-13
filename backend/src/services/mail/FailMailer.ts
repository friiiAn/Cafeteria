import type { Mailer, MensajeCorreo } from "./Mailer.js";

export class FailMailer implements Mailer {
  async enviar(_mensaje: MensajeCorreo): Promise<void> {
    throw new Error("Envío de correo simulado como fallido");
  }
}
