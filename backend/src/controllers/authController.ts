import type { Request, Response } from "express";
import * as authService from "../services/authService.js";
import { HttpError } from "../utils/httpError.js";

export async function register(req: Request, res: Response): Promise<void> {
  const usuario = await authService.registrar(req.body);
  res.status(201).json(usuario);
}

export async function login(req: Request, res: Response): Promise<void> {
  const resultado = await authService.login(req.body.correo, req.body.password);
  res.status(200).json(resultado);
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  res.status(200).json(req.user);
}
