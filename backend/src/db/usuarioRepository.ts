import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { query, execute } from "./pool.js";
import type { Rol, UsuarioConHash, UsuarioPublico } from "../types/usuario.js";

interface UsuarioRow extends RowDataPacket {
  id: number;
  nombre: string;
  correo: string;
  password_hash: string;
  activo: number;
  rol: Rol;
}

function mapPublico(row: UsuarioRow): UsuarioPublico {
  return {
    id: row.id,
    nombre: row.nombre,
    correo: row.correo,
    rol: row.rol,
    activo: Boolean(row.activo),
  };
}

function mapConHash(row: UsuarioRow): UsuarioConHash {
  return { ...mapPublico(row), passwordHash: row.password_hash };
}

const SELECT_BASE = `
  SELECT u.id, u.nombre, u.correo, u.password_hash, u.activo, r.nombre AS rol
  FROM usuario u
  JOIN rol r ON r.id = u.rol_id
`;

export async function findByCorreo(
  correo: string,
): Promise<UsuarioConHash | null> {
  const rows = await query<UsuarioRow[]>(`${SELECT_BASE} WHERE u.correo = ? LIMIT 1`, [
    correo,
  ]);
  return rows.length > 0 ? mapConHash(rows[0]) : null;
}

export async function findById(id: number): Promise<UsuarioPublico | null> {
  const rows = await query<UsuarioRow[]>(`${SELECT_BASE} WHERE u.id = ? LIMIT 1`, [id]);
  return rows.length > 0 ? mapPublico(rows[0]) : null;
}

export async function listOperativos(): Promise<UsuarioPublico[]> {
  const rows = await query<UsuarioRow[]>(
    `${SELECT_BASE} WHERE r.nombre IN ('administrador', 'cajero', 'cocinero')
     ORDER BY u.id ASC`,
  );
  return rows.map(mapPublico);
}

export async function createUsuario(params: {
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: Rol;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO usuario (nombre, correo, password_hash, rol_id)
     VALUES (?, ?, ?, (SELECT id FROM rol WHERE nombre = ?))`,
    [params.nombre, params.correo, params.passwordHash, params.rol],
  );
  return result.insertId;
}

export async function updateUsuario(
  id: number,
  campos: {
    nombre?: string;
    correo?: string;
    rol?: Rol;
    activo?: boolean;
  },
): Promise<void> {
  const sets: string[] = [];
  const valores: unknown[] = [];

  if (campos.nombre !== undefined) {
    sets.push("nombre = ?");
    valores.push(campos.nombre);
  }
  if (campos.correo !== undefined) {
    sets.push("correo = ?");
    valores.push(campos.correo);
  }
  if (campos.rol !== undefined) {
    sets.push("rol_id = (SELECT id FROM rol WHERE nombre = ?)");
    valores.push(campos.rol);
  }
  if (campos.activo !== undefined) {
    sets.push("activo = ?");
    valores.push(campos.activo ? 1 : 0);
  }

  if (sets.length === 0) {
    return;
  }

  valores.push(id);
  await execute(
    `UPDATE usuario SET ${sets.join(", ")} WHERE id = ?`,
    valores,
  );
}

export async function existeCorreo(
  correo: string,
  exceptoId?: number,
): Promise<boolean> {
  const rows = await query<RowDataPacket[]>(
    `SELECT id FROM usuario WHERE correo = ? AND id <> ? LIMIT 1`,
    [correo, exceptoId ?? 0],
  );
  return rows.length > 0;
}

export async function countUsuarios(): Promise<number> {
  const rows = await query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM usuario`,
  );
  return Number((rows[0] as { total: number }).total);
}

export type { ResultSetHeader };
