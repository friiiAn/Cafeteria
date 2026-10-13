import { describe, it, expect, afterAll, beforeAll, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarUsuarioPorCorreo } from "../helpers/db.js";

const app = createApp();
const CORREO = "test-cajero@itsh.edu.mx";

let adminToken = "";

beforeAll(async () => {
  const login = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = login.body.token as string;
});

afterEach(async () => {
  await eliminarUsuarioPorCorreo(CORREO);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("CRUD /api/usuarios (administrador)", () => {
  it("crea un usuario operativo (cajero)", async () => {
    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Carlos Cajero",
        correo: CORREO,
        password: "secreto123",
        rol: "cajero",
      });

    expect(res.status).toBe(201);
    expect(res.body.rol).toBe("cajero");
    expect(res.body.activo).toBe(true);
    expect(res.body).not.toHaveProperty("password_hash");
  });

  it("rechaza crear con rol inválido", async () => {
    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "X",
        correo: CORREO,
        password: "secreto123",
        rol: "usuario",
      });
    expect(res.status).toBe(400);
  });

  it("lista, desactiva y bloquea el acceso del desactivado", async () => {
    const creado = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        nombre: "Carlos Cajero",
        correo: CORREO,
        password: "secreto123",
        rol: "cajero",
      });
    expect(creado.status).toBe(201);

    const lista = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(lista.status).toBe(200);
    expect(lista.body.some((u: { correo: string }) => u.correo === CORREO)).toBe(true);

    const actualizado = await request(app)
      .put(`/api/usuarios/${creado.body.id}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ activo: false });
    expect(actualizado.status).toBe(200);
    expect(actualizado.body.activo).toBe(false);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ correo: CORREO, password: "secreto123" });
    expect(login.status).toBe(401);
  });

  it("responde 403 a un usuario sin rol administrador", async () => {
    const cajero = await request(app)
      .post("/api/auth/login")
      .send({ correo: "caja@itsh.edu.mx", password: "caja123" });

    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${cajero.body.token}`)
      .send({
        nombre: "No permitido",
        correo: CORREO,
        password: "secreto123",
        rol: "cajero",
      });
    expect(res.status).toBe(403);
  });
});
