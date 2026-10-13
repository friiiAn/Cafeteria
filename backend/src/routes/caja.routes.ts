import { Router } from "express";
import * as cajaController from "../controllers/cajaController.js";
import { validateBody } from "../middlewares/validate.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  crearPedidoMostradorSchema,
  cobroSchema,
} from "../schemas/caja.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("cajero", "administrador"));

router.post(
  "/pedidos",
  validateBody(crearPedidoMostradorSchema),
  asyncHandler(cajaController.crear),
);

router.get("/pedidos/:id", asyncHandler(cajaController.obtener));

router.post(
  "/pedidos/:id/cobrar",
  validateBody(cobroSchema),
  asyncHandler(cajaController.cobrar),
);

router.post("/pedidos/:id/cancelar", asyncHandler(cajaController.cancelar));

export default router;
