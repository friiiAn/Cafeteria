import {
  createUsuario,
  existeCorreo,
  findByCorreo,
  findById,
} from "../db/usuarioRepository.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { HttpError } from "../utils/httpError.js";
import type { UsuarioPublico } from "../types/usuario.js";

const MENSAJE_CREDENCIALES = "Correo o contraseña incorrectos";

export interface ResultadoLogin {
  token: string;
  usuario: UsuarioPublico;
}

export async function login(
  correo: string,
  password: string,
): Promise<ResultadoLogin> {
  const usuario = await findByCorreo(correo);
  if (!usuario || !usuario.activo) {
    throw HttpError.unauthorized(MENSAJE_CREDENCIALES);
  }

  const coincide = await verifyPassword(password, usuario.passwordHash);
  if (!coincide) {
    throw HttpError.unauthorized(MENSAJE_CREDENCIALES);
  }

  const { passwordHash: _omit, ...publico } = usuario;
  const token = signToken({ sub: publico.id, rol: publico.rol });

  return { token, usuario: publico };
}

export async function registrar(params: {
  nombre: string;
  correo: string;
  password: string;
}): Promise<UsuarioPublico> {
  const yaExiste = await existeCorreo(params.correo);
  if (yaExiste) {
    throw HttpError.conflict("El correo ya está registrado");
  }

  const passwordHash = await hashPassword(params.password);
  const id = await createUsuario({
    nombre: params.nombre,
    correo: params.correo,
    passwordHash,
    rol: "usuario",
  });

  const creado = await findById(id);
  if (!creado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo crear la cuenta");
  }
  return creado;
}

export async function obtenerPerfil(id: number): Promise<UsuarioPublico> {
  const usuario = await findById(id);
  if (!usuario) {
    throw HttpError.notFound("Usuario no encontrado");
  }
  return usuario;
}
