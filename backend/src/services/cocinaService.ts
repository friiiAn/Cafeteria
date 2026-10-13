import * as pedidoRepo from "../db/pedidoRepository.js";
import * as pedidoService from "./pedidoService.js";
import * as notificacionService from "./notificacionService.js";
import { formatoFechaHora } from "../utils/fecha.js";
import type { ItemCocina, PedidoCocina } from "../types/pedido.js";

export async function listar(): Promise<PedidoCocina[]> {
  const pedidos = await pedidoRepo.listarParaCocina();
  if (pedidos.length === 0) {
    return [];
  }

  const items = await pedidoRepo.listarItemsDePedidos(
    pedidos.map((pedido) => pedido.id),
  );
  const porPedido = new Map<number, ItemCocina[]>();
  for (const item of items) {
    const acumulado = porPedido.get(item.pedido_id) ?? [];
    acumulado.push({ cantidad: item.cantidad, nombre: item.nombre });
    porPedido.set(item.pedido_id, acumulado);
  }

  return pedidos.map((pedido) => ({
    id: pedido.id,
    numero: pedido.numero,
    tipo: pedido.tipo,
    estado: pedido.estado,
    fecha_recoleccion: formatoFechaHora(pedido.fecha_recoleccion),
    items: porPedido.get(pedido.id) ?? [],
  }));
}

export async function iniciar(
  pedidoId: number,
  cocineroId: number,
): Promise<{ id: number; estado: string }> {
  return pedidoService.transicionar(pedidoId, "En preparación", cocineroId);
}

export async function marcarListo(
  pedidoId: number,
  cocineroId: number,
): Promise<{ id: number; estado: string }> {
  return pedidoService.transicionar(
    pedidoId,
    "Listo",
    cocineroId,
    async (conn, pedido) => {
      await notificacionService.crearParaPedidoListo(conn, pedido);
    },
  );
}
