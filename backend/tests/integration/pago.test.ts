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
const NOMBRE = "TEST Platillo Pago";
const FECHA_MENU = "2099-12-29";
const CORREO = "test.pago@itsh.edu.mx";
const CORREO_OTRO = "test.pago.otro@itsh.edu.mx";

let adminToken = "";
let clienteToken = "";
let otroToken = "";
let menuDiaId = 0;

beforeEach(async () => {
  const admin = await request(app)
    .post("/api/auth/login")
    .send({ correo: "admin@itsh.edu.mx", password: "admin123" });
  adminToken = admin.body.token as string;

  clienteToken = await registrarYLogin(app, CORREO);
  otroToken = await registrarYLogin(app, CORREO_OTRO);

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 45);
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

async function crearPedido(token: string): Promise<number> {
  const res = await request(app)
    .post("/api/pedidos")
    .set("Authorization", `Bearer ${token}`)
    .send({
      fecha_recoleccion: fechaLocal(15),
      items: [{ menu_dia_id: menuDiaId, cantidad: 2 }],
    });
  return res.body.id as number;
}

describe("POST /api/pedidos/:id/pagar", () => {
  it("confirma el pago y pasa el pedido a Pagado", async () => {
    const id = await crearPedido(clienteToken);

    const res = await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ token_pago: "tok_ok_demo" });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("Pagado");
    expect(res.body.pago.metodo).toBe("online");
    expect(res.body.pago.monto).toBe(90);
    expect(res.body.pago.estado).toBe("confirmado");
    expect(res.body.pago.referencia).toBeTruthy();

    const detalle = await request(app)
      .get(`/api/pedidos/${id}`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(detalle.body.estado).toBe("Pagado");
    const historial = detalle.body.historial;
    expect(historial[historial.length - 1].estado_nuevo).toBe("Pagado");
  });

  it("rechaza el pago (402) y el pedido sigue Pendiente", async () => {
    const id = await crearPedido(clienteToken);

    const res = await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ token_pago: "tok_fail_demo" });

    expect(res.status).toBe(402);

    const detalle = await request(app)
      .get(`/api/pedidos/${id}`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(detalle.body.estado).toBe("Pendiente");
  });

  it("no permite pagar dos veces el mismo pedido (409)", async () => {
    const id = await crearPedido(clienteToken);

    await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ token_pago: "tok_ok_demo" });

    const res = await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({ token_pago: "tok_ok_demo" });

    expect(res.status).toBe(409);
  });

  it("no permite pagar un pedido ajeno (404)", async () => {
    const id = await crearPedido(clienteToken);

    const res = await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${otroToken}`)
      .send({ token_pago: "tok_ok_demo" });

    expect(res.status).toBe(404);
  });

  it("exige un token de pago (400)", async () => {
    const id = await crearPedido(clienteToken);

    const res = await request(app)
      .post(`/api/pedidos/${id}/pagar`)
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
