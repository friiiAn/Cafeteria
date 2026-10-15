import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
  cerrarBaseDatos,
  eliminarPedidoPorId,
  eliminarPlatilloPorNombre,
  eliminarUsuarioConPedidos,
} from "../helpers/db.js";
import {
  CUENTAS,
  crearMenuDePrueba,
  fechaLocal,
  login,
  registrarYLogin,
} from "../helpers/pedidos.js";

const app = createApp();
const NOMBRE = "TEST Platillo Cocina";
const FECHA_MENU = "2099-12-26";

let adminToken = "";
let cajaToken = "";
let cocinaToken = "";
let menuDiaId = 0;
const pedidosCreados: number[] = [];

async function pedidoPagado(cantidad = 2): Promise<number> {
  const creado = await request(app)
    .post("/api/caja/pedidos")
    .set("Authorization", `Bearer ${cajaToken}`)
    .send({ items: [{ menu_dia_id: menuDiaId, cantidad }] });
  const id = creado.body.id as number;
  pedidosCreados.push(id);
  await request(app)
    .post(`/api/caja/pedidos/${id}/cobrar`)
    .set("Authorization", `Bearer ${cajaToken}`)
    .send({ metodo: "efectivo" });
  return id;
}

beforeEach(async () => {
  adminToken = await login(app, CUENTAS.admin.correo, CUENTAS.admin.password);
  cajaToken = await login(app, CUENTAS.cajero.correo, CUENTAS.cajero.password);
  cocinaToken = await login(
    app,
    CUENTAS.cocinero.correo,
    CUENTAS.cocinero.password,
  );

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 25);
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

describe("GET /api/cocina/pedidos", () => {
  it("lista los pedidos Pagados con sus items", async () => {
    const id = await pedidoPagado(2);

    const res = await request(app)
      .get("/api/cocina/pedidos")
      .set("Authorization", `Bearer ${cocinaToken}`);

    expect(res.status).toBe(200);
    const pedido = res.body.find((p: { id: number }) => p.id === id);
    expect(pedido).toBeTruthy();
    expect(pedido.estado).toBe("Pagado");
    expect(pedido.tipo).toBe("mostrador");
    expect(pedido.cliente_nombre).toBeNull();
    expect(pedido.creado_en).toBeTruthy();
    expect(pedido.items).toHaveLength(1);
    expect(pedido.items[0].cantidad).toBe(2);
    expect(pedido.items[0].nombre).toBe(NOMBRE);
  });

  it("expone el nombre del cliente en pedidos anticipados", async () => {
    const correo = `cocina-nombre-${Date.now()}@itsh.edu.mx`;
    const clienteToken = await registrarYLogin(app, correo);
    const creado = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({
        fecha_recoleccion: fechaLocal(30),
        items: [{ menu_dia_id: menuDiaId, cantidad: 1 }],
      });
    const id = creado.body.id as number;
    pedidosCreados.push(id);
    await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ token_pago: "tok_ok_demo" });

    const res = await request(app)
      .get("/api/cocina/pedidos")
      .set("Authorization", `Bearer ${cocinaToken}`);

    const pedido = res.body.find((p: { id: number }) => p.id === id);
    expect(pedido).toBeTruthy();
    expect(pedido.cliente_nombre).toBe("Cliente de prueba");
    expect(pedido.tipo).toBe("anticipado");

    await eliminarUsuarioConPedidos(correo);
  });

  it("rechaza a un cajero (403)", async () => {
    const res = await request(app)
      .get("/api/cocina/pedidos")
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(res.status).toBe(403);
  });

  it("exige sesión autenticada (401)", async () => {
    const res = await request(app).get("/api/cocina/pedidos");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/cocina/pedidos/:id/iniciar", () => {
  it("pasa un pedido Pagado a En preparación y registra historial", async () => {
    const id = await pedidoPagado();

    const res = await request(app)
      .post(`/api/cocina/pedidos/${id}/iniciar`)
      .set("Authorization", `Bearer ${cocinaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("En preparación");

    const detalle = await request(app)
      .get(`/api/caja/pedidos/${id}`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(
      detalle.body.historial.map((h: { estado_nuevo: string }) => h.estado_nuevo),
    ).toEqual(["Pendiente", "Pagado", "En preparación"]);
  });

  it("rechaza iniciar dos veces (409)", async () => {
    const id = await pedidoPagado();

    const primero = await request(app)
      .post(`/api/cocina/pedidos/${id}/iniciar`)
      .set("Authorization", `Bearer ${cocinaToken}`);
    expect(primero.status).toBe(200);

    const segundo = await request(app)
      .post(`/api/cocina/pedidos/${id}/iniciar`)
      .set("Authorization", `Bearer ${cocinaToken}`);
    expect(segundo.status).toBe(409);
  });

  it("devuelve 404 si el pedido no existe", async () => {
    const res = await request(app)
      .post("/api/cocina/pedidos/999999/iniciar")
      .set("Authorization", `Bearer ${cocinaToken}`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/cocina/pedidos/:id/listo", () => {
  it("pasa de En preparación a Listo", async () => {
    const id = await pedidoPagado();
    await request(app)
      .post(`/api/cocina/pedidos/${id}/iniciar`)
      .set("Authorization", `Bearer ${cocinaToken}`);

    const res = await request(app)
      .post(`/api/cocina/pedidos/${id}/listo`)
      .set("Authorization", `Bearer ${cocinaToken}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("Listo");
  });

  it("rechaza listo si no está En preparación (409)", async () => {
    const id = await pedidoPagado();

    const res = await request(app)
      .post(`/api/cocina/pedidos/${id}/listo`)
      .set("Authorization", `Bearer ${cocinaToken}`);

    expect(res.status).toBe(409);
  });

  it("mantiene visible un pedido Listo (en espera de caja)", async () => {
    const id = await pedidoPagado();
    await request(app)
      .post(`/api/cocina/pedidos/${id}/iniciar`)
      .set("Authorization", `Bearer ${cocinaToken}`);
    await request(app)
      .post(`/api/cocina/pedidos/${id}/listo`)
      .set("Authorization", `Bearer ${cocinaToken}`);

    const res = await request(app)
      .get("/api/cocina/pedidos")
      .set("Authorization", `Bearer ${cocinaToken}`);
    const pedido = res.body.find((p: { id: number }) => p.id === id);
    expect(pedido).toBeTruthy();
    expect(pedido.estado).toBe("Listo");
  });
});
