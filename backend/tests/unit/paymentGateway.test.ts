import { describe, it, expect } from "vitest";
import { MockPaymentGateway } from "../../src/services/payment/MockPaymentGateway.js";

const gateway = new MockPaymentGateway();

describe("MockPaymentGateway", () => {
  it("aprueba un token válido y genera referencia", async () => {
    const resultado = await gateway.cobrar({
      monto: 100,
      token: "tok_ok_123",
      referencia: "A-20261013-001",
    });

    expect(resultado.aprobado).toBe(true);
    expect(resultado.referencia).toBe("mock_A-20261013-001");
  });

  it("rechaza un token de fallo", async () => {
    const resultado = await gateway.cobrar({
      monto: 100,
      token: "tok_fail_1",
      referencia: "A-20261013-001",
    });

    expect(resultado.aprobado).toBe(false);
    expect(resultado.mensaje).toBeTruthy();
  });

  it("rechaza un token con formato inválido", async () => {
    const resultado = await gateway.cobrar({
      monto: 100,
      token: "abc",
      referencia: "A-20261013-001",
    });

    expect(resultado.aprobado).toBe(false);
  });
});
