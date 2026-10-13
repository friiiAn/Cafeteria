import type { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { HttpError } from "../utils/httpError.js";

let cache: Map<string, number> | null = null;
let cacheTransiciones: Set<string> | null = null;

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

async function cargarTransiciones(): Promise<Set<string>> {
  if (cacheTransiciones) {
    return cacheTransiciones;
  }
  const rows = await query<RowDataPacket[]>(
    "SELECT desde_id, hacia_id FROM transicion_estado",
  );
  cacheTransiciones = new Set(
    rows.map((row) => `${Number(row.desde_id)}-${Number(row.hacia_id)}`),
  );
  return cacheTransiciones;
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

export async function transicionPermitida(
  desdeId: number,
  haciaId: number,
): Promise<boolean> {
  const transiciones = await cargarTransiciones();
  return transiciones.has(`${desdeId}-${haciaId}`);
}

export function limpiarCacheEstados(): void {
  cache = null;
  cacheTransiciones = null;
}
