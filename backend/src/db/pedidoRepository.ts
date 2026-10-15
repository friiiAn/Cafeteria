import type { RowDataPacket } from "mysql2";
import { q, e, query, type DbExecutor } from "./pool.js";
import { formatoFechaHora } from "../utils/fecha.js";
import type {
  HistorialEstado,
  ItemPedido,
  PedidoResumen,
} from "../types/pedido.js";

export interface PedidoBase extends RowDataPacket {
  id: number;
  numero: string;
  tipo: string;
  usuario_id: number | null;
  estado_id: number;
  estado: string;
  total: string | number;
  fecha_recoleccion: Date | string;
  creado_en: Date | string;
}

interface ItemRow extends RowDataPacket {
  menu_dia_id: number;
  nombre: string | null;
  cantidad: number;
  precio_unitario: string | number;
  subtotal: string | number;
}

interface HistorialRow extends RowDataPacket {
  estado_anterior: string | null;
  estado_nuevo: string;
  fecha: Date | string;
}

interface ResumenRow extends RowDataPacket {
  id: number;
  numero: string;
  estado: string;
  total: string | number;
  fecha_recoleccion: Date | string;
  creado_en: Date | string;
}

export interface PedidoEntregaRow extends RowDataPacket {
  id: number;
  numero: string;
  tipo: string;
  cliente_nombre: string | null;
  total: string | number;
  creado_en: Date | string;
  fecha_recoleccion: Date | string;
}

