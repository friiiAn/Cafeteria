import { env } from "../../config/env.js";
import { ConsoleMailer } from "./ConsoleMailer.js";
import { FailMailer } from "./FailMailer.js";
import type { Mailer } from "./Mailer.js";

export function getMailer(): Mailer {
  return env.MAIL_PROVIDER === "fail" ? new FailMailer() : new ConsoleMailer();
}

export type { Mailer, MensajeCorreo } from "./Mailer.js";
export { ConsoleMailer } from "./ConsoleMailer.js";
export { FailMailer } from "./FailMailer.js";
