import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
  cerrarBaseDatos,
  eliminarPedidoPorId,
  eliminarPlatilloPorNombre,
} from "../helpers/db.js";
import { CUENTAS, crearMenuDePrueba, login } from "../helpers/pedidos.js";

const app = createApp();
const NOMBRE = "TEST Platillo Entrega";
const FECHA_MENU = "2099-12-17";

let adminToken = "";
let cajaToken = "";
let cocinaToken = "";
let menuDiaId = 0;
const pedidosCreados: number[] = [];

async function pedidoMostrador(): Promise<number> {
  const creado = await request(app)
    .post("/api/caja/pedidos")
    .set("Authorization", `Bearer ${cajaToken}`)
    .send({ items: [{ menu_dia_id: menuDiaId, cantidad: 1 }] });
  const id = creado.body.id as number;
  pedidosCreados.push(id);
  return id;
}

async function cobrar(id: number): Promise<void> {
  await request(app)
    .post(`/api/caja/pedidos/${id}/cobrar`)
    .set("Authorization", `Bearer ${cajaToken}`)
    .send({ metodo: "efectivo" });
}

async function listo(id: number): Promise<void> {
  await request(app)
    .post(`/api/cocina/pedidos/${id}/iniciar`)
    .set("Authorization", `Bearer ${cocinaToken}`);
  await request(app)
    .post(`/api/cocina/pedidos/${id}/listo`)
    .set("Authorization", `Bearer ${cocinaToken}`);
}

beforeEach(async () => {
  adminToken = await login(app, CUENTAS.admin.correo, CUENTAS.admin.password);
  cajaToken = await login(app, CUENTAS.cajero.correo, CUENTAS.cajero.password);
  cocinaToken = await login(
    app,
    CUENTAS.cocinero.correo,
    CUENTAS.cocinero.password,
  );

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 20);
  menuDiaId = menu.menuDiaId;
  pedidosCreados.length = 0;
});

afterEach(async () => {
  for (const id of pedidosCreados) {
    await eliminarPedidoPorId(id);
  }
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("GET /api/caja/pedidos", () => {
  it("lista solo los pedidos Listos", async () => {
    const listoId = await pedidoMostrador();
    await cobrar(listoId);
    await listo(listoId);

    const pagadoId = await pedidoMostrador();
    await cobrar(pagadoId);

    const res = await request(app)
      .get("/api/caja/pedidos")
      .set("Authorization", `Bearer ${cajaToken}`);

    expect(res.status).toBe(200);
    const ids = res.body.map((p: { id: number }) => p.id);
    expect(ids).toContain(listoId);
    expect(ids).not.toContain(pagadoId);

    const fila = res.body.find((p: { id: number }) => p.id === listoId);
    expect(fila.creado_en).toBeTruthy();
    expect(fila.items).toHaveLength(1);
    expect(fila.items[0].cantidad).toBe(1);
    expect(fila.items[0].nombre).toBe(NOMBRE);
  });
});

describe("POST /api/caja/pedidos/:id/entregar", () => {
  it("pasa un pedido Listo a Entregado y registra historial", async () => {
    const id = await pedidoMostrador();
    await cobrar(id);
    await listo(id);

    const res = await request(app)
      .post(`/api/caja/pedidos/${id}/entregar`)
      .set("Authorization", `Bearer ${cajaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("Entregado");

    const detalle = await request(app)
      .get(`/api/caja/pedidos/${id}`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(
      detalle.body.historial.map((h: { estado_nuevo: string }) => h.estado_nuevo),
    ).toContain("Entregado");
  });

  it("rechaza entregar un pedido que no está Listo (409)", async () => {
    const id = await pedidoMostrador();
    await cobrar(id);

    const res = await request(app)
      .post(`/api/caja/pedidos/${id}/entregar`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(res.status).toBe(409);
  });

  it("rechaza entregar dos veces (409)", async () => {
    const id = await pedidoMostrador();
    await cobrar(id);
    await listo(id);

    const primero = await request(app)
      .post(`/api/caja/pedidos/${id}/entregar`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(primero.status).toBe(200);

    const segundo = await request(app)
      .post(`/api/caja/pedidos/${id}/entregar`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(segundo.status).toBe(409);
  });

  it("rechaza a un cocinero (403)", async () => {
    const id = await pedidoMostrador();
    await cobrar(id);
    await listo(id);

    const res = await request(app)
      .post(`/api/caja/pedidos/${id}/entregar`)
      .set("Authorization", `Bearer ${cocinaToken}`);
    expect(res.status).toBe(403);
  });

  it("exige sesión autenticada (401)", async () => {
    const res = await request(app).post("/api/caja/pedidos/1/entregar");
    expect(res.status).toBe(401);
  });
});
