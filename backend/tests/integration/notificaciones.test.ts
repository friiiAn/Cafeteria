import { describe, it, expect, afterAll, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import {
  cerrarBaseDatos,
  eliminarPedidoPorId,
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
import { enviarPendientes } from "../../src/services/notificacionService.js";
import { ConsoleMailer } from "../../src/services/mail/ConsoleMailer.js";
import { FailMailer } from "../../src/services/mail/FailMailer.js";

const app = createApp();
const NOMBRE = "TEST Platillo Notificacion";
const FECHA_MENU = "2099-12-16";
const CORREO = "test.notif@itsh.edu.mx";
const CORREO_OTRO = "test.notif.otro@itsh.edu.mx";

let adminToken = "";
let cajaToken = "";
let cocinaToken = "";
let clienteToken = "";
let otroToken = "";
let menuDiaId = 0;
const mostradorCreados: number[] = [];

async function crearAnticipadoPagado(): Promise<{ id: number; numero: string }> {
  const creado = await request(app)
    .post("/api/pedidos")
    .set("Authorization", `Bearer ${clienteToken}`)
    .send({
      fecha_recoleccion: fechaLocal(20),
      items: [{ menu_dia_id: menuDiaId, cantidad: 1 }],
    });
  const id = creado.body.id as number;
  await request(app)
    .post(`/api/pedidos/${id}/pagar`)
    .set("Authorization", `Bearer ${clienteToken}`)
    .send({ token_pago: "tok_ok_notif" });
  return { id, numero: creado.body.numero as string };
}

async function pasarAListo(id: number): Promise<void> {
  await request(app)
    .post(`/api/cocina/pedidos/${id}/iniciar`)
    .set("Authorization", `Bearer ${cocinaToken}`);
  await request(app)
    .post(`/api/cocina/pedidos/${id}/listo`)
    .set("Authorization", `Bearer ${cocinaToken}`);
}

async function notificacionesDe(token: string): Promise<
  { id: number; pedido_id: number; estado_envio: string; intentos: number; leida: boolean; mensaje: string }[]
> {
  const res = await request(app)
    .get("/api/notificaciones")
    .set("Authorization", `Bearer ${token}`);
  expect(res.status).toBe(200);
  return res.body;
}

beforeEach(async () => {
  adminToken = await login(app, CUENTAS.admin.correo, CUENTAS.admin.password);
  cajaToken = await login(app, CUENTAS.cajero.correo, CUENTAS.cajero.password);
  cocinaToken = await login(
    app,
    CUENTAS.cocinero.correo,
    CUENTAS.cocinero.password,
  );
  clienteToken = await registrarYLogin(app, CORREO);
  otroToken = await registrarYLogin(app, CORREO_OTRO);

  const menu = await crearMenuDePrueba(app, adminToken, NOMBRE, FECHA_MENU, 30);
  menuDiaId = menu.menuDiaId;
  mostradorCreados.length = 0;
});

afterEach(async () => {
  await eliminarUsuarioConPedidos(CORREO);
  await eliminarUsuarioConPedidos(CORREO_OTRO);
  for (const id of mostradorCreados) {
    await eliminarPedidoPorId(id);
  }
  await eliminarPlatilloPorNombre(NOMBRE);
});

afterAll(async () => {
  await cerrarBaseDatos();
});

describe("Notificación al pasar a Listo", () => {
  it("crea una notificación pendiente para el dueño del pedido", async () => {
    const { id, numero } = await crearAnticipadoPagado();
    await pasarAListo(id);

    const notificaciones = await notificacionesDe(clienteToken);
    const notificacion = notificaciones.find((n) => n.pedido_id === id);

    expect(notificacion).toBeTruthy();
    expect(notificacion?.estado_envio).toBe("pendiente");
    expect(notificacion?.intentos).toBe(0);
    expect(notificacion?.leida).toBe(false);
    expect(notificacion?.mensaje).toContain(numero);
  });

  it("envía el correo y registra el resultado (enviada, intentos=1)", async () => {
    const { id } = await crearAnticipadoPagado();
    await pasarAListo(id);

    const resultado = await enviarPendientes(new ConsoleMailer());
    expect(resultado.enviadas).toBeGreaterThanOrEqual(1);

    const notificaciones = await notificacionesDe(clienteToken);
    const notificacion = notificaciones.find((n) => n.pedido_id === id);
    expect(notificacion?.estado_envio).toBe("enviada");
    expect(notificacion?.intentos).toBe(1);
  });

  it("un fallo de correo se registra y se reintenta sin perderse", async () => {
    const { id } = await crearAnticipadoPagado();
    await pasarAListo(id);

    const fallo = await enviarPendientes(new FailMailer());
    expect(fallo.fallidas).toBeGreaterThanOrEqual(1);

    let notificacion = (await notificacionesDe(clienteToken)).find(
      (n) => n.pedido_id === id,
    );
    expect(notificacion?.estado_envio).toBe("fallida");
    expect(notificacion?.intentos).toBe(1);

    await enviarPendientes(new ConsoleMailer());

    notificacion = (await notificacionesDe(clienteToken)).find(
      (n) => n.pedido_id === id,
    );
    expect(notificacion?.estado_envio).toBe("enviada");
    expect(notificacion?.intentos).toBe(2);
  });

  it("no notifica pedidos de mostrador", async () => {
    const creado = await request(app)
      .post("/api/caja/pedidos")
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ cliente_nombre: "Mostrador", items: [{ menu_dia_id: menuDiaId, cantidad: 1 }] });
    const id = creado.body.id as number;
    mostradorCreados.push(id);
    await request(app)
      .post(`/api/caja/pedidos/${id}/cobrar`)
      .set("Authorization", `Bearer ${cajaToken}`)
      .send({ metodo: "efectivo" });
    await pasarAListo(id);

    const notificaciones = await notificacionesDe(cajaToken);
    expect(notificaciones.some((n) => n.pedido_id === id)).toBe(false);
  });

  it("no notifica pedidos cancelados", async () => {
    const creado = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${clienteToken}`)
      .send({
        fecha_recoleccion: fechaLocal(20),
        items: [{ menu_dia_id: menuDiaId, cantidad: 1 }],
      });
    const id = creado.body.id as number;
    await request(app)
      .post(`/api/pedidos/${id}/cancelar`)
      .set("Authorization", `Bearer ${clienteToken}`);

    const notificaciones = await notificacionesDe(clienteToken);
    expect(notificaciones.some((n) => n.pedido_id === id)).toBe(false);
  });
});

describe("GET /api/notificaciones", () => {
  it("solo muestra las notificaciones del usuario y exige sesión", async () => {
    const { id } = await crearAnticipadoPagado();
    await pasarAListo(id);

    const ajeno = await notificacionesDe(otroToken);
    expect(ajeno.some((n) => n.pedido_id === id)).toBe(false);

    const anonimo = await request(app).get("/api/notificaciones");
    expect(anonimo.status).toBe(401);
  });
});

describe("POST /api/notificaciones/:id/leer", () => {
  it("marca como leída una notificación propia", async () => {
    const { id } = await crearAnticipadoPagado();
    await pasarAListo(id);
    const notificacion = (await notificacionesDe(clienteToken)).find(
      (n) => n.pedido_id === id,
    );

    const res = await request(app)
      .post(`/api/notificaciones/${notificacion?.id}/leer`)
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(res.status).toBe(200);
    expect(res.body.leida).toBe(true);

    const despues = (await notificacionesDe(clienteToken)).find(
      (n) => n.id === notificacion?.id,
    );
    expect(despues?.leida).toBe(true);
  });

  it("niega marcar como leída una notificación ajena (403)", async () => {
    const { id } = await crearAnticipadoPagado();
    await pasarAListo(id);
    const notificacion = (await notificacionesDe(clienteToken)).find(
      (n) => n.pedido_id === id,
    );

    const res = await request(app)
      .post(`/api/notificaciones/${notificacion?.id}/leer`)
      .set("Authorization", `Bearer ${otroToken}`);
    expect(res.status).toBe(403);
  });

  it("devuelve 404 si la notificación no existe", async () => {
    const res = await request(app)
      .post("/api/notificaciones/999999/leer")
      .set("Authorization", `Bearer ${clienteToken}`);
    expect(res.status).toBe(404);
  });
});
