import type { Request, Response } from "express";
import * as usuarioService from "../services/usuarioService.js";

export async function listar(_req: Request, res: Response): Promise<void> {
  const usuarios = await usuarioService.listar();
  res.status(200).json(usuarios);
}

export async function crear(req: Request, res: Response): Promise<void> {
  const usuario = await usuarioService.crear(req.body);
  res.status(201).json(usuario);
}

export async function actualizar(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const usuario = await usuarioService.actualizar(id, req.body);
  res.status(200).json(usuario);
}
