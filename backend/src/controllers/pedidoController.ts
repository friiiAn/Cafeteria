import type { Request, Response } from "express";
import * as pedidoService from "../services/pedidoService.js";
import { usuarioActual } from "../utils/requestUser.js";

function textoQuery(valor: unknown): string | undefined {
  return typeof valor === "string" && valor.length > 0 ? valor : undefined;
}

export async function crear(req: Request, res: Response): Promise<void> {
  const pedido = await pedidoService.crear(usuarioActual(req), req.body);
  res.status(201).json(pedido);
}

export async function listar(req: Request, res: Response): Promise<void> {
  const pedidos = await pedidoService.listar(usuarioActual(req), {
    estado: textoQuery(req.query.estado),
    desde: textoQuery(req.query.desde),
    hasta: textoQuery(req.query.hasta),
  });
  res.status(200).json(pedidos);
}

export async function obtener(req: Request, res: Response): Promise<void> {
  const pedido = await pedidoService.obtener(
    usuarioActual(req),
    Number(req.params.id),
  );
  res.status(200).json(pedido);
}

export async function pagar(req: Request, res: Response): Promise<void> {
  const resultado = await pedidoService.pagar(
    usuarioActual(req),
    Number(req.params.id),
    req.body.token_pago,
  );
  res.status(200).json(resultado);
}

export async function cancelar(req: Request, res: Response): Promise<void> {
  const resultado = await pedidoService.cancelar(
    usuarioActual(req),
    Number(req.params.id),
  );
  res.status(200).json(resultado);
}
