import "dotenv/config";
import { pool } from "../src/db/pool.js";
import { existeCorreo, createUsuario } from "../src/db/usuarioRepository.js";
import { hashPassword } from "../src/utils/password.js";
import type { Rol } from "../src/types/usuario.js";
import { logger } from "../src/utils/logger.js";

interface CuentaSeed {
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
}

function leerCuentas(): CuentaSeed[] {
  const cuentas: CuentaSeed[] = [
    {
      nombre: "Administrador",
      correo: process.env.SEED_ADMIN_EMAIL ?? "admin@itsh.edu.mx",
      password: process.env.SEED_ADMIN_PASSWORD ?? "admin123",
      rol: "administrador",
    },
    {
      nombre: "Cajero",
      correo: process.env.SEED_CAJERO_EMAIL ?? "caja@itsh.edu.mx",
      password: process.env.SEED_CAJERO_PASSWORD ?? "caja123",
      rol: "cajero",
    },
    {
      nombre: "Cocinero",
      correo: process.env.SEED_COCINERO_EMAIL ?? "cocina@itsh.edu.mx",
      password: process.env.SEED_COCINERO_PASSWORD ?? "cocina123",
      rol: "cocinero",
    },
  ];
  return cuentas;
}

async function main(): Promise<void> {
  const cuentas = leerCuentas();

  for (const cuenta of cuentas) {
    const yaExiste = await existeCorreo(cuenta.correo);
    if (yaExiste) {
      logger.info(`[seed] Ya existe ${cuenta.correo} (${cuenta.rol}), se omite`);
      continue;
    }
    const passwordHash = await hashPassword(cuenta.password);
    await createUsuario({
      nombre: cuenta.nombre,
      correo: cuenta.correo,
      passwordHash,
      rol: cuenta.rol,
    });
    logger.info(`[seed] Creado ${cuenta.correo} (${cuenta.rol})`);
  }

  logger.info("[seed] Completado");
  await pool.end();
}

main().catch(async (error) => {
  logger.error("[seed] Error", error);
  await pool.end();
  process.exit(1);
});
