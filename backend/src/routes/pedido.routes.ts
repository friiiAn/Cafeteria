import { Router } from "express";
import * as pedidoController from "../controllers/pedidoController.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { requireAuth } from "../middlewares/auth.js";
import {
  crearPedidoSchema,
  pagoSchema,
  listarPedidosQuerySchema,
} from "../schemas/pedido.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateBody(crearPedidoSchema),
  asyncHandler(pedidoController.crear),
);

router.get(
  "/",
  requireAuth,
  validateQuery(listarPedidosQuerySchema),
  asyncHandler(pedidoController.listar),
);

router.get("/:id", requireAuth, asyncHandler(pedidoController.obtener));

router.post(
  "/:id/pagar",
  requireAuth,
  validateBody(pagoSchema),
  asyncHandler(pedidoController.pagar),
);

router.post("/:id/cancelar", requireAuth, asyncHandler(pedidoController.cancelar));

export default router;
