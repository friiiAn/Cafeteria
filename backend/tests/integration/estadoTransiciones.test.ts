import { describe, it, expect, afterAll } from "vitest";
import * as estadoService from "../../src/services/estadoService.js";
import { cerrarBaseDatos } from "../helpers/db.js";

async function par(desde: string, hacia: string): Promise<boolean> {
  return estadoService.transicionPermitida(
    await estadoService.idPorNombre(desde),
    await estadoService.idPorNombre(hacia),
  );
}

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("Mapa de transiciones de estado", () => {
  it("permite las transiciones del flujo", async () => {
    expect(await par("Pendiente", "Pagado")).toBe(true);
    expect(await par("Pagado", "En preparación")).toBe(true);
    expect(await par("En preparación", "Listo")).toBe(true);
    expect(await par("Listo", "Entregado")).toBe(true);
    expect(await par("Pendiente", "Cancelado")).toBe(true);
  });

  it("rechaza transiciones fuera de secuencia", async () => {
    expect(await par("Pagado", "Listo")).toBe(false);
    expect(await par("Listo", "En preparación")).toBe(false);
    expect(await par("Pendiente", "En preparación")).toBe(false);
    expect(await par("En preparación", "Pagado")).toBe(false);
  });
});
