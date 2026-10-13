import { Router } from "express";
import * as notificacionController from "../controllers/notificacionController.js";
import { requireAuth } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(notificacionController.listar));

router.post("/:id/leer", asyncHandler(notificacionController.marcarLeida));

export default router;
