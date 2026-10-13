import request from "supertest";
import type { Express } from "express";

export const PASSWORD_CLIENTE = "cliente123";

export const CUENTAS = {
  admin: { correo: "admin@itsh.edu.mx", password: "admin123" },
  cajero: { correo: "caja@itsh.edu.mx", password: "caja123" },
  cocinero: { correo: "cocina@itsh.edu.mx", password: "cocina123" },
} as const;

export async function login(
  app: Express,
  correo: string,
  password: string,
): Promise<string> {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ correo, password });
  return res.body.token as string;
}

export async function registrarYLogin(
  app: Express,
  correo: string,
): Promise<string> {
  await request(app)
    .post("/api/auth/register")
    .send({ nombre: "Cliente de prueba", correo, password: PASSWORD_CLIENTE });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ correo, password: PASSWORD_CLIENTE });

  return login.body.token as string;
}

export async function crearMenuDePrueba(
  app: Express,
  adminToken: string,
  nombre: string,
  fecha: string,
  precio: number,
): Promise<{ platilloId: number; menuDiaId: number }> {
  const platillo = await request(app)
    .post("/api/platillos")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ nombre, categoria: "Comida" });

  const menu = await request(app)
    .post("/api/menu")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({ fecha, platillo_id: platillo.body.id, precio });

  return {
    platilloId: platillo.body.id as number,
    menuDiaId: menu.body.id as number,
  };
}

export function fechaLocal(minutos: number): string {
  const fecha = new Date(Date.now() + minutos * 60_000);
  const p = (n: number): string => String(n).padStart(2, "0");
  return (
    `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}` +
    `T${p(fecha.getHours())}:${p(fecha.getMinutes())}:${p(fecha.getSeconds())}`
  );
}
