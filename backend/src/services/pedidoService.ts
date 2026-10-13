import * as menuRepo from "../db/menuRepository.js";
import * as pedidoRepo from "../db/pedidoRepository.js";
import * as pagoRepo from "../db/pagoRepository.js";
import * as estadoService from "./estadoService.js";
import { getPaymentGateway } from "./payment/index.js";
import { withTransaction, type DbExecutor } from "../db/pool.js";
import { HttpError } from "../utils/httpError.js";
import { env } from "../config/env.js";
import { hoyISO, formatoMySQL, formatoFechaHora } from "../utils/fecha.js";
import type {
  ItemPedido,
  PedidoDetalle,
  PedidoResumen,
  PagoConfirmado,
} from "../types/pedido.js";

interface LineaBase {
  menu_dia_id: number;
  cantidad: number;
  precio_unitario: number;
}

function redondear(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100;
}

export function calcularTotales(lineas: LineaBase[]): {
  total: number;
  items: ItemPedido[];
} {
  let total = 0;
  const items: ItemPedido[] = lineas.map((linea) => {
    const subtotal = redondear(linea.cantidad * linea.precio_unitario);
    total += subtotal;
    return {
      menu_dia_id: linea.menu_dia_id,
      nombre: "",
      cantidad: linea.cantidad,
      precio_unitario: redondear(linea.precio_unitario),
      subtotal,
    };
  });
  return { total: redondear(total), items };
}

export function anticipacionSuficiente(
  fechaRecoleccion: Date,
  ahora: Date,
  minLead: number,
): boolean {
  return fechaRecoleccion.getTime() >= ahora.getTime() + minLead * 60_000;
}

function parsearFechaLocal(valor: string): Date {
  const fecha = new Date(valor.replace(" ", "T"));
  if (Number.isNaN(fecha.getTime())) {
    throw HttpError.badRequest("Fecha de recolección inválida");
  }
  return fecha;
}

function consolidar(
  items: { menu_dia_id: number; cantidad: number }[],
): { menu_dia_id: number; cantidad: number }[] {
  const acumulado = new Map<number, number>();
  for (const item of items) {
    acumulado.set(
      item.menu_dia_id,
      (acumulado.get(item.menu_dia_id) ?? 0) + item.cantidad,
    );
  }
  return [...acumulado.entries()].map(([menu_dia_id, cantidad]) => ({
    menu_dia_id,
    cantidad,
  }));
}

async function construirLineas(
  items: { menu_dia_id: number; cantidad: number }[],
): Promise<{ total: number; items: ItemPedido[] }> {
  const consolidados = consolidar(items);
  const entradas = await menuRepo.listarPorIds(
    consolidados.map((item) => item.menu_dia_id),
  );
  const porId = new Map(entradas.map((entrada) => [entrada.id, entrada]));

  const lineas: LineaBase[] = consolidados.map((item) => {
    const entrada = porId.get(item.menu_dia_id);
    if (!entrada) {
      throw HttpError.conflict("Uno de los platillos del menú ya no existe");
    }
    if (!entrada.disponible || !entrada.platillo_activo) {
      throw HttpError.conflict(`El platillo "${entrada.nombre}" no está disponible`);
    }
    return {
      menu_dia_id: item.menu_dia_id,
      cantidad: item.cantidad,
      precio_unitario: entrada.precio,
    };
  });

  return calcularTotales(lineas);
}

async function generarFolio(
  conn: DbExecutor,
  tipo: "anticipado" | "mostrador",
): Promise<string> {
  const hoy = hoyISO();
  const prefijo = tipo === "mostrador" ? "M" : "A";
  const base = `${prefijo}-${hoy.replace(/-/g, "")}`;
  const total = await pedidoRepo.contarDelDia(conn, hoy, prefijo);
  for (let n = total + 1; n <= total + 20; n += 1) {
    const numero = `${base}-${String(n).padStart(3, "0")}`;
    const existe = await pedidoRepo.existeNumero(conn, numero);
    if (!existe) {
      return numero;
    }
  }
  throw new HttpError(500, "INTERNAL_ERROR", "No se pudo generar el folio del pedido");
}

