import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarPlatilloPorNombre } from "../helpers/db.js";

const app = createApp();
const NOMBRE = "TEST Platillo Integración";

let adminToken = "";
let cajeroToken = "";

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;

  const cajero = await request(app)
    .post("/api/auth/login")
    .send({ correo: "caja@itsh.edu.mx", password: "caja123" });
  cajeroToken = cajero.body.token as string;
});

afterEach(async () => {
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("CRUD /api/platillos (administrador)", () => {
  it("crea un platillo y lo devuelve con su id", async () => {
    const res = await request(app)
      .post("/api/platillos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: NOMBRE, categoria: "Comida", descripcion: "Rico" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeGreaterThan(0);
    expect(res.body.nombre).toBe(NOMBRE);
    expect(res.body.activo).toBe(true);
  });

  it("lista y filtra por estado activo", async () => {
    await request(app)
      .post("/api/platillos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: NOMBRE });

    const activos = await request(app)
      .get("/api/platillos?activo=true")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(activos.status).toBe(200);
    expect(activos.body.some((p: { nombre: string }) => p.nombre === NOMBRE)).toBe(true);

    const inactivos = await request(app)
      .get("/api/platillos?activo=false")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(inactivos.body.some((p: { nombre: string }) => p.nombre === NOMBRE)).toBe(false);
  });

  it("actualiza el estado activo de un platillo", async () => {
    const creado = await request(app)
      .post("/api/platillos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: NOMBRE });

    const res = await request(app)
      .put(`/api/platillos/${creado.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ activo: false });

    expect(res.status).toBe(200);
    expect(res.body.activo).toBe(false);
  });

  it("rechaza nombre inválido con 400", async () => {
    const res = await request(app)
      .post("/api/platillos")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "" });
    expect(res.status).toBe(400);
  });

  it("responde 404 al actualizar un platillo inexistente", async () => {
    const res = await request(app)
      .put("/api/platillos/99999999")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ activo: false });
    expect(res.status).toBe(404);
  });

  it("responde 403 a un usuario sin rol administrador", async () => {
    const res = await request(app)
      .post("/api/platillos")
      .set("Authorization", `Bearer ${cajeroToken}`)
      .send({ nombre: NOMBRE });
    expect(res.status).toBe(403);
  });
});
