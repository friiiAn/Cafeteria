import { describe, it, expect, afterAll, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarUsuarioPorCorreo } from "../helpers/db.js";

const app = createApp();
const CORREO = "test-registro@itsh.edu.mx";

afterEach(async () => {
  await eliminarUsuarioPorCorreo(CORREO);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("POST /api/auth/register", () => {
  it("registra un cliente con rol usuario", async () => {
    const res = await request(app).post("/api/auth/register").send({
      nombre: "Ana Pérez",
      correo: CORREO,
      password: "secreto123",
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTypeOf("number");
    expect(res.body.rol).toBe("usuario");
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("rechaza un correo duplicado con 409", async () => {
    await request(app).post("/api/auth/register").send({
      nombre: "Ana",
      correo: CORREO,
      password: "secreto123",
    });
    const res = await request(app).post("/api/auth/register").send({
      nombre: "Otra",
      correo: CORREO,
      password: "secreto123",
    });
    expect(res.status).toBe(409);
  });

  it("rechaza datos inválidos con 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ nombre: "A", correo: "no-es-correo", password: "123" });
    expect(res.status).toBe(400);
  });

  it("no permite elegir un rol privilegiado", async () => {
    const res = await request(app).post("/api/auth/register").send({
      nombre: "Intruso",
      correo: CORREO,
      password: "secreto123",
      rol: "administrador",
    });
    expect(res.status).toBe(201);
    expect(res.body.rol).toBe("usuario");
  });
});
