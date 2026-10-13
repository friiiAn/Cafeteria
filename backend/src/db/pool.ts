import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export const pool = mysql.createPool(env.DATABASE_URL);

export type DbExecutor = Pick<mysql.Pool, "query" | "execute">;

export async function q<T = mysql.RowDataPacket[]>(
  db: DbExecutor,
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [rows] = await db.query(sql, params);
  return rows as T;
}

export async function e(
  db: DbExecutor,
  sql: string,
  params: unknown[] = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await db.execute(sql, params as never[]);
  return result as mysql.ResultSetHeader;
}

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  return q<T>(pool, sql, params);
}

export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<mysql.ResultSetHeader> {
  return e(pool, sql, params);
}

export async function withTransaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
