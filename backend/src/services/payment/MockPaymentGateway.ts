import type { CargoParams, CargoResultado, PaymentGateway } from "./PaymentGateway.js";

const PREFIJO_FALLO = "tok_fail";
const PREFIJO_VALIDO = "tok_";

export class MockPaymentGateway implements PaymentGateway {
  async cobrar({ token, referencia }: CargoParams): Promise<CargoResultado> {
    if (token.startsWith(PREFIJO_FALLO)) {
      return { aprobado: false, mensaje: "Pago rechazado por el proveedor" };
    }
    if (!token.startsWith(PREFIJO_VALIDO)) {
      return { aprobado: false, mensaje: "Token de pago inválido" };
    }
    return { aprobado: true, referencia: `mock_${referencia}` };
  }
}
