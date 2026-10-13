import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarPlatilloPorNombre } from "../helpers/db.js";

const app = createApp();
const NOMBRE = "TEST Platillo Cliente";
const FECHA = "2099-12-30";
const FECHA_VACIA = "2099-01-01";

let adminToken = "";
let clienteToken = "";
let platilloId = 0;

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;

  const cliente = await request(app)
    .post("/api/auth/login")
    .send({ correo: "caja@itsh.edu.mx", password: "caja123" });
  clienteToken = cliente.body.token as string;

  const platillo = await request(app)
    .post("/api/platillos")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ nombre: NOMBRE, categoria: "Comida", descripcion: "Del día" });
  platilloId = platillo.body.id as number;

  await request(app)
    .post("/api/menu")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ fecha: FECHA, platillo_id: platilloId, precio: 45 });
});

afterEach(async () => {
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("Consulta GET /api/menu/cliente", () => {
  it("devuelve los platillos del menú con precio", async () => {
    const res = await request(app)
      .get(`/api/menu/cliente?fecha=${FECHA}`)
      .set("Authorization", `Bearer ${clienteToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nombre).toBe(NOMBRE);
    expect(res.body[0].precio).toBe(45);
    expect(res.body[0].disponible).toBe(true);
  });

  it("excluye platillos inactivos del catálogo", async () => {
    await request(app)
      .put(`/api/platillos/${platilloId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ activo: false });

    const cliente = await request(app)
      .get(`/api/menu/cliente?fecha=${FECHA}`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(cliente.body).toHaveLength(0);

    const admin = await request(app)
      .get(`/api/menu?fecha=${FECHA}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(admin.body).toHaveLength(1);
  });

  it("devuelve lista vacía para una fecha sin menú", async () => {
    const res = await request(app)
      .get(`/api/menu/cliente?fecha=${FECHA_VACIA}`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("exige sesión autenticada", async () => {
    const res = await request(app).get(`/api/menu/cliente?fecha=${FECHA}`);
    expect(res.status).toBe(401);
  });
});
