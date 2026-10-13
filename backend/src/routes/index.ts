import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import platilloRoutes from "./platillo.routes.js";
import menuRoutes from "./menu.routes.js";
import pedidoRoutes from "./pedido.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/platillos", platilloRoutes);
router.use("/menu", menuRoutes);
router.use("/pedidos", pedidoRoutes);

export default router;
