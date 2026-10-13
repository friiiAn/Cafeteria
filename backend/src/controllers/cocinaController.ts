import type { Request, Response } from "express";
import * as cocinaService from "../services/cocinaService.js";
import { usuarioActual } from "../utils/requestUser.js";

export async function listar(_req: Request, res: Response): Promise<void> {
  const pedidos = await cocinaService.listar();
  res.status(200).json(pedidos);
}

export async function iniciar(req: Request, res: Response): Promise<void> {
  const resultado = await cocinaService.iniciar(
    Number(req.params.id),
    usuarioActual(req),
  );
  res.status(200).json(resultado);
}

export async function listo(req: Request, res: Response): Promise<void> {
  const resultado = await cocinaService.marcarListo(
    Number(req.params.id),
    usuarioActual(req),
  );
  res.status(200).json(resultado);
}