interface LineaPedido {
  menu_dia_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export async function crear(
  conn: DbExecutor,
  params: {
    numero: string;
    tipo: "anticipado" | "mostrador";
    estadoId: number;
    usuarioId: number | null;
    clienteNombre: string | null;
    fechaRecoleccion: string | null;
    total: number;
    creadoPor: number | null;
  },
): Promise<number> {
  const result = await e(
    conn,
    `INSERT INTO pedido
       (numero, tipo, estado_id, usuario_id, cliente_nombre, fecha_recoleccion, total, creado_por)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.numero,
      params.tipo,
      params.estadoId,
      params.usuarioId,
      params.clienteNombre,
      params.fechaRecoleccion,
      params.total,
      params.creadoPor,
    ],
  );
  return result.insertId;
}

export async function crearDetalles(
  conn: DbExecutor,
  pedidoId: number,
  lineas: LineaPedido[],
): Promise<void> {
  for (const linea of lineas) {
    await e(
      conn,
      `INSERT INTO pedido_detalle (pedido_id, menu_dia_id, cantidad, precio_unitario, subtotal)
       VALUES (?, ?, ?, ?, ?)`,
      [
        pedidoId,
        linea.menu_dia_id,
        linea.cantidad,
        linea.precio_unitario,
        linea.subtotal,
      ],
    );
  }
}

export async function registrarHistorial(
  conn: DbExecutor,
  params: {
    pedidoId: number;
    anteriorId: number | null;
    nuevoId: number;
    cambiadoPor: number | null;
  },
): Promise<void> {
  await e(
    conn,
    `INSERT INTO pedido_estado_historial (pedido_id, estado_anterior_id, estado_nuevo_id, cambiado_por)
     VALUES (?, ?, ?, ?)`,
    [params.pedidoId, params.anteriorId, params.nuevoId, params.cambiadoPor],
  );
}

export async function actualizarEstado(
  conn: DbExecutor,
  pedidoId: number,
  estadoId: number,
): Promise<void> {
  await e(conn, `UPDATE pedido SET estado_id = ? WHERE id = ?`, [
    estadoId,
    pedidoId,
  ]);
}

export async function cambiarEstadoCondicional(
  conn: DbExecutor,
  pedidoId: number,
  desdeId: number,
  haciaId: number,
): Promise<number> {
  const result = await e(
    conn,
    `UPDATE pedido SET estado_id = ? WHERE id = ? AND estado_id = ?`,
    [haciaId, pedidoId, desdeId],
  );
  return result.affectedRows;
}

export async function existeNumero(
  conn: DbExecutor,
  numero: string,
): Promise<boolean> {
  const rows = await q<RowDataPacket[]>(
    conn,
    "SELECT id FROM pedido WHERE numero = ? LIMIT 1",
    [numero],
  );
  return rows.length > 0;
}

export async function contarDelDia(
  conn: DbExecutor,
  fecha: string,
  prefijo: string,
): Promise<number> {
  const rows = await q<RowDataPacket[]>(
    conn,
    "SELECT COUNT(*) AS total FROM pedido WHERE DATE(creado_en) = ? AND numero LIKE ?",
    [fecha, `${prefijo}-%`],
  );
  return Number(rows[0]?.total ?? 0);
}

export async function obtenerBase(id: number): Promise<PedidoBase | null> {
  const rows = await query<PedidoBase[]>(
    `SELECT p.id, p.numero, p.tipo, p.usuario_id, p.estado_id, e.nombre AS estado,
            p.total, p.fecha_recoleccion, p.creado_en
     FROM pedido p
     JOIN estado_pedido e ON e.id = p.estado_id
     WHERE p.id = ? LIMIT 1`,
    [id],
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function listarDetalle(pedidoId: number): Promise<ItemPedido[]> {
  const rows = await query<ItemRow[]>(
    `SELECT d.menu_dia_id, p.nombre, d.cantidad, d.precio_unitario, d.subtotal
     FROM pedido_detalle d
     LEFT JOIN menu_dia md ON md.id = d.menu_dia_id
     LEFT JOIN platillo p ON p.id = md.platillo_id
     WHERE d.pedido_id = ?
     ORDER BY d.id ASC`,
    [pedidoId],
  );
  return rows.map((row) => ({
    menu_dia_id: row.menu_dia_id,
    nombre: row.nombre ?? "Platillo",
    cantidad: row.cantidad,
    precio_unitario: Number(row.precio_unitario),
    subtotal: Number(row.subtotal),
  }));
}

export async function listarHistorial(
  pedidoId: number,
): Promise<HistorialEstado[]> {
  const rows = await query<HistorialRow[]>(
    `SELECT ea.nombre AS estado_anterior, en_.nombre AS estado_nuevo, h.fecha
     FROM pedido_estado_historial h
     LEFT JOIN estado_pedido ea ON ea.id = h.estado_anterior_id
     JOIN estado_pedido en_ ON en_.id = h.estado_nuevo_id
     WHERE h.pedido_id = ?
     ORDER BY h.id ASC`,
    [pedidoId],
  );
  return rows.map((row) => ({
    estado_anterior: row.estado_anterior,
    estado_nuevo: row.estado_nuevo,
    fecha: formatoFechaHora(row.fecha),
  }));
}

export async function listarPorUsuario(
  usuarioId: number,
  filtros: { estado?: string; desde?: string; hasta?: string } = {},
): Promise<PedidoResumen[]> {
  const condiciones = ["p.usuario_id = ?"];
  const valores: unknown[] = [usuarioId];

  if (filtros.estado) {
    condiciones.push("e.nombre = ?");
    valores.push(filtros.estado);
  }
  if (filtros.desde) {
    condiciones.push("DATE(p.fecha_recoleccion) >= ?");
    valores.push(filtros.desde);
  }
  if (filtros.hasta) {
    condiciones.push("DATE(p.fecha_recoleccion) <= ?");
    valores.push(filtros.hasta);
  }

  const rows = await query<ResumenRow[]>(
    `SELECT p.id, p.numero, e.nombre AS estado, p.total, p.fecha_recoleccion,
            p.creado_en
     FROM pedido p
     JOIN estado_pedido e ON e.id = p.estado_id
     WHERE ${condiciones.join(" AND ")}
     ORDER BY p.creado_en DESC, p.id DESC`,
    valores,
  );
  return rows.map((row) => ({
    id: row.id,
    numero: row.numero,
    estado: row.estado,
    total: Number(row.total),
    fecha_recoleccion: formatoFechaHora(row.fecha_recoleccion),
    creado_en: formatoFechaHora(row.creado_en),
  }));
}

export async function listarListos(): Promise<PedidoEntregaRow[]> {
  return query<PedidoEntregaRow[]>(
    `SELECT p.id, p.numero, p.tipo, p.cliente_nombre, p.total,
            p.creado_en, p.fecha_recoleccion
     FROM pedido p
     JOIN estado_pedido e ON e.id = p.estado_id
     WHERE e.nombre = 'Listo'
     ORDER BY p.fecha_recoleccion ASC, p.creado_en ASC`,
  );
}

export interface PedidoCocinaRow extends RowDataPacket {
  id: number;
  numero: string;
  tipo: string;
  estado: string;
  cliente_nombre: string | null;
  creado_en: Date | string;
  fecha_recoleccion: Date | string;
}

export interface ItemCocinaRow extends RowDataPacket {
  pedido_id: number;
  cantidad: number;
  nombre: string;
}

export async function listarParaCocina(): Promise<PedidoCocinaRow[]> {
  return query<PedidoCocinaRow[]>(
    `SELECT p.id, p.numero, p.tipo, e.nombre AS estado,
            CASE
              WHEN p.tipo = 'anticipado' THEN COALESCE(p.cliente_nombre, u.nombre)
              ELSE p.cliente_nombre
            END AS cliente_nombre,
            p.creado_en, p.fecha_recoleccion
     FROM pedido p
     JOIN estado_pedido e ON e.id = p.estado_id
     LEFT JOIN usuario u ON u.id = p.usuario_id
     WHERE e.nombre IN ('Pagado', 'En preparación', 'Listo')
     ORDER BY p.fecha_recoleccion ASC, p.creado_en ASC`,
  );
}

export async function listarItemsDePedidos(
  pedidoIds: number[],
): Promise<ItemCocinaRow[]> {
  if (pedidoIds.length === 0) {
    return [];
  }
  const placeholders = pedidoIds.map(() => "?").join(", ");
  return query<ItemCocinaRow[]>(
    `SELECT d.pedido_id, d.cantidad, COALESCE(pl.nombre, 'Platillo') AS nombre
     FROM pedido_detalle d
     LEFT JOIN menu_dia md ON md.id = d.menu_dia_id
     LEFT JOIN platillo pl ON pl.id = md.platillo_id
     WHERE d.pedido_id IN (${placeholders})
     ORDER BY d.id ASC`,
    pedidoIds,
  );
}
