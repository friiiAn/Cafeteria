import type { RowDataPacket } from "mysql2";
import { e, query, type DbExecutor } from "./pool.js";

export interface PagoRow extends RowDataPacket {
  id: number;
  pedido_id: number;
  metodo: string;
  monto: string | number;
  referencia: string | null;
}

export async function crear(
  conn: DbExecutor,
  params: {
    pedidoId: number;
    metodo: string;
    monto: number;
    referencia: string | null;
    registradoPor: number | null;
  },
): Promise<number> {
  const result = await e(
    conn,
    `INSERT INTO pago (pedido_id, metodo, monto, referencia, registrado_por)
     VALUES (?, ?, ?, ?, ?)`,
    [
      params.pedidoId,
      params.metodo,
      params.monto,
      params.referencia,
      params.registradoPor,
    ],
  );
  return result.insertId;
}

export async function findByPedido(pedidoId: number): Promise<PagoRow | null> {
  const rows = await query<PagoRow[]>(
    `SELECT id, pedido_id, metodo, monto, referencia
     FROM pago WHERE pedido_id = ? LIMIT 1`,
    [pedidoId],
  );
  return rows.length > 0 ? rows[0] : null;
}
