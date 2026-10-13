import type { Request, Response } from "express";
import * as pedidoService from "../services/pedidoService.js";
import { usuarioActual } from "../utils/requestUser.js";

export async function crear(req: Request, res: Response): Promise<void> {
  const pedido = await pedidoService.crearMostrador(usuarioActual(req), req.body);
  res.status(201).json(pedido);
}

export async function obtener(req: Request, res: Response): Promise<void> {
  const pedido = await pedidoService.obtenerParaCaja(Number(req.params.id));
  res.status(200).json(pedido);
}

export async function listarListos(_req: Request, res: Response): Promise<void> {
  const pedidos = await pedidoService.listarParaEntrega();
  res.status(200).json(pedidos);
}

export async function entregar(req: Request, res: Response): Promise<void> {
  const resultado = await pedidoService.entregar(
    Number(req.params.id),
    usuarioActual(req),
  );
  res.status(200).json(resultado);
}

export async function cobrar(req: Request, res: Response): Promise<void> {
  const resultado = await pedidoService.cobrarEnCaja(
    Number(req.params.id),
    req.body.metodo,
    usuarioActual(req),
  );
  res.status(200).json(resultado);
}

export async function cancelar(req: Request, res: Response): Promise<void> {
  const resultado = await pedidoService.cancelarEnCaja(
    Number(req.params.id),
    usuarioActual(req),
  );
  res.status(200).json(resultado);
}
