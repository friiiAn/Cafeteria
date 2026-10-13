import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodTypeAny } from "zod";
import { HttpError } from "../utils/httpError.js";

function manejarError(error: unknown, next: NextFunction, campoPorDefecto: string): void {
  if (error instanceof ZodError) {
    const detalles = error.issues.map((issue) => ({
      campo: issue.path.join(".") || campoPorDefecto,
      mensaje: issue.message,
    }));
    next(HttpError.badRequest("Datos inválidos", detalles));
    return;
  }
  next(error);
}

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      manejarError(error, next, "(cuerpo)");
    }
  };
}

export function validateQuery(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req.query);
      Object.assign(req.query, parsed);
      next();
    } catch (error) {
      manejarError(error, next, "(consulta)");
    }
  };
}
