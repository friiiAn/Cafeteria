import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
  cerrarBaseDatos,
  eliminarPedidoPorId,
  eliminarPlatilloPorNombre,
} from "../helpers/db.js";
import {
  CUENTAS,
  crearMenuDePrueba,
  login,
} from "../helpers/pedidos.js";

const app = createApp();
const NOMBRE = "TEST Platillo Caja";
const FECHA_MENU = "2099-12-27";

let adminToken = "";
let cajaToken = "";
let cocinaToken = "";
let menuDiaId = 0;
let precio = 30;
const pedidosCreados: number[] = [];

async function crearMostrador(cantidad = 2) {
  const res = await request(app)
    .post("/api/caja/pedidos")
    .set("Authorization", `Bearer ${cajaToken}`)
    .send({ items: [{ menu_dia_id: menuDiaId, cantidad }] });
  if (res.body?.id) {
    pedidosCreados.push(res.body.id as number);
  }
  return res;
}

beforeEach(async () => {
  adminToken = await login(app, CUENTAS.admin.correo, CUENTAS.admin.password);
  cajaToken = await login(app, CUENTAS.cajero.correo, CUENTAS.cajero.password);
  cocinaToken = await login(
    app,
    CUENTAS.cocinero.correo,
    CUENTAS.cocinero.password,
  );

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, precio);
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

describe("POST /api/caja/pedidos", () => {
  it("registra un pedido de mostrador en estado Pendiente", async () => {
    const res = await crearMostrador(2);

    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe("mostrador");
    expect(res.body.estado).toBe("Pendiente");
    expect(res.body.numero).toMatch(/^M-\d{8}-\d{3}$/);
    expect(res.body.total).toBe(precio * 2);
    expect(res.body.items).toHaveLength(1);
  });

  it("no aplica la ventana de 10 minutos", async () => {
    const res = await crearMostrador(1);
    expect(res.status).toBe(201);
    expect(res.body.estado).toBe("Pendiente");
  });

  it("rechaza un platillo no disponible (409)", async () => {
    await request(app)
      .put(`/api/menu/${menuDiaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ disponible: false });

    const res = await crearMostrador(1);
    expect(res.status).toBe(409);
  });

  it("rechaza items vacíos (400)", async () => {
    const res = await request(app)
      .post("/api/caja/pedidos")
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  it("rechaza a un cocinero (403)", async () => {
    const res = await request(app)
      .post("/api/caja/pedidos")
      .set("Authorization", `Bearer ${cocinaToken}`)
      .send({ items: [{ menu_dia_id: menuDiaId, cantidad: 1 }] });
    expect(res.status).toBe(403);
  });

  it("exige sesión autenticada (401)", async () => {
    const res = await request(app)
      .post("/api/caja/pedidos")
      .send({ items: [{ menu_dia_id: menuDiaId, cantidad: 1 }] });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/caja/pedidos/:id/cobrar", () => {
  it("cobra en efectivo y deja el pedido Pagado", async () => {
    const creado = await crearMostrador(2);
    const id = creado.body.id as number;

    const cobro = await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "efectivo" });

    expect(cobro.status).toBe(200);
    expect(cobro.body.estado).toBe("Pagado");
    expect(cobro.body.pago.metodo).toBe("efectivo");
    expect(cobro.body.pago.monto).toBe(precio * 2);
    expect(cobro.body.pago.estado).toBe("confirmado");

    const detalle = await request(app)
      .get(`/api/caja/pedidos/${id}`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(detalle.status).toBe(200);
    expect(detalle.body.estado).toBe("Pagado");
    expect(detalle.body.historial.map((h: { estado_nuevo: string }) => h.estado_nuevo)).toEqual([
      "Pendiente",
      "Pagado",
    ]);
  });

  it("cobra con tarjeta", async () => {
    const creado = await crearMostrador(1);
    const id = creado.body.id as number;

    const cobro = await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "tarjeta" });

    expect(cobro.status).toBe(200);
    expect(cobro.body.pago.metodo).toBe("tarjeta");
  });

  it("rechaza un método inválido (400)", async () => {
    const creado = await crearMostrador(1);
    const id = creado.body.id as number;

    const cobro = await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "cheque" });

    expect(cobro.status).toBe(400);
  });

  it("rechaza el doble cobro (409)", async () => {
    const creado = await crearMostrador(1);
    const id = creado.body.id as number;

    const primero = await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "efectivo" });
    expect(primero.status).toBe(200);

    const segundo = await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "efectivo" });
    expect(segundo.status).toBe(409);
  });

  it("devuelve 404 si el pedido no existe", async () => {
    const res = await request(app)
      .post("/api/caja/pedidos/999999/cobrar")
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "efectivo" });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/caja/pedidos/:id/cancelar", () => {
  it("cancela un pedido Pendiente y rechaza recancelar (409)", async () => {
    const creado = await crearMostrador(1);
    const id = creado.body.id as number;

    const cancelar = await request(app)
      .post(`/api/caja/pedidos/${id}/cancelar`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(cancelar.status).toBe(200);
    expect(cancelar.body.estado).toBe("Cancelado");

    const deNuevo = await request(app)
      .post(`/api/caja/pedidos/${id}/cancelar`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(deNuevo.status).toBe(409);
  });

  it("no cancela un pedido ya pagado (409)", async () => {
    const creado = await crearMostrador(1);
    const id = creado.body.id as number;
    await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "efectivo" });

    const res = await request(app)
      .post(`/api/caja/pedidos/${id}/cancelar`)
      .set("Authorization", `Bearer ${cajaToken}`);
    expect(res.status).toBe(409);
  });
});
