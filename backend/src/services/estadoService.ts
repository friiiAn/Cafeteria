import type { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { HttpError } from "../utils/httpError.js";

let cache: Map<string, number> | null = null;

async function cargar(): Promise<Map<string, number>> {
  if (cache) {
    return cache;
  }
  const rows = await query<RowDataPacket[]>(
    "SELECT id, nombre FROM estado_pedido",
  );
  cache = new Map(rows.map((row) => [String(row.nombre), Number(row.id)]));
  return cache;
}

export async function idPorNombre(nombre: string): Promise<number> {
  const mapa = await cargar();
  const id = mapa.get(nombre);
  if (id === undefined) {
    throw new HttpError(
      500,
      "INTERNAL_ERROR",
      `Estado de pedido no configurado: ${nombre}`,
    );
  }
  return id;
}

export function limpiarCacheEstados(): void {
  cache = null;
}
