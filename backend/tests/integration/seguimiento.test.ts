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
const NOMBRE = "TEST Platillo Seguimiento";
const FECHA_MENU = "2099-12-15";
const CORREO = "test.seguimiento@itsh.edu.mx";
const CORREO_OTRO = "test.seguimiento.otro@itsh.edu.mx";

let adminToken = "";
let clienteToken = "";
let otroToken = "";
let menuDiaId = 0;

async function crearPedido(token: string, minutos = 15): Promise<number> {
  const res = await request(app)
    .post("/api/pedidos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fecha_recoleccion: fechaLocal(minutos),
      items: [{ menu_dia_id: menuDiaId, cantidad: 1 }],
    });
  return res.body.id as number;
}

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;

  clienteToken = await registrarYLogin(app, CORREO);
  otroToken = await registrarYLogin(app, CORREO_OTRO);

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 40);
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

describe("GET /api/pedidos", () => {
  it("lista los pedidos propios con creado_en, más recientes primero", async () => {
    const primero = await crearPedido(clienteToken);
    const segundo = await crearPedido(clienteToken);

    const res = await request(app)
      .get("/api/pedidos")
      .set("Authorization", `Bearer ${clienteToken}`);

    expect(res.status).toBe(200);
    const ids = res.body.map((p: { id: number }) => p.id);
    expect(ids).toContain(primero);
    expect(ids).toContain(segundo);
    // El último creado aparece primero (orden por creado_en DESC, id DESC).
    const posPrimero = ids.indexOf(primero);
    const posSegundo = ids.indexOf(segundo);
    expect(posSegundo).toBeLessThan(posPrimero);
    expect(res.body[0]).toHaveProperty("creado_en");
  });

  it("no mezcla pedidos de otros usuarios", async () => {
    const mio = await crearPedido(clienteToken);

    const res = await request(app)
      .get("/api/pedidos")
      .set("Authorization", `Bearer ${otroToken}`);

    expect(res.status).toBe(200);
    expect(res.body.some((p: { id: number }) => p.id === mio)).toBe(false);
  });

  it("exige sesión autenticada (401)", async () => {
    const res = await request(app).get("/api/pedidos");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/pedidos/:id", () => {
  it("devuelve el detalle con el timeline de estados", async () => {
    const id = await crearPedido(clienteToken);
    await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ token_pago: "tok_ok_seguimiento" });

    const res = await request(app)
      .get(`/api/pedidos/${id}`)
      .set("Authorization", `Bearer ${clienteToken}`);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("Pagado");
    expect(res.body.historial.map((h: { estado_nuevo: string }) => h.estado_nuevo)).toEqual([
      "Pendiente",
      "Pagado",
    ]);
  });

  it("niega el acceso a un pedido ajeno (403)", async () => {
    const id = await crearPedido(clienteToken);

    const res = await request(app)
      .get(`/api/pedidos/${id}`)
      .set("Authorization", `Bearer ${otroToken}`);

    expect(res.status).toBe(403);
  });

  it("devuelve 404 si el pedido no existe", async () => {
    const res = await request(app)
      .get("/api/pedidos/999999")
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(res.status).toBe(404);
  });
});
