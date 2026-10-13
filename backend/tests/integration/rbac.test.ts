import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { cerrarBaseDatos } from "../helpers/db.js";

const app = createApp();

async function tokenDe(correo: string, password: string): Promise<string> {
  const res = await request(app).post("/api/auth/login").send({ correo, password });
  return res.body.token as string;
}

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("RBAC en /api/usuarios", () => {
  it("responde 401 sin sesión", async () => {
    const res = await request(app).get("/api/usuarios");
    expect(res.status).toBe(401);
  });

  it("responde 403 para un cajero", async () => {
    const token = await tokenDe("caja@itsh.edu.mx", "caja123");
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("responde 403 para un cocinero", async () => {
    const token = await tokenDe("cocina@itsh.edu.mx", "cocina123");
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("permite 200 para un administrador", async () => {
    const token = await tokenDe("admin@itsh.edu.mx", "admin123");
    const res = await request(app)
      .get("/api/usuarios")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
