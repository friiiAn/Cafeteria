import type { Request } from "express";
import { HttpError } from "./httpError.js";

export function usuarioActual(req: Request): number {
  if (!req.user) {
    throw HttpError.unauthorized();
  }
  return req.user.id;
}
