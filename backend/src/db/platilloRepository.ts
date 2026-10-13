import type { RowDataPacket } from "mysql2";
import { query, execute } from "./pool.js";
import type { Platillo } from "../types/platillo.js";

interface PlatilloRow extends RowDataPacket {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: number;
}

function map(row: PlatilloRow): Platillo {
  return {
    id: row.id,
    nombre: row.nombre,
    categoria: row.categoria,
    descripcion: row.descripcion,
    activo: Boolean(row.activo),
  };
}

const SELECT_BASE = `
  SELECT p.id, p.nombre, p.categoria, p.descripcion, p.activo
  FROM platillo p
`;

export async function listar(
  filtros: { activo?: boolean } = {},
): Promise<Platillo[]> {
  const condiciones: string[] = [];
  const valores: unknown[] = [];

  if (filtros.activo !== undefined) {
    condiciones.push("p.activo = ?");
    valores.push(filtros.activo ? 1 : 0);
  }

  const where = condiciones.length > 0 ? ` WHERE ${condiciones.join(" AND ")}` : "";
  const rows = await query<PlatilloRow[]>(
    `${SELECT_BASE}${where} ORDER BY p.nombre ASC`,
    valores,
  );
  return rows.map(map);
}

export async function findById(id: number): Promise<Platillo | null> {
  const rows = await query<PlatilloRow[]>(
    `${SELECT_BASE} WHERE p.id = ? LIMIT 1`,
    [id],
  );
  return rows.length > 0 ? map(rows[0]) : null;
}

export async function crear(params: {
  nombre: string;
  categoria?: string | null;
  descripcion?: string | null;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO platillo (nombre, categoria, descripcion) VALUES (?, ?, ?)`,
    [params.nombre, params.categoria ?? null, params.descripcion ?? null],
  );
  return result.insertId;
}

export async function actualizar(
  id: number,
  campos: {
    nombre?: string;
    categoria?: string | null;
    descripcion?: string | null;
    activo?: boolean;
  },
): Promise<void> {
  const sets: string[] = [];
  const valores: unknown[] = [];

  if (campos.nombre !== undefined) {
    sets.push("nombre = ?");
    valores.push(campos.nombre);
  }
  if (campos.categoria !== undefined) {
    sets.push("categoria = ?");
    valores.push(campos.categoria);
  }
  if (campos.descripcion !== undefined) {
    sets.push("descripcion = ?");
    valores.push(campos.descripcion);
  }
  if (campos.activo !== undefined) {
    sets.push("activo = ?");
    valores.push(campos.activo ? 1 : 0);
  }

  if (sets.length === 0) {
    return;
  }

  valores.push(id);
  await execute(`UPDATE platillo SET ${sets.join(", ")} WHERE id = ?`, valores);
}
