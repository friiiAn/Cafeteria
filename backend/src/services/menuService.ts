import * as platilloRepo from "../db/platilloRepository.js";
import * as menuRepo from "../db/menuRepository.js";
import { HttpError } from "../utils/httpError.js";
import type { MenuEntrada } from "../types/platillo.js";

function esErrorFk(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: string }).code === "ER_ROW_IS_REFERENCED_2" ||
      (error as { code?: string }).code === "ER_ROW_IS_REFERENCED")
  );
}

export async function listar(fecha: string): Promise<MenuEntrada[]> {
  return menuRepo.listarPorFecha(fecha, { soloActivos: false });
}

export async function listarCliente(fecha: string): Promise<MenuEntrada[]> {
  return menuRepo.listarPorFecha(fecha, { soloActivos: true });
}

export async function crear(params: {
  fecha: string;
  platillo_id: number;
  precio: number;
  disponible: boolean;
  especial: boolean;
}): Promise<MenuEntrada> {
  const platillo = await platilloRepo.findById(params.platillo_id);
  if (!platillo) {
    throw HttpError.notFound("Platillo no encontrado");
  }
  if (params.precio < 0) {
    throw HttpError.badRequest("El precio no puede ser negativo");
  }

  const duplicado = await menuRepo.existeEnFecha(params.fecha, params.platillo_id);
  if (duplicado) {
    throw HttpError.conflict("El platillo ya está en el menú de esa fecha");
  }

  const id = await menuRepo.crear({
    fecha: params.fecha,
    platilloId: params.platillo_id,
    precio: params.precio,
    disponible: params.disponible,
    especial: params.especial,
  });

  const creado = await menuRepo.findById(id);
  if (!creado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo agregar el platillo al menú");
  }
  return creado;
}

export async function actualizar(
  id: number,
  cambios: { precio?: number; disponible?: boolean; especial?: boolean },
): Promise<MenuEntrada> {
  const existente = await menuRepo.findById(id);
  if (!existente) {
    throw HttpError.notFound("Entrada de menú no encontrada");
  }
  if (cambios.precio !== undefined && cambios.precio < 0) {
    throw HttpError.badRequest("El precio no puede ser negativo");
  }

  await menuRepo.actualizar(id, cambios);

  const actualizado = await menuRepo.findById(id);
  if (!actualizado) {
    throw new HttpError(500, "INTERNAL_ERROR", "No se pudo actualizar la entrada de menú");
  }
  return actualizado;
}

export async function eliminar(id: number): Promise<void> {
  const existente = await menuRepo.findById(id);
  if (!existente) {
    throw HttpError.notFound("Entrada de menú no encontrada");
  }

  try {
    await menuRepo.eliminar(id);
  } catch (error) {
    if (esErrorFk(error)) {
      throw HttpError.conflict(
        "No se puede quitar: el platillo está asociado a pedidos existentes",
      );
    }
    throw error;
  }
}
