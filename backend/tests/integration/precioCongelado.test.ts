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
const NOMBRE = "TEST Platillo Congelado";
const FECHA_MENU = "2099-12-28";
const CORREO = "test.congelado@itsh.edu.mx";

let adminToken = "";
let clienteToken = "";
let menuDiaId = 0;

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;
  clienteToken = await registrarYLogin(app, CORREO);

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 45);
  menuDiaId = menu.menuDiaId;
});

afterEach(async () => {
  await eliminarUsuarioConPedidos(CORREO);
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("precio congelado del pedido", () => {
  it("conserva el precio al cambiar el menú después de crear el pedido", async () => {
    const creado = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({
        fecha_recoleccion: fechaLocal(15),
        items: [{ menu_dia_id: menuDiaId, cantidad: 2 }],
      });
    expect(creado.status).toBe(201);
    expect(creado.body.total).toBe(90);

    await request(app)
      .put(`/api/menu/${menuDiaId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ precio: 60 });

    const detalle = await request(app)
      .get(`/api/pedidos/${creado.body.id}`)
      .set("Authorization", `Bearer ${clienteToken}`);

    expect(detalle.body.items[0].precio_unitario).toBe(45);
    expect(detalle.body.items[0].subtotal).toBe(90);
    expect(detalle.body.total).toBe(90);
  });
});
