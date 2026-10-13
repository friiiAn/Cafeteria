import { env } from "../../config/env.js";
import { MockPaymentGateway } from "./MockPaymentGateway.js";
import type { PaymentGateway } from "./PaymentGateway.js";

export function getPaymentGateway(): PaymentGateway {
  switch (env.PAYMENT_PROVIDER) {
    case "mock":
      return new MockPaymentGateway();
    case "stripe":
      throw new Error("Proveedor de pago 'stripe' aún no implementado");
    default:
      throw new Error(`Proveedor de pago desconocido: ${env.PAYMENT_PROVIDER}`);
  }
}
