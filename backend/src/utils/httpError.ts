export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly detalles?: unknown;

  constructor(status: number, code: string, message: string, detalles?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.detalles = detalles;
  }

  static badRequest(message: string, detalles?: unknown): HttpError {
    return new HttpError(400, "VALIDATION_ERROR", message, detalles);
  }

  static unauthorized(message = "No autorizado"): HttpError {
    return new HttpError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "No tienes permiso para esta acción"): HttpError {
    return new HttpError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Recurso no encontrado"): HttpError {
    return new HttpError(404, "NOT_FOUND", message);
  }

  static conflict(message: string): HttpError {
    return new HttpError(409, "CONFLICT", message);
  }
}
