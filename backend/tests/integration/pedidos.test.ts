import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
  cerrarBaseDatos,
  eliminarPlatilloPorNombre,
  eliminarUsuarioConPedidos,
} from "../helpers/db.js";
import {
  crearMenuDePrueba,
  fechaLocal,
  registrarYLogin,
} from "../helpers/pedidos.js";

const app = createApp();
const NOMBRE = "TEST Platillo Pedido";
const FECHA_MENU = "2099-12-30";
const CORREO = "test.pedido@itsh.edu.mx";
const CORREO_OTRO = "test.pedido.otro@itsh.edu.mx";

let adminToken = "";
let clienteToken = "";
let otroToken = "";
let menuDiaId = 0;

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;

  clienteToken = await registrarYLogin(app, CORREO);
  otroToken = await registrarYLogin(app, CORREO_OTRO);

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 45);
  menuDiaId = menu.menuDiaId;
});

afterEach(async () => {
  await eliminarUsuarioConPedidos(CORREO);
  await eliminarUsuarioConPedidos(CORREO_OTRO);
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

function crearPedido(token: string, minutos: number, cantidad = 2) {
  return request(app)
    .post("/api/pedidos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fecha_recoleccion: fechaLocal(minutos),
      items: [{ menu_dia_id: menuDiaId, cantidad }],
    });
}

describe("POST /api/pedidos", () => {
  it("crea un pedido anticipado en estado Pendiente", async () => {
    const res = await crearPedido(clienteToken, 15, 2);

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe("Pendiente");
    expect(res.body.numero).toMatch(/^A-\d{8}-\d{3}$/);
    expect(res.body.total).toBe(90);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].precio_unitario).toBe(45);
    expect(res.body.items[0].subtotal).toBe(90);
  });

  it("rechaza un pedido con menos de 10 minutos de anticipación (409)", async () => {
    const res = await crearPedido(clienteToken, 5);
    expect(res.status).toBe(409);
  });

  it("rechaza un platillo no disponible (409)", async () => {
    await request(app)
      .put(`/api/menu/${menuDiaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ disponible: false });

    const res = await crearPedido(clienteToken, 15);
    expect(res.status).toBe(409);
  });

  it("rechaza un platillo desactivado (409)", async () => {
    const menuRes = await request(app)
      .get(`/api/menu?fecha=${FECHA_MENU}`)
      .set("Authorization", `Bearer ${adminToken}`);
    const entrada = menuRes.body[0];
    await request(app)
      .put(`/api/platillos/${entrada.platillo_id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ activo: false });

    const res = await crearPedido(clienteToken, 15);
    expect(res.status).toBe(409);
  });

  it("rechaza cantidad inválida (400)", async () => {
    const res = await crearPedido(clienteToken, 15, 0);
    expect(res.status).toBe(400);
  });

  it("rechaza un pedido sin items (400)", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ fecha_recoleccion: fechaLocal(15), items: [] });
    expect(res.status).toBe(400);
  });

  it("exige sesión autenticada (401)", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .send({ fecha_recoleccion: fechaLocal(15), items: [{ menu_dia_id: menuDiaId, cantidad: 1 }] });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/pedidos", () => {
  it("lista y obtiene pedidos propios", async () => {
    const creado = await crearPedido(clienteToken, 15);
    const id = creado.body.id as number;

    const lista = await request(app)
      .get("/api/pedidos")
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(lista.status).toBe(200);
    expect(lista.body.some((p: { id: number }) => p.id === id)).toBe(true);

    const detalle = await request(app)
      .get(`/api/pedidos/${id}`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(detalle.status).toBe(200);
    expect(detalle.body.numero).toBe(creado.body.numero);
    expect(detalle.body.items).toHaveLength(1);
    expect(detalle.body.historial[0].estado_nuevo).toBe("Pendiente");
  });

  it("no permite ver un pedido ajeno (403)", async () => {
    const creado = await crearPedido(clienteToken, 15);
    const res = await request(app)
      .get(`/api/pedidos/${creado.body.id}`)
      .set("Authorization", `Bearer ${otroToken}`);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/pedidos/:id/cancelar", () => {
  it("cancela un pedido Pendiente y rechaza recancelar (409)", async () => {
    const creado = await crearPedido(clienteToken, 15);
    const id = creado.body.id as number;

    const cancelar = await request(app)
      .post(`/api/pedidos/${id}/cancelar`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(cancelar.status).toBe(200);
    expect(cancelar.body.estado).toBe("Cancelado");

    const deNuevo = await request(app)
      .post(`/api/pedidos/${id}/cancelar`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(deNuevo.status).toBe(409);
  });
});
