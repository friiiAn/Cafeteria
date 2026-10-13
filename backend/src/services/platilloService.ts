import * as repo from "../db/platilloRepository.js";
import { HttpError } from "../utils/httpError.js";
import type { Platillo } from "../types/platillo.js";

export async function listar(filtros: { activo?: boolean } = {}): Promise<Platillo[]> {
  return repo.listar(filtros);
}

export async function crear(params: {
  nombre: string;
  categoria?: string | null;
  descripcion?: string | null;
}): Promise<Platillo> {
  const id = await repo.crear(params);
  const creado = await repo.findById(id);
  if (!creado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo crear el platillo");
  }
  return creado;
}

export async function actualizar(
  id: number,
  cambios: {
    nombre?: string;
    categoria?: string | null;
    descripcion?: string | null;
    activo?: boolean;
  },
): Promise<Platillo> {
  const existente = await repo.findById(id);
  if (!existente) {
    throw HttpError.notFound("Platillo no encontrado");
  }

  await repo.actualizar(id, cambios);

  const actualizado = await repo.findById(id);
  if (!actualizado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo actualizar el platillo");
  }
  return actualizado;
}
