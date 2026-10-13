import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new HttpError(404, "NOT_FOUND", `Ruta no encontrada: ${req.method} ${req.path}`));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Datos inválidos",
        detalles: error.issues.map((issue) => ({
          campo: issue.path.join(".") || "(cuerpo)",
          mensaje: issue.message,
        })),
      },
    });
    return;
  }

  if (error instanceof HttpError) {
    if (error.status >= 500) {
      logger.error(error.message, error.detalles);
    }
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.detalles !== undefined ? { detalles: error.detalles } : {}),
      },
    });
    return;
  }

  logger.error("Error no controlado", error);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
    },
  });
}
