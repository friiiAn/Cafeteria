import { describe, it, expect } from "vitest";
import {
  calcularTotales,
  anticipacionSuficiente,
} from "../../src/services/pedidoService.js";

describe("calcularTotales", () => {
  it("calcula subtotales y total del pedido", () => {
    const { total, items } = calcularTotales([
      { menu_dia_id: 1, cantidad: 2, precio_unitario: 45 },
      { menu_dia_id: 2, cantidad: 1, precio_unitario: 25.5 },
    ]);

    expect(items[0].subtotal).toBe(90);
    expect(items[1].subtotal).toBe(25.5);
    expect(total).toBe(115.5);
  });

  it("redondea a 2 decimales", () => {
    const { total } = calcularTotales([
      { menu_dia_id: 1, cantidad: 3, precio_unitario: 0.1 },
    ]);
    expect(total).toBe(0.3);
  });

  it("regresa total 0 con lista vacía", () => {
    expect(calcularTotales([]).total).toBe(0);
  });
});

describe("anticipacionSuficiente", () => {
  const ahora = new Date("2026-10-13T12:00:00");

  it("acepta justo el mínimo de anticipación", () => {
    expect(
      anticipacionSuficiente(new Date("2026-10-13T12:10:00"), ahora, 10),
    ).toBe(true);
  });

  it("rechaza por debajo del mínimo", () => {
    expect(
      anticipacionSuficiente(new Date("2026-10-13T12:09:59"), ahora, 10),
    ).toBe(false);
  });

  it("acepta con más margen", () => {
    expect(
      anticipacionSuficiente(new Date("2026-10-13T13:00:00"), ahora, 10),
    ).toBe(true);
  });
});