export async function crear(
  usuarioId: number,
  datos: {
    fecha_recoleccion: string;
    items: { menu_dia_id: number; cantidad: number }[];
  },
): Promise<PedidoDetalle> {
  const fecha = parsearFechaLocal(datos.fecha_recoleccion);
  if (!anticipacionSuficiente(fecha, new Date(), env.MIN_LEAD_MINUTES)) {
    throw HttpError.conflict(
      `El pedido requiere al menos ${env.MIN_LEAD_MINUTES} minutos de anticipación`,
    );
  }

  const { total, items } = await construirLineas(datos.items);
  const estadoPendiente = await estadoService.idPorNombre("Pendiente");

  const pedidoId = await withTransaction(async (conn) => {
    const numero = await generarFolio(conn, "anticipado");
    const id = await pedidoRepo.crear(conn, {
      numero,
      tipo: "anticipado",
      estadoId: estadoPendiente,
      usuarioId,
      clienteNombre: null,
      fechaRecoleccion: formatoMySQL(fecha),
      total,
      creadoPor: usuarioId,
    });
    await pedidoRepo.crearDetalles(conn, id, items);
    await pedidoRepo.registrarHistorial(conn, {
      pedidoId: id,
      anteriorId: null,
      nuevoId: estadoPendiente,
      cambiadoPor: usuarioId,
    });
    return id;
  });

  return obtener(usuarioId, pedidoId);
}

export async function listar(
  usuarioId: number,
  filtros: { estado?: string; desde?: string; hasta?: string } = {},
): Promise<PedidoResumen[]> {
  return pedidoRepo.listarPorUsuario(usuarioId, filtros);
}

async function construirDetalle(
  pedido: pedidoRepo.PedidoBase,
): Promise<PedidoDetalle> {
  const items = await pedidoRepo.listarDetalle(pedido.id);
  const historial = await pedidoRepo.listarHistorial(pedido.id);
  return {
    id: pedido.id,
    numero: pedido.numero,
    tipo: pedido.tipo,
    estado: pedido.estado,
    total: Number(pedido.total),
    fecha_recoleccion: pedido.fecha_recoleccion
      ? formatoFechaHora(pedido.fecha_recoleccion)
      : "",
    items,
    historial,
  };
}

export async function obtener(
  usuarioId: number,
  pedidoId: number,
): Promise<PedidoDetalle> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido || pedido.usuario_id !== usuarioId) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  return construirDetalle(pedido);
}

export async function obtenerParaCaja(pedidoId: number): Promise<PedidoDetalle> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  return construirDetalle(pedido);
}

export async function pagar(
  usuarioId: number,
  pedidoId: number,
  tokenPago: string,
): Promise<PagoConfirmado> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido || pedido.usuario_id !== usuarioId) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  if (pedido.estado !== "Pendiente") {
    throw HttpError.conflict("El pedido ya no está pendiente de pago");
  }
  const pagoExistente = await pagoRepo.findByPedido(pedidoId);
  if (pagoExistente) {
    throw HttpError.conflict("El pedido ya tiene un pago registrado");
  }

  const monto = Number(pedido.total);
  const gateway = getPaymentGateway();
  const resultado = await gateway.cobrar({
    monto,
    token: tokenPago,
    referencia: pedido.numero,
  });
  if (!resultado.aprobado) {
    throw new HttpError(
      402,
      "PAYMENT_REJECTED",
      resultado.mensaje ?? "Pago rechazado",
    );
  }

  const estadoPagado = await estadoService.idPorNombre("Pagado");
  try {
    await withTransaction(async (conn) => {
      await pagoRepo.crear(conn, {
        pedidoId,
        metodo: "online",
        monto,
        referencia: resultado.referencia ?? null,
        registradoPor: usuarioId,
      });
      await pedidoRepo.actualizarEstado(conn, pedidoId, estadoPagado);
      await pedidoRepo.registrarHistorial(conn, {
        pedidoId,
        anteriorId: pedido.estado_id,
        nuevoId: estadoPagado,
        cambiadoPor: usuarioId,
      });
    });
  } catch (error) {
    if (esErrorDuplicado(error)) {
      throw HttpError.conflict("El pedido ya tiene un pago registrado");
    }
    throw error;
  }

  return {
    pedido_id: pedidoId,
    estado: "Pagado",
    pago: {
      metodo: "online",
      monto,
      referencia: resultado.referencia ?? null,
      estado: "confirmado",
    },
  };
}

export async function cancelar(
  usuarioId: number,
  pedidoId: number,
): Promise<{ id: number; estado: string }> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido || pedido.usuario_id !== usuarioId) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  if (pedido.estado !== "Pendiente") {
    throw HttpError.conflict("El pedido ya no se puede cancelar");
  }

  const estadoCancelado = await estadoService.idPorNombre("Cancelado");
  await withTransaction(async (conn) => {
    await pedidoRepo.actualizarEstado(conn, pedidoId, estadoCancelado);
    await pedidoRepo.registrarHistorial(conn, {
      pedidoId,
      anteriorId: pedido.estado_id,
      nuevoId: estadoCancelado,
      cambiadoPor: usuarioId,
    });
  });

  return { id: pedidoId, estado: "Cancelado" };
}

