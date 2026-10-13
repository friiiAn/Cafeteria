import type { Request, Response } from "express";
import * as notificacionService from "../services/notificacionService.js";
import { usuarioActual } from "../utils/requestUser.js";

export async function listar(req: Request, res: Response): Promise<void> {
  const notificaciones = await notificacionService.listar(usuarioActual(req));
  res.status(200).json(notificaciones);
}

export async function marcarLeida(req: Request, res: Response): Promise<void> {
  const resultado = await notificacionService.marcarLeida(
    usuarioActual(req),
    Number(req.params.id),
  );
  res.status(200).json(resultado);
}
