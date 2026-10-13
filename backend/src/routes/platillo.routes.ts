import { Router } from "express";
import * as platilloController from "../controllers/platilloController.js";
import { validateBody } from "../middlewares/validate.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  crearPlatilloSchema,
  actualizarPlatilloSchema,
} from "../schemas/platillo.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("administrador"));

router.get("/", asyncHandler(platilloController.listar));
router.post(
  "/",
  validateBody(crearPlatilloSchema),
  asyncHandler(platilloController.crear),
);
router.put(
  "/:id",
  validateBody(actualizarPlatilloSchema),
  asyncHandler(platilloController.actualizar),
);

export default router;
