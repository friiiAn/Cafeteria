import { Router } from "express";
import * as menuController from "../controllers/menuController.js";
import { validateBody, validateQuery } from "../middlewares/validate.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  fechaQuerySchema,
  crearMenuSchema,
  actualizarMenuSchema,
} from "../schemas/menu.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  validateQuery(fechaQuerySchema),
  asyncHandler(menuController.listar),
);

router.get(
  "/cliente",
  requireAuth,
  validateQuery(fechaQuerySchema),
  asyncHandler(menuController.listarCliente),
);

router.post(
  "/",
  requireAuth,
  requireRole("administrador"),
  validateBody(crearMenuSchema),
  asyncHandler(menuController.crear),
);

router.put(
  "/:id",
  requireAuth,
  requireRole("administrador"),
  validateBody(actualizarMenuSchema),
  asyncHandler(menuController.actualizar),
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("administrador"),
  asyncHandler(menuController.eliminar),
);

export default router;
