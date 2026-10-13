import type { Request, Response } from "express";
import * as menuService from "../services/menuService.js";
import { hoyISO } from "../utils/fecha.js";

function fechaDe(req: Request): string {
  const fecha = req.query.fecha;
  return typeof fecha === "string" && fecha.length > 0 ? fecha : hoyISO();
}

export async function listar(req: Request, res: Response): Promise<void> {
  const menu = await menuService.listar(fechaDe(req));
  res.status(200).json(menu);
}

export async function listarCliente(req: Request, res: Response): Promise<void> {
  const menu = await menuService.listarCliente(fechaDe(req));
  res.status(200).json(menu);
}

export async function crear(req: Request, res: Response): Promise<void> {
  const entrada = await menuService.crear(req.body);
  res.status(201).json(entrada);
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const entrada = await menuService.actualizar(id, req.body);
  res.status(200).json(entrada);
}

export async function eliminar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  await menuService.eliminar(id);
  res.status(204).send();
}
