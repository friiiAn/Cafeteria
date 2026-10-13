import {
  createUsuario,
  existeCorreo,
  findById,
  listOperativos,
  updateUsuario,
} from "../db/usuarioRepository.js";
import { hashPassword } from "../utils/password.js";
import { HttpError } from "../utils/httpError.js";
import type { Rol, UsuarioPublico } from "../types/usuario.js";
import { ROLES_OPERATIVOS } from "../types/usuario.js";

function rolValido(rol: string): rol is Rol {
  return (ROLES_OPERATIVOS as readonly string[]).includes(rol);
}

export async function listar(): Promise<UsuarioPublico[]> {
  return listOperativos();
}

export async function crear(params: {
  nombre: string;
  correo: string;
  password: string;
  rol: string;
}): Promise<UsuarioPublico> {
  if (!rolValido(params.rol)) {
    throw HttpError.badRequest(
      `Rol inválido. Válidos: ${ROLES_OPERATIVOS.join(", ")}`,
    );
  }

  const yaExiste = await existeCorreo(params.correo);
  if (yaExiste) {
    throw HttpError.conflict("El correo ya está registrado");
  }

  const passwordHash = await hashPassword(params.password);
  const id = await createUsuario({
    nombre: params.nombre,
    correo: params.correo,
    passwordHash,
    rol: params.rol,
  });

  const creado = await findById(id);
  if (!creado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo crear el usuario");
  }
  return creado;
}

export async function actualizar(
  id: number,
  cambios: {
    nombre?: string;
    correo?: string;
    rol?: string;
    activo?: boolean;
  },
): Promise<UsuarioPublico> {
  const existente = await findById(id);
  if (!existente) {
    throw HttpError.notFound("Usuario no encontrado");
  }

  if (cambios.rol !== undefined && !rolValido(cambios.rol)) {
    throw HttpError.badRequest(
      `Rol inválido. Válidos: ${ROLES_OPERATIVOS.join(", ")}`,
    );
  }

  if (cambios.correo !== undefined) {
    const duplicado = await existeCorreo(cambios.correo, id);
    if (duplicado) {
      throw HttpError.conflict("El correo ya está registrado");
    }
  }

  await updateUsuario(id, {
    nombre: cambios.nombre,
    correo: cambios.correo,
    rol: cambios.rol as Rol | undefined,
    activo: cambios.activo,
  });

  const actualizado = await findById(id);
  if (!actualizado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo actualizar el usuario");
  }
  return actualizado;
}
