import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos, eliminarUsuarioPorCorreo } from "../helpers/db.js";
import { existeCorreo, createUsuario } from "../../src/db/usuarioRepository.js";
import { hashPassword } from "../../src/utils/password.js";

const app = createApp();
const CORREO = "test-auth@itsh.edu.mx";
const PASSWORD = "test1234";

beforeAll(async () => {
  if (!(await existeCorreo(CORREO))) {
    await createUsuario({
      nombre: "Test Auth",
      correo: CORREO,
      passwordHash: await hashPassword(PASSWORD),
      rol: "usuario",
    });
  }
});

afterAll(async () => {
  await eliminarUsuarioPorCorreo(CORREO);
  await cerrarBaseDatos();
});

describe("POST /api/auth/login", () => {
  it("inicia sesión con credenciales válidas y devuelve token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: CORREO, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.usuario.correo).toBe(CORREO);
    expect(res.body.usuario).not.toHaveProperty("password_hash");
  });

  it("rechaza credenciales inválidas con mensaje genérico", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: CORREO, password: "incorrecta" });

    expect(res.status).toBe(401);
    expect(res.body.error.message).not.toContain("correo");
  });

  it("rechaza un correo inexistente con el mismo mensaje", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ correo: "noexiste@itsh.edu.mx", password: "x" });

    expect(res.status).toBe(401);
  });

  it("valida el cuerpo de la petición", async () => {
    const res = await request(app).post("/api/auth/login").send({ correo: "malo" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/auth/me", () => {
  it("devuelve el perfil con token válido", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ correo: CORREO, password: PASSWORD });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.correo).toBe(CORREO);
    expect(res.body.rol).toBe("usuario");
  });

  it("responde 401 sin token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("responde 401 con token inválido", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token.falso.aqui");
    expect(res.status).toBe(401);
  });
});
