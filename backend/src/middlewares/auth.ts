import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { HttpError } from "../utils/httpError.js";
import { findById } from "../db/usuarioRepository.js";
import type { Rol } from "../types/usuario.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw HttpError.unauthorized("Token de acceso ausente");
    }

    const token = header.slice("Bearer ".length).trim();
    const payload = verifyToken(token);

    const usuario = await findById(payload.sub);
    if (!usuario || !usuario.activo) {
      throw HttpError.unauthorized("Sesión inválida o cuenta desactivada");
    }

    req.user = usuario;
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      next(error);
      return;
    }
    next(HttpError.unauthorized("Token inválido o expirado"));
  }
}

export function requireRole(...roles: Rol[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(HttpError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.rol)) {
      next(HttpError.forbidden());
      return;
    }
    next();
  };
}
