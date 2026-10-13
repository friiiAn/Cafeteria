import { describe, it, expect } from "vitest";
import { ConsoleMailer } from "../../src/services/mail/ConsoleMailer.js";
import { FailMailer } from "../../src/services/mail/FailMailer.js";

describe("ConsoleMailer", () => {
  it("resuelve sin error al enviar", async () => {
    const mailer = new ConsoleMailer();
    await expect(
      mailer.enviar({ para: "cliente@itsh.edu.mx", asunto: "Prueba", cuerpo: "Hola" }),
    ).resolves.toBeUndefined();
  });
});

describe("FailMailer", () => {
  it("rechaza el envío (simula un proveedor caído)", async () => {
    const mailer = new FailMailer();
    await expect(
      mailer.enviar({ para: "cliente@itsh.edu.mx", asunto: "Prueba", cuerpo: "Hola" }),
    ).rejects.toThrow(/fallido/i);
  });
});
