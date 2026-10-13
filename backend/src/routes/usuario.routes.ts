import { Router } from "express";
import * as usuarioController from "../controllers/usuarioController.js";
import { validateBody } from "../middlewares/validate.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
} from "../schemas/usuario.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("administrador"));

router.get("/", asyncHandler(usuarioController.listar));
router.post("/", validateBody(crearUsuarioSchema), asyncHandler(usuarioController.crear));
router.put(
  "/:id",
  validateBody(actualizarUsuarioSchema),
  asyncHandler(usuarioController.actualizar),
);

export default router;
