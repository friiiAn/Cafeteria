import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
  cerrarBaseDatos,
  eliminarPlatilloPorNombre,
  eliminarUsuarioConPedidos,
} from "../helpers/db.js";
import {
  CUENTAS,
  crearMenuDePrueba,
  fechaLocal,
  login,
  registrarYLogin,
} from "../helpers/pedidos.js";

const app = createApp();
const NOMBRE = "TEST Platillo Orden";
const FECHA_MENU = "2099-12-25";
const CORREO = "test.orden@itsh.edu.mx";

let adminToken = "";
let cocinaToken = "";
let clienteToken = "";
let menuDiaId = 0;

async function pedidoPagado(minutos: number): Promise<number> {
  const creado = await request(app)
    .post("/api/pedidos")
    .set("Authorization", `Bearer ${clienteToken}`)
    .send({
      fecha_recoleccion: fechaLocal(minutos),
      items: [{ menu_dia_id: menuDiaId, cantidad: 1 }],
    });
  const id = creado.body.id as number;
  const pago = await request(app)
    .post(`/api/pedidos/${id}/pagar`)
    .set("Authorization", `Bearer ${clienteToken}`)
    .send({ token_pago: "tok_ok_orden" });
  expect(pago.status).toBe(200);
  return id;
}

beforeEach(async () => {
  adminToken = await login(app, CUENTAS.admin.correo, CUENTAS.admin.password);
  cocinaToken = await login(
    app,
    CUENTAS.cocinero.correo,
    CUENTAS.cocinero.password,
  );
  clienteToken = await registrarYLogin(app, CORREO);

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 20);
  menuDiaId = menu.menuDiaId;
});

afterEach(async () => {
  await eliminarUsuarioConPedidos(CORREO);
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("Orden de la lista de cocina", () => {
  it("ordena por hora de recolección ascendente", async () => {
    const lejano = await pedidoPagado(120);
    const cercano = await pedidoPagado(30);

    const res = await request(app)
      .get("/api/cocina/pedidos")
      .set("Authorization", `Bearer ${cocinaToken}`);

    expect(res.status).toBe(200);
    const ids = res.body.map((p: { id: number }) => p.id as number);
    expect(ids.indexOf(cercano)).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf(lejano)).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf(cercano)).toBeLessThan(ids.indexOf(lejano));
  });
});
