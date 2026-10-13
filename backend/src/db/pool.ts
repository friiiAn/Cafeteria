import mysql from "mysql2/promise";
import { env } from "../config/env.js";

export const pool = mysql.createPool(env.DATABASE_URL);

export async function query<T = mysql.RowDataPacket[]>(
  sql: string,
  params: unknown[] = [],
): Promise<T> {
  const [rows] = await pool.query(sql, params);
  return rows as T;
}

export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute(sql, params as never[]);
  return result as mysql.ResultSetHeader;
}
