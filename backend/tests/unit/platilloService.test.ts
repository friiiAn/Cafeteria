import { describe, it, expect, afterAll, afterEach } from "vitest";
import * as platilloService from "../../src/services/platilloService.js";
import { HttpError } from "../../src/utils/httpError.js";
import { cerrarBaseDatos, eliminarPlatilloPorNombre } from "../helpers/db.js";

const NOMBRE = "TEST Platillo Service";

afterEach(async () => {
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("platilloService", () => {
  it("crea un platillo activo y lo lista", async () => {
    const creado = await platilloService.crear({
      nombre: NOMBRE,
      categoria: "Comida",
      descripcion: "Platillo de prueba",
    });

    expect(creado.id).toBeGreaterThan(0);
    expect(creado.activo).toBe(true);
    expect(creado.categoria).toBe("Comida");

    const lista = await platilloService.listar({ activo: true });
    expect(lista.some((p) => p.id === creado.id)).toBe(true);
  });

  it("actualiza y desactiva un platillo", async () => {
    const creado = await platilloService.crear({ nombre: NOMBRE });
    const actualizado = await platilloService.actualizar(creado.id, {
      nombre: NOMBRE,
      activo: false,
    });

    expect(actualizado.activo).toBe(false);

    const activos = await platilloService.listar({ activo: true });
    expect(activos.some((p) => p.id === creado.id)).toBe(false);
  });

  it("lanza 404 al actualizar un platillo inexistente", async () => {
    await expect(
      platilloService.actualizar(99_999_999, { nombre: "Fantasma" }),
    ).rejects.toBeInstanceOf(HttpError);
  });
});
