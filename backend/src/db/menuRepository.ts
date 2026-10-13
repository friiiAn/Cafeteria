import type { RowDataPacket } from "mysql2";
import { query, execute } from "./pool.js";
import { formatoFecha } from "../utils/fecha.js";
import type { MenuEntrada } from "../types/platillo.js";

interface MenuRow extends RowDataPacket {
  id: number;
  fecha: Date | string;
  platillo_id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: string | number;
  disponible: number;
  especial: number;
}

function map(row: MenuRow): MenuEntrada {
  return {
    id: row.id,
    fecha: formatoFecha(row.fecha),
    platillo_id: row.platillo_id,
    nombre: row.nombre,
    categoria: row.categoria,
    descripcion: row.descripcion,
    precio: Number(row.precio),
    disponible: Boolean(row.disponible),
    especial: Boolean(row.especial),
  };
}

const SELECT_BASE = `
  SELECT md.id, md.fecha, md.platillo_id, p.nombre, p.categoria, p.descripcion,
         md.precio, md.disponible, md.especial
  FROM menu_dia md
  JOIN platillo p ON p.id = md.platillo_id
`;

export async function listarPorFecha(
  fecha: string,
  filtros: { soloActivos?: boolean } = {},
): Promise<MenuEntrada[]> {
  const filtroActivo = filtros.soloActivos ? " AND p.activo = 1" : "";
  const rows = await query<MenuRow[]>(
    `${SELECT_BASE} WHERE md.fecha = ?${filtroActivo}
     ORDER BY md.especial DESC, p.nombre ASC`,
    [fecha],
  );
  return rows.map(map);
}

export async function findById(id: number): Promise<MenuEntrada | null> {
  const rows = await query<MenuRow[]>(
    `${SELECT_BASE} WHERE md.id = ? LIMIT 1`,
    [id],
  );
  return rows.length > 0 ? map(rows[0]) : null;
}

export async function existeEnFecha(
  fecha: string,
  platilloId: number,
): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id FROM menu_dia WHERE fecha = ? AND platillo_id = ? LIMIT 1`,
    [fecha, platilloId],
  );
  return rows.length > 0;
}

export async function crear(params: {
  fecha: string;
  platilloId: number;
  precio: number;
  disponible: boolean;
  especial: boolean;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO menu_dia (fecha, platillo_id, precio, disponible, especial)
     VALUES (?, ?, ?, ?, ?)`,
    [
      params.fecha,
      params.platilloId,
      params.precio,
      params.disponible ? 1 : 0,
      params.especial ? 1 : 0,
    ],
  );
  return result.insertId;
}

export async function actualizar(
  id: number,
  campos: {
    precio?: number;
    disponible?: boolean;
    especial?: boolean;
  },
): Promise<void> {
  const sets: string[] = [];
  const valores: unknown[] = [];

  if (campos.precio !== undefined) {
    sets.push("precio = ?");
    valores.push(campos.precio);
  }
  if (campos.disponible !== undefined) {
    sets.push("disponible = ?");
    valores.push(campos.disponible ? 1 : 0);
  }
  if (campos.especial !== undefined) {
    sets.push("especial = ?");
    valores.push(campos.especial ? 1 : 0);
  }

  if (sets.length === 0) {
    return;
  }

  valores.push(id);
  await execute(`UPDATE menu_dia SET ${sets.join(", ")} WHERE id = ?`, valores);
}

export async function eliminar(id: number): Promise<void> {
  await execute(`DELETE FROM menu_dia WHERE id = ?`, [id]);
}
