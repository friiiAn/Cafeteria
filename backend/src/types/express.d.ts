import type { UsuarioPublico } from "../types/usuario.js";

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioPublico;
    }
  }
}

export {};
