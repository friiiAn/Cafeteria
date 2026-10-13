export interface MensajeCorreo {
  para: string;
  asunto: string;
  cuerpo: string;
}

export interface Mailer {
  enviar(mensaje: MensajeCorreo): Promise<void>;
}
