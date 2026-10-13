import { Router } from "express";
import * as cocinaController from "../controllers/cocinaController.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth, requireRole("cocinero", "administrador"));

router.get("/pedidos", asyncHandler(cocinaController.listar));

router.post("/pedidos/:id/iniciar", asyncHandler(cocinaController.iniciar));

router.post("/pedidos/:id/listo", asyncHandler(cocinaController.listo));

export default router;
