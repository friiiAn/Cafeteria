import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/pool.js";
import { logger } from "./utils/logger.js";
import { iniciarNotificacionWorker } from "./workers/notificacionWorker.js";

async function main(): Promise<void> {
  await pool.query("SELECT 1");

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`API escuchando en http://localhost:${env.PORT}/api`);
  });

  const detenerWorker = iniciarNotificacionWorker();

  const apagar = (senal: string) => {
    logger.info(`Recibida señal ${senal}, cerrando...`);
    detenerWorker();
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => apagar("SIGINT"));
  process.on("SIGTERM", () => apagar("SIGTERM"));
}

main().catch((error) => {
  logger.error("No se pudo iniciar el servidor", error);
  process.exit(1);
});
