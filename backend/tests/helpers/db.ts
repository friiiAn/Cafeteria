import { pool } from "../../src/db/pool.js";

export async function eliminarUsuarioPorCorreo(correo: string): Promise<void> {
  await pool.query("DELETE FROM usuario WHERE correo = ?", [correo]);
}

export async function eliminarPlatilloPorNombre(nombre: string): Promise<void> {
  await pool.query(
    "DELETE FROM menu_dia WHERE platillo_id IN (SELECT id FROM platillo WHERE nombre = ?)",
    [nombre],
  );
  await pool.query("DELETE FROM platillo WHERE nombre = ?", [nombre]);
}

export async function eliminarMenuPorFecha(fecha: string): Promise<void> {
  await pool.query("DELETE FROM menu_dia WHERE fecha = ?", [fecha]);
}

export async function cerrarBaseDatos(): Promise<void> {
  await pool.end();
}
