import { pool } from "../../src/db/pool.js";

export async function eliminarUsuarioPorCorreo(correo: string): Promise<void> {
  await pool.query("DELETE FROM usuario WHERE correo = ?", [correo]);
}

export async function eliminarUsuarioConPedidos(correo: string): Promise<void> {
  const [filas] = await pool.query("SELECT id FROM usuario WHERE correo = ?", [
    correo,
  ]);
  const ids = (filas as Array<{ id: number }>).map((fila) => fila.id);
  if (ids.length > 0) {
    const placeholders = ids.map(() => "?").join(", ");
    await pool.query(
      `DELETE FROM pago WHERE pedido_id IN
        (SELECT id FROM pedido WHERE usuario_id IN (${placeholders}))`,
      ids,
    );
    await pool.query(`DELETE FROM pedido WHERE usuario_id IN (${placeholders})`, ids);
  }
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
