import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarPlatilloPorNombre } from "../helpers/db.js";

const app = createApp();
const NOMBRE = "TEST Platillo Reflejo";
const FECHA = "2099-12-29";

let adminToken = "";
let clienteToken = "";
let entradaId = 0;

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
    .send({ nombre: NOMBRE });

  const entrada = await request(app)
    .post("/api/menu")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ fecha: FECHA, platillo_id: platillo.body.id, precio: 30 });
  entradaId = entrada.body.id as number;
});

afterEach(async () => {
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("Reflejo inmediato de cambios (US3)", () => {
  it("refleja el cambio de precio en la consulta del cliente", async () => {
    await request(app)
      .put(`/api/menu/${entradaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ precio: 80 });

    const res = await request(app)
      .get(`/api/menu/cliente?fecha=${FECHA}`)
      .set("Authorization", `Bearer ${clienteToken}`);

    expect(res.body[0].precio).toBe(80);
  });

  it("refleja el cambio de disponibilidad en la consulta del cliente", async () => {
    await request(app)
      .put(`/api/menu/${entradaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ disponible: false });

    const res = await request(app)
      .get(`/api/menu/cliente?fecha=${FECHA}`)
      .set("Authorization", `Bearer ${clienteToken}`);

    expect(res.body[0].disponible).toBe(false);
  });
});
