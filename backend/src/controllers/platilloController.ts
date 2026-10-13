import type { Request, Response } from "express";
import * as platilloService from "../services/platilloService.js";

export async function listar(req: Request, res: Response): Promise<void> {
  const activoParam = req.query.activo;
  const filtros: { activo?: boolean } = {};
  if (activoParam === "true") {
    filtros.activo = true;
  } else if (activoParam === "false") {
    filtros.activo = false;
  }

  const platillos = await platilloService.listar(filtros);
  res.status(200).json(platillos);
}

export async function crear(req: Request, res: Response): Promise<void> {
  const platillo = await platilloService.crear(req.body);
  res.status(201).json(platillo);
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const platillo = await platilloService.actualizar(id, req.body);
  res.status(200).json(platillo);
}
