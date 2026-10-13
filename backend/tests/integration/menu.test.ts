import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarPlatilloPorNombre } from "../helpers/db.js";

const app = createApp();
const NOMBRE = "TEST Platillo Menu";
const FECHA = "2099-12-31";

let adminToken = "";
let cajeroToken = "";
let platilloId = 0;

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;

  const cajero = await request(app)
    .post("/api/auth/login")
    .send({ correo: "caja@itsh.edu.mx", password: "caja123" });
  cajeroToken = cajero.body.token as string;

  const platillo = await request(app)
    .post("/api/platillos")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ nombre: NOMBRE, categoria: "Comida" });
  platilloId = platillo.body.id as number;
});

afterEach(async () => {
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("Gestión /api/menu (administrador)", () => {
  it("agrega un platillo al menú de una fecha", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: 45, especial: true });

    expect(res.status).toBe(201);
    expect(res.body.precio).toBe(45);
    expect(res.body.especial).toBe(true);
    expect(res.body.disponible).toBe(true);
    expect(res.body.fecha).toBe(FECHA);
  });

  it("rechaza duplicar el mismo platillo en la misma fecha (409)", async () => {
    await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: 45 });

    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: 50 });

    expect(res.status).toBe(409);
  });

  it("rechaza precio negativo (400)", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: -1 });
    expect(res.status).toBe(400);
  });

  it("rechaza un platillo inexistente (404)", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: 99999999, precio: 10 });
    expect(res.status).toBe(404);
  });

  it("edita precio, disponibilidad y especial de una entrada", async () => {
    const creado = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: 45 });

    const res = await request(app)
      .put(`/api/menu/${creado.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ precio: 55, disponible: false, especial: true });

    expect(res.status).toBe(200);
    expect(res.body.precio).toBe(55);
    expect(res.body.disponible).toBe(false);
    expect(res.body.especial).toBe(true);
  });

  it("quita un platillo del menú (204)", async () => {
    const creado = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: 45 });

    const eliminar = await request(app)
      .delete(`/api/menu/${creado.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(eliminar.status).toBe(204);

    const lista = await request(app)
      .get(`/api/menu?fecha=${FECHA}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(lista.body).toHaveLength(0);
  });

  it("responde 403 a un usuario sin rol administrador", async () => {
    const res = await request(app)
      .post("/api/menu")
      .set("Authorization", `Bearer ${cajeroToken}`)
      .send({ fecha: FECHA, platillo_id: platilloId, precio: 45 });
    expect(res.status).toBe(403);
  });
});