export async function crearMostrador(
  cajeroId: number,
  datos: {
    items: { menu_dia_id: number; cantidad: number }[];
    cliente_nombre?: string;
  },
): Promise<PedidoDetalle> {
  const { total, items } = await construirLineas(datos.items);
  const estadoPendiente = await estadoService.idPorNombre("Pendiente");

  const pedidoId = await withTransaction(async (conn) => {
    const numero = await generarFolio(conn, "mostrador");
    const id = await pedidoRepo.crear(conn, {
      numero,
      tipo: "mostrador",
      estadoId: estadoPendiente,
      usuarioId: cajeroId,
      clienteNombre: datos.cliente_nombre ?? null,
      fechaRecoleccion: formatoMySQL(new Date()),
      total,
      creadoPor: cajeroId,
    });
    await pedidoRepo.crearDetalles(conn, id, items);
    await pedidoRepo.registrarHistorial(conn, {
      pedidoId: id,
      anteriorId: null,
      nuevoId: estadoPendiente,
      cambiadoPor: cajeroId,
    });
    return id;
  });

  return obtenerParaCaja(pedidoId);
}

export async function cobrarEnCaja(
  pedidoId: number,
  metodo: "efectivo" | "tarjeta",
  cajeroId: number,
): Promise<PagoConfirmado> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  if (pedido.estado !== "Pendiente") {
    throw HttpError.conflict("El pedido no está pendiente de cobro");
  }
  const pagoExistente = await pagoRepo.findByPedido(pedidoId);
  if (pagoExistente) {
    throw HttpError.conflict("El pedido ya tiene un pago registrado");
  }

  const monto = Number(pedido.total);
  const estadoPagado = await estadoService.idPorNombre("Pagado");
  try {
    await withTransaction(async (conn) => {
      await pagoRepo.crear(conn, {
        pedidoId,
        metodo,
        monto,
        referencia: null,
        registradoPor: cajeroId,
      });
      const filas = await pedidoRepo.cambiarEstadoCondicional(
        conn,
        pedidoId,
        pedido.estado_id,
        estadoPagado,
      );
      if (filas === 0) {
        throw HttpError.conflict("El pedido cambió de estado; actualiza y reintenta");
      }
      await pedidoRepo.registrarHistorial(conn, {
        pedidoId,
        anteriorId: pedido.estado_id,
        nuevoId: estadoPagado,
        cambiadoPor: cajeroId,
      });
    });
  } catch (error) {
    if (esErrorDuplicado(error)) {
      throw HttpError.conflict("El pedido ya tiene un pago registrado");
    }
    throw error;
  }

  return {
    pedido_id: pedidoId,
    estado: "Pagado",
    pago: { metodo, monto, referencia: null, estado: "confirmado" },
  };
}

export async function cancelarEnCaja(
  pedidoId: number,
  cajeroId: number,
): Promise<{ id: number; estado: string }> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  if (pedido.estado !== "Pendiente") {
    throw HttpError.conflict("El pedido ya no se puede cancelar");
  }

  const estadoCancelado = await estadoService.idPorNombre("Cancelado");
  await withTransaction(async (conn) => {
    const filas = await pedidoRepo.cambiarEstadoCondicional(
      conn,
      pedidoId,
      pedido.estado_id,
      estadoCancelado,
    );
    if (filas === 0) {
      throw HttpError.conflict("El pedido cambió de estado; actualiza y reintenta");
    }
    await pedidoRepo.registrarHistorial(conn, {
      pedidoId,
      anteriorId: pedido.estado_id,
      nuevoId: estadoCancelado,
      cambiadoPor: cajeroId,
    });
  });

  return { id: pedidoId, estado: "Cancelado" };
}

export async function transicionar(
  pedidoId: number,
  haciaNombre: string,
  cambiadoPor: number,
): Promise<{ id: number; estado: string }> {
  const pedido = await pedidoRepo.obtenerBase(pedidoId);
  if (!pedido) {
    throw HttpError.notFound("Pedido no encontrado");
  }
  const haciaId = await estadoService.idPorNombre(haciaNombre);
  if (pedido.estado_id === haciaId) {
    throw HttpError.conflict(`El pedido ya está en estado ${haciaNombre}`);
  }
  if (!(await estadoService.transicionPermitida(pedido.estado_id, haciaId))) {
    throw HttpError.conflict(
      `No se puede pasar de ${pedido.estado} a ${haciaNombre}`,
    );
  }

  await withTransaction(async (conn) => {
    const filas = await pedidoRepo.cambiarEstadoCondicional(
      conn,
      pedidoId,
      pedido.estado_id,
      haciaId,
    );
    if (filas === 0) {
      throw HttpError.conflict("El pedido cambió de estado; actualiza y reintenta");
    }
    await pedidoRepo.registrarHistorial(conn, {
      pedidoId,
      anteriorId: pedido.estado_id,
      nuevoId: haciaId,
      cambiadoPor,
    });
  });

  return { id: pedidoId, estado: haciaNombre };
}

function esErrorDuplicado(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_ENTRY"
  );
}
