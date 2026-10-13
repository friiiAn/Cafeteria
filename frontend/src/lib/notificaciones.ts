import { api } from "./apiClient";
import type { Notificacion } from "../types";

export function listarNotificaciones(): Promise<Notificacion[]> {
  return api.get<Notificacion[]>("/notificaciones");
}

export function marcarNotificacionLeida(
  id: number,
): Promise<{ id: number; leida: boolean }> {
  return api.post<{ id: number; leida: boolean }>(`/notificaciones/${id}/leer`);
}
